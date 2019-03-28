const rp = require('request-promise');
const request = require('request');
const axios = require('axios');
const qs = require('querystring')

class Test {

    static async promise () {
        console.log(await rp.post({
            method: "POST",
            uri: "https://lichess.org/api/users",
            body: {
                text: {
                    plain: "aliquantus,chess-network,lovlas"
                }
            },
            timeout: 2000,
            json: true
        }));
    }

    static async callback () {
        request({
            method: "POST",
            url: "https://lichess.org/api/users",
            body: "aliquantus,chess-network,lovlas", /*qs.stringify({
                text: {
                    plain: "aliquantus,chess-network,lovlas"
                }
            }),*/
            timeout: 2000,
            //json: true
        }, console.log);
    }

    static async axios () {
        console.log(await axios.post("https://lichess.org/api/users", {
            body: qs.stringify({
                text: {
                    plain: "aliquantus,chess-network,lovlas"
                }
            }),
            timeout: 2000,
            json: true
        }));
    }

}

//Test.promise();
Test.callback();
//Test.axios();