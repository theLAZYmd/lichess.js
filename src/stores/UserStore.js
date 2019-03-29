const DataStore = require('./DataStore');
const U = require('../structures/User');

/**
 * A data store to store User models.
 * @extends {DataStore}
 * @param {iterable} iterable A data object returned from an API call in an Array or iterable format
 * @param {Constructor} User A user type or implemented user type by which each member of the collection can be constructed.
 */
class UserStore extends DataStore {
    constructor(iterable, User = U) {
        super(iterable, User);
    }

    /**
     * Data that resolves to give a User object. This can be:
     * * A User object
     * * A Snowflake
     * * A Message object (resolves to the message author)
     * * A GuildMember object
     * @typedef {User|Snowflake} UserResolvable
     */

    /**
     * Resolves a UserResolvable to a User object.
     * @param {UserResolvable} user The UserResolvable to identify
     * @returns {?User}
     */
    resolve(user) {
        return super.resolve(user);
    }

    /**
     * Resolves a UserResolvable to a user ID string.
     * @param {UserResolvable} user The UserResolvable to identify
     * @returns {?Snowflake}
     */
    resolveID(user) {
        return super.resolveID(user);
    }

}

module.exports = UserStore;