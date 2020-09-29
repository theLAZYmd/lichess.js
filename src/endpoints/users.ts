
import config from '../config.json';
import qs from 'querystring';

import { GET, POST } from '../utils/requests';
import { SearchResult, User, StatusUser, Title, History, Variant, Activity, Rank, RankUser } from '../interfaces';
import * as regexes from '../utils/regexes';
import Stream from 'stream';
import request from 'request';

export * from '../interfaces';

export default class Users {

	constructor(public access_token?: string) {}

	search(term: string, friend: boolean = false, object: boolean = true): Promise<SearchResult[]> {
		return GET({
			url: '/player/autocomplete',
			params: {
				term,
				friend: friend ? 1 : 0,
				object: object ? 1 : 0
			}
		}).then(v => v.result);
	}

	/**
     * Get user(s) public data. Calls {getOne} or {getMultiple} depending on input parameter.
     */
	get(userParam: string, timeout?: number): Promise<User>
	get(userParam: string[], timeout?: number): Promise<User | User[]>
	get(userParam: string | string[], timeout?: number): Promise<User | User[]> {
		if (typeof userParam === 'string') return this.getOne(userParam, timeout);
		else {
			if (userParam.length === 1) return this.getOne(userParam[0], timeout);
			return this.getMultiple(userParam, timeout);
		}
	}

	/**
     * Read public data of a user.
     */
	getOne(username: string, timeout?: number): Promise<User> {
		if (!regexes.username.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		return GET({ url: '/api/user/' + username, timeout })
	}

	/**
     * Get several users by their IDs. Users are returned in the order same order as the IDs.
     */
	getMultiple(names: string[], timeout: number = 10000): Promise<User[]> {
		names.forEach((n) => {
			if (!regexes.username.test(n)) throw new TypeError('Invalid format for lichess username. ' + n);
		});
		return POST({ url: '/api/users', data: names.join(','), timeout });
	}

	/**
     * Gets a list of users following a specified user
     */
	async following(username: string, timeout?: number, stream?: false): Promise<User[]> {
		if (!regexes.username.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		let x = await GET({
			url: `/api/user/${username}/following`,
			timeout,
			headers: { Accept: 'application/x-ndjson'},
			responseType: stream ? 'stream' : 'text'
		});
		if (!stream) return (x as string).split('\n').map(line => JSON.parse(line));
		let last = '';
		let output = new Stream.Readable();
		return new Promise((res, rej) => {
			x.on('data', (data: Buffer) => {
				let str = data.toString().trim();
				try {
					let user = JSON.parse(last + str) as User;
					last = '';
					output.push(user)
				} catch (e) {
					last += str;
				}
			})
				.on('error', rej)
				.on('end', () => output.destroy());
		});
	}

	/**
     * Gets a list of users who follow a specified user
     */
	async followers(username: string): Promise<User[]> {
		if (!regexes.username.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		const uri = `${config.uri}api/user/${username}/followers`;
		return await new Promise((res, rej) => {
			let output: User[] = [];
			let last = '';
			const options = {
				uri,
				Accept: 'application/x-ndjson'
			};
			try {
				let req = request.get(options);
				req.on('data', (data) => {
					let str = data.toString().trim();
					try {
						let json: User = JSON.parse(last + str);
						last = '';
						output.push(json);
					} catch (e) {
						last += str;
					}
				})
					.on('response', (response) => {
						if (response.statusCode !== 200) req.emit('error', 'Not found');
					})
					.on('error', rej)
					.on('end', () => res(output));
			} catch (e) {
				if (e) rej(e);
			}
		});
	}

	/**
     * Options to send to the users.status endpoint
	 * @example
     * //Only returns the full user object for users who are playing and titled
     * {
     *  fetchUsers: false,
     *  filter: user => user.playing && user.titled
     * }
     */

	/**
     * Gets the status of many users and returns it
     */
	async status(ids: string[], options?: {
		fetchUsers: boolean,
		filter: (u: User | StatusUser) => boolean
	}): Promise<User[]|StatusUser[]> {
		let { fetchUsers, filter } = options || { filter: () => true };
		if (ids.length > 50) throw new TypeError('Cannot check status of more than 50 names');
		if (!ids.every(n => regexes.username.test(n))) throw new SyntaxError('Invalid format for lichess username');
		let results: User[] = await GET({
			url: '/api/users/status',
			params: {
				ids: ids.join(',')
			}
		});
		results = results.filter(filter);
		if (!fetchUsers) return results;
		let users = await this.getMultiple(results.map(u => u.id));
		return results.map((u, i) => Object.assign(u, users[i]));
	}

	/**
     * Gets the top 10 players by rating of every variant
     */
	async top10(keys: Variant | Variant[] = []): Promise<Rank | RankUser[]> {
		if (typeof keys === 'string') keys = [keys];
		let res = await GET({
			url: '/player',
			headers: {
				Accept: 'application/vnd.lichess.v3+json'
			},
			timeout: 2000
		}) as Rank;
		if (keys.length === 1) return res[keys[0]];
		return res;
	}

	/**
     * Gets the top user-specified number of players for a given variant
     */
	async leaderboard(variant: Variant = 'bullet', n: number = 100): Promise<RankUser[]> {
		if (n > 200) throw new TypeError('Cannot get leaderboard for more than 200 names');
		return await GET({
			url: '/player/top/' + n + '/' + variant,
			headers: {
				Accept: 'application/vnd.lichess.v3+json'
			},
			timeout: 2000
		});
	}

	/**
	 * Lichess API documentation specifies an array of [year, month, day, rating] entries
	 * This is parsed to an array of [timestamp, rating] entries
	 */
	async history(username: string): Promise<[string, [number, number][]][]> {
		if (!regexes.username.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		let raw: History[] = await GET({
			url: `/api/user/${username}/rating-history`,
			headers: {
				Accept: 'application/vnd.lichess.v1+json'
			},
			timeout: 2000
		});
		return raw.map(({name, points}) => [
			name,
			points.reduce((obj: [number, number][], [year, month, day, rating]) => {
				let k = new Date(year, month, day).getTime();
				let v = rating;
				obj.push([k, v]);
				return obj;
			}, [])
		]);
	}

	async stats(username: string, variant: Variant): Promise<Performance> {
		if (!regexes.username.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		return await GET({
			url: `/@/${username}/perf/${variant}`,
			headers: {
				Accept: 'application/vnd.lichess.v1+json'
			},
			timeout: 2000
		});
	}

	/**
     * The activity feed of a user viewable on their profile
     */
	async activity(username: string): Promise<Activity[]> {
		if (!regexes.username.test(username)) throw new TypeError('Invalid format for lichess username: ' + username);
		return await GET({
			url: `/api/user/${username}/activity`,
			timeout: 2000
		});
	}

	/**
     * Get members of a team. Members are sorted by reverse chronological order of joining the team (most recent first).
     * @param {string} teamID
     * @returns {Promise<Collection<User>>}
     */
	async team(teamID: string) {
		const uri = `${config.uri}team/${teamID}/users`;
		try {
			return await new Promise((res, rej) => {
				let output: User[] = [];
				let last = '';
				const options = {
					uri,
					Accept: 'application/x-ndjson'
				};
				try {
					let req = request.get(options);
					req.on('data', (data) => {
						data.toString().trim().split('\n').forEach(line => req.emit('line', line));
					})
						.on('line', (str) => {
							let test = last + str;
							try {
								let json: User = JSON.parse(test);
								last = '';
								output.push(json);
							} catch (e) {
								last += str;
							}
						})
						.on('response', (response) => {
							if (response.statusCode !== 200) req.emit('error', 'Not found');
						})
						.on('error', rej)
						.on('end', () => res(output));
				} catch (e) {
					if (e) rej(e);
				}
			});
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
     * Get a list of users who are live.
     * @param {statusOptions} options
     * @returns {Promise<StatusUser[]|User[]>}
     */
	async streaming(options?: {
		fetchUsers: boolean,
		filter: (u: User | StatusUser) => boolean
	}) {
		let { fetchUsers, filter } = options || { filter: () => true };
		let results: StatusUser[] = await GET({
			url: '/stream/live',
			timeout: 2000
		});
		if (!fetchUsers) {
			results = results.filter(filter);
			return results;
		} else {
			let users = await this.getMultiple(results.map(r => r.id));
			results = results.filter(filter);
			return results.map((r, i) => Object.assign(r, users[i]));
		}
	}

	/**
     * Get titled users. Get users by title. Several titles can be specified.
     */
	async titled(titles: Title[] = ['GM'], online: boolean = false): Promise<User[]> {
		const options = {
			uri: `${config.uri}api/users/titled?${qs.stringify({
				titles: titles.join(','),
				online
			})}`,
			json: true
		};
		return await new Promise((res, rej) => {
			try {
				let output: User[] = [];
				let last = '';
				let req = request.get(options);
				req.on('data', (data) => {
					let str = data.toString().trim();
					try {
						let json: User = JSON.parse(last + str);
						last = '';
						output.push(json);
					} catch (e) {
						last += str;
					}
				})
					.on('response', (response) => {
						if (response.statusCode !== 200) req.emit('error', 'Not found');
					})
					.on('error', rej)
					.on('end', () => res(output));
			} catch (e) {
				if (e) rej(e);
			}
		});
	}

}