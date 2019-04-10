const rp = require('request-promise');
const config = require('../config.js');

class Puzzles {

	constructor() {
	}

	/**
	 * Returns a random puzzle from Lichess as an FEN. 
	 * @param {string|number} id 
	 * @public
	 */
	async get(id = '') {
		try {
			if (id === 'daily') return this.daily();
			if (isNaN(Number(id))) throw 'Invalid ID to parse.';
			if (Puzzles._cache[id]) return Puzzles._cache[id];
			let fen = await Puzzles.scrapePuzzle(`${config.uri}training/${id}`);
			Puzzles._cache[id] = fen;
			return fen;
		} catch (e) {
			if (e) throw e;
		}
	}
	/**
	 * 
	 * Returns the daily puzzle from Lichess as an FEN.
	 * @public
	 */
	async daily() {
		try {
			return await Puzzles.scrapePuzzle(`${config.uri}training/daily`);
		} catch (e) {
			if (e) throw e;
		}
	}

	static async scrapePuzzle(url) {
		try {
			const buffer = await rp.get(url);
			const body = buffer.toString();
			let id = body.match(/content="Chess tactic #([0-9]+) - (?:White|Black) to play"/);
			let initialPly = body.match(/"initialPly":([0-9]+),/);
			if (!id || !initialPly) throw '';
			id = id[1];
			initialPly = initialPly[1];
			let argument = body.match(new RegExp(`"ply":${initialPly},"fen":"(${Puzzles.FENRegEx})"`));
			if (!argument) throw '';
			return argument[1];
		} catch (e) {
			throw new Error('Couldn\'t parse HTML for puzzle on page ' + url + ':\n' + e);
		}
	}

	static get FENRegEx () {
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

	static get regex () {
		return new RegExp(Puzzles.FENRegEx);
	}

}

Puzzles._cache = {};

module.exports = Puzzles;