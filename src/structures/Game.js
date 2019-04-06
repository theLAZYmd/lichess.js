const Base = require('./Base');
const config = require('../config.js');
const UserStore = require('../stores/UserStore');
const StatusUser = require('./StatusUser');
/**
 * Represents a Lichess game
 * @extends {Base}
 */
class Game extends Base {
    constructor(data) {
        super();

        /**
         * The ID of the game, must match /[a-z][\w]{0,28}[a-z0-9]/i
         * @type {string}
         * @readonly
         */
        this.id = data.id.slice(0, 8);

        this._patch(data);
    }

    _patch(data) {

        /**
         * Whether or not the game is rated
         * @type {boolean}
         * @name Game#rated
         * @readonly
         */
        this.rated = Boolean(data.rated);

        /**
         * The variant of the game
         * @type {string}
         * @name Game#variant
         * @readonly
         */
        if (data.variant) this.variant = data.variant;

        /**
         * The speed of the game
         * @type {string}
         * @name Game#speed
         * @readonly
         */
        if (data.speed) this.speed = data.speed;

        /**
         * The result of the game, if it has finished
         * @type {string}
         * @name Game#result
         * @readonly
         */
        if (data.status) this.result = data.status;

        /**
         * @type {UserStore}
         * @name Game#players
         * @readonly
         */
        if (data.players) this.players = new UserStore(Object.entries(data.players).map(([colour, obj]) => [colour, obj.user || obj]), StatusUser)

        if (data.opening) {

            /**
             * A game's ECO code of the opening
             * @type {string}
             * @readonly
             */
            if (data.opening.eco) this.ECO = data.opening.eco;

            /**
             * A game's opening name
             * @type {string}
             * @readonly
             */
            if (data.opening.name) this.opening = data.opening.name;

            /**
             * The game's ply number which determines the opening
             * @type {number}
             * @readonly
             */
            if (data.opening.ply) this.ply = data.opening.ply;
        }
        
        /**
         * The timestamp the game was created at
         * @type {number}
         * @readonly
         */
        if (data.moves) {
            let moves = data.moves.split(/\s+/g).reduce((acc, move, i, array) => {
                if (i % 2 === 0) acc.push(array.slice(i, i + 2));
                return acc;
            }, []);
            moves.unshift(null);
            
            /**
             * The moves of the game as a 2D-array, beginning at value 1 and finishing at the number of moves that were in the game
             * The 0th value of the array returns null.
             * @type {string[][]}
             * @readonly
             */
            this.moves = moves;
        }

        /**
         * @typedef {object} clockObj
         * @property {number} initial
         * @property {number} increment
         * @property {number} totalTime
         */

        /**
         * The clock information for the game
         * @type {clockObj}
         * @readonly
         */
        if (data.clock) this.clock = data.clock;

    }

    get url () {
        return `${config.url}url`;
    }

    /**
     * Checks if the game is equal to another. It compares ID, gamename, and bot flags.
     * It is recommended to compare equality by using `game.id === game2.id` unless you want to compare all properties.
     * @param {Game} game Game to compare with
     * @returns {boolean}
     * @readonly
     */
    equals(game) {
        let equal = game && this.id === game.id;
        return equal;
    }

    /**
     * When concatenated with a string, this automatically returns a link to the game profile in markdown format.
     * @returns {string}
     * @example
     * // Logs: Link to [game](https://lichess.org/q7ZvsdUF)!
     * console.log(`Link to ${game}!`);
     * @readonly
     */
    toString() {
        return `[${this.id}](${this.url})`;
    }

    toJSON(...props) {
        const json = super.toJSON({}, ...props);
        return json;
    }

    send() {}
}

module.exports = Game;