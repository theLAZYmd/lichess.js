const DataStore = require('./DataStore');
const Game = require('../structures/Game');

/**
 * A data store to store Game models.
 * @extends {DataStore}
 * @param {iterable} iterable A data object returned from an API call in an Array or iterable format
 * @param {Constructor} Game A game type or implemented game type by which each member of the collection can be constructed.
 */
class GameStore extends DataStore {
	constructor(iterable) {
		super(iterable, Game);
	}

	/**
     * Data that resolves to give a Game object. This can be:
     * * A Game object
     * * A Snowflake
     * * A Message object (resolves to the message author)
     * * A GuildMember object
     * @typedef {Game|Snowflake} GameResolvable
     */

	/**
     * Resolves a GameResolvable to a Game object.
     * @param {GameResolvable} game The GameResolvable to identify
     * @returns {?Game}
     */
	resolve(game) {
		return super.resolve(game);
	}

	/**
     * Resolves a GameResolvable to a game ID string.
     * @param {GameResolvable} game The GameResolvable to identify
     * @returns {?Snowflake}
     */
	resolveID(game) {
		return super.resolveID(game);
	}

}

module.exports = GameStore;