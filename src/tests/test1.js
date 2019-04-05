const {
    id,
    secret,
    host,
    port,
    callback
} = require('../config.json');

const client = require('../main');
const lila = (new client)
    .setID(id)
    .setHost(host)
    .setPort(port)
    .setCallback(callback)
    .setScopes()
    //.login(secret);

class Test {

    static async leaderboard() {
        console.log(await lila.users.leaderboard());
    }

    static async status() {
        console.log(await lila.users.status(["theLAZYmd", "mathace", "dovijanic", "opperwezen"], {
            fetchUsers: true
        }));
    }

    static async top10() {
        console.log(await lila.users.top10());
    }

    static async lb() {
        console.log(await lila.users.leaderboard("crazyhouse"));
    }

    static async user() { 
        console.log(await lila.users.get(["theLAZYmd"], {
            oauth: false
        }));
    }

    static async history() {
        console.log(await lila.users.history("theLAZYmd"));
    }

    static async titled() {
        console.log(await lila.users.titled('GM'));
    }

    static async team() {
        console.log(await lila.users.team('oxford-university-chess-club'));
    }

    static async users() {
        console.log((await lila.users.getMultiple(["mathace", "opperwezen", "obiwanbenoni"], {
            oauth: false
        })));
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

        }))
    }

    static async me() {
        await lila.authentication();
        console.log(await lila.profile.get());
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
        .on('error', console.error)
    }

    static async current() {
        console.log(await lila.games.current(['tomodbk', 'LeProfessionnel']));
    }

}

Test.game();