const rp = require('request-promise');
const r = {
    username: /(?:^|\b)([a-z0-9][\w-]*[a-z0-9])$/i
}
const urls = {
    base: "https://lichess.org/",
    users: {
        status: "api/users/status?ids=|",
        top10: "player",
        get: "api/users/",
    },
    profile: "@/|",
    user: "api/user/|",
    game: "api/game/|",
    puzzle: "training/|",
    redirect: "http://localhost:3000/callback"
}


class Lichess {

    constructor() {

    }

    get users() {
        return UserStore;
    }

}

class UserStore extends DataStore {

    constructor(client) {
        super(client);
    }


    _addMember(guildUser, emitEvent = true) {
        const existing = this.members.has(guildUser.user.id);
        if (!(guildUser.user instanceof User)) guildUser.user = this.client.dataManager.newUser(guildUser.user);

        guildUser.joined_at = guildUser.joined_at || 0;
        const member = new GuildMember(this, guildUser);
        this.members.set(member.id, member);

        /**
         * Emitted whenever a user joins a guild.
         * @event Client#guildMemberAdd
         * @param {GuildMember} member The member that has joined a guild
         */
        if (this.client.ws.connection.status === Constants.Status.READY && emitEvent && !existing) {
            this.client.emit(Constants.Events.GUILD_MEMBER_ADD, member);
        }

        return member;
    }

    _updateMember(member, data) {
        const oldMember = Util.cloneObject(member);

        if (data.roles) member._roles = data.roles;
        if (typeof data.nick !== 'undefined') member.nickname = data.nick;

        const notSame = member.nickname !== oldMember.nickname || !Util.arraysEqual(member._roles, oldMember._roles);

        if (this.client.ws.connection.status === Constants.Status.READY && notSame) {
            /**
             * Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
             * @event Client#guildMemberUpdate
             * @param {GuildMember} oldMember The member before the update
             * @param {GuildMember} newMember The member after the update
             */
            this.client.emit(Constants.Events.GUILD_MEMBER_UPDATE, oldMember, member);
        }

        return {
            old: oldMember,
            mem: member,
        };
    }

    _removeMember(guildMember) {
        this.members.delete(guildMember.id);
    }

    async get(userResolvable) {
        let users = resolve(userResolvable);
        return await rp.post({
            method: "POST",
            uri: urls.users.get,
            body: {
                text: {
                    plain: users.join(",")
                }
            },
            timeout: 5000,
            json: true
        });
    }

    async status(userResolvable) {
        let users = resolve(userResolvable);
        return await rp.get({
            uri: urls.base + urls.users.status.replace("|", users.join(",")),
            json: true
        })
    }

    async top10() {
        return await rp.get({
            uri: urls.base + urls.users.top10,
            headers: {
                Accept: "application/vnd.lichess.v3+json"
            },
            json: true
        })
    }
}

module.exports = Lichess;

(async () => {
    try {
        let client = new Lichess();
        console.log(await client.users.status(['theLAZYmd']));
        //console.log(await client.users.top10());
    } catch (e) {
        if (e) console.error(e);
    }
})()

function Deprecated() {

    let errors = ['invalid argument type',
        'username is required',
        'game ID is required'
    ];

    const Lichess = function () {
        function Lichess() {}

        Lichess.user = function (options, cb) {
            if (typeof options === 'function') {
                cb = options;
            }

            let params = {
                team: options.team || '',
                nb: options.nb || 10
            };

            request.get(
                Lichess.apiServer + '/user' +
                (typeof options === 'string' ? '/' + options :
                    '?team=' + params.team + '&nb=' + params.nb),
                function (err, res) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, res.body);
                }
            );
        };

        Lichess.user.games = function (username, options, cb) {
            if (!username) {
                throw new Error(errors[1]);
            } else if (typeof options === 'function') {
                cb = options;
            }

            let params = {
                nb: options.nb || 100,
                page: options.page || 1,
                with_analysis: options.with_analysis || 0,
                with_moves: options.with_moves || 0,
                with_opening: options.with_opening || 0,
                with_movetimes: options.with_movetimes || 0,
                rated: options.rated || 0
            };

            let queryString =
                'nb=' + params.nb +
                '&page=' + params.page +
                '&with_analysis=' + params.with_analysis +
                '&with_moves=' + params.with_moves +
                '&with_opening=' + params.with_opening +
                '&with_movetimes=' + params.with_movetimes +
                '&rated=' + params.rated;

            request.get(
                Lichess.apiServer + '/user/' + username + '/games?' + queryString,
                function (err, res) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, res.body);
                }
            );
        };

        Lichess.game = function (gameId, options, cb) {
            if (!gameId) {
                throw new Error(errors[2]);
            } else if (typeof gameId !== 'string') {
                throw new Error(errors[0]);
            } else if (typeof options === 'function') {
                cb = options;
            }

            let params = {
                with_analysis: options.with_analysis || 0,
                with_moves: options.with_moves || 0,
                with_movetimes: options.with_movetimes || 0,
                with_opening: options.with_opening || 0,
                with_fens: options.with_fens || 0
            };

            let queryString =
                'with_analysis=' + params.with_analysis +
                '&with_moves=' + params.with_moves +
                '&with_opening=' + params.with_opening +
                '&with_movetimes=' + params.with_movetimes +
                '&with_fens=' + params.with_fens;

            request.get(
                Lichess.apiServer + '/game/' + gameId + '?' + queryString,
                function (err, res) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, res.body);
                }
            );
        };

        Lichess.game.export = function (gameId, cb) {
            if (!gameId) {
                throw new Error(errors[2]);
            } else if (typeof gameId !== 'string') {
                throw new Error(errors[0]);
            }

            return cb(null, JSON.stringify({
                id: gameId,
                pgn_url: Lichess.apiServer + '/game/export/' + gameId + '.pgn'
            }));
        };

        return Lichess;
    }
}