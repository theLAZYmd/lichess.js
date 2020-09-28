"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("./endpoints/users")); /*
import Games from './endpoints/games';
import Tournaments from './endpoints/tournaments';*/
const profile_1 = __importDefault(require("./endpoints/profile"));
const challenge_1 = __importDefault(require("./endpoints/challenge")); /*
import Puzzles from './endpoints/puzzles';
import Teams from './endpoints/teams';*/
/**
 * Creates a new instance of a JavaScript client for the Lichess API.
 * This client is almost entirely asynchronous and relies on the dependencies in package.json, with the most notable being {'request-promise'}
 * View {Collection} to see the properties of a collection.
 */
class Lichess {
    constructor(access_token) {
        this.access_token = access_token;
    }
    /**
     *
     * Lichess time controls are based on estimated game duration = (clock initial time) + 40 × (clock increment)
     * For instance, the estimated duration of a 5+3 game is 5 × 60 + 40 × 3 = 420 seconds.
     */
    static getTimeControlCategory(mins, increment) {
        let d = (mins * 60) + 40 * increment;
        if (d < 30)
            return 'ultrabullet';
        if (d < 180)
            return 'bullet';
        if (d < 480)
            return 'blitz';
        if (d < 1500)
            return 'rapid';
        return 'classical';
    }
    /**
     * Sets the client's Personal Access Token if one is supplied
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
        return new profile_1.default(this.access_token);
    }
    get challenge() {
        return new challenge_1.default(this.access_token);
    }
}
exports.default = Lichess;
//# sourceMappingURL=index.js.map