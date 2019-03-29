const express = require('express');
//const axios = require('axios');
const rp = require('request-promise');
const simpleOAuth = require('simple-oauth2');
const qs = require('querystring');
const open = require('open');
const path = require('path');

//const {Builder, By, Key, until} = require('selenium-webdriver');
//require('chromedriver');

/**
 * Initiates a new login process to Lichess' OAuth service
 * @constructor
 * @param {string} id
 * @param {string} secret
 * @param {string} access_token
 * @param {string} host @default 'http://localhost
 * @param {string} callback @default '/callback'
 * @param {string[]} scopes @default []
 */
class OAuth2 {

    constructor({
        id, secret, access_token, host, port, scopes, callback, state
    } = {}) {
        this.id = id;
        this.secret = secret;
        this.access_token = access_token,
        this.port = port;
        this.scopes = scopes;
        this.state = state;
        
        this.app = express();
        this.tokenHost = 'https://oauth.lichess.org';
        this.tokenPath = '/oauth';
        this.authorizePath = '/oauth/authorize';
        this.host = `${host}:${port}`;
        this.redirect_uri = `${this.host}${callback}`;

        //this.app.get('/', (req, res) => res.send('Hello<br><a href="/auth">Log in with lichess</a>'));

        this.app.getPromise = (data) => {
            return new Promise((res, rej) => {
                this.app.get(data, function () {
                    try {
                        res(arguments);
                    } catch (e) {
                        rej(e);
                    }
                })
            })
        }
    }

    async run (res) {
        this.set()
        .then(async () => {            
            const token = this.oauth2.accessToken.create(this.result); 
            const userInfo = await OAuth2.getUserInfo(token.token);
            //console.log(userInfo);
            res();
        });
        this.listen();
        this.launch();
    }

    /**
     * Generates a URI for the authorization server with queries including the redirect_uri which should be the /callback and the list of scopes
     * @type {string}
     */
    get authorizationUri () {
        if (this._authorizationUri) return this._authorizationUri;
        return this._authorizationUri = this.tokenHost + this.authorizePath + '?' + qs.stringify({
            response_type: "code",
            client_id: this.id,
            redirect_uri: this.redirect_uri,
            scope: this.scopes.join(' '),
            state: this.state
        }, '&', '=');
    }

    /**
     * Creates a new OAuth object that can be used to generate personal, expiring, access token from a refreshing token with client id and secret. Asynchronous create_token function only works with valid request code
     */
    get oauth2 () {
        if (this._oauth2) return this._oauth2;
        return this._oauth2 = simpleOAuth.create({
            client: {
                id: this.id,
                secret: this.secret,
            },
            auth: {
                tokenHost: this.tokenHost,
                tokenPath: this.tokenPath,
                authorizePath: this.authorizePath
            }
        });
    }
    
    /**
     * Creates a temporary server on a given domain with a callback url. Listens on the callback url for the authentication server to send a request confirming authorization
     */
    async set() {
        try {
            this.app.getPromise('/style.css')
                .then(([req, res]) => res.sendFile(path.normalize(__dirname + '/../views/OAuth/style.css')))
            this.app.getPromise('/')
                .then(([req, res]) => res.sendFile(path.normalize(__dirname + '/../views/OAuth/auth.html')))
            this.app.getPromise('/auth')
                .then(([req, res]) => res.redirect(this.authorizationUri))
            let [req, res] = await this.app.getPromise('/callback');
            try {
                const result = await this.oauth2.authorizationCode.getToken({
                    code: req.query.code,
                    redirect_uri: this.redirect_uri
                });
                const token = this.oauth2.accessToken.create(result); 
                const userInfo = await OAuth2.getUserInfo(token.token);
                res.send(`<h1>Successfully authorised!</h1><h2>You can close this tab now.</h2><br>Your lichess user info: <pre>${JSON.stringify(userInfo, null, 4)}</pre>`);
                this.result = result;
                return this;
            } catch (e) {
                res.send(`<h1>Authentication Failed.</h1><pre>${e.toString()}</pre>`)
            }
        } catch (e) {
            if (e) res.send(e);
            console.error(e);
        }
    }

    /**
     * Sets the listeners on a given domain
     */
    listen() {
        this.app.listen(this.port, () => {});
    }

    /**
     * Launches a new automated web-browsing instance
     */
    async launch() {
        try {
            await open(this.host);
            //let driver = new Builder().forBrowser('chrome').build();
            //await driver.get(this.host);
        } catch (e) {
            if (e) console.error(e);
        }
    }

    /**
     * Returns user-info using an authorisation token
     * @param {string} token 
     */
    static getUserInfo(token) {
        return rp.get({
            uri: 'https://lichess.org/api/account',
            json: true,
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token.access_token
            }
        })
        /*
        return axios.get('/api/account', {
            baseURL: 'https://lichess.org/',
            headers: {
                'Authorization': 'Bearer ' + token.access_token
            }
        });
        */
    }

}

module.exports = OAuth2;