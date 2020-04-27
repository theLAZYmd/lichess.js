export = Teams;
declare class Teams {
    constructor(oauth: any, result: any, access_token: any);
    oauth: any;
    result: any;
    access_token: any;
    /**
     * Members are sorted by reverse chronological order of joining the team (most recent first).
     * Members are streamed as ndjson, i.e. one JSON object per line.
     * @returns {Promise<User[]>}
     */
    members(id: any): Promise<any[]>;
    /**
     * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
     * https://lichess.org/team
     * @returns {Promise<null>}
     */
    join(id: any): Promise<null>;
    /**
     * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
     * https://lichess.org/team
     * @returns {Promise<null>}
     */
    leave(id: any): Promise<null>;
    /**
     * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
     * https://lichess.org/team
     * @returns {Promise<null>}
     */
    kick(id: any, userID: any): Promise<null>;
}
