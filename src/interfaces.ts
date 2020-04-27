export interface SearchResult {
	name: string
	id: string
	patron?: boolean
	friend?: boolean
}

interface Perf {
	games: number
	prog: number
	rating: number
	rd: number
}

export type Variant = 'ultraBullet' | 'bullet' | 'blitz' | 'rapid' | 'classical' | 'chess960' | 'crazyhouse' | 'antichess' | 'atomic' | 'horde' | 'kingOfTheHill' | 'racingKings' | 'threeCheck' | 'puzzle';
export type Title = 'GM' | 'WGM' | 'IM' | 'WIM' | 'FM' | 'WFM' | 'NM' | 'CM' | 'WCM' | 'WNM' | 'LM' | 'BOT';
export type Shield = Variant | 'superblitz';

export interface StatusUser {
	id: string
	name: string
	title: Title
	online: boolean
	playing: boolean
	streaming: boolean
	patron: boolean
}

export interface User {
	id: string,
	username: string,
	title: Title,
	online: boolean,
	playing: boolean,
	streaming: boolean,
	createdAt: 1290415680000,
	seenAt: 1522636452014,
	profile: {
		bio: string,
		country: string,
		firstName: string,
		lastName: string,
		links: string,
		location: string
	},
	language: "en-GB",
	pers: {
		[key in Variant]: Perf
	}
	patron: boolean,
	disabled: boolean,
	engine: boolean,
	booster: boolean,
	playTime: {
		total: number,
		tv: number
	}
}

export interface History {
	name: string
	points: [number, number, number, number][]
}

export interface Activity {
	interval: {
		start: number,
		end: number
	},
	games: {
		[key in Variant]?: {
			win: number
			loss: number
			draw: number
			rp: {
				before: number
				after: number
			}
		}
	}
}

interface ShortUser {
	id: string
	name: string
	title: Title | null
}

interface Result {
	opInt: number
	opId: ShortUser
	at: string
	gameId: string
}

interface ShortGame {
	int: number
	at: string
	gameId: string
}

interface Streak {
	v: number
	from?: ShortGame
	to?: ShortGame
}

export interface Performance {
	user: {
		name: string
	}
	perf: {
		glicko: {
			rating: number
			deviation: number
			provisional: boolean
		}
		nb: number
		progress: number
	}
	rank: number
	percentile: number
	stat: {
		_id: string
		userId: ShortUser
		perfType: {
			key: string
			name: string
		}
		highest: ShortGame
		lowest: ShortGame
		bestWins: {
			results: Result[]
		}
		worstLosses: {
			results: Result[]
		}
		count: {
			all: number,
			rated: number,
			win: number,
			loss: number,
			draw: number,
			tour: number,
			berserk: number,
			opAvg: number,
			seconds: number,
			disconnects: number
		}
		resultStreak: {
			win: {
				cur: Streak
				max: Streak
			}
		}
		playStreak: {
			nb: Streak
			time: Streak
			lastDate: Streak
		}
	}
}

export interface RankUser {
	id: string
	username: string
	perfs: {
		[key in Variant]: {
			rating: number
			progress: number
		}
	}
	title: Title
	patron: boolean
	online: boolean
}

export type Rank = {
	[key in Variant]: RankUser[]
}