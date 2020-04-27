"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request = require('request');
const rp = require('request-promise');
const config = require('../config');
const User = require('../structures/User');
class Teams {
    constructor(oauth, result, access_token) {
        this.oauth = oauth;
        this.result = result;
        this.access_token = access_token;
    }
    /**
     * Members are sorted by reverse chronological order of joining the team (most recent first).
     * Members are streamed as ndjson, i.e. one JSON object per line.
     * @returns {Promise<User[]>}
     */
    members(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield new Promise((res, rej) => {
                    let output = [];
                    let last = '';
                    const options = {
                        method: 'GET',
                        uri: `${config.uri}team/${id}/users`,
                        headers: {
                            Accept: 'application/x-ndjson'
                        }
                    };
                    let req = request.get(options);
                    req.on('data', (data) => {
                        data.toString().trim().split('\n').forEach(line => req.emit('line', line));
                    })
                        .on('line', (str) => {
                        let test = last + str;
                        try {
                            let json = JSON.parse(test);
                            last = '';
                            output.push(new User(json));
                        }
                        catch (e) {
                            last += str;
                        }
                    })
                        .on('response', (response) => {
                        if (response.statusCode !== 200)
                            req.emit('error', 'Not found');
                    })
                        .on('error', rej)
                        .on('end', () => __awaiter(this, void 0, void 0, function* () {
                        let results = output;
                        res(results);
                    }));
                });
            }
            catch (e) {
                if (e)
                    throw e;
            }
        });
    }
    /**
     * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
     * https://lichess.org/team
     * @returns {Promise<null>}
     */
    join(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
                let access_token = token ? token.token.access_token : this.access_token;
                let options = {
                    uri: `${config.uri}team/${id}/join`,
                    json: true,
                    timeout: 5000,
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer ' + access_token
                    }
                };
                yield rp.post(options);
            }
            catch (e) {
                if (e)
                    throw e;
            }
        });
    }
    /**
     * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
     * https://lichess.org/team
     * @returns {Promise<null>}
     */
    leave(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
                let access_token = token ? token.token.access_token : this.access_token;
                let options = {
                    uri: `${config.uri}team/${id}/quit`,
                    json: true,
                    timeout: 5000,
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer ' + access_token
                    }
                };
                yield rp.post(options);
            }
            catch (e) {
                if (e)
                    throw e;
            }
        });
    }
    /**
     * Join a team. If the team join policy requires a confirmation, and the team owner is not the oAuth app owner, then the call fails with 403 Forbidden.
     * https://lichess.org/team
     * @returns {Promise<null>}
     */
    kick(id, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
                let access_token = token ? token.token.access_token : this.access_token;
                let options = {
                    uri: `${config.uri}team/${id}/kick/${userID}`,
                    json: true,
                    timeout: 5000,
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer ' + access_token
                    }
                };
                yield rp.post(options);
            }
            catch (e) {
                if (e)
                    throw e;
            }
        });
    }
}
module.exports = Teams;
//# sourceMappingURL=teams.js.map