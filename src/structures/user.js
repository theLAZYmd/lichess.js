const Base = require('./Base');
const Util = require('../util/Util');
const RatingStore = require('../stores/RatingStore');
const config = require('../config');

/**
 * Represents a Lichess user
 * @extends {Base}
 * @implements {TournamentUser}
 * @implements {StatusUser}
 */
class User extends Base {
	constructor(data) {
		super();
		this._patch(data);
	}

	/**
	 * The ID of the user, must match /[a-z][\w-]{0,28}[a-z0-9]/i
	 * @type {string}
	 * @readonly
	 */
	get id () {
		return this._data.id;
	}
  
	/**
	 * Whether or not the user is a bot
	 * @type {boolean}
	 * @name User#bot
	 * @readonly
	 */
	get bot () {
		return Boolean(this._data.title === 'BOT');
	}

	/**
	 * The username of the user
	 * @type {string}
	 * @name User#username
	 * @readonly
	 */
	get username () {
		return this._data.username;
	}

	/**
	 * A user's title on Lichess
	 * @type {string?}
	 * @name User#title
	 * @readonly
	 */
	get title () {
		if (this._data.title && this._data.title !== 'BOT') return this._data.title;
		return undefined;
	}
			
	/**
	 * The timestamp the user was created at
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp () {
		if (this._data.createdAt) return this._data.createdAt;
		return null;		
	}

	/**
	 * Whether or not the user is online
	 * @type {Boolean}
	 * @name User#online
	 * @readonly
	 */
	get online() {
		return Boolean(this._data.online);
	}
                
	/**
	 * Whether or not the user is streaming
	 * @type {Boolean}
	 * @name User#streaming
	 * @readonly
	 */
	get streaming () {
		return Boolean(this._data.streaming);
	}

	get names () {
		let names = [];
		if (this._data.profile) {
			if (this._data.profile.firstName) names.push(this._data.profile.firstName);
			if (this._data.profile.lastName) names.push(this._data.profile.lastName);
		}
		return names.length ? names : undefined;
	}
	
	/**
	 * A user's name
	 * @type {string}
	 * @readonly
	 */
	get name () {
		if (this.names) return this.names.join(' ');
		return undefined;
	}

	/**
	 * A user's country as an ISO3166-1 code
	 * @type {string}
	 * @readonly
	 */
	get country () {
		if (this._data.profile) return this._data.profile.country;
		return undefined;
	}

	/**
	 * A user's location
	 * @type {string}
	 * @readonly
	 */
	get location () {
		if (this._data.profile) return this._data.profile.location;
		return undefined;
	}

	/**
	 * A user's self-written biography
	 * @type {string}
	 * @readonly
	 */
	get bio () {
		if (this._data.profile) return this._data.profile.bio;
		return undefined;
	}

	/**
	 * The links a user has chosen to write in their biography
	 * @type {string[]}
	 * @readonly
	 */
	get links () {
		if (this._data.profile && this._data.profile.links) return Util.clean(this._data.profile.links.split('\r\n'));
		return undefined;
	}

	/**
	 * A user's FIDE rating, if they have provided it
	 * @type {number}
	 * @readonly
	 */
	get FIDE () {
		if (this._data.profile) return this._data.profile.fideRating;
		return undefined;
	}

	/**
	 * A user's USCF rating, if they have provided it
	 * @type {number}
	 * @readonly
	 */
	get USCF () {
		if (this._data.profile) return this._data.profile.uscfRating;
		return undefined;
	}

	/**
	 * A user's ECF rating, if they have provided it
	 * @type {number}
	 * @readonly
	 */
	get ECF () {
		if (this._data.profile) return this._data.profile.ecfRating;
		return undefined;
	}

	/**
	 * The timestamp the user was last seen at at
	 * @type {number}
	 * @readonly
	 */
	get seenTimestamp() {
		return this._data.seenTimestamp;
	}

	/**
	 * The user's language, in format of {ISO 639-1}-{ISO3166-1}
	 * @type {string}
	 * @name User#language
	 * @readonly
	 */
	get language() {
		return this._data.language;
	}

	/**
	 * The URL to a user's profile
	 * @type {string}
	 * @name User#url
	 * @readonly
	 */
	get url () {
		return this._data.url;
	}

	/**
	 * The number of following for a user
	 * @type {number}
	 * @name User#following
	 * @readonly
	 */
	get following () {
		return this._data.nbFollowing;
	}

	/**
	 * The number of followers for a user
	 * @type {number}
	 * @name User#followers
	 * @readonly
	 */
	get followers () {
		return this._data.nbFollowers;
	}

	/**
	 * The user's game completion rate
	 * @type {number}
	 * @name User#completionRate
	 * @readonly
	 */
	get completionRate () {
		this._data.completionRate;
		return undefined;
	}

	/**
	 * The total time a user has spent playing on Lichess
	 * @type {time}
	 * @readonly
	 */
	get playTime() {
		if (this._data.playTime && this._data.playTime.total) return Util.getTime(this._data.playTime.total * 1000);
		return undefined;
	}

	get tvTime () {
		if (this._data.playTime && this._data.playTime.tv) return Util.getTime(this._data.playTime.tv * 1000);
		return undefined;
	}

	/**
	 * @typedef {Object} GamesObject
	 * @property {Number} all
	 * @property {Number} rated
	 * @property {Number} ai
	 * @property {Number} draw
	 * @property {Number} drawH
	 * @property {Number} loss
	 * @property {Number} lossH
	 * @property {Number} win
	 * @property {Number} winH
	 * @property {Number} bookmark
	 * @property {Number} playing
	 * @property {Number} import
	 * @property {Number} me
	 */

	/**
	 * Represents a summary of the games a user has played.
	 * @type {GamesObject}
	 * @name User#gameCount
	 * @readonly
	 */
	get gameCount () {
		if (this._data.count) return this._data.count;
		return undefined;
	}

	/**
	 * List of all valid Lichess ratings mapped to the user's rating for that variant
	 * @returns {Collection<Rating>}
	 */
	get perfs () {
		return new RatingStore(this._data.perfs);
	}

	get gameURL () {
		if (typeof this._data.playing === 'string') return this._data.playing;
		return undefined;
	}

	/**
     * The time the user was created at
     * @type {Date}
     * @readonly
     */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
     * The time the user was seen at
     * @type {Date}
     * @readonly
     */
	get seenAt() {
		if (this.seenTimestamp) return new Date(this.seenTimestamp);
		return undefined;
	}

	/**
     * The URL to challenge a user
     * @type {string}
     * @name User#challengeURL
     * @readonly
     */
	get challengeURL() {
		return `${config.uri}?user=${this.id}#friend`;
	}

	/**
     * The URL to a DM a user
     * @type {string}
     * @name User#messageURL
     * @readonly
     */
	get messageURL() {
		return `${config.uri}inbox/new?user=${this.id}`;
	}

	/**
     * The URL to a user's game, unless a status call has been made to show they are not playing one
     * @type {string}
     * @name User#watchURL
     * @readonly
     */
	get watchURL() {
		if (!this.playing === false) return undefined;
		return `${config.uri}@/${this.username}/tv`;
	}

	/**
     * The URL to a user's stream, unless a status call has been made to show they are not online
     * @type {string}
     * @name User#streamURL
     * @readonly
     */
	get streamURL() {
		if (!this.streaming === false) return undefined;
		return `${config.uri}@/${this.username}/tv`;
	}

	/**
     * Checks if the user is equal to another. It compares ID, username, and bot flags.
     * It is recommended to compare equality by using `user.id === user2.id` unless you want to compare all properties.
     * @param {User} user User to compare with
     * @returns {boolean}
     * @readonly
     */
	equals(user) {
		let equal = user && this.id === user.id && this.username === user.username && this.bot === user.bot;
		return equal;
	}

	/**
     * When concatenated with a string, this automatically returns a link to the user profile in markdown format.
     * @returns {string}
     * @example
     * // Logs: Hello from [theLAZYmd](https://lichess.org/@/theLAZYmd)!
     * console.log(`Hello from ${user}!`);
     * @readonly
     */
	toString() {
		return `[${this.id}](${this.url})`;
	}
	/*
	toJSON(...props) {
		const json = super.toJSON({}, ...props);
		return json;
	}*/

	send() {}
}

module.exports = User;