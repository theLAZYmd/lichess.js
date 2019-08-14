const Base = require('./Base');

/**
 * Represents a Lichess user in a tournament
 * @extends {Base]}
 * @implements {User}
 */
class TournamentUser extends Base {

	constructor(data) {
		super();
		this._patch(data);
	}

	/**
	 * ID of a user taken from their username
	 */
	get id () {
		if (!this._data.username) return null;
		return this._data.username.toLowerCase();
	}

	/**
	 * ID of a user taken from their username
	 */
	get username () {
		return this._data.username;
	}

	/**
	 * The ranking of a user in a tournament, should be equal to this.index() + 1
	 * @type {number}
	 */
	get rank () {
		return this._data.rank;
	}

	/**
	 * TournamentUser's score in the tournament
	 * @type {number}
	 */
	get score () {
		return this._data.score;
	}

	/**
	 * TournamentUser's current rating. Should be equal to user.get().rating[variant];
	 */
	get rating () {
		return this._data.rating;
	}

	get performance () {
		return this._data.performance;
	}

}

module.exports = TournamentUser;