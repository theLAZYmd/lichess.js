const DataStore = require('./DataStore');
const rp = require('request-promise');
const r = {
    username: /(?:^|\b)([a-z0-9][\w-]*[a-z0-9])$/i
}
const urls = {
    base: "https://lichess.org/",
    users: {
        status: "api/users/status?ids=|",
        top10: "player",
        get: "api/users/",
    },
    profile: "@/|",
    user: "api/user/|",
    game: "api/game/|",
    puzzle: "training/|",
    redirect: "http://localhost:3000/callback"
}

class UserStore extends DataStore {

    constructor(client) {
        super(client);     
    }

    static async status (userResolvable) {
        let users = resolve(userResolvable);
        return await rp.get({
            uri: urls.base + urls.users.status.replace("|", users.join(",")),
            json: true
        })
    }
    
    static async top10 () {
        return await rp.get({
            uri: urls.base + urls.users.top10,
            headers: {
                Accept: "application/vnd.lichess.v3+json"
            },
            json: true
        })
    }
}

module.exports = UserStore;

function resolve (stringResolvable) {
    try {
        if (Array.isArray(stringResolvable)) {
            for (let s of stringResolvable) {
                if (typeof s !== "string") throw ["type", s];
                if (!r.username.test(s)) throw ["format", s];
            }
            return stringResolvable;
        }
        if (typeof stringResolvable !== "string") throw ["type", stringResolvable];
        if (!r.username.test(stringResolvable)) throw ["format", stringResolvable];
        return [stringResolvable];
    } catch (e) {
        if (Array.isArray(e)) {
            if (e[0] === "type") throw new TypeError(`${typeof e[1]} is not a valid type to search username.`);
            if (e[1] === "format") throw new TypeError(`${e[1]} is not of the valid format to parse as a username.`);
        } 
        throw e;
    }
}