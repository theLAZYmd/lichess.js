export = Tournaments;
declare class Tournaments {
    /**
     * Single web-crawler for V2 lichess design
     * @param {string} variant - The shield variant
     * @private
     * @returns {string[]}
     */
    private static getV2Variant;
    /**
     * Web-crawler for all shields on V1 lichess design
     * @private
     * @deprecated
     * @returns {Object}
     */
    private static getV1Shields;
    /**
     * Web-crawler for all shields on V2 lichess design
     * @private
     * @returns {Object}
     */
    private static getV2Shields;
    constructor(oauth: any, result: any, access_token: any);
    oauth: any;
    result: any;
    access_token: any;
    /**
     * @typedef LichessTournament
     * @property {Number} nbPlayers - the number in the tournament
     * @property {TournamentGame} duels - contains the ID of the game, and a 'p' property with an array of two players 'n' name 'r' rating and 'k' ranking for each
     * @property {Object} standing - property page: 1, players User[] with name, rank, rating, ratingDiff, score, sheet: {scores, total, fire}, title
     * @property {Boolean} isStarted - has the tournament started?
     * @property {Number?} secondsToStart - doesn't exist after tournament has started
     * @property {Number?} secondsToFinish - doesn't exist before tournament has started
     * @property {TournamentGame?} featured - id, fen, color, lastMove, white {rank, name, rating}, black {rank, name, rating, title, berserk}
     * @property {string} id
     * @property {string} createdBy
     * @property {Date} startsAt
     * @property {string} system - dictates the type of arena
     * @property {string} fullName - username
     * @property {Number} minutes
     * @property {Object} perf - icon, name of variant type
     * @property {Object} clock - limit, increment
     * @property {string} variant
     * @property {Object?} spotlight - 'headline', 'description', 'iconFont'
     * @property {Boolean} berserkable
     * @property {Object} verdicts - 'list' [{condition: 'val', verdict: 'ok'}], accepted Boolean - list of conditions for restrictions on tournaments
     * @property {Object} schedule - 'freq' ex: shield, 'speed' ex: classical
     * @property {Object} quote - text and author
     * @property {string} defender - username
     */
    /**
     * Gets the live data of a tournament
     * @param {string} id
     * @returns LichessTournament
     */
    get(id: string): Promise<any>;
    /**
     * Returns the list of ongoing tournaments
     */
    list(): Promise<any>;
    games(id: any, options?: {}, ndjson?: boolean): Promise<any>;
    /**
     * Returns the results (as an array of users)
     * @param {*} id
     * @param {*} options
     * @returns {Object}
     * @property {string} id
     * @property {User[]} results
     */
    results(id: any, { nb, fetchUsers, filter }?: any): Object;
    /**
     * Returns the results of the last shield in a variant
     * @param {LichessVariant} variant
     * @param {ResultsData} data
     */
    lastShield(variant: any, data: any): Promise<Object | undefined>;
    /**
     * @typedef {Object} tournamentOptions
     * @property {string} name
     * @property {number} clockTime
     * @property {number} clockIncrement
     * @property {number} minutes
     * @property {number} waitMinutes
     * @property {number} startDate
     * @property {LichessVariant} variant
     * @property {boolean} rated
     * @property {string} position
     * @property {boolean} berserkable
     * @property {string} password
     */
    /**
     * Create a new tournament. Create a public or private tournament to your taste.
     * This endpoint mirrors the form on https://lichess.org/tournament/new.
     * You can create up to 2 tournaments per day for a single login.
     * @param {tournamentOptions} tournamentOptions
     */
    create(tournamentOptions?: {
        name: string;
        clockTime: number;
        clockIncrement: number;
        minutes: number;
        waitMinutes: number;
        startDate: number;
        variant: any;
        rated: boolean;
        position: string;
        berserkable: boolean;
        password: string;
    }): Promise<void>;
    /**
     * Crawls the Lichess shield pages and returns the list of tournament IDs for each shield
     * @param {string?} variant - The shield variant as a variant KEY
     * @param {Boolean?} dev - Whether the lichess.dev page should be parsed
     * @public
     * @returns {string[]|Object}
     */
    public shields(variant?: string | null): Object | string[];
}
//# sourceMappingURL=tournaments.d.ts.map