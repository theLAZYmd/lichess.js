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
class Profile {
    constructor(access_token) {
        this.access_token = access_token;
    }
    /**
     * Read public data of logged-in user.
     * @returns {User}
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            return requests_1.GET({
                url: '/api/account',
                timeout: 5000,
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + this.access_token
                }
            });
        });
    }
}
exports.default = Profile;
//# sourceMappingURL=profile.js.map