import { SearchResult, User, StatusUser, Title, Variant, Activity, Rank, RankUser } from '../interfaces';
export * from '../interfaces';
export default class Users {
    access_token: string;
    constructor(access_token: string);
    searchUsers(term: string, friend?: boolean, object?: boolean): Promise<SearchResult>;
    /**
     * Get user(s) public data. Calls {getOne} or {getMultiple} depending on input parameter.
     */
    get(userParam: string, timeout?: number): Promise<User>;
    get(userParam: string[], timeout?: number): Promise<User | User[]>;
    /**
     * Read public data of a user.
     */
    getOne(username: string, timeout?: number): Promise<User>;
    /**
     * Get several users by their IDs. Users are returned in the order same order as the IDs.
     */
    getMultiple(names: string[], timeout?: number): Promise<User[]>;
    /**
     * Gets a list of users following a specified user
     */
    following(username: string, timeout?: number, stream?: false): Promise<User[]>;
    /**
     * Gets a list of users who follow a specified user
     */
    followers(username: string): Promise<User[]>;
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
    status(ids: string[], options?: {
        fetchUsers: boolean;
        filter: (u: User | StatusUser) => boolean;
    }): Promise<User[] | StatusUser[]>;
    /**
     * Gets the top 10 players by rating of every variant
     */
    top10(keys?: Variant | Variant[]): Promise<Rank | RankUser[]>;
    /**
     * Gets the top user-specified number of players for a given variant
     */
    leaderboard(variant?: Variant, n?: number): Promise<RankUser[]>;
    /**
     * Lichess API documentation specifies an array of [year, month, day, rating] entries
     * This is parsed to an array of [timestamp, rating] entries
     */
    history(username: string): Promise<[string, [number, number][]][]>;
    stats(username: string, variant: Variant): Promise<Performance>;
    /**
     * The activity feed of a user viewable on their profile
     */
    activity(username: string): Promise<Activity[]>;
    /**
     * Get members of a team. Members are sorted by reverse chronological order of joining the team (most recent first).
     * @param {string} teamID
     * @returns {Promise<Collection<User>>}
     */
    team(teamID: string): Promise<unknown>;
    /**
     * Get a list of users who are live.
     * @param {statusOptions} options
     * @returns {Promise<StatusUser[]|User[]>}
     */
    streaming(options?: {
        fetchUsers: boolean;
        filter: (u: User | StatusUser) => boolean;
    }): Promise<StatusUser[]>;
    /**
     * Get titled users. Get users by title. Several titles can be specified.
     */
    titled(titles?: Title[], online?: boolean): Promise<User[]>;
}
