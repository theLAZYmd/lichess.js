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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("../config.json"));
const querystring_1 = __importDefault(require("querystring"));
const requests_1 = require("../utils/requests");
const regexes = __importStar(require("../utils/regexes"));
const stream_1 = __importDefault(require("stream"));
const request_1 = __importDefault(require("request"));
class Users {
    constructor(access_token) {
        this.access_token = access_token;
    }
    searchUsers(term, friend = true, object = true) {
        return requests_1.GET({
            url: '/player/autocomplete',
            params: {
                term,
                friend: friend ? 1 : 0,
                object: object ? 1 : 0
            }
        });
    }
    get(userParam, timeout) {
        if (typeof userParam === 'string')
            return this.getOne(userParam, timeout);
        else {
            if (userParam.length === 1)
                return this.getOne(userParam[0], timeout);
            return this.getMultiple(userParam, timeout);
        }
    }
    /**
     * Read public data of a user.
     */
    getOne(username, timeout) {
        if (!regexes.username.test(username))
            throw new TypeError('Invalid format for lichess username: ' + username);
        return requests_1.GET({ url: '/api/user' + username, timeout });
    }
    /**
     * Get several users by their IDs. Users are returned in the order same order as the IDs.
     */
    getMultiple(names, timeout = 10000) {
        names.forEach((n) => {
            if (!regexes.username.test(n))
                throw new TypeError('Invalid format for lichess username. ' + n);
        });
        return requests_1.POST({ url: '/api/users', data: names.join(','), timeout });
    }
    /**
     * Gets a list of users following a specified user
     */
    following(username, timeout, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!regexes.username.test(username))
                throw new TypeError('Invalid format for lichess username: ' + username);
            let x = yield requests_1.GET({
                url: `/api/user/${username}/following`,
                timeout,
                headers: { Accept: 'application/x-ndjson' },
                responseType: stream ? 'stream' : 'text'
            });
            if (!stream)
                return x.split('\n').map(line => JSON.parse(line));
            let last = '';
            let output = new stream_1.default.Readable();
            return new Promise((res, rej) => {
                x.on('data', (data) => {
                    let str = data.toString().trim();
                    try {
                        let user = JSON.parse(last + str);
                        last = '';
                        output.push(user);
                    }
                    catch (e) {
                        last += str;
                    }
                })
                    .on('error', rej)
                    .on('end', () => output.destroy());
            });
        });
    }
    /**
     * Gets a list of users who follow a specified user
     */
    followers(username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!regexes.username.test(username))
                throw new TypeError('Invalid format for lichess username: ' + username);
            const uri = `${config_json_1.default.uri}api/user/${username}/followers`;
            return yield new Promise((res, rej) => {
                let output = [];
                let last = '';
                const options = {
                    uri,
                    Accept: 'application/x-ndjson'
                };
                try {
                    let req = request_1.default.get(options);
                    req.on('data', (data) => {
                        let str = data.toString().trim();
                        try {
                            let json = JSON.parse(last + str);
                            last = '';
                            output.push(json);
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
                        .on('end', () => res(output));
                }
                catch (e) {
                    if (e)
                        rej(e);
                }
            });
        });
    }
    /**
     * Options to send to the users.status endpoint
     * @example
     * //Only returns the full user object for users who are playing and titled
     * {
     *  fetchUsers: false,
     *  filter: user => user.playing && user.titled
     * }
     */
    /**
     * Gets the status of many users and returns it
     */
    status(ids, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let { fetchUsers, filter } = options || { filter: () => true };
            if (ids.length > 50)
                throw new TypeError('Cannot check status of more than 50 names');
            if (!ids.every(n => regexes.username.test(n)))
                throw new SyntaxError('Invalid format for lichess username');
            let results = yield requests_1.GET({
                url: '/api/users/status',
                params: {
                    ids: ids.join(',')
                }
            });
            results = results.filter(filter);
            if (!fetchUsers)
                return results;
            let users = yield this.getMultiple(results.map(u => u.id));
            return results.map((u, i) => Object.assign(u, users[i]));
        });
    }
    /**
     * Gets the top 10 players by rating of every variant
     */
    top10(keys = []) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof keys === 'string')
                keys = [keys];
            let res = yield requests_1.GET({
                url: '/player',
                headers: {
                    Accept: 'application/vnd.lichess.v3+json'
                },
                timeout: 2000
            });
            if (keys.length === 1)
                return res[keys[0]];
            return res;
        });
    }
    /**
     * Gets the top user-specified number of players for a given variant
     */
    leaderboard(variant = 'bullet', n = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            if (n > 200)
                throw new TypeError('Cannot get leaderboard for more than 200 names');
            return yield requests_1.GET({
                url: '/player/top/' + n + '/' + variant,
                headers: {
                    Accept: 'application/vnd.lichess.v3+json'
                },
                timeout: 2000
            });
        });
    }
    /**
     * Lichess API documentation specifies an array of [year, month, day, rating] entries
     * This is parsed to an array of [timestamp, rating] entries
     */
    history(username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!regexes.username.test(username))
                throw new TypeError('Invalid format for lichess username: ' + username);
            let raw = yield requests_1.GET({
                url: `/api/user/${username}/rating-history`,
                headers: {
                    Accept: 'application/vnd.lichess.v1+json'
                },
                timeout: 2000
            });
            return raw.map(({ name, points }) => [
                name,
                points.reduce((obj, [year, month, day, rating]) => {
                    let k = new Date(year, month, day).getTime();
                    let v = rating;
                    obj.push([k, v]);
                    return obj;
                }, [])
            ]);
        });
    }
    stats(username, variant) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!regexes.username.test(username))
                throw new TypeError('Invalid format for lichess username: ' + username);
            return yield requests_1.GET({
                url: `/@/${username}/perf/${variant}`,
                headers: {
                    Accept: 'application/vnd.lichess.v1+json'
                },
                timeout: 2000
            });
        });
    }
    /**
     * The activity feed of a user viewable on their profile
     */
    activity(username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!regexes.username.test(username))
                throw new TypeError('Invalid format for lichess username: ' + username);
            return yield requests_1.GET({
                url: `/api/user/${username}/activity`,
                timeout: 2000
            });
        });
    }
    /**
     * Get members of a team. Members are sorted by reverse chronological order of joining the team (most recent first).
     * @param {string} teamID
     * @returns {Promise<Collection<User>>}
     */
    team(teamID) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = `${config_json_1.default.uri}team/${teamID}/users`;
            try {
                return yield new Promise((res, rej) => {
                    let output = [];
                    let last = '';
                    const options = {
                        uri,
                        Accept: 'application/x-ndjson'
                    };
                    try {
                        let req = request_1.default.get(options);
                        req.on('data', (data) => {
                            data.toString().trim().split('\n').forEach(line => req.emit('line', line));
                        })
                            .on('line', (str) => {
                            let test = last + str;
                            try {
                                let json = JSON.parse(test);
                                last = '';
                                output.push(json);
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
                            .on('end', () => res(output));
                    }
                    catch (e) {
                        if (e)
                            rej(e);
                    }
                });
            }
            catch (e) {
                if (e)
                    throw e;
            }
        });
    }
    /**
     * Get a list of users who are live.
     * @param {statusOptions} options
     * @returns {Promise<StatusUser[]|User[]>}
     */
    streaming(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let { fetchUsers, filter } = options || { filter: () => true };
            let results = yield requests_1.GET({
                url: '/stream/live',
                timeout: 2000
            });
            if (!fetchUsers) {
                results = results.filter(filter);
                return results;
            }
            else {
                let users = yield this.getMultiple(results.map(r => r.id));
                results = results.filter(filter);
                return results.map((r, i) => Object.assign(r, users[i]));
            }
        });
    }
    /**
     * Get titled users. Get users by title. Several titles can be specified.
     */
    titled(titles = ['GM'], online = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                uri: `${config_json_1.default.uri}api/users/titled?${querystring_1.default.stringify({
                    titles: titles.join(','),
                    online
                })}`,
                json: true
            };
            return yield new Promise((res, rej) => {
                try {
                    let output = [];
                    let last = '';
                    let req = request_1.default.get(options);
                    req.on('data', (data) => {
                        let str = data.toString().trim();
                        try {
                            let json = JSON.parse(last + str);
                            last = '';
                            output.push(json);
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
                        .on('end', () => res(output));
                }
                catch (e) {
                    if (e)
                        rej(e);
                }
            });
        });
    }
}
exports.default = Users;
//# sourceMappingURL=users.js.map