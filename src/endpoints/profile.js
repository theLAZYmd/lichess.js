const rp = require('request-promise');
const config = require('../config');
const qs = require('querystring');

const User = require('../structures/User');
const Util = require('../util/Util');

class Profile {

	constructor(oauth, result, access_token) {
		this.oauth = oauth;
		this.result = result;
		this.access_token = access_token;
	}

	/**
     * Read public data of logged-in user.
     * @returns {User}
     */
	async get() {
		try {
			const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
			let access_token = token ? token.token.access_token : this.access_token;
			let options = {
				uri: `${config.uri}api/account`,
				json: true,
				timeout: 5000,
				headers: {
					Accept: 'application/json',
					Authorization: 'Bearer ' + access_token
				}
			};
			return new User(await rp.get(options));
		} catch (e) {
			if (e) throw e;
		}
	}

}

module.exports = Profile;