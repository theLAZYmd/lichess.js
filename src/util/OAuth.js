const express = require('express');
const axios = require('axios');
const rp = require('request-promise');
const simpleOAuth = require('simple-oauth2');
const qs = require('querystring');

const {Builder, By, Key, until} = require('selenium-webdriver');
require('chromedriver');

/**
 * Initiates a new login process to Lichess' OAuth service
 * @constructor
 * @param {string} id
 * @param {string} secret
 * @param {string} access_token
 * @param {string} host
 * @param {string} callback
 * @param {string[]} scopes
 */
class OAuth2 {

    constructor({
        id, secret, access_token, host, port, scopes, callback
    } = {}) {
        this.id = id;
        this.secret = secret;
        this.access_token = access_token,
        this.port = port;
        this.scopes = scopes;
        
        this.app = express();
        this.tokenHost = 'https://oauth.lichess.org';
        this.tokenPath = '/oauth';
        this.authorizePath = '/oauth/authorize';
        this.host = `${host}:${port}`;
        this.redirect_uri = `${this.host}${callback}`;
        console.log(this.redirect_uri);

        console.log(this.oauth2);
        this.set();
        this.listen();
        this.launch();
    }

    /**
     * Generates a randomised string which is returned in the authorisation. Can be checked at the end to check request is the same
     * @type {string}
     */
    get state () {
        if (this._state) return this._state;
        return this._state = Math.random().toString(36).substring(2);
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
    set() {
        this.app.get('/', (req, res) => res.send('Hello<br><a href="/auth">Log in with lichess</a>'));
        this.app.get('/auth', (req, res) => {
            console.log(this.authorizationUri);
            res.redirect(this.authorizationUri);
        });
        this.app.get('/callback', async (req, res) => {
            try {
                console.log(req.query.code);
                const result = await this.oauth2.authorizationCode.getToken({
                    code: req.query.code,
                    redirect_uri: this.redirect_uri
                });
                console.log(result);
                const token = this.oauth2.accessToken.create(result); 
                console.log(token);         
                const userInfo = await OAuth2.getUserInfo(token.token);
                res.send(`<h1>Successfully authorised!</h1>Your lichess user info: <pre>${JSON.stringify(userInfo, null, 4)}</pre><br>You can now close this tab.`);
            } catch (e) {
                //if (e) console.error(e);
                res.send(`<h1>Authentication Failed.</h1><pre>${e.toString()}</pre>`)
            }
        });
    }

    /**
     * Sets the listeners on a given domain
     */
    listen() {
        this.app.listen(this.port, () => console.log(`App listening on port ${this.port}!`));
    }

    /**
     * Launches a new automated web-browsing instance
     */
    async launch() {
        try {
            let driver = new Builder().forBrowser('chrome').build();
            await driver.get(this.host);
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
                Authorization: 'Bearer ' + this.access_token, //token.access_token
            }
        })
        return axios.get('/api/account', {
            baseURL: 'https://lichess.org/',
            headers: {
                'Authorization': 'Bearer ' + token.access_token
            }
        });
    }

}

new OAuth2({
    id: 'i91k6C7VQnqfivw2',
    secret: 'KDCs2v3kvz0BQqiapuFXsqRrt7zGpu6q',
    host: 'http://localhost',
    scopes: [],
    port: 3000,
    callback: '/callback'
})

module.exports = OAuth2;