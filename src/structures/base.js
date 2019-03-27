const Collection = require('../stores/Collection');
const Util = require('../util/Util');

/**
 * Represents a data model that is identifiable by a Snowflake (i.e. Discord API data models).
 */
class Base {
    constructor() {
    }

    _clone() {
        return Object.assign(Object.create(this), this);
    }

    _patch(data) {
        return data;
    }

    _update(data) {
        const clone = this._clone();
        this._patch(data);
        return clone;
    }

    toJSON(...props) {
        return Util.flatten(this, ...props);
    }

    valueOf() {
        return this.id;
    }
}

module.exports = Base;