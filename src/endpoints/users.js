const rp = require('request-promise');
const config = require('../config.json');

class Users {

    static async status(names) {
        if (!Array.isArray(names)) throw new TypeError("lichess.users.status() takes an array as an input");
        if (names.length > 50) throw new TypeError("Cannot check status of more than 50 names");
        for (let n of names) {
            if (typeof n !== "string") throw new TypeError("lichess.users.status() takes string values of an array as an input: " + n);
            if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(n)) throw new TypeError("Invalid format for lichess username: " + n);
        }
        try {
            return rp.get({
                "uri": config.uri + "api/users/status?ids=" + names.join(","),
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw "Either request timed out or account doesn't exist. If account exists, please try again in 30 seconds.";
        }
    }

    static async top10() {
        try {
            return rp.get({
                "uri": config.uri + "player",
                "headers": {
                    "Accept": "application/vnd.lichess.v3+json"
                },
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw e;
        }
    }

    static async leaderboard(variant = "bullet", n = 100) {
        if (typeof variant !== "string") throw new TypeError("Variant must match list of lichess variant keys");
        let f = false;
        for (let v of config.variants) {        //this is bad, we should use an aho-corasick at some point
            if (variant === v) {
                f = true;
                break;
            }
        }
        if (!f) throw new TypeError("Variant must match list of lichess variant keys: " + config.variants.join(", "));
        if (n > 200) throw new TypeError("Cannot get leaderboard for more than 200 names");
        try {
            return rp.get({
                "uri": config.uri + "player/top/" + n + "/" + variant,
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw e;
        }
    }

    static async user(username) {
        if (typeof username !== "string") throw new TypeError("lichess.users.user() takes string values of an array as an input: " + username);
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        try {
            return rp.get({
                "uri": config.uri + "api/user/" + username,
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw "Either request timed out or account doesn't exist. If account exists, please try again in 30 seconds.";
        }
    }

    //seems to be deprecated
    static async history(username) {
        if (typeof username !== "string") throw new TypeError("lichess.users.history() takes string values of an array as an input: " + username);
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        try {
            return rp.get({
                "uri": config.uri + "api/user/" + username + "/rating-history",
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw "Either request timed out or account doesn't exist. If account exists, please try again in 30 seconds.";
        }
    }
    
    static async activity(username) {
        if (typeof username !== "string") throw new TypeError("lichess.users.activity() takes string values of an array as an input: " + username);
        if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError("Invalid format for lichess username: " + username);
        try {
            return rp.get({
                "uri": config.uri + "api/user/" + username + "/activity",
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw "Either request timed out or account doesn't exist. If account exists, please try again in 30 seconds.";
        }
    }

    static async users(names) {        
        if (!Array.isArray(names)) throw new TypeError("lichess.users.users() takes an array as an input");
        if (names.length > 50) throw new TypeError("Cannot check status of more than 50 names");
        for (let n of names) {
            if (typeof n !== "string") throw new TypeError("lichess.users.status() takes string values of an array as an input: " + n);
            if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(n)) throw new TypeError("Invalid format for lichess username: " + n);
        }
		try {
            let options = {
                "method": "POST",
                "uri": config.uri + "api/users",
                "body": {
                    "text": {
                        "plain": names.join(",")
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

    static async team(team) {
        if (typeof team !== "string") throw new TypeError("lichess.users.team() takes string values of an array as an input: " + team);
        try {
            return rp.get({
                "uri": config.uri + "team/" + team + "/users",
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw "Either request timed out or account doesn't exist. If account exists, please try again in 30 seconds.";
        }
    }

    static async live() {
        try {
            return rp.get({
                "uri": config.uri + "streamer/live",
                "json": true,
                "timeout": 2000
            });
        } catch (e) {
            if (e) throw "Either request timed out or account doesn't exist. If account exists, please try again in 30 seconds.";
        }
    }

    static async titled(titles = ["GM"], online = false) {
        if (!Array.isArray(titles)) throw new TypeError("Variant must match list of lichess variant keys");
        let f = false;
        for (let t of titles) {
            for (let _t of config.titles) {        //this is bad, we should use an aho-corasick at some point
                if (t === _t) {
                    f = true;
                    break;
                }
            }
        }
        if (!f) throw new TypeError("Title must match list of lichess title keys: " + config.titles.join(", "));
        if (n > 200) throw new TypeError("Cannot get leaderboard for more than 200 names");
        try {
            return rp.get({
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