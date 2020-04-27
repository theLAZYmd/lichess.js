export = Games;
declare class Games {
    constructor(oauth: any, result: any, ...args: any[]);
    oauth: any;
    result: any;
    Users: any;
    /**
     * @typedef {gameOptions}
     */
    /**
     * Get user(s) public data. Calls {getOne} or {getMultiple} depending on input parameter.
     * @param {string|string[]} userParam
     * @param {gameOptions} options
     */
    get(userParam: string | string[], options: any): Promise<any>;
    /**
     * Download one game in PGN or JSON format. Only finished games can be downloaded.
     * @param {string} id
     * @param {gameOptions} options
     */
    getOne(id: string, options: any): Promise<any>;
    /**
     * Get several users by their IDs. Users are returned in the order same order as the IDs.
     * @param {string[]} names
     * @returns {Promise<Collection<User>>}
     */
    getMultiple(ids: any, options: any): Promise<any>;
    /**
     * Games are sorted by reverse chronological order (most recent first). We recommend streaming the response, for it can be very long. https://lichess.org/@/german11 for instance has more than 250,000 games. The game stream is throttled, depending on who is making the request:
     * Anonymous request: 10 games per second
     * OAuth2 authenticated request: 20 games per second
     * Authenticated, downloading your own games: 50 games per second
     * @param {string} username
     * @param {gameOptions} options
     * @param {Boolean} stream - Whether to return the output once all games have been collected or to stream the result using an event emitter
     * @param {string} filepath
     */
    byUser(username: string, options: any, stream: boolean | undefined, filepath: string): any;
    current(usernames: any, options: any): Promise<void>;
    ongoing(nb?: number): Promise<any>;
    tv(variants?: any[]): Promise<any>;
}
//# sourceMappingURL=games.d.ts.map