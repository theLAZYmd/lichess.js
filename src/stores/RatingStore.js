const DataStore = require('./DataStore');
const Rating = require('../structures/Rating');

/**
 * A data store to store Rating models.
 * @extends {DataStore}
 */
class RatingStore extends DataStore {
    constructor(iterable) {
        super(iterable, Rating);
    }

    /**
     * Data that resolves to give a Rating object. This can be:
     * * A Rating object
     * * A Snowflake
     * * A Message object (resolves to the message author)
     * * A GuildMember object
     * @typedef {Rating|Snowflake|Message} RatingResolvable
     */

    /**
     * Resolves a RatingResolvable to a Rating object.
     * @param {RatingResolvable} rating The RatingResolvable to identify
     * @returns {?Rating}
     */
    resolve(rating) {
        if (rating instanceof User) return rating.perfs;
        return super.resolve(rating);
    }

    /**
     * Resolves a RatingResolvable to a rating ID string.
     * @param {RatingResolvable} rating The RatingResolvable to identify
     * @returns {?Snowflake}
     */
    resolveID(rating) {
        return super.resolveID(rating);
    }
}

module.exports = RatingStore;