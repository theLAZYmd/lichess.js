const Base = require('./base');

/**
 * Represents a Lichess user in a tournament
 * @extends {Base]}
 * @implements {User}
 */
class TournamentUser extends Base {

	constructor(data) {
		super();

		/**
         * ID of a user taken from their username
         */
		this.id = data.username.toLowerCase();

		/**
         * ID of a user taken from their username
         */
		this.username = data.username;

		/**
         * The ranking of a user in a tournament, should be equal to this.index() + 1
         * @type {number}
         */
		if (typeof data.rank !== 'undefined') this.rank = data.rank;

		/**
         * TournamentUser's score in the tournament
         * @type {number}
         */
		if (typeof data.score !== 'undefined') this.score = data.score;

		/**
         * TournamentUser's current rating. Should be equal to user.get().rating[variant];
         */
		if (data.rating) this.rating = data.rating;

		if (data.performance) this.performance = data.performance;
	}

}

module.exports = TournamentUser;