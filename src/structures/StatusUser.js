const config = require('../config');
const Base = require('./Base');

/**
 * Represents a Lichess user in a tournament
 * @extends {Base]}
 * @implements {User}
 * @example
 * let obj ={
    "id": "chess-network",
    "name": "Chess-Network",
    "title": "NM",
    "online": true,
    "playing": true,
    "streaming": true,
    "patron": true
    }
 */
class StatusUser extends Base {

	constructor(data) {
		super();
		this._patch(data);

	}

	/**
	 * ID of a user taken from their username
	 */
	get id () {
		return this._data.id;
	}

	/**
	 * ID of a user taken from the 'name' property
	 */
	get username () {
		return this._data.name;
	}

	/**
	 * A user's title on Lichess
	 * @type {string}
	 * @name StatusUser#title
	 * @readonly
	 */
	get title () {
		if (this._data.title && this._data.title !== 'BOT') return this._data.title;
		return undefined;
	}
                
	/**
	 * Whether or not the user is online
	 * @type {Boolean}
	 * @name StatusUser#online
	 * @readonly
	 */
	get online () {
		return Boolean(this._data.online);
	}
			
	/**
	 * Whether or not the user is playing
	 * @type {Boolean}
	 * @name StatusUser#playing
	 * @readonly
	 */
	get playing () {
		return Boolean(this._data.playing);
	}
			
	/**
	 * Whether or not the user is streaming
	 * @type {Boolean}
	 * @name StatusUser#streaming
	 * @readonly
	 */
	get streaming () {
		return Boolean(this._data.streaming);
	}
     
	/**
	 * Whether or not the user is a patron
	 * @type {Boolean}
	 * @name StatusUser#patron
	 * @readonly
	 */
	get patron () {
		return Boolean(this._data.patron);
	}

	/**
     * The URL to a user's game, if they are playing one
     * @type {string}
     * @name User#url
     * @readonly
     */
	get gameURL () {
		if (!this.playing) return undefined;
		return `${config.uri}/@/${this.username}/tv`;
	}
    
	/**
     * The URL to a user's stream, if they are streaming
     * @type {string}
     * @name User#url
     * @readonly
     */
	get streamURL () {
		if (!this.streaming) return undefined;
		return `${config.uri}/@/${this.username}/tv`;
	}

}

module.exports = StatusUser;