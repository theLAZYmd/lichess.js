const User = require('./user');
const Base = require('./base');

/**
 * Represents a Lichess user in a tournament
 * @extends {TournamentUser}
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
         * @name TournamentUser#language
         * @readonly
         */
        if (data.language) this.language = data.language;

        /**
         * The URL to a user's profile
         * @type {string}
         * @name TournamentUser#url
         * @readonly
         */
        if (data.url) this.url = data.url;

        /**
         * The number of following for a user
         * @type {number}
         * @name TournamentUser#following
         * @readonly
         */
        if (typeof data.nbFollowing !== 'undefined') this.following = data.nbFollowing;

        /**
         * The number of followers for a user
         * @type {number}
         * @name TournamentUser#followers
         * @readonly
         */
        if (typeof data.nbFollowers !== 'undefined') this.followers = data.nbFollowers;

        /**
         * The user's game completion rate
         * @type {number}
         * @name TournamentUser#completionRate
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

        if (TournamentUser.fetch) this.user = new User(this);
    }

}

module.exports = TournamentUser;