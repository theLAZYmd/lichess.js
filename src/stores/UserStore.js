const DataStore = require('./DataStore');
const User = require('../structures/User');
const Endpoint = require('../endpoints/users');

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

    /**
     * Obtains a user from Discord, or the user cache if it's already available.
     * @param {Snowflake} id ID of the user
     * @param {boolean} [cache=true] Whether to cache the new user object if it isn't already
     * @returns {Promise<User>}
     */
    async fetch(id, cache = true) {
        const existing = this.get(id);
        if (existing) return existing;
        const data = await new Endpoint().get(id);
        return this.add(data, cache);
    }
}

module.exports = UserStore;