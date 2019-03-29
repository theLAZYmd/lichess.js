const rp = require('request-promise');
const config = require('../config.json');
const qs = require('querystring');

const User = require('../structures/User');
const Util = require('../util/Util');

class Profile {

    constructor(oauth, result, access_token) {
        this.oauth = oauth;
        this.result = result;
        this.access_token = access_token
    }

    /**
     * Read public data of logged-in user.
     * @returns {User}
     */
    async get() {
        try {
            const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
            let access_token = token ? token.token.access_token : this.access_token;
            let options = {
                uri: `${config.uri}api/account`,
                json: true,
                timeout: 5000,
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + access_token
                }
            }
            console.log(options);
            return new User(await rp.get(options));
        } catch (e) {
            if (e) throw e;
        }
    }

    /**
     * Get several users by their IDs. Profile are returned in the order same order as the IDs.
     * @param {string[]} names 
     * @returns {Promise<Collection>}
     */
    async getMultiple(names) {
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
                json: true
            }));
        } catch (e) {
            if (e) throw e;
        }
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
    /**
     * The activity feed of a user viewable on their profile
     * Needs to Have an ActivityStore built for it!
     * @deprecated
     * @param {string} username 
     * @returns {Object[]}
     * @example
     * //Sample Data
     * 
     * [{
     *  interval: {
     *      start: 1553731200,
     *      end: 1553817600
     *  },
     *  games: {
     *      bullet: {
     *          win: 1,
     *          loss: 0, 
     *          draw: 0,
     *          rp: {
     *              before: 1932,
     *              after: 1946
     *          }
     *      }
     *  }
     * }]
     */
    async activity(username) {
        if (typeof username !== "string") throw new TypeError("lichess.users.activity() takes string values of an array as an input: " + username);
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        try {
            let obj = await rp.get({
                uri: `${config.uri}api/user/${username}/activity`,
                json: true,
                timeout: 2000
            });
            for (let v of obj) console.log(v.games);
            return obj;
        } catch (e) {
            if (e) throw e;
        }
    }

    /**
     * Get members of a team. Members are sorted by reverse chronological order of joining the team (most recent first).
     * @param {string} teamID
     * @returns {Promise<Collection>}
     */
    async team(teamID) {
        if (typeof teamID !== "string") throw new TypeError("teamID takes string values: " + teamID);
        try {
            return new UserStore(Util.ndjson((await rp.get({
                uri: `${config.uri}team/${teamID}/users`,
                timeout: 10000
            })).trim()));
        } catch (e) {
            if (e) throw e;
        }
    }

    /**
     * Get a list of users who are live.
     * @param {statusOptions} options
     * @returns {Promise<Collection>}
     */
    async streaming({
        fetchUsers = false,
        filter = user => user.streaming
    } = {}) {
        try {
            let result = new UserStore(await rp.get({
                uri: `${config.uri}streamer/live`,
                json: true,
                timeout: 2000
            }), StreamUser);
            if (!fetchUsers) return result;
            let users = await this.getMultiple(result.keyArray().filter(k => filter(result.get(k))));
            return result.merge(users);
        } catch (e) {
            if (e) throw e;
        }
    }

    /**
     * @typedef {string} LichessTitle
     * @example
     * //List of only accepted LichessTitle values:
     * [
     *   "GM",
     *   "WGM",
     *   "IM",
     *   "WIM",
     *   "FM",
     *   "WFM",
     *   "NM",
     *   "CM",
     *   "WCM",
     *   "WNM",
     *   "LM",
     *   "BOT"
     * ]
     */

    /**
     * Get titled users. Get users by title. Several titles can be specified.
     * @param {LichessTitle[]} titles 
     * @param {Boolean} online 
     * @returns {Promise<Collection>}
     */
    async titled(titles = ["GM"], online = false) {
        if (typeof titles === "string") titles = [titles];
        if (!Array.isArray(titles)) throw new TypeError("Titles to check must be in an array");
        let titleList = new Map(config.titles.map(s => [s, true]));
        if (!titles.every(t => titleList.get(t))) throw new TypeError("Title must match list of lichess title keys: " + config.titles.join(", "));
        try {
            return new UserStore(Util.ndjson((await rp.get({
                "uri": `${config.uri}api/users/titled?${qs.stringify({
                    titles: titles.join(","),
                    online
                })}`,
                "json": true,
                "timeout": 10000
            })).trim()));
        } catch (e) {
            if (e) throw e;
        }
    }

}

module.exports = Profile;