const rp = require('request-promise');
const config = require('../config.json');
const qs = require('querystring');

const UserStore = require('../stores/UserStore');
const StatusUser = require('../structures/StatusUser');
const User = require('../structures/User');

class Users {

    constructor(oauth, result) {
        this.oauth = oauth;
        this.result = result;
        this.redirect_uri = 'http://localhost:3000/callback'
    }

    /**
     * Options to send to the users.status endpoint
     * @typedef {Object} statusOptions
     * @property {boolean} fetchUsers @default false - whether to ping the users API and grab more data for each user
     * @filter {Function} filter @default true - if the users API is to be pinged, a filter for which status users to do this for
     * @example
     * //Only returns the full user object for users who are playing and titled
     * {
     *  fetchUsers: false,
     *  filter: user => user.playing && user.titled
     * }
     * @returns {Promise<Collection>}
     */

    /**
     * Gets the status of many users and returns it
     * @param {string[]} ids 
     * @param {statusOptions} options
     * @returns {Promise<Collection>}
     */
    async status(ids, {
        fetchUsers = false,
        filter = user => user
    } = {}) {
        if (!Array.isArray(ids)) throw new TypeError("lichess.users.status() takes an array as an input");
        if (ids.length > 50) throw new TypeError("Cannot check status of more than 50 names");
        if (!ids.every(n => typeof n === "string" && /[a-z][\w-]{0,28}[a-z0-9]/i.test(n))) throw new SyntaxError("Invalid format for lichess username: " + n);
        if (typeof fetchUsers !== "boolean") throw new TypeError("fetch takes Boolean values");
        try {
            let results = await rp.get({
                uri: `${config.uri}api/users/status?${qs.stringify({
                    ids: ids.join(",")
                })}`,
                json: true,
                timeout: 2000
            });
            let result = new UserStore(results, StatusUser);
            if (!fetchUsers) return result;
            let users = await this.getMultiple(result.keyArray().filter(k => filter(result.get(k))));
            return result.merge(users);
        } catch (e) {
            if (e) throw e;
        }
    }

    /**
     * Gets the top 10 players by rating of every variant
     * @returns {Promise<Colection>}
     */
    async top10() {
        try {
            let obj = await rp.get({
                "uri": config.uri + "player",
                "headers": {
                    "Accept": "application/vnd.lichess.v3+json"
                },
                "json": true,
                "timeout": 2000
            });
            for (let variant of Object.keys(obj)) {
                obj[variant] = new UserStore(obj[variant]);
            }
            return obj;
        } catch (e) {
            if (e) throw e;
        }
    }

    /**
     * Gets the top user-specified number of players for a given variant
     * @param {string} variant @default 'bullet'
     * @param {number} n @default 100
     * @returns {Promise<Colection>}
     */
    async leaderboard(variant = "bullet", n = 100) {
        if (typeof variant !== "string") throw new TypeError("Variant must match list of lichess variant keys");
        if (config.variants.every(v => v !== variant)) throw new TypeError("Variant must match list of lichess variant keys: " + config.variants.join(", "));
        if (n > 200) throw new TypeError("Cannot get leaderboard for more than 200 names");
        try {
            return new UserStore((await rp.get({
                "uri": config.uri + "player/top/" + n + "/" + variant,
                "headers": {
                    "Accept": "application/vnd.lichess.v3+json"
                },
                "json": true,
                "timeout": 2000
            })).users);
        } catch (e) {
            if (e) throw e;
        }
    }

    //seems to be deprecated
    async history(username) {
        if (typeof username !== "string") throw new TypeError("lichess.users.history() takes string values of an array as an input: " + username);
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        try {
            return await rp.get({
                "uri": config.uri + "api/user/" + username + "/rating-history",
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw e;
        }
    }
    
    //untested
    async activity(username) {
        if (typeof username !== "string") throw new TypeError("lichess.users.activity() takes string values of an array as an input: " + username);
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        try {
            return await rp.get({
                "uri": config.uri + "api/user/" + username + "/activity",
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw e;
        }
    }

    /**
     * Get user(s) public data. Calls {getOne} or {getMultiple} depending on input parameter.
     * @param {string|string[]} userParam 
     */
    async get(userParam) {
        if (typeof userParam === "string") return this.getOne(...arguments);
        if (Array.isArray(userParam)) {
            if (userParam.length === 1) return this.getOne(userParam[0], ...Array.from(arguments).slice(1));
            return this.getMultiple(...arguments);
        }
        throw new TypeError("Input must be string or string[]");
    }

    /**
     * @typedef {Object} oauthOptions
     * @param {boolean} oauth @default false
     */

    /**
     * Read public data of a user.
     * @param {string} username 
     * @param {oauthOptions} options
     * @returns {User}
     */
    async getOne(username, {
        oauth = false
    } = {}) {
        if (typeof username !== "string") throw new TypeError("lichess.users.get() takes string values of an array as an input: " + username);
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        try {
            let token = this.oauth.accessToken.create(result).token.access_token;
            let options = {
                uri: config.uri + "api/user/" + username,
                json: true,
                timeout: 2000
            }
            if (oauth) options.headers = {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            }
            return new User(await rp.get(options));
        } catch (e) {
            if (e) throw e;
        }
    }

    /**
     * Get several users by their IDs. Users are returned in the order same order as the IDs.
     * @param {string[]} names 
     * @param {oauthOptions} options
     * @returns {Promise<Collection>}
     */
    async getMultiple(names, {
        oauth = false
    } = {}) {     
        if (!Array.isArray(names)) throw new TypeError("lichess.users.getMultiple() takes an array as an input");
        if (names.length > 50) throw new RangeError("Cannot check status of more than 50 names");
        if (!names.every(n => typeof n === "string" && /[a-z][\w-]{0,28}[a-z0-9]/i.test(n))) throw new SyntaxError("Invalid format for lichess username: " + n);
        names.unshift(null);
        names.push(null);
        try {
            return new UserStore(await rp.post({
                method: "POST",
                uri: config.uri + "api/users",
                body: names.join(","),
                timeout: 2000,
                json: true,
                headers: !oauth ? null : {
                    Authorization: 'Bearer ' + this.oauth.accessToken.create(this.result).token.access_token
                }
            }));
		} catch (e) {
			if (e) throw e;
		}
    }

    //untested
    async team(team) {
        if (typeof team !== "string") throw new TypeError("lichess.users.team() takes string values of an array as an input: " + team);
        try {
            return await rp.get({
                "uri": config.uri + "team/" + team + "/users",
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw e;
        }
    }

    //untested
    async live() {
        try {
            return await rp.get({
                "uri": config.uri + "streamer/live",
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw e;
         }
    }

    //untested
    async titled(titles = ["GM"], online = false) {
        if (!Array.isArray(titles)) throw new TypeError("Variant must match list of lichess variant keys");
        if (!titles.every(t => t in Object.fromEntries(config.titles.map(s => [s, true])))) throw new TypeError("Title must match list of lichess title keys: " + config.titles.join(", "));
        if (n > 200) throw new TypeError("Cannot get leaderboard for more than 200 names");
        try {
            return await rp.get({
                "uri": config.uri + "api/users/titled?titles=" + titles.join(",") + "?online=" + online,
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw e;
        }
    }
    
}

module.exports = Users;