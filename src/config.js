module.exports = {
	uri: 'https://lichess.org/',  //root domain from which to use all the API methods. Switch to dev version of fork if/when necessary
	dev: 'https://lichess.dev/',
	variants: [                   //list of variants available on lichess. Can be updated if Lichess variant list changes
		'ultraBullet',
		'bullet',
		'blitz',
		'rapid',
		'classical',
		'chess960',
		'crazyhouse',
		'antichess',
		'atomic',
		'horde',
		'kingOfTheHill',
		'racingKings',
		'threeCheck',
		'puzzle'
	],
	titles: [                     //list of titles available on Lichess
		'GM',
		'WGM',
		'IM',
		'WIM',
		'FM',
		'WFM',
		'NM',
		'CM',
		'WCM',
		'WNM',
		'LM',
		'BOT'
	]
};