const Base = require('./Base');
const Util = require('../util/Util');
const RatingStore = require('../stores/RatingStore');
const qs = require('querystring');

/**
 * Represents a Lichess user
 * @extends {Base}
 * @implements {TournamentUser}
 * @implements {StatusUser}
 */
class User extends Base {
    constructor(data) {
        super();

        /**
         * The ID of the user, must match /[a-z][\w-]{0,28}[a-z0-9]/i
         * @type {string}
         * @readonly
         */
        this.id = data.id;

        this._patch(data);
    }

    _patch(data) {

        /**
         * Whether or not the user is a bot
         * @type {boolean}
         * @name User#bot
         * @readonly
         */
        this.bot = Boolean(data.title === "BOT");

        /**
         * The username of the user
         * @type {string}
         * @name User#username
         * @readonly
         */
        if (data.username) this.username = data.username;

        /**
         * A user's title on Lichess
         * @type {string}
         * @name User#title
         * @readonly
         */
        if (data.title && data.title !== "BOT") this.title = data.title;

        /**
         * Whether or not the user is online
         * @type {Boolean}
         * @name StatusUser#online
         * @readonly
         */
        this.online = Boolean(data.online);
                
        /**
         * Whether or not the user is streaming
         * @type {Boolean}
         * @name StatusUser#streaming
         * @readonly
         */
        this.streaming = Boolean(data.streaming);

        
        if (data.profile) {
            let names = [];
            if (data.profile.firstName) names.push(data.profile.firstName);
            if (data.profile.lastName) names.push(data.profile.lastName);

            /**
             * A user's name
             * @type {string}
             * @readonly
             */
            if (names.length > 0) this.name = names.join(' ');

            /**
             * A user's country as an ISO3166-1 code
             * @type {string}
             * @readonly
             */
            if (data.profile.country) this.country = data.profile.country;

            /**
             * A user's location
             * @type {string}
             * @readonly
             */
            if (data.profile.location) this.location = data.profile.location;

            /**
             * A user's self-written biography
             * @type {string}
             * @readonly
             */
            if (data.profile.bio) this.bio = data.profile.bio;

            /**
             * The links a user has chosen to write in their biography
             * @type {string[]}
             * @readonly
             */
            if (data.profile.links) this.links = Util.clean(data.profile.links.split('\r\n'));

            /**
             * A user's FIDE rating, if they have provided it
             * @type {number}
             * @readonly
             */
            if (data.profile.fideRating) this.FIDE = data.profile.fideRating;

            /**
             * A user's USCF rating, if they have provided it
             * @type {number}
             * @readonly
             */
            if (data.profile.uscfRating) this.USCF = data.profile.uscfRating;

            /**
             * A user's ECF rating, if they have provided it
             * @type {number}
             * @readonly
             */
            if (data.profile.ecfRating) this.ECF = data.profile.ecfRating;
        }
        
        /**
         * The timestamp the user was created at
         * @type {number}
         * @readonly
         */
        if (data.createdAt) this.createdTimestamp = data.createdAt;

        /**
         * The timestamp the user was last seen at at
         * @type {number}
         * @readonly
         */
        if (data.seenAt) this.seenTimestamp = data.createdAt;

        /**
         * The user's language, in format of {ISO 639-1}-{ISO3166-1}
         * @type {string}
         * @name User#language
         * @readonly
         */
        if (data.language) this.language = data.language;

        /**
         * The URL to a user's profile
         * @type {string}
         * @name User#url
         * @readonly
         */
        if (data.url) this.url = data.url;

        /**
         * The number of following for a user
         * @type {number}
         * @name User#following
         * @readonly
         */
        if (typeof data.nbFollowing !== 'undefined') this.following = data.nbFollowing;

        /**
         * The number of followers for a user
         * @type {number}
         * @name User#followers
         * @readonly
         */
        if (typeof data.nbFollowers !== 'undefined') this.followers = data.nbFollowers;

        /**
         * The user's game completion rate
         * @type {number}
         * @name User#completionRate
         * @readonly
         */
        if (data.completionRate) this.completionRate = data.completionRate;

        if (data.playTime) {

            /**
             * The total time a user has spent playing on Lichess
             * @type {time}
             * @readonly
             */
            if (data.playTime.total) this.playTime = Util.getTime(data.playTime.total * 1000);

            if (data.playTime.tv) this.tvTime = Util.getTime(data.playTime.tv * 1000);
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
         * @name User#games
         * @readonly
         */
        if (data.count) this.games = data.count;

        /**
         * List of all valid Lichess ratings mapped to the user's rating for that variant
         * @returns {Collection<Rating>}
         */
        if (data.perfs) this.ratings = new RatingStore(data.perfs);

        if (typeof data.playing === "string") this.gameURL = data.playing;
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
        return new Date(this.seenTimestamp);
    }

    /**
     * The URL to challenge a user
     * @type {string}
     * @name User#challengeURL
     * @readonly
     */
    get challengeURL() {
        return `${config.url}?${qs.stringify({
            user: this.id + '#friend'
        })}`
    }

    /**
     * The URL to a DM a user
     * @type {string}
     * @name User#messageURL
     * @readonly
     */
    get messageURL() {
        return `${config.url}inbox/new?${qs.stringify({
            user: this.id
        })}`
    }

    /**
     * The URL to a user's game, unless a status call has been made to show they are not playing one
     * @type {string}
     * @name User#watchURL
     * @readonly
     */
    get watchURL() {
        if (!this.playing === false) return undefined;
        return `${config.uri}/@/${this.username}/tv`
    }

    /**
     * The URL to a user's stream, unless a status call has been made to show they are not online
     * @type {string}
     * @name User#streamURL
     * @readonly
     */
    get streamURL() {
        if (!this.streaming === false) return undefined;
        return `${config.uri}/@/${this.username}/tv`
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

    toJSON(...props) {
        const json = super.toJSON({}, ...props);
        return json;
    }

    send() {}
}

module.exports = User;