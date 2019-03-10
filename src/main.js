const Users = require("./endpoints/users");

class lazy_lila {

    constructor() {

    }

    get users () {
        if (this._users) return this._users;
        return this._users = Users;
    }

}

const Lichess = new lazy_lila();
module.exports = Lichess;

(async () => {
    try {
        //console.log(await Lichess.users.status(["theLAZYmd", "mathace", "dovijanic", "opperwezen"]));
        //console.log(await Lichess.users.top10());
        //console.log(await Lichess.users.leaderboard("crazyhouse"));
        //console.log(await Lichess.users.user("theLAZYmd"));
        //console.log(await Lichess.users.history("theLAZYmd"));
        console.log(await Lichess.users.users(["theLAZYmd", "mathace", "dovijanic", "opperwezen"]));
    } catch (e) {
        if (e) console.error(e);
    }
})();