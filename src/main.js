const Users = require("./endpoints/users");
const Games = require("./endpoints/games");
const Tournaments = require("./endpoints/tournaments");

class Lila {

    /**
     * Sets the client's ID to use for OAuth
     * @param {string} id 
     */
    setID(id) {
        if (!this.oauth) this.oauth = {};
        this.oauth.id = id;
        return this;
    }
    /**
     * Sets the client's secret to use for OAuth
     * @param {string} secret 
     */
    setSecret(secret) {
        if (!this.oauth) this.oauth = {};
        this.oauth.secret = secret;
        return this;
    }

    setHost() {}
    setCallback() {}
    setScopes() {}
    login() {}

    /**
     * Sets the client's Personal Access Token if one is supplied
     * @param {string} secret 
     */
    setPersonal(access_token) {        
        if (!this.oauth) this.oauth = {};
        this.oauth.access_token = access_token;
        return this;
    }

    get users () {
        return new Users(this.oauth);
    }

    get games () {
        return new Games(this.oauth);
    }

    get tournaments () {
        return new Tournaments(this.oauth);
    }

    get _constructor () {
        return Lila;
    }

}

module.exports = new Lila;