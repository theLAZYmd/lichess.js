const rp = require('request-promise');
const config = require('../config.json');

class Tournaments {

    static async get () {
        return await rp.get({
            "uri": config.uri + "/api/tournament",
            "json": true,
            "timeout": 2000
        })
    }

    static async games (id, options = {}, ndjson = false) {        
        if (typeof id !== "string") throw new TypeError("Tournament ID must be a string");
        let keys = [    "moves", "tags", "clocks", "evals", "opening", "literate"   ];
        let values = keys.filter(k => typeof options[k] !== "undefined").map(k => options[k]);
		try {
            return await rp.get({
                "method": "GET",
                "uri": config.uri + "api/tournament/" + id + "/games",
                "headers": {
                    "Accept": "application/" + (ndjson ? "x-ndjson" : "x-chess-pgn")
                },
                "timeout": 2000
            });
		} catch (e) {
			if (e) throw e;
		}
    }

    static async results (id, nb = 9) {
        try {
            if (typeof id !== "string") throw new TypeError("Tournament ID must be a string");
            if (typeof nb !== "number") throw new TypeError("Number of games to fetch must be type Number");
            let query = "?nb=" + nb;
            return await rp.get({
                "method": "GET",
                "uri": config.uri + "api/tournament/" + id + "/results" + query,
                "headers": {
                    "Accept": "application/" + (ndjson ? "x-ndjson" : "x-chess-pgn")
                },
                "body": {
                    "text": {
                        "plain": ids.join(",")
                    }
                },
                "timeout": 2000
            });
		} catch (e) {
			if (e) throw e;
		}
    }

}

module.exports = Tournaments;