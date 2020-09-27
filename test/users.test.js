const { default: Lichess, Variant} = require('../dist/index');
const assert = require('assert');
const lichess = new Lichess();
const { expect, should, use } = require('chai');
should();
use(require('chai-interface'));

const Variants = ['ultraBullet', 'bullet', 'blitz', 'rapid', 'classical', 'chess960', 'crazyhouse', 'antichess', 'atomic', 'horde', 'kingOfTheHill', 'racingKings', 'threeCheck', 'puzzle'];
const Title = ['GM', 'WGM', 'IM', 'WIM', 'FM', 'WFM', 'NM', 'CM', 'WCM', 'WNM', 'LM', 'BOT'];

describe('Users endpoint tests', () => {
	it('user', async () => {
		const user = await lichess.users.get('theLAZYmd');
		const UserInterface = {
			id: String,
			username: String,
			title: String,
			online: Boolean,
			playing: Boolean,
			streaming: Boolean,
			createdAt: Number,
			seenAt: Number,
			profile: {
				bio: String,
				country: String,
				firstName: String,
				lastName: String,
				links: String,
				location: String
			},
			language: String,
			perfs: Object,
			patron: Boolean,
			disabled: Boolean,
			engine: Boolean,
			booster: Boolean,
			playTime: Object
		}
		user.should.have.interface(UserInterface);
	});
	it('should return 9', () => {
		assert.strictEqual(3 * 3, 9);
	});
});