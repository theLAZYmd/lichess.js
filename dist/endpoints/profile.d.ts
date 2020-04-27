export = Profile;
declare class Profile {
    constructor(oauth: any, result: any, access_token: any);
    oauth: any;
    result: any;
    access_token: any;
    /**
     * Read public data of logged-in user.
     * @returns {User}
     */
    get(): any;
}
//# sourceMappingURL=profile.d.ts.map