const rp = require('request-promise');
const request = require('request');
const config = require('../config.json');
const qs = require('querystring');
const EventEmitter = require('events');

const Util = require('../util/Util');
const Users = require('./users');
const GameStore = require('../stores/GameStore');
const UserStore = require('../stores/UserStore');
const Game = require('../structures/game.js');
const StatusUser = require('../structures/StatusUser');

class Games {

    constructor(oauth, result) {
        this.oauth = oauth;
        this.result = result;
        this.Users = new Users(...arguments);
    }

    /**
     * @typedef {gameOptions}
     */
        /**
     * Get user(s) public data. Calls {getOne} or {getMultiple} depending on input parameter.
     * @param {string|string[]} userParam 
     * @param {gameOptions} options
     */
    async get(userParam, options) {
        let def = {
            moves: true,
            tags: true,
            clocks: true, 
            evals: true, 
            opening: true, 
            literate: false,            
            fetchUsers: false,
            json: true
        };
        if (!Object.keys(options).every(k => k in def)) throw new Error(`Query parameter doesn't exist!`);
        if (!Object.values(options).every(v => typeof v === "boolean")) throw new Error('Query parameter must take a boolean value!');
        options = Object.assign(def, options);
        if (typeof userParam === "string") return this.getOne(userParam, options);
        if (Array.isArray(userParam)) {
            if (userParam.length === 1) return this.getOne(userParam[0], options);
            return this.getMultiple(userParam, options);
        }
        throw new TypeError("Input must be string or string[]");
    }

    /**
     * Download one game in PGN or JSON format. Only finished games can be downloaded.
     * @param {string} id 
     * @param {gameOptions} options 
     */
    async getOne(id, options) {
        if (typeof id !== "string" || !/[a-z][\w-]{0,28}[a-z0-9]/i.test(id)) throw new TypeError("game ID for lichess.games.export() must be a string");
        if (id.length > 8) id = id.slice(0, 8);
        try {
            let result = new Game(JSON.parse(await rp.get({
                uri: `${config.uri}game/export/${id}?${qs.stringify(options)}`,
                headers: {
                    Accept: "application/" + (options.json ? "json" : "x-chess-pgn")
                },
                timeout: 2000
            })));
            if (!options.fetchUsers) return result;
            let colours = new Map();
            colours.set(result.players.get('white').id, 'white');
            colours.set(result.players.get('black').id, 'black');
            let users = await this.Users.getMultiple(result.players.keyArray());
            let players = users.reKey(colours);
            result.players = result.players.merge(players);
            return result;
        } catch (e) {
            if (e) throw e;
        }
    }
    
    /**
     * Get several users by their IDs. Users are returned in the order same order as the IDs.
     * @param {string[]} names 
     * @returns {Promise<Collection<User>>}
     */
    async getMultiple(ids, options) {
        if (!Array.isArray(ids)) throw new TypeError("lichess.users.getMultiple() takes an array as an input");
        if (!ids.every(n => typeof n === "string" && /[a-z][\w-]{0,28}[a-z0-9]/i.test(n))) throw new SyntaxError("Invalid format for lichess username.");
        ids = ids.map(id => id.slice(0, 8));
        try {
            let req = {
                method: "POST",
                uri: `${config.uri}games/export/_ids?${qs.stringify(options)}`,
                headers: {
                    Accept: "application/json"
                },
                body: {
                    text: ids.join(",")
                },
                timeout: 8000,
                json: true
            };
            let res = await rp.post(req);
            console.log(req, res);
            return new GameStore(Util.ndjson(res));
        } catch (e) {
            if (e) throw e;
        }
    }
    
    /**
     * Games are sorted by reverse chronological order (most recent first). We recommend streaming the response, for it can be very long. https://lichess.org/@/german11 for instance has more than 250,000 games. The game stream is throttled, depending on who is making the request:
     * Anonymous request: 10 games per second
     * OAuth2 authenticated request: 20 games per second
     * Authenticated, downloading your own games: 50 games per second
     * @param {string} username 
     * @param {gameOptions} options 
     * @param {Boolean} stream - Whether to return the output once all games have been collected or to stream the result using an event emitter
     * @param {string} filepath 
     */
    byUser(username, options = {}, stream = false, filepath) { //it would be really nice if I learned how to use typescript to verify these values better than this   
        let keys = ["since", "until", "max", "vs", "perfType", "color", "rated", "analysed", "ongoing", "moves", "tags", "clocks", "evals", "opening"]
        if (typeof username !== "string") throw new TypeError("game ID for lichess.games.exportUser() must be a string");
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        if (options.since && options.since < 1356998400070) throw new Error("Date specified is before date of Lichess site launch");
        if (options.until && options.until < 1356998400070) throw new Error("Date specified is before date of Lichess site launch");
        if (typeof options.max !== "undefined" && options.max !== null && (typeof options.max !== "number"&& options.max < 1)) throw new Error("Could not interpret value for max number of games to download");
        if (options.vs && typeof options.vs !== "string") throw new TypeError("game ID for lichess.games.export() must be a string");
        if (options.vs && !/[a-z][\w-]{0,28}[a-z0-9]/i.test(options.vs)) throw new TypeError("Invalid format for lichess username: " + options.vs);
        if (options.perfType) {
            if (typeof options.perfType === "string") options.perfType = [options.perfType];
            else if (!Array.isArray(options.perfType)) throw new TypeError("perfType parameter must be a variant represented as a string or an array containing variants from the specific lichess list: " + config.variants.join(","));
            for (let variant of options.perfType) {
                if (config.variants.indexOf(variant.trim()) === -1) throw new TypeError("variants specified must be from the specific list of lichess variant keys, separated by a comma: " + config.variants.join(","));
            }
            options.perfType = options.perfType.join(",");
        }
        if (typeof options.color !== "undefined" && typeof options.color !== "string" && !/^(?:white|black)$/.test(options.color)) throw new TypeError("color parameter takes a string value of 'white' or 'black'");
        for (let option of ["rated", "analysed", "ongoing", "moves", "tags", "clocks", "evals", "opening"]) {
            if (typeof options[option] !== "undefined" && typeof options[option] !== "boolean") throw new TypeError(option + " parameter takes a boolean value");
        }
        if (ndjson === false && !filepath) throw new Error('pgn must contain a path to pipe to');
        let query = qs.stringify(options);
        try {
            let req = {
                uri: `${config.uri}api/games/user/${username}?${query}`,
                headers: {
                    Accept: "application/x-ndjson",
                },
                timeout: 20000,
                json: true
            }
            switch (Boolean(stream)) {
                case true:
                    let output = new EventEmitter();
                    request(req)
                        .on('data', (data) => {
                            let game = new Game(JSON.parse(data.toString().trim()));
                            output.emit('data', game);
                        })
                        .on('error', (e) => output.emit('error', e))
                        .on('end', () => output.emit('end'));
                    return output;
                case false:
                    return Promise.resolve((async () => {
                        new GameStore(Util.ndjson(await rp.get(req)))
                    })());
                default:
                    throw new TypeError(options);
            }      
        } catch (e) {
            if (e) throw e;
        }
    }

    /*
     * Stream the games played between a list of users, in real time. Only games where both players are part of the list are included.
     * Basically check if any two players from a list are playing right now
     */
    async current(usernames, options) {        
        if (!Array.isArray(usernames)) throw new TypeError("lichess.games.current() takes an array as an input");
        if (!usernames.every(n => typeof n === "string" && /[a-z][\w-]{0,28}[a-z0-9]/i.test(n))) throw new SyntaxError("Invalid format for lichess username.");
		try {
            let options = {
                method: "POST",
                uri: config.uri + "api/stream/games-by-users",
                body: {
                    text: {
                        plain: usernames.join(",")
                    }
                },
                json: true
            };
            let output = new EventEmitter();
            let x = request.post(options)
            .on('data', (data) => {
                let game = new Game(JSON.parse(data.toString().trim()));
                console.log(game);
            })
            .on('error', (e) => output.emit('error', e))
            .on('end', () => output.emit('end'));
            console.log(x);
            //return new GameStore(Util.ndjson(await rp.post(options)));
		} catch (e) {
			if (e) throw e;
		}
    }

    /*
     * requires OAuth2 authorisation
     */
    async ongoing(nb = 9) {
        if (typeof nb !== "number") throw new TypeError("Number of games to fetch must be type Number");
        if (nb < 1 || nb > 50) throw new TypeError("nb value provided is out of range 1-50: " + nb);
		try {
            return await rp.get({
                "method": "GET",
                "uri": config.uri + "api/account/playing",
                "timeout": 2000
            });
		} catch (e) {
			if (e) throw e;
		}
    }
    
    async TV(variants = []) {
        let vmap = new Map([
            ["bot", "Bot"],
            ["computer", "Computer"],
            ["ultraBullet", "UltraBullet"],
            ["bullet", "Bullet"],
            ["blitz", "Blitz"],
            ["rapid", "Rapid"],
            ["classical", "Classical"],
            ["chess960", "Chess960"],
            ["crazyhouse", "Crazyhouse"],
            ["antichess", "Antichess"],
            ["atomic", "Atomic"],
            ["horde", "Horde"],
            ["kingOfTheHill", "King of the Hill"],
            ["racingKings", "Racing Kings"],
            ["threeCheck", "Three-check"],
            ["topRated", "Top Rated"]
        ])
        if (variants) {
            if (typeof variants === "string") variants = [variants];
            if (!Array.isArray(variants)) throw new TypeError("variants parameter must be a variant represented as a string or an array containing variants from the specific lichess list: " + config.variants.join(","));
            if (!variants.every(v => config.variants.indexOf(v.trim()))) throw new TypeError("variants specified must be from the specific list of lichess variant keys, separated by a comma: " + config.variants.join(","));
        }
        try {
            let data = await rp.get({
                uri: `${config.uri}tv/channels`,
                json: true,
                timeout: 2000
            });
            if (variants.length === 0) return data;
            let robj = {};
            for (let v of variants) {
                robj[v] = data[vmap.get(v)]
            }
            return robj;
        } catch (e) {
            if (e) throw e;
        }
    }
    
}

module.exports = Games;