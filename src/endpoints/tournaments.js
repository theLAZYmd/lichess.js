const request = require('request');
const rp = require('request-promise');
const qs = require('querystring');
const cheerio = require('cheerio');

const config = require('../config.json');
const User = require('../structures/User');
const UserConstructor = require('./users');
const TournamentUser = require('../structures/TournamentUser');

class Tournaments {

	constructor(oauth, result, access_token) {
		this.oauth = oauth;
		this.result = result;
		this.access_token = access_token;
	}

	/**
	 * @typedef LichessTournament
	 * @property {Number} nbPlayers - the number in the tournament
	 * @property {TournamentGame} duels - contains the ID of the game, and a 'p' property with an array of two players 'n' name 'r' rating and 'k' ranking for each
	 * @property {Object} standing - property page: 1, players User[] with name, rank, rating, ratingDiff, score, sheet: {scores, total, fire}, title
	 * @property {Boolean} isStarted - has the tournament started?
	 * @property {Number?} secondsToStart - doesn't exist after tournament has started
	 * @property {Number?} secondsToFinish - doesn't exist before tournament has started
	 * @property {TournamentGame?} featured - id, fen, color, lastMove, white {rank, name, rating}, black {rank, name, rating, title, berserk}
	 * @property {string} id
	 * @property {string} createdBy
	 * @property {Date} startsAt
	 * @property {string} system - dictates the type of arena
	 * @property {string} fullName - username
	 * @property {Number} minutes
	 * @property {Object} perf - icon, name of variant type
	 * @property {Object} clock - limit, increment
	 * @property {string} variant
	 * @property {Object?} spotlight - 'headline', 'description', 'iconFont'
	 * @property {Boolean} berserkable
	 * @property {Object} verdicts - 'list' [{condition: 'val', verdict: 'ok'}], accepted Boolean - list of conditions for restrictions on tournaments
	 * @property {Object} schedule - 'freq' ex: shield, 'speed' ex: classical
	 * @property {Object} quote - text and author
	 * @property {string} defender - username
	 */

	/**
	 * Gets the live data of a tournament
	 * @param {string} id
	 * @returns LichessTournament
	 */
	async get (id) {
		try {
			let data = await rp.get({
				method: 'GET',
				uri: config.uri + 'tournament/' + id,
				header: {
					Accept: 'application/vnd.lichess.v1+json'
				},
				timeout: 2000
			});
			/* eslint-disable no-unused-vars */
			let {nbPlayers, duels, standing, isStarted, secondsToFinish, featured, createdBy, startsAt, system, fullName, minutes, perf, clock, variant, spotlight, beserkable, verdicts, schedule, defender} = data;
			let tourn_id = data.id;
			return data;
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
	 * Returns the list of ongoing tournaments
	 */
	async list () {
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
		return await new Promise((res, rej) => {
			let output = [];
			let last = '';
			const provQuery = {
				method: 'GET',
				uri: `${config.uri}api/tournament/${id}/games?${qs.stringify(Object.assign(def, options))}`,
				headers: {
					Accept: 'application/' + (ndjson ? 'x-ndjson' : 'x-chess-pgn')
				}
			};
			try {
				if (!ndjson) return rp(provQuery).then(res);
				let req = request.get(provQuery);
				req.on('data', (data) => {
					data.toString().trim().split('\n').forEach(line => req.emit('line', line));
				})
					.on('line', (str) => {
						let test = last + str;
						try {
							let json = JSON.parse(test);
							last = '';
							output.push(new User(json));
						} catch (e) {
							last += str;
						}
					})
					.on('response', (response) => {
						if (response.statusCode !== 200) req.emit('error', 'Not found');
					})
					.on('error', rej)
					.on('end', async () => {							
						let results = output;
						res(results);
					});
			} catch (e) {
				if (e) rej(e);
			}
		});
	}

	/**
	 * Returns the results (as an array of users) 
	 * @param {*} id 
	 * @param {*} options
	 * @returns {Object}
	 * @property {string} id
	 * @property {User[]} results
	 */
	async results (id, {
		nb = 9,
		fetchUsers = true,
		filter = () => true
	} = {}) {
		if (typeof id !== 'string') throw new TypeError('Tournament ID must be a string');
		if (typeof nb !== 'number') throw new TypeError('Number of games to fetch must be type Number');
		if (typeof fetchUsers !== 'boolean') throw new TypeError('fetch takes Boolean values');
		if (nb <= 0) throw new RangeError('Number of results to fetch is outside the range');        
        const uri = `${config.uri}api/tournament/${id}/results?${qs.stringify({nb})}`;
		return await new Promise((res, rej) => {
			let output = [];
			let last = '';
			const options = {
				uri,
				Accept: 'application/x-ndjson'
			};
			try {
				let req = request.get(options);
				const Users = new UserConstructor(this);
				req.on('data', (data) => {
					data.toString().trim().split('\n').forEach(line => req.emit('line', line));
				})
					.on('line', (str) => {
						let test = last + str;
						try {
							let json = JSON.parse(test);
							last = '';
							output.push(new User(json));
						} catch (e) {
							last += str;
						}
					})
					.on('response', (response) => {
						if (response.statusCode !== 200) req.emit('error', 'Not found');
					})
					.on('error', rej)
					.on('end', async () => {	
                        let results = output;					
						//let results = output.map(r => new TournamentUser(r)).filter(filter);
						if (!fetchUsers) return res({id, results});
						//let users = await Users.getMultiple(results);
						//results = results.map((u, i) => Object.assign(u, users[i]));
						res({id, results});
					});
			} catch (e) {
				if (e) rej(e);
			}
		});
	}
	
	/**
	 * Returns the results of the last shield in a variant
	 * @param {LichessVariant} variant 
	 * @param {ResultsData} data 
	 */
	async lastShield(variant, data) {
		try {
			const ids = await this.shields(variant, false);
			let id = ids.shift();
			return await this.results(id, data);
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
	 * @param {string?} variant - The shield variant as a variant KEY
	 * @param {Boolean?} dev - Whether the lichess.dev page should be parsed
	 * @public
	 * @returns {string[]|Object}
	 */
	async shields(variant = '') {
		try {
			if (variant) return await this.constructor.getV2Variant(variant);
			else return await this.constructor.getV2Shields();
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
	 * Single web-crawler for V2 lichess design
	 * @param {string} variant - The shield variant 
	 * @private
	 * @returns {string[]}
	 */
	static async getV2Variant(variant) {
		if (config.variants.concat(config.shield).indexOf(variant) === -1) throw new Error('Variant ' + variant + ' does not have a valid value:\n' + config.variants.concat(config.shield).join(', '));
		const data = await rp.get(`${config.uri}tournament/shields/${variant}`);
		let found = [];
		const $ = cheerio.load(data);
		$('a', 'div[class="page-menu__content box"]').each((i, link) => {
			let text = $(link).attr('href');
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
	 * @deprecated
	 * @returns {Object}
	 */
	static async getV1Shields() {
		const data = await rp.get(`${config.uri}tournament/shields`);
		let output = {};
		const $ = cheerio.load(data);
		$('.winner_list').each(function () {
			let curr = null;
			$(this).find('h2').each(function () {
				curr = $(this).text()
					.trim()
					.split('\n')
					.pop()
					.trim();
			});
			output[curr] = [];
			$(this).find('a').each(function () {
				let line = $(this);
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
		const data = await rp.get(`${config.uri}tournament/shields`);
		let output = {};
		const $ = cheerio.load(data);
		$('.tournament-shields__item').each(function (i, section) {
			let curr = null;
			$(this).find('h2 a').each(function () {
				curr = $(this)
					.attr('href')
					.split('/')
					.pop()
					.trim();
			});
			output[curr] = [];
			$(this).find('a').each(function () {
				let line = $(this);
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