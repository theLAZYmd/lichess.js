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
Object.defineProperty(exports, "__esModule", { value: true });
const requests_1 = require("../utils/requests");
class Challenge {
    constructor(access_token) {
        this.access_token = access_token;
    }
    /**
     * Read public data of logged-in user.
     */
    create(username, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return requests_1.POST({
                url: '/api/challenge/' + username,
                timeout: 5000,
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + this.access_token
                },
                data: options
            });
        });
    }
    /**
     * Create a challenge that any 2 players can join.
     * Share the URL of the challenge. the first 2 players to click it will be paired for a game.
     * Specify a second parameter to have your authenticated user join the game
     */
    open(options, join) {
        return __awaiter(this, void 0, void 0, function* () {
            let game = yield requests_1.POST({
                url: '/api/challenge/open',
                timeout: 5000,
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + this.access_token
                },
                data: options
            });
            if (join)
                yield this.accept(game.id);
            return game;
        });
    }
    /**
     * Start a game with Lichess AI.
     * You will be notified on the event stream that a new game has started.
     */
    ai(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return requests_1.POST({
                url: '/api/challenge/ai',
                timeout: 5000,
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + this.access_token
                },
                data: options
            });
        });
    }
    /**
     * Accept an incoming challenge.
     * You should receive a gameStart event on the incoming events stream.
     */
    accept(challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return requests_1.POST({
                url: `/api/challenge/${challengeId}/accept`
            });
        });
    }
    /**
     * Decline an incoming challenge.
     */
    decline(challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return requests_1.POST({
                url: `/api/challenge/${challengeId}/decline`
            });
        });
    }
}
exports.default = Challenge;
//# sourceMappingURL=challenge.js.map