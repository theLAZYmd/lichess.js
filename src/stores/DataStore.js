const Collection = require('./Collection');
/**
 * Manages the creation, retrieval and deletion of a specific data model.
 * @extends {Collection}
 */
class DataStore extends Collection {

	constructor(iterable = [], type) {
		super();
		if (typeof iterable !== 'object') throw new TypeError(iterable);
		if (!Array.isArray(iterable)) iterable = Object.entries(iterable);
		if (iterable[0].length === 2) return new Collection(iterable.map(([key, data]) => [key, this.modify(data, type)]));
		for (let item of iterable) {
			this.add(item, type);
		}
	}

	add(data, Structure) {
		let existing = this.get(data.id);
		if (existing && typeof existing._path === 'function') return existing._patch(data);
		let entry = Structure ? new Structure(data) : data;
		this.set(entry.id, entry);
		return entry;
	}

	/**
	 * Returns a new Instance of a constructor, if one is specified
	 * @param {Object|*} data 
	 * @param {Constructor} Structure 
	 */
	modify(data, Structure) {
		return Structure ? new Structure(data) : data;
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