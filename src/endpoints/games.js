const rp = require('request-promise');
const config = require('../config.json');
const qs = require('querystring');

class Users {

    async get(id, options = {}, json = false) {
        if (typeof id !== "string") throw new TypeError("game ID for lichess.games.export() must be a string");
        let def = {
            moves: true,
            tags: true, 
            clocks: true, 
            evals: true, 
            opening: true, 
            literate: false
        };
        if (!Object.keys(options).every(k => k in def)) throw new Error(`Query parameter doesn't exist!`);
        if (!Object.values(options).every(v => typeof v !== "boolean")) throw new Error('Query parameter must take a boolean value!');
        try {
            return await rp.get({
                uri: `${config.uri}game/export/${id}?${qs.stringify(Object.assign(def, options))}`,
                headers: {
                    Accept: "application/" + (json ? "json" : "x-chess-pgn")
                },
                timeout: 2000
            });
        } catch (e) {
            if (e) throw e;
        }
    }
    
    async byUser(username, options = {}, ndjson = false, filepath) { //it would be really nice if I learned how to use typescript to verify these values better than this   
        let keys = ["since", "until", "max", "vs", "perfType", "color", "rated", "analysed", "ongoing", "moves", "tags", "clocks", "evals", "opening"]
        if (typeof username !== "string") throw new TypeError("game ID for lichess.games.exportUser() must be a string");
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        if (options.since && options.since < 1356998400070) throw new Error("Date specified is before date of Lichess site launch");
        if (options.until && options.until < 1356998400070) throw new Error("Date specified is before date of Lichess site launch");
        if (typeof options.max !== "undefined" && (options.max !== null || typeof options.max !== "number" || options.max < 1)) throw new Error("Could not interpret value for max number of games to download");
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
            if (typeof [options[option]] !== "undefined" && typeof options[option] !== "boolean") throw new TypeError(option + " parameter takes a boolean value");
        }
        if (ndjson === false && !filepath) throw new Error()
        let values = keys.filter(k => typeof options[k] !== "undefined").map(k => options[k]);
        let query = (values.length > 0 ? "?" : "") + values.join("&");
        try {
            return await rp.get({
                "uri": config.uri + "api/games/user/" + username + query,
                "headers": {
                    "Accept": "application/" + (ndjson ? "x-json" : "x-chess-pgn")
                }
            });
            /*
            request({
                "uri": config.uri + "api/games/user/" + username + query,
                "headers": {
                    "Accept": "application/" + (ndjson ? "x-json" : "x-chess-pgn")
                }
            })
            .on('response', console.log)
            .pipe(request.put(filepath));
            */
        } catch (e) {
            if (e) throw e;
        }
    }

    async getMultiple(ids, options = {}, ndjson = false) {        
        if (!Array.isArray(ids)) throw new TypeError("lichess.games.getMultiple() takes an array as an input");
        for (let n of ids) {
            if (typeof n !== "string") throw new TypeError("lichess.users.status() takes string values of an array as an input: " + n);
            if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(n)) throw new TypeError("Invalid format for lichess username: " + n);
        }
        let keys = [    "moves", "tags", "clocks", "evals", "opening", "literate"   ];
        let values = keys.filter(k => typeof options[k] !== "undefined").map(k => options[k]);
        let query = (values.length > 0 ? "?" : "") + values.join("&");
		try {
            let options = {
                "method": "POST",
                "uri": config.uri + "games/export/_ids" + query,
                "headers": {
                    "Accept": "application/" + (ndjson ? "x-ndjson" : "x-chess-pgn")
                },
                "body": {
                    "text": {
                        "plain": ids.join(",")
                    }
                },
                "timeout": 2000,
                "json": true
            };
            return await rp.post(options);
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
        for (let n of usernames) {
            if (typeof n !== "string") throw new TypeError("lichess.users.current() takes string values of an array as an input: " + n);
            if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(n)) throw new TypeError("Invalid format for lichess username: " + n);
        }
		try {
            let options = {
                "method": "POST",
                "uri": config.uri + "api/stream/games-by-users",
                "body": {
                    "text": {
                        "plain": usernames.join(",")
                    }
                },
                "timeout": 2000
            };
            return await rp.post(options);
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
    
    async getTV(variants = []) {
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
            for (let variant of variants) {
                if (config.variants.indexOf(variant.trim()) === -1) throw new TypeError("variants specified must be from the specific list of lichess variant keys, separated by a comma: " + config.variants.join(","));
            }
        }
        try {
            let data = await rp.get({
                "uri": config.uri + "tv/channels",
                "json": true,
                "timeout": 2000
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

module.exports = Users;