import { GET } from '../utils/requests';
import { User } from '../interfaces';

export default class Profile {

	constructor(public access_token: string) {}

	/**
     * Read public data of logged-in user.
     * @returns {User}
     */
	async get(): Promise<User> {
		return GET({
			url: '/api/account',
			timeout: 5000,
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.access_token
			}
		});
	}

}