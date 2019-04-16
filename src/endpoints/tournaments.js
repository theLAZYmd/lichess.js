const rp = require('request-promise');
const qs = require('querystring');
//const fs = require('fs');
//const cheerio = require('cheerio');

const config = require('../config.js');
const Util = require('../util/Util');
const UserStore = require('../stores/UserStore');
const UserConstructor = require('./users');
const TournamentUser = require('../structures/TournamentUser');

class Tournaments {

	constructor(oauth, result, access_token) {
		this.oauth = oauth;
		this.result = result;
		this.access_token = access_token;
	}

	async get () {
		return await rp.get({
			uri: config.uri + '/api/tournament',
			json: true,
			timeout: 2000
		});
	}

	async games (id, options = {}, ndjson = false) {        
		if (typeof id !== 'string') throw new TypeError('Tournament ID must be a string');
		let def = {
			moves: true,
			tags: true, 
			clocks: false, 
			evals: false, 
			opening: false, 
			literate: false
		};
		if (!Object.keys(options).every(k => k in def)) throw new Error('Query parameter doesn\'t exist!');
		if (!Object.values(options).every(v => typeof v !== 'boolean')) throw new Error('Query parameter must take a boolean value!');
		try {
			return await rp.get({
				method: 'GET',
				uri: `${config.uri}api/tournament/${id}/games?${qs.stringify(Object.assign(def, options))}`,
				headers: {
					Accept: 'application/' + (ndjson ? 'x-ndjson' : 'x-chess-pgn')
				},
				timeout: 2000
			});
		} catch (e) {
			if (e) throw e;
		}
	}

	async results (id, {
		nb = 9,
		fetchUsers = true
	} = {}) {
		try {
			if (typeof id !== 'string') throw new TypeError('Tournament ID must be a string');
			if (typeof nb !== 'number') throw new TypeError('Number of games to fetch must be type Number');
			if (typeof fetchUsers !== 'boolean') throw new TypeError('fetch takes Boolean values');
			if (nb <= 0) throw new RangeError('Number of results to fetch is outside the range');        
			let results = Util.ndjson((await rp.get({
				method: 'GET',
				uri: `${config.uri}api/tournament/${id}/results?${qs.stringify({nb})}`,
				headers: {
					Accept: 'application/x-json'
				},
				timeout: 2000
			})).trim());
			let result = new UserStore(results, TournamentUser);
			if (!fetchUsers) return result;
			const Users = new UserConstructor(this);
			let users = await Users.getMultiple(result.keyArray());
			return result.merge(users);
		} catch (e) {
			if (e) throw e;
		}
	}

	async live (id) {
		try {
			let html = await rp.get({
				method: 'GET',
				uri: config.uri + 'tournament/' + id,
				timeout: 2000
			});
			let json = JSON.parse(html.match(/\{.*\:\{.*\:.*\}\}/g)[0]);
			//fs.writeFileSync('../../misc/sandbox.json', JSON.stringify(json, null, 4));
			/*
            let $ = cheerio.load(html);
            $('script').each((i, elem) => {
                console.log($(this));
            })*/
			return json;
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * @typedef {Object} tournamentOptions
     * @property {string} name
     * @property {number} clockTime
     * @property {number} clockIncrement
     * @property {number} minutes
     * @property {number} waitMinutes
     * @property {number} startDate
     * @property {LichessVariant} variant 
     * @property {boolean} rated
     * @property {string} position
     * @property {boolean} berserkable
     * @property {string} password
     */

	/**
     * Create a new tournament. Create a public or private tournament to your taste.
     * This endpoint mirrors the form on https://lichess.org/tournament/new.
     * You can create up to 2 tournaments per day for a single login.
     * @param {tournamentOptions} tournamentOptions 
     */
	async create(tournamentOptions = {}) {
		try {
			if ((!this.oauth || !this.result) && !this.access_token) throw new Error('Insufficient permissions! Must connect OAuth app first.');
			let token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
			let access_token = token ? token.token.access_token : this.access_token;
			await rp.post({
				uri: `${config.uri}tournament/new`,
				headers: {
					Authorization: 'Bearer ' + access_token
				},
				body: tournamentOptions,
				json: true
			});
		} catch (e) {
			if (e) throw e;
		}
	}

}

module.exports = Tournaments;