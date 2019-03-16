const rp = require('request-promise');
const config = require('../config.json');

class Tournaments {

    static async get () {
        return await rp.get({
            "uri": config.uri + "/api/tournament",
            "json": true,
            "timeout": 2000
        })
    }

}

module.exports = Tournaments;