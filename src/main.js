const c = require('./config.json');

const Users = require("./endpoints/users");
const Games = require("./endpoints/games");
const Tournaments = require("./endpoints/tournaments");

/**
 * Creates a new instance of the client to use the Lichess API with oauth settings
 * @constructor
 * @param {clientOptions} config 
 */
class lazy_lila {

    /**
     * @typedef {Object} clientOptions
     * @property {oAuthOptions} oauth
     */
    constructor(config) {

        this.config = config;

        /**
         * @typedef {Object} oauthOptions
         * @property {string} id
         * @property {string} secret
         */
        this.oauth = config.oauth || {
            id: c.id || null,
            secret: c.secret || null
        }
    }

    get users () {
        if (this._users) return this._users;
        return this._users = new Users(this.config);
    }

    get games () {
        if (this._games) return this._games;
        return this._games = new Games(this.config);
    }

    get tournaments () {
        if (this._tournaments) return this._tournaments;
        return this._tournaments = new Tournaments(this.config);
    }

}

const Lichess = new lazy_lila();
module.exports = Lichess;

(async () => {
    try {
        //console.log(await Lichess.users.status(["theLAZYmd", "mathace", "dovijanic", "opperwezen"]));
        //console.log(await Lichess.users.top10());
        //console.log(await Lichess.users.leaderboard("crazyhouse"));
        //console.log(await Lichess.users.user("theLAZYmd"));
        //console.log(await Lichess.users.history("theLAZYmd"));
        console.log(await Lichess.users.users(["theLAZYmd", "mathace", "dovijanic", "opperwezen"]));
    } catch (e) {
        if (e) console.error(e);
    }
})();