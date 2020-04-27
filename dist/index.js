"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("./endpoints/users")); /*
import Games from './endpoints/games';
import Tournaments from './endpoints/tournaments';*/
const profile_1 = __importDefault(require("./endpoints/profile")); /*
import Puzzles from './endpoints/puzzles';
import Teams from './endpoints/teams';*/
/**
 * Creates a new instance of a JavaScript client for the Lichess API.
 * This client is almost entirely asynchronous and relies on the dependencies in package.json, with the most notable being {'request-promise'}
 * View {Collection} to see the properties of a collection.
 */
class Lila {
    constructor(access_token) {
        this.access_token = access_token;
    }
    /**
     * Sets the client's Personal Access Token if one is supplied
     * @param {string} secret
     */
    setToken(access_token) {
        this.access_token = access_token;
        return this;
    }
    /**
     * List of scopes "https://lichess.org/api#section/Authentication"}
     * @default {}
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
    /**
     * Sets the scopes for the authentication process
     * @default []
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
            if (typeof value !== 'boolean')
                throw new TypeError('Scope value must be a boolean');
            if (!(key in def))
                throw new Error('Invalid scope');
            if (value)
                def[key] = true;
        }
        return this;
    }
    /**
     * Resolves a promise when the OAuth process has completed. Useful for testing.
     * @name Lila#authentication
     * @example
     * //Gets the user endpoint only once authentication has been achieved
     * import lila from 'lazy-lila').setID(id).login(secret;
     *
     * (async () => {
     *  await lila.authentication();
     *  lila.users.get('theLAZYmd');    //Method is not called unless user logs in
     * })
     */
    get users() {
        return new users_1.default(this.access_token);
    }
    /*
        get games() {
            return new Games(this.access_token);
        }
    
        get tournaments() {
            return new Tournaments(this.access_token);
        }*/
    get profile() {
        if (!this.access_token)
            throw new Error('Can\'t call OAuth method without having first logged in!');
        return new profile_1.default(this.access_token);
    }
}
exports.default = Lila;
//# sourceMappingURL=index.js.map