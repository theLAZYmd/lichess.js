import { User } from '../interfaces';
export default class Profile {
    access_token: string;
    constructor(access_token: string);
    /**
     * Read public data of logged-in user.
     * @returns {User}
     */
    get(): Promise<User>;
}
//# sourceMappingURL=profile.d.ts.map