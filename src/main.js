let version = Number(process.version
	.match(/v([0-9]+)\.([0-9]+)\.([0-9]+)/)
	.slice(1)
	.map(n => '0'.repeat(2 - n.toString().length) + n.toString())
	.join(''));
const events = version < 111300 ? require('./util/Events.js') : require('events');
const {
	once,
	EventEmitter
} = events;
let authentication = new EventEmitter();

const Users = require('./endpoints/users');
const Games = require('./endpoints/games');
const Tournaments = require('./endpoints/tournaments');
const Profile = require('./endpoints/profile');
const Puzzles = require('./endpoints/puzzles');
/**
 * Creates a new instance of a JavaScript client for the Lichess API.
 * This client is almost entirely asynchronous and relies on the dependencies in package.json, with the most notable being {'request-promise'}
 * View {Collection} to see the properties of a collection.
 */
class Lila {

	constructor() {
		this.oauthOptions = {
			port: '3000',
			host: 'http://localhost',
			callback: 'http://localhost:3000/callback',
			scopes: [],
			autoclose: false
		};
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
		this.access_token = access_token;
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
			if (typeof value !== 'boolean') throw new TypeError('Scope value must be a boolean');
			if (!(key in def)) throw new Error('Invalid scope');
			if (value) def[key] = true;
		}
		this.oauthOptions.scopes = Object.keys(def).filter(k => def[k]);
		return this;
	}

	/**
     * Logs into the client OAuth credentials using the app secret
	 * Only for personal token use
     * @param {string} secret 
     */
	login(secret) {
		if (this.access_token) return this;
		if (!secret) throw 'Invalid secret to login';
		this.oauthOptions.secret = secret;
		this.oauth = this.getOAuth(Math.random().toString(36).substring(2));
		return this;
	}

	/**
     * Resolves a promise when the OAuth process has completed. Useful for testing.
     * @name Lila#authentication
     * @example
     * //Gets the user endpoint only once authentication has been achieved
     * const lila = require('lazy-lila').setID(id).login(secret);
     * 
     * (async () => {
     *  await lila.authentication();
     *  lila.users.get('theLAZYmd');    //Method is not called unless user logs in
     * })
     */
	async authentication() {
		try {
			let x = await once(authentication, 'login');
			if (!x) throw 'Failed to log in';
			return true;
		} catch (e) {
			throw e;
		}
	}

	/**
     * Sets OAuth values from a user-specified config. Resolves a promise for Lila#authentication when called
     * @private
     * @param {string} state 
     */
	async getOAuth(state) {
		if (!this.oauthOptions.id || !this.oauthOptions.secret) throw new Error('Can\'t login to Authentication process without a valid app ID');
		const OAuth = require('./util/OAuth');
		this.oauthOptions.state = state;
		const Session = new OAuth(this.oauthOptions);
		Session.run(async () => {
			this.oauth = Session.oauth2;
			this.result = Session.result;
			if (Session.state === state) authentication.emit('login');
		});
	}

	get users() {
		return new Users(this.oauth, this.result, this.access_token);
	}

	get games() {
		return new Games(this.oauth, this.result, this.access_token);
	}

	get tournaments() {
		return new Tournaments(this.oauth, this.result, this.access_token);
	}
    
	get profile() {
		if (!this.oauth && !this.access_token) throw new Error('Can\'t call OAuth method without having first logged in!');
		return new Profile(this.oauth, this.result, this.access_token);
	}

	get puzzles() {
		return new Puzzles();
	}

}

module.exports = Lila;