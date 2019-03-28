const DataStore = require('./DataStore');
const User = require('../structures/User');

/**
 * A data store to store User models.
 * @extends {DataStore}
 */
class UserStore extends DataStore {
    constructor(iterable, U = User) {
        super(iterable, U);
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