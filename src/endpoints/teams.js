const request = require('request');
const rp = require('request-promise');
const config = require('../config');

const User = require('../structures/User');

class Teams {

	constructor(oauth, result, access_token) {
		this.oauth = oauth;
		this.result = result;
		this.access_token = access_token;
	}

	/**
     * Members are sorted by reverse chronological order of joining the team (most recent first).
	 * Members are streamed as ndjson, i.e. one JSON object per line.
     * @returns {Promise<User[]>}
     */
	async members(id) {
		try {
			return await new Promise((res, rej) => {
				let output = [];
				let last = '';
				const options = {
					method: 'GET',
					uri: `${config.uri}team/${id}/users`,
					headers: {
						Accept: 'application/x-ndjson'
					}
                };
				let req = request.get(options);
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
			});
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
	 * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
	 * https://lichess.org/team
     * @returns {Promise<null>}
     */
	async join(id) {
		try {
			const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
			let access_token = token ? token.token.access_token : this.access_token;
			let options = {
				uri: `${config.uri}team/${id}/join`,
				json: true,
				timeout: 5000,
				headers: {
					Accept: 'application/json',
					Authorization: 'Bearer ' + access_token
				}
			};
			await rp.post(options);
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
	 * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
	 * https://lichess.org/team
     * @returns {Promise<null>}
     */
	async leave(id) {
		try {
			const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
			let access_token = token ? token.token.access_token : this.access_token;
			let options = {
				uri: `${config.uri}team/${id}/quit`,
				json: true,
				timeout: 5000,
				headers: {
					Accept: 'application/json',
					Authorization: 'Bearer ' + access_token
				}
			};
			await rp.post(options);
		} catch (e) {
			if (e) throw e;
		}
	}

	/**
	 * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
	 * https://lichess.org/team
     * @returns {Promise<null>}
     */
	async kick(id, userID) {
		try {
			const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
			let access_token = token ? token.token.access_token : this.access_token;
			let options = {
				uri: `${config.uri}team/${id}/kick/${userID}`,
				json: true,
				timeout: 5000,
				headers: {
					Accept: 'application/json',
					Authorization: 'Bearer ' + access_token
				}
			};
			await rp.post(options);
		} catch (e) {
			if (e) throw e;
		}
	}

}

module.exports = Teams;