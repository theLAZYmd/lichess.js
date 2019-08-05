/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const {
	id,
	secret,
	host,
	port,
	callback
} = require('../config.json');

const List = JSON.parse(require('fs').readFileSync('./src/tests/ids.json'));

const client = require('../main');
const lila = (new client)
	.setPersonal('yqiybX5KWGZ2Uom3');

class Test {

	static async leaderboard() {
		console.log(await lila.users.leaderboard());
	}

	static async status() {
		console.log(await lila.users.status(['theLAZYmd', 'mathace', 'dovijanic', 'opperwezen'], {
			fetchUsers: true
		}));
	}

	static async top10() {
		console.log(await lila.users.top10());
	}

	static async lb() {
		console.log(await lila.users.leaderboard('crazyhouse'));
	}

	static async user() { 
		console.log((await lila.users.get(['theLAZYmd'])).id);
	}

	static async history() {
		//lila.users.history('theLAZYmd')
		console.log(await lila.users.history('theLAZYmd'));
	}

	static async stats() {
		console.log(await lila.users.stats('theLAZYmd', 'crazyhouse'));
	}

	static async titled() {
		console.log(await lila.users.titled('GM'));
	}

	static async team() {
		console.log(await lila.users.team('oxford-university-chess-club'));
	}

	static async users(n = Number(process.argv[2]) || 100) {
		console.log(await lila.users.getMultiple(List.slice(0, n)));
	}

	static async streaming() {
		console.log(await lila.users.streaming({
			fetchUsers: true
		}));
	}

	static async activity() {
		console.log(await lila.users.activity('theLAZYmd'));
	}

	static async tournament() {
		console.log((await lila.tournaments.results('eG6QWTOo', {
			nb: 30,
			fetch: true
		})));
	}

	static async live() {
		console.log(await lila.tournaments.live('eG6QWTOo', {

		}));
	}

	static async me() {
		try {
			//await lila.authentication();
			let res = await lila.profile.get();
			console.log(res);
		} catch (e) {
			if (e) console.error(e);
		}
	}

	static async game() {
		console.log(await lila.games.get(['IBJTqc5R', 'cfhpQQ9o'], {
			fetchUsers: true
		}));
	}

	static async games() {
		let res = lila.games.byUser('opperwezen', {
			max: 10,
			stream: true
		});
		res.on('data', console.log)
			.on('error', console.error);
	}

	static async current() {
		console.log(await lila.games.current(['tomodbk', 'LeProfessionnel']));
	}

	static async tv() {
		console.log(await lila.games.tv(['crazyhouse']));
	}

	static async puzzle() {
		console.log(await lila.puzzles.get());		
		console.log(await lila.puzzles.daily());
	}

	static async shield() {
		console.log(await lila.tournaments.shields());
	}

}

Test.users();