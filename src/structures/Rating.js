const Base = require('./Base');
const Util = require('../util/Util');

/**
 * @typedef {string} LichessRating - Represents a valid variant value on Lichess
 * @example
 * [
 *  "ultraBullet",
 *  "bullet",
 *  "blitz",
 *  "rapid",
 *  "classical",
 *  "chess960",
 *  "crazyhouse",
 *  "antichess",
 *  "atomic",
 *  "horde",
 *  "kingOfTheHill",
 *  "racingKings",
 *  "threeCheck",
 *  "puzzle"
 * ]
 */

/**
 * Represents a Lichess rating object
 * @extends {Base}
 */
class Rating extends Base {
    constructor(data) {
        super();

        this._patch(data);
    }

    _patch(data = {}) {

        /**
         * The number of games a user has played
         * @type {number}
         * @readonly
         */
        this.games = data.games || 0;

        /**
         * The rating of a user. Returns undefined if the number of games played is 0.
         * @type {number}
         * @readonly
         */
        this.rating = data.rating || undefined;

        /**
         * The rd over a user for a variant. Returns undefined if the number of games played is 0.
         * @type {number}
         * @readonly
         */
        this.rd = data.rd || undefined;

        /**
         * The progress over a recent period of time according to Lichess' servers. Returns undefined if the number of games played is 0.
         * @type {number}
         * @readonly
         */
        this.prog = typeof data.prog !== "undefined" ? data.prog : undefined;

        /**
         * Whether the user's rating is provisional. Returns true if the user has played no games
         * @type {Boolean}
         * @readonly
         */
        this.prov = typeof data.prov !== "undefined" ? data.prov : true;
    }

    get exists () {
        return Boolean(this.rating);
    }

    /**
     * Checks if the rating is equal to another. It compares ID, ratingname, and bot flags.
     * It is recommended to compare equality by using `rating.id === rating2.id` unless you want to compare all properties.
     * @param {Rating} rating Rating to compare with
     * @returns {boolean}
     * @readonly
     */
    equals(rating) {
        return this.rating === rating.rating;
    }

    /**
     * When concatenated with a string, this automatically returns a link to the rating profile in markdown format.
     * @returns {string}
     * @example
     * // Logs: Hello from [theLAZYmd](https://lichess.org/@/theLAZYmd)!
     * console.log(`Hello from ${rating}!`);
     * @readonly
     */
    toString() {
        return `[${this.id}](${this.url})`;
    }

    toJSON(...props) {
        const json = super.toJSON({}, ...props);
        return json;
    }

}

module.exports = Rating;