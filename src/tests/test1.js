const {
    id = null,
    secret = null
} = require('../config.json');

const lila = require('../main')
    .setID(id)
    .setSecret(secret);

class Test {

    static async leaderboard() {
        console.log(await lila.users.leaderboard());
    }

    static async status() {
        console.log(lila.users.status(["theLAZYmd", "mathace", "dovijanic", "opperwezen"]));
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

    static async users() {
        console.log((await lila.users.getMultiple(["mathace", "theLAZYmd", "littleplotkin", "penguingim1", "opperwezen", "obiwanbenoni"])));
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

Test.tournament();