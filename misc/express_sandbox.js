const express = require('express');
const axios = require('axios');
const rp = require('request-promise');
const simpleOAuth = require('simple-oauth2');
const qs = require('querystring');
const {id, secret} = require('../src/config.json');

const {Builder, By, Key, until} = require('selenium-webdriver');
require('chromedriver');

class OAuth2 {

    constructor() {
        this.app = express();
        this.port = 3000;
        this.tokenHost = 'https://oauth.lichess.org';
        this.tokenPath = '/oauth';
        this.authorizePath = '/oauth/authorize';
        this.redirectUri = "http://localhost:3000/callback";
    }

    /**
     * List of scopes {"https://lichess.org/api#section/Authentication"}
     */
    get scopes () {
        if (this._scopes) return this._scopes;
        return this._scopes = [
            'game:read',
            'preference:read', //- Read your preferences
            'preference:write', //- Write your preferences
            'email:read', //- Read your email address
            'challenge:read', //- Read incoming challenges
            'challenge:write', //- Create, accept, decline challenges
            'tournament:write' //- Create tournaments
            //'bot:play'
        ];
    }

    get state () {
        if (this._state) return this._state;
        return this._state = Math.random().toString(36).substring(2);
    }

    get authorizationUri () {
        if (this._authorizationUri) return this._authorizationUri;
        return this._authorizationUri = this.tokenHost + this.authorizePath + '?' + qs.stringify({
            response_type: "code",
            client_id: id,
            redirect_uri: this.redirectUri, 
            scope: this.scopes.join(' '),
            state: this.state
        }, '&', '=');
    }

    get oauth2 () {
        if (this._oauth2) return this._oauth2;
        return this._oauth2 = simpleOAuth.create({
            client: {
                id,
                secret,
            },
            auth: {
                tokenHost: this.tokenHost,
                tokenPath: this.tokenPath,
                authorizePath: this.authorizePath,
            }
        });
    }

    set() {
        this.app.get('/', (req, res) => res.send('Hello<br><a href="/auth">Log in with lichess</a>'));
        this.app.get('/auth', (req, res) => {
            console.log(this.authorizationUri);
            res.redirect(this.authorizationUri);
        });
        this.app.get('/callback', async (req, res) => {
            try {
                const result = await this.oauth2.authorizationCode.getToken({
                    "code": req.query.code,
                    "redirect_uri": this.redirectUri
                });
                const token = this.oauth2.accessToken.create(result);
                console.log(token);                
                const userInfo = await OAuth2.getUserInfo(token.token);
                res.send(`<h1>Success!</h1>Your lichess user info: <pre>${JSON.stringify(userInfo.data)}</pre>`);
            } catch (e) {
                if (e) console.error(e);
            }
        });
    }

    listen() {
        this.app.listen(this.port, () => console.log(`App listening on port ${this.port}!`));
    }

    async launch() {
        try {
            let driver = new Builder().forBrowser('chrome').build();
            await driver.get(`http://localhost:${this.port}/`);
        } catch (e) {
            if (e) console.error(e);
        }
    }

    static getUserInfo(token) {
        return rp.get({
            "uri": 'https://lichess.org/api/account',
            "json": true,
            "headers": {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token.access_token
            }
        })
        return axios.get('/api/account', {
            "baseURL": 'https://lichess.org/',
            "headers": {
                'Authorization': 'Bearer ' + token.access_token
            }
        });
    }

}

let r = new OAuth2();
r.set();
r.listen();
r.launch();/*
(async () => {
    console.log(await OAuth2.getUserInfo());
})();*/

module.exports = OAuth2;