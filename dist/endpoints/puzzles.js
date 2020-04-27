"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const rp = require('request-promise');
const config = require('../config.json');
class Puzzles {
    constructor() {
    }
    /**
     * Returns a random puzzle from Lichess as an FEN.
     * @param {string|number} id
     * @returns {Position}
     * @public
     */
    get(id = '') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (id === 'daily')
                    return this.daily();
                if (isNaN(Number(id)))
                    throw 'Invalid ID to parse.';
                return yield Puzzles.scrapePuzzle();
            }
            catch (e) {
                if (e)
                    throw e;
            }
        });
    }
    /**
     *
     * Returns the daily puzzle from Lichess as an FEN.
     * @returns {Position}
     * @public
     */
    daily() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /* eslint-disable no-unused-vars */
                const options = {
                    uri: `${config.uri}training/daily`,
                    headers: {
                        Accept: 'application/vnd.lichess.v1+json'
                    },
                    json: true
                };
                const result = rp.get(options);
                const { game, puzzle, mode, difficulty } = result;
                const { id, rating, attempts, fen, color, initialPly, lines, vote, initialMove, enabled } = puzzle;
                const { choices, current } = difficulty;
                return { id, fen };
            }
            catch (e) {
                if (e)
                    throw e;
            }
        });
    }
    /**
     * @typedef {Object} Position
     * @property {string} id
     * @property {string} fen
     * @param {string} url
     */
    static scrapePuzzle(_id = '') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (_id && Puzzles._cache[_id])
                    return Puzzles._cache[_id];
                const url = `${config.uri}training/${_id}`;
                const buffer = yield rp.get(url);
                const body = buffer.toString();
                let id = body.match(/content="Chess tactic #([0-9]+) - (?:White|Black) to play"/);
                let initialPly = body.match(/"initialPly":([0-9]+),/);
                if (!id || !initialPly)
                    throw '';
                id = id[1];
                initialPly = initialPly[1];
                let argument = body.match(new RegExp(`"ply":${initialPly},"fen":"(${Puzzles.FENRegEx})"`));
                if (!argument)
                    throw '';
                let fen = argument[1];
                Puzzles._cache[id] = fen;
                return { id, fen };
            }
            catch (e) {
                throw new Error('Couldn\'t parse HTML for puzzle \'' + _id + '\':\n' + e);
            }
        });
    }
    static get FENRegEx() {
        return '((?:(?:[pnbrqkPNBRQK1-8]{1,8})\\/?){8})' + //Piece Placement: any of those characters, allow 1 to 8 of each, folloed by a slash, all that repeated 8 times. Standard chess FEN produced. Slash is optional (0 or 1). 
            '((?:[pnbrqkPNBRQK]{1,16})\\/?)?' + //Second group: crazyhouse additional inhand pieces, if they exist.
            '\\s+' + //white space
            '(b|w)' + //Side to Move
            '\\s+' + //white space
            '(-|K?Q?k?q?)' + //Castling Rights. Matches 0 or 1 of each, so optional.
            '\\s+' + //white space
            '(-|[a-h][3-6])' + //En Passant Possible Target Squares
            '\\s+' + //white space
            '(\\d+)' + //Half-Move Clock since last capture or pawn advance for 50 move rule
            '\\s+' + //white space
            '(\\d+)' + //Fullmove number
            '\\s*' + //white space, may or may not exist
            '(\\+[0-3]\\+[0-3])?'; //three-check extra group, may or may not exist	
    }
    static get regex() {
        return new RegExp(Puzzles.FENRegEx);
    }
}
Puzzles._cache = {};
module.exports = Puzzles;
//# sourceMappingURL=puzzles.js.map