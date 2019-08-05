const rp = require('request-promise');
const config = require('../config');
const qs = require('querystring');

const UserStore = require('../stores/UserStore');
const RatingStore = require('../stores/RatingStore');
const StatusUser = require('../structures/StatusUser');
const StreamUser = require('../structures/StreamUser');
const User = require('../structures/User');
const Util = require('../util/Util');

class Users {

	constructor(oauth, result, access_token) {
		this.oauth = oauth;
		this.result = result;
		this.access_token = access_token;
	}

	/**
     * Get user(s) public data. Calls {getOne} or {getMultiple} depending on input parameter.
     * @param {string|string[]} userParam 
     */
	async get(userParam) {
		if (typeof userParam === 'string') return this.getOne(...arguments);
		if (Array.isArray(userParam)) {
			if (userParam.length === 1) return this.getOne(userParam[0], ...Array.from(arguments).slice(1));
			return this.getMultiple(...arguments);
		}
		throw new TypeError('Input must be string or string[]');
	}

	/**
     * @typedef {Object} oauthOptions
     * @param {boolean} oauth @default false
     */

	/**
     * Read public data of a user.
     * @param {string} username 
     * @returns {User}
     */
	async getOne(username) {
		if (typeof username !== 'string') throw new TypeError('lichess.users.get() takes string values of an array as an input: ' + username);
		if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		try {
			let options = {
				uri: `${config.uri}api/user/${username}`,
				json: true,
				timeout: 2000
			};
			return new User(await rp.get(options));
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * Get several users by their IDs. Users are returned in the order same order as the IDs.
     * @param {string[]} names 
     * @returns {Promise<Collection<User>>}
     */
	async getMultiple(names) {
		if (!Array.isArray(names)) throw new TypeError('lichess.users.getMultiple() takes an array as an input');
		//if (names.length > 50) throw new RangeError("Cannot check status of more than 50 names");
		if (!names.every(n => typeof n === 'string' && /[a-z][\w-]{0,28}[a-z0-9]/i.test(n))) throw new SyntaxError('Invalid format for lichess username.');
		try {
			let options = {
				method: 'POST',
				uri: `${config.uri}api/users`,
				body: names.join(','),
				timeout: 10000,
			};
			let arr = JSON.parse(await rp.post(options));
			return arr.map(data => new User(data));
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * Gets a list of users following a specified user
     * @param {string} username 
     * @returns {Promise<Collection<User>>}
     */
	async following(username) {
		if (typeof username !== 'string') throw new TypeError('lichess.users.get() takes string values of an array as an input: ' + username);
		if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		const uri = `${config.uri}api/user/${username}/following`;
		try {
			return Util.ndjson((await rp.get({
				uri,
				Accept: 'application/x-ndjson'
			})).trim()).map(data => new User(data));
		} catch (e) {
			if (e) {
				console.error(uri);
				throw e;
			}
		}
	}

	/**
     * Gets a list of users who follow a specified user
     * @param {string} username 
     * @returns {Promise<Collection<User>>}
     */
	async followers(username) {
		if (typeof username !== 'string') throw new TypeError('lichess.users.get() takes string values of an array as an input: ' + username);
		if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		try {
			return Util.ndjson((await rp.post({
				method: 'GET',
				uri: `${config.uri}api/user/${username}/followers`,
				timeout: 2000,
				json: true
			})).trim());
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * Options to send to the users.status endpoint
     * @typedef {Object} statusOptions
     * @property {boolean} fetchUsers @default false - whether to ping the users API and grab more data for each user
     * @filter {Function} filter @default true - if the users API is to be pinged, a filter for which status users to do this for
     * @example
     * //Only returns the full user object for users who are playing and titled
     * {
     *  fetchUsers: false,
     *  filter: user => user.playing && user.titled
     * }
     */

	/**
     * Gets the status of many users and returns it
     * @param {string[]} ids 
     * @param {statusOptions} options
     * @returns {Promise<Collection<StatusUser|User>>}
     */
	async status(ids, {
		fetchUsers = false,
		filter = user => user
	} = {}) {
		if (!Array.isArray(ids)) throw new TypeError('lichess.users.status() takes an array as an input');
		if (ids.length > 50) throw new TypeError('Cannot check status of more than 50 names');
		if (!ids.every(n => typeof n === 'string' && /[a-z][\w-]{0,28}[a-z0-9]/i.test(n))) throw new SyntaxError('Invalid format for lichess username');
		if (typeof fetchUsers !== 'boolean') throw new TypeError('fetch takes Boolean values');
		try {
			let results = await rp.get({
				uri: `${config.uri}api/users/status?${qs.stringify({
					ids: ids.join(',')
				})}`,
				json: true,
				timeout: 2000
			});
			if (!fetchUsers) return results;
			let users = await this.getMultiple(results.keyArray().filter(k => filter(results.get(k))));
			return results.merge(users);
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * Gets the top 10 players by rating of every variant
     * @returns {Promise<Colection>}
     */
	async top10() {
		try {
			let obj = await rp.get({
				uri: config.uri + 'player',
				headers: {
					Accept: 'application/vnd.lichess.v3+json'
				},
				json: true,
				timeout: 2000
			});
			for (let variant of Object.keys(obj)) {
				obj[variant] = new UserStore(obj[variant]);
			}
			return obj;
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * Gets the top user-specified number of players for a given variant
     * @param {string} variant @default 'bullet'
     * @param {number} n @default 100
     * @returns {Promise<Colection>}
     */
	async leaderboard(variant = 'bullet', n = 100) {
		if (typeof variant !== 'string') throw new TypeError('Variant must match list of lichess variant keys');
		if (config.variants.every(v => v !== variant)) throw new TypeError('Variant must match list of lichess variant keys: ' + config.variants.join(', '));
		if (n > 200) throw new TypeError('Cannot get leaderboard for more than 200 names');
		try {
			return new UserStore((await rp.get({
				uri: config.uri + 'player/top/' + n + '/' + variant,
				headers: {
					Accept: 'application/vnd.lichess.v3+json'
				},
				json: true,
				timeout: 2000
			})).users);
		} catch (e) {
			if (e) throw e;
		}
	}

	//seems to be deprecated
	async history(username) {
		if (typeof username !== 'string') throw new TypeError('lichess.users.history() takes string values of an array as an input: ' + username);
		if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		try {
			let raw = await rp.get({
				uri: `${config.uri}api/user/${username}/rating-history`,
				headers: {
					Accept: 'application/vnd.lichess.v1+json'
				},
				json: true,
				timeout: 2000
			});
			let arr = raw.map(({name, points}) => [
				name,
				points.reduce((obj, [year, month, day, rating]) => {
					let k = new Date(year, month, day).getTime();
					let v = rating;
					obj[k] = v;
					return obj;
				}, {})
			]);
			return new RatingStore(arr, function returner (data) {
				return data;
			});
		} catch (e) {
			if (e) throw e;
		}
	}

	async stats(username, variant) {
		if (typeof username !== 'string') throw new TypeError('lichess.users.history() takes string values of an array as an input: ' + username);
		if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		try {
			let raw = await rp.get({
				uri: `${config.uri}@/${username}/perf/${variant}`,
				headers: {
					Accept: 'application/vnd.lichess.v1+json'
				},
				json: true,
				timeout: 2000
			});
			return raw;
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * The activity feed of a user viewable on their profile
     * Needs to Have an ActivityStore built for it!
     * @deprecated
     * @param {string} username 
     * @returns {Object[]}
     * @example
     * //Sample Data
     * 
     * [{
     *  interval: {
     *      start: 1553731200,
     *      end: 1553817600
     *  },
     *  games: {
     *      bullet: {
     *          win: 1,
     *          loss: 0, 
     *          draw: 0,
     *          rp: {
     *              before: 1932,
     *              after: 1946
     *          }
     *      }
     *  }
     * }]
     */
	async activity(username) {
		if (typeof username !== 'string') throw new TypeError('lichess.users.activity() takes string values of an array as an input: ' + username);
		if (!/[a-z][\w-]{0,28}[a-z0-9]/i.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		try {
			let obj = await rp.get({
				uri: `${config.uri}api/user/${username}/activity`,
				json: true,
				timeout: 2000
			});
			return obj;
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * Get members of a team. Members are sorted by reverse chronological order of joining the team (most recent first).
     * @param {string} teamID
     * @returns {Promise<Collection<User>>}
     */
	async team(teamID) {
		if (typeof teamID !== 'string') throw new TypeError('teamID takes string values: ' + teamID);
		try {
			return Util.ndjson((await rp.get({
				uri: `${config.uri}team/${teamID}/users`,
				timeout: 10000
			})).trim());
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * Get a list of users who are live.
     * @param {statusOptions} options
     * @returns {Promise<Collection<StatusUser|User>>}
     */
	async streaming({
		fetchUsers = false,
		filter = user => user.streaming
	} = {}) {
		try {
			let result = new UserStore(await rp.get({
				uri: `${config.uri}streamer/live`,
				json: true,
				timeout: 2000
			}), StreamUser);
			if (!fetchUsers) return result;
			let users = await this.getMultiple(result.keyArray().filter(k => filter(result.get(k))));
			return result.merge(users);
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * @typedef {string} LichessTitle
     * @example
     * //List of only accepted LichessTitle values:
     * [
     *   "GM",
     *   "WGM",
     *   "IM",
     *   "WIM",
     *   "FM",
     *   "WFM",
     *   "NM",
     *   "CM",
     *   "WCM",
     *   "WNM",
     *   "LM",
     *   "BOT"
     * ]
     */

	/**
     * Get titled users. Get users by title. Several titles can be specified.
     * @param {LichessTitle[]} titles 
     * @param {Boolean} online 
     * @returns {Promise<Collection<StatusUser|User>>}
     */
	async titled(titles = ['GM'], online = false) {
		if (typeof titles === 'string') titles = [titles];
		if (!Array.isArray(titles)) throw new TypeError('Titles to check must be in an array');
		let titleList = new Map(config.titles.map(s => [s, true]));
		if (!titles.every(t => titleList.get(t))) throw new TypeError('Title must match list of lichess title keys: ' + config.titles.join(', '));
		try {
			return Util.ndjson((await rp.get({
				uri: `${config.uri}api/users/titled?${qs.stringify({
					titles: titles.join(','),
					online
				})}`,
				json: true,
				timeout: 10000
			})).trim());
		} catch (e) {
			if (e) throw e;
		}
	}

}

module.exports = Users;