const rp = require('request-promise');
const qs = require('querystring');
const cheerio = require('cheerio');

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

	/**
	 * Returns the list of ongoing tournaments
	 */
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
			let res = Util.ndjson((await rp.get({
				method: 'GET',
				uri: `${config.uri}api/tournament/${id}/results?${qs.stringify({nb})}`,
				headers: {
					Accept: 'application/x-json'
				},
				timeout: 2000
			})).trim());
			let results = new UserStore(res, TournamentUser);
			if (!fetchUsers) return {id, results};
			const Users = new UserConstructor(this);
			let users = await Users.getMultiple(results.keyArray());
			results = results.merge(users);
			return {id, results};
		} catch (e) {
			if (e) throw e;
		}
	}
	
	/**
	 * Returns the results of the last shield in a variant
	 * @param {LichessVariant} variant 
	 * @param {ResultsData} data 
	 */
	async lastShield(variant, data) {
		try {
			const ids = await this.shields(variant, false);
			const id = ids.shift();
			return await this.results(id, data);
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

	/**
	 * Crawls the Lichess shield pages and returns the list of tournament IDs for each shield
	 * @param {string?} variant - The shield variant
	 * @param {Boolean?} dev - Whether the lichess.dev page should be parsed
	 * @public
	 * @returns {string[]|Object}
	 */
	async shields(variant = '', dev = false) {
		if (variant && dev) return await this.constructor.getV2Variant(variant);
		if (dev) return await this.constructor.getV2Shields();
		let data = await this.constructor.getV1Shields();
		if (variant) return data[variant];
		return data;
	}

	/**
	 * Single web-crawler for V2 lichess design
	 * @param {string} variant - The shield variant 
	 * @private
	 * @returns {string[]}
	 */
	static async getV2Variant(variant) {
		const data = await rp.get(`${config.dev}tournament/shields/${variant}`);
		let found = [];
		const $ = cheerio.load(data);
		const $1 = cheerio.load($('div[class="page-menu__content box"]').html());
		const links = $1('a');
		$1(links).each((i, link) => {
			let text = $1(link).attr('href');
			try {
				let matches = text.split('/');
				let [n, tournament, id, etc] = matches;
				if (typeof etc !== 'undefined') return;
				if (n !== '') return;
				if (tournament !== 'tournament') return;
				if (id === 'leaderboard') return;
				if (id === 'shields') return;
				found.push(id);
			} catch (e) {
				if (e) throw [text, e];
			}
		});
		return found;
	}

	/**
	 * Web-crawler for all shields on V1 lichess design
	 * @private
	 * @returns {Object}
	 */
	static async getV1Shields() {
		const data = await rp.get('https://lichess.org/tournament/shields');
		let output = {};
		const $ = cheerio.load(data);
		const stages = $('.winner_list');
		$(stages).each((i, stage) => {
			let s = $(stage).html();
			let $1 = cheerio.load(s);
			let curr = null;
			$1('h2').each((i, elem) => {
				curr = $1(elem)
					.text()
					.trim()
					.split('\n')
					.pop()
					.trim();
			});
			output[curr] = [];
			let links = $1('a');
			$1(links).each((i, link) => {
				let line = $(link);
				if (!line.attr('href')) return;
				if (typeof line.attr('class') !== 'undefined') return;
				let path = line.attr('href');
				let id = path.split('/').pop();
				output[curr].push(id);
			});
		});
		return output;
	}

	/**
	 * Web-crawler for all shields on V2 lichess design
	 * @private
	 * @returns {Object}
	 */
	static async getV2Shields() {
		const data = await rp.get('https://lichess.dev/tournament/shields');
		let output = {};
		const $ = cheerio.load(data);
		const sections = $('.tournament-shields__item');
		$(sections).each((i, section) => {
			let s = $(section).html();
			let $1 = cheerio.load(s);
			let curr = null;
			$1('h2').each((i, elem) => {
				curr = $1(elem)
					.text()
					.trim()
					.slice(1);
			});
			output[curr] = [];
			let links = $1('a');
			$1(links).each((i, link) => {
				let line = $(link);
				if (!line.attr('href')) return;
				if (typeof line.attr('class') !== 'undefined') return;
				let path = line.attr('href');
				let matches = path.split('/');
				let [n, tournament, id, etc] = matches;
				if (typeof etc !== 'undefined') return;
				if (n !== '') return;
				if (tournament !== 'tournament') return;
				if (id === 'leaderboard') return;
				if (id === 'shields') return;
				output[curr].push(id);
			});
		});
		return output;
	}

}

module.exports = Tournaments;