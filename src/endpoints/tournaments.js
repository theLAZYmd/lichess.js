const rp = require('request-promise');
//const fs = require('fs');
//const cheerio = require('cheerio');

const config = require('../config.json');
const Util = require('../util/Util');
const UserStore = require('../stores/UserStore');
const TournamentUser = require('../structures/TournamentUser');

class Tournaments {

    async get () {
        return await rp.get({
            "uri": config.uri + "/api/tournament",
            "json": true,
            "timeout": 2000
        })
    }

    async games (id, options = {}, ndjson = false) {        
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

    async results (id, {
        nb = 9,
        fetch = true
    } = {}) {
        try {
            if (typeof id !== "string") throw new TypeError("Tournament ID must be a string");
            if (typeof nb !== "number") throw new TypeError("Number of games to fetch must be type Number");
            let query = "?nb=" + nb;            
            let results = Util.ndjson((await rp.get({
                method: "GET",
                uri: config.uri + "api/tournament/" + id + "/results" + query,
                headers: {
                    Accept: "application/x-json"
                },
                timeout: 2000
            })).trim());
            TournamentUser.fetch = fetch;
            return new UserStore(results, TournamentUser);
		} catch (e) {
			if (e) throw e;
		}
    }

    async live (id) {
        try {
            let html = await rp.get({
                method: "GET",
                uri: config.uri + "tournament/" + id,
                timeout: 2000
            });
            let json = JSON.parse(html.match(/\{.*\:\{.*\:.*\}\}/g)[0]);
            //fs.writeFileSync('../../misc/sandbox.json', JSON.stringify(json, null, 4));
            /*
            let $ = cheerio.load(html);
            $('script').each((i, elem) => {
                console.log($(this));
            })*/
            //return json;
        } catch (e) {
            if (e) throw e;
        }
    }

}

module.exports = Tournaments;