class Lila {

    constructor() {
        this.oauthOptions = {
            port: '3000',
            host: 'http://localhost',
            callback: 'http://localhost:3000/callback',
            scopes: []
        }
    }

    /**
     * Sets the client's ID to use for OAuth
     * @param {string} id 
     */
    setID(id) {
        this.oauthOptions.id = id;
        return this;
    }
    
    /**
     * Sets the client's Personal Access Token if one is supplied
     * @param {string} secret 
     */
    setPersonal(access_token) {        
        this.oauthOptions.access_token = access_token;
        return this;
    }

    /**
     * Sets the client's host domain. Must be a valid url.
     * @default 'http://localhost'
     * @param {string} host
     */
    setHost(host) {
        this.oauthOptions.host = host;
        return this;
    }

    /**
     * Sets the port on the host domain to listen to.
     * @default 3000
     * @param {number} port 
     */
    setPort(port) {
        this.oauthOptions.port = port;
        return this;
    }

    /**
     * Sets the callback url on the host domain. Is appended to the host domain.
     * @default 'callback'
     * @param {string} callback 
     */
    setCallback(callback) {
        this.oauthOptions.callback = callback;
        return this;
    }

    /**
     * List of scopes "https://lichess.org/api#section/Authentication"}
     * @default []
     * @typedef {scopeOptions}
     * @property {Boolean} 'game:read': @default false - Read game playing
     * @property {Boolean} 'preference:read' @default false -  Read your preferences
     * @property {Boolean} 'preference:write' @default false - Write your preferences
     * @property {Boolean} 'email:read' @default false - Read your email address
     * @property {Boolean} 'challenge:read' @default false - Read incoming challenges
     * @property {Boolean} 'challenge:write' @default false - Create, accept, decline challenges
     * @property {Boolean} 'tournament:write' @default false - Create tournaments
     * @property {Boolean} 'bot:play' @default false - Plays moves through the account, only available through bot accounts
     * @param {scopeOptions} scopes 
     */

    setScopes(scopes = {}) {
        let def = {
            'game:read': false,
            'preference:read': false,
            'preference:write': false,
            'email:read': false,
            'challenge:read': false,
            'challenge:write': false,
            'tournament:write': false,
            'bot:play': false
        };
        for (let [key, value] of Object.entries(scopes)) {
            if (typeof value !== "boolean") throw new TypeError('Scope value must be a boolean');
            if (!key in def) throw new Error('Invalid scope');
            if (value) def[key] = true;
        }
        this.oauthOptions.scopes = Object.keys(def).filter(k => def[k]);
        return this;
    }

    /**
     * Logs into the client OAuth credentials using the app secret
     * @param {string} secret 
     */
    async login(secret) {
        if (secret) this.secret = secret;
        this.oauth = await this.getOAuth();
        return this;
    }

    async getOAuth() {
        if (!this.oauthOptions.id && !this.oauthOptions.access_token) throw new Error("Can't login to Authentication process without a valid app ID");
        throw new Error('e');
        const OAuth = require('./util/OAuth');
        const Session = new OAuth(this.oauthOptions);
        return Session.oauth2;
    }

    get users () {
        const Users = require('./endpoints/users');
        return new Users(this.oauth);
    }

    get games () {
        const Games = require('./endpoints/games');
        return new Games(this.oauth);
    }

    get tournaments () {
        const Tournaments = require('./endpoints/tournaments');
        return new Tournaments(this.oauth);
    }

}

module.exports = Lila;