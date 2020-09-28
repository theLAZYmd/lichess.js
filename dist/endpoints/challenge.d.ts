import { Game, ChallengeOptions } from '../interfaces';
export default class Challenge {
    access_token?: string | undefined;
    constructor(access_token?: string | undefined);
    /**
     * Read public data of logged-in user.
     */
    create(username: string, options: ChallengeOptions): Promise<Game>;
    /**
     * Create a challenge that any 2 players can join.
     * Share the URL of the challenge. the first 2 players to click it will be paired for a game.
     * Specify a second parameter to have your authenticated user join the game
     */
    open(options: ChallengeOptions, join?: boolean): Promise<Game>;
    /**
     * Start a game with Lichess AI.
     * You will be notified on the event stream that a new game has started.
     */
    ai(options: ChallengeOptions): Promise<Game>;
    /**
     * Accept an incoming challenge.
     * You should receive a gameStart event on the incoming events stream.
     */
    accept(challengeId: string): Promise<{
        ok: boolean;
    } | {
        error: string;
    }>;
    /**
     * Decline an incoming challenge.
     */
    decline(challengeId: string): Promise<{
        ok: boolean;
    } | {
        error: string;
    }>;
}
//# sourceMappingURL=challenge.d.ts.map