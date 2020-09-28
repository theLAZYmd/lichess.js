import { POST } from '../utils/requests';
import { Game, ChallengeOptions } from '../interfaces';

export default class Challenge {

	constructor(public access_token?: string) {}

	/**
     * Read public data of logged-in user.
     */
	async create(username: string, options: ChallengeOptions): Promise<Game> {
		return POST({
			url: '/api/challenge/' + username,
			timeout: 5000,
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.access_token
			},
			data: options
		});
	}

	/**
     * Create a challenge that any 2 players can join.
	 * Share the URL of the challenge. the first 2 players to click it will be paired for a game.
	 * Specify a second parameter to have your authenticated user join the game 
     */
	async open(options: ChallengeOptions, join?: boolean): Promise<Game> {
		let game: Game = await POST({
			url: '/api/challenge/open',
			timeout: 5000,
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.access_token
			},
			data: options
		});
		if (join) await this.accept(game.id);
		return game;
	}

	/**
     * Start a game with Lichess AI.
	 * You will be notified on the event stream that a new game has started.
     */
	async ai(options: ChallengeOptions): Promise<Game> {
		return POST({
			url: '/api/challenge/ai',
			timeout: 5000,
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.access_token
			},
			data: options
		});
	}

	/**
	 * Accept an incoming challenge.
	 * You should receive a gameStart event on the incoming events stream.
	 */
	async accept(challengeId: string): Promise<{ ok: boolean } | { error: string }> {
		return POST({
			url: `/api/challenge/${challengeId}/accept`
		});
	}

	/**
	 * Decline an incoming challenge.
	 */
	async decline(challengeId: string): Promise<{ ok: boolean } | { error: string }> {
		return POST({
			url: `/api/challenge/${challengeId}/decline`
		});
	}

}