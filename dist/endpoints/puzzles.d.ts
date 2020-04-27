export = Puzzles;
declare class Puzzles {
    /**
     * Returns a random puzzle from Lichess as an FEN.
     * @param {string|number} id
     * @returns {Position}
     * @public
     */
    public get(id?: string | number): {
        id: string;
        fen: string;
    };
    /**
     *
     * Returns the daily puzzle from Lichess as an FEN.
     * @returns {Position}
     * @public
     */
    public daily(): {
        id: string;
        fen: string;
    };
}
declare namespace Puzzles {
    /**
     * @typedef {Object} Position
     * @property {string} id
     * @property {string} fen
     * @param {string} url
     */
    export function scrapePuzzle(_id?: string): Promise<any>;
    export const _cache: {};
}
