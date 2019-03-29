const Collection = require('./Collection');
let Structure;

/**
 * Manages the creation, retrieval and deletion of a specific data model.
 * @extends {Collection}
 */
class DataStore extends Collection {

    constructor(iterable, type) {
        super();
        if (type) Structure = type;
        if (iterable) {
            for (let item of iterable) {
                this.add(item);
            }
        }
    }

    add(data, cache = true, {
        id
    } = {}) {
        const existing = this.get(id || data.id);
        if (existing && cache && existing._patch) existing._patch(data);
        if (existing) return existing;
        let entry = Structure ? new Structure(data) : data;
        if (cache) this.set(id || entry.id, entry);
        return entry;
    }

    remove(key) {
        return this.delete(key);
    }

    /**
     * Resolves a data entry to a data Object.
     * @param {string|Object} idOrInstance The id or instance of something in this DataStore
     * @returns {?Object} An instance from this DataStore
     */
    resolve(idOrInstance) {
        if (idOrInstance instanceof this.holds) return idOrInstance;
        if (typeof idOrInstance === 'string') return this.get(idOrInstance) || null;
        return null;
    }

    /**
     * Resolves a data entry to a instance ID.
     * @param {string|Instance} idOrInstance The id or instance of something in this DataStore
     * @returns {?Snowflake}
     */
    resolveID(idOrInstance) {
        if (idOrInstance instanceof this.holds) return idOrInstance.id;
        if (typeof idOrInstance === 'string') return idOrInstance;
        return null;
    }

    static get[Symbol.species]() {
        return Collection;
    }
}

module.exports = DataStore;