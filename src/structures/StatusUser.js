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

		/**
         * ID of a user taken from their username
         */
		this.id = data.id;

		/**
         * ID of a user taken from the 'name' property
         */
		this.username = data.name;

		/**
         * A user's title on Lichess
         * @type {string}
         * @name StatusUser#title
         * @readonly
         */
		if (data.title && data.title !== 'BOT') this.title = data.title;

                
		/**
         * Whether or not the user is online
         * @type {Boolean}
         * @name StatusUser#online
         * @readonly
         */
		this.online = Boolean(data.online);
                
		/**
         * Whether or not the user is playing
         * @type {Boolean}
         * @name StatusUser#playing
         * @readonly
         */
		this.playing = Boolean(data.playing);
                
		/**
         * Whether or not the user is streaming
         * @type {Boolean}
         * @name StatusUser#streaming
         * @readonly
         */
		this.streaming = Boolean(data.streaming);
                
		/**
         * Whether or not the user is a patron
         * @type {Boolean}
         * @name StatusUser#patron
         * @readonly
         */
		this.patron = Boolean(data.patron);
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