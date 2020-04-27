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
const rp = require('request-promise');
const config = require('../config.json');
const qs = require('querystring');
const User = require('../structures/User');
const Util = require('../util/Util');
class Profile {
    constructor(oauth, result, access_token) {
        this.oauth = oauth;
        this.result = result;
        this.access_token = access_token;
    }
    /**
     * Read public data of logged-in user.
     * @returns {User}
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.oauth ? this.oauth.accessToken.create(this.result) : undefined;
                let access_token = token ? token.token.access_token : this.access_token;
                let options = {
                    uri: `${config.uri}api/account`,
                    json: true,
                    timeout: 5000,
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer ' + access_token
                    }
                };
                return new User(yield rp.get(options));
            }
            catch (e) {
                if (e)
                    throw e;
            }
        });
    }
}
module.exports = Profile;
//# sourceMappingURL=profile.js.map