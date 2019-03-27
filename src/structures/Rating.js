const Base = require('./Base');
const Util = require('../util/Util');
const { variants  } = require('../config.json');

/**
 * Represents a rating object from Lichess
 * @extends {Base}
 */
class Rating extends Base {
    constructor(data) {
        super();
        this._patch(data);
    }

    _patch(data) {
        /**
         * The username of the user
         * @type {string}
         * @name User#username
         * @readonly
         */
        if (data.username) this.username = data.username;
        
        /**
         * Whether or not the user is online
         * @type {Boolean}
         * @name User#online
         * @readonly
         */
        if (typeof data.online !== 'undefined') this.online = Boolean(data.online);

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

        if (data.count) this.games = data.count;
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
        const json = super.toJSON({
            createdTimestamp: true,
            defaultAvatarURL: true,
            tag: true,
            lastMessage: false,
            lastMessageID: false,
        }, ...props);
        json.avatarURL = this.avatarURL();
        json.displayAvatarURL = this.displayAvatarURL();
        return json;
    }

    send() {}
}

module.exports = User;