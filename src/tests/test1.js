const {
    id,
    secret,
    host,
    port,
    callback
} = require('../config.json');

const lila = require('../index')
    .setID(id)
    .setHost(host)
    .setPort(port)
    .setCallback(callback)
    .setScopes()
    .login(secret);

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
        console.log(await lila.users.get(["theLAZYmd"]));
    }

    static async history() {
        console.log(await lila.users.history("theLAZYmd"));
    }

    static async titled() {
        console.log(await lila.users.titled('GM', 'BHM'));
    }

    static async users() {
        console.log((await lila.users.getMultiple(["mathace", "opperwezen", "obiwanbenoni"])).get('opperwezen'));
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

}

Test.status();
//Test.users();