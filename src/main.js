const {
    id = null,
    secret = null
} = require('./config.json');

const Users = require("./endpoints/users");
const Games = require("./endpoints/games");
const Tournaments = require("./endpoints/tournaments");

/**
 * Creates a new instance of the client to use the Lichess API with oauth settings
 * @constructor
 * @param {clientOptions} config 
 */
class Lila {

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

module.exports = Lila;