const lila = require('../main.js');
let app = new lila();

(async () => {
    //console.log(await app.users.leaderboard());
    //return await app.users.status(["theLAZYmd", "mathace", "dovijanic", "opperwezen"]);
    //console.log(await app.users.top10());
    //console.log(await app.users.leaderboard("crazyhouse"));
    console.log(await app.users.get(["theLAZYmd"]));
    //console.log(await app.users.history("theLAZYmd"));
    //console.log(await app.users.getMultiple(["mathace", "theLAZYmd", "littleplotkin", "penguingim1", "opperwezen"]));
})();