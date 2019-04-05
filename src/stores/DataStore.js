const Collection = require('./Collection');
/**
 * Manages the creation, retrieval and deletion of a specific data model.
 * @extends {Collection}
 */
class DataStore extends Collection {

    constructor(iterable, type, nulls = []) {
        super();
        if (type) this.Structure = type;
        if (!Array.isArray(iterable) && typeof iterable === "object") iterable = Object.entries(iterable);
        if (nulls.length > 0) iterable = iterable.concat(nulls.map(key => [key, undefined]));
        if (iterable) {
            for (let item of iterable) {
                if (Array.isArray(item) && item.length === 2) this.add(item[1], item[0]);
                else this.add(item);
            }
        }
        if (this.Structure) delete this.Structure;
    }

    add(data, id) {
        const existing = this.get(id || data.id);
        if (existing && existing._patch) existing._patch(data);
        if (existing) return existing;
        let entry = this.Structure ? new this.Structure(data) : data;
        this.set(id || entry.id, entry);
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