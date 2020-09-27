"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios = axios_1.default.create({
    baseURL: 'https://lichess.org'
});
function GET(options) {
    options = Object.assign(options, {
        method: 'GET',
        timeout: 5000
    });
    let x = axios(options)
        .catch((e) => {
        console.error(e);
        throw e;
    });
    if (options.responseType === 'stream')
        return x;
    else
        return x.then((res) => res.data);
}
exports.GET = GET;
function POST(options) {
    options = Object.assign(options, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return axios(options)
        .then((res) => res.data)
        .catch((e) => {
        throw e;
    });
}
exports.POST = POST;
//# sourceMappingURL=requests.js.map