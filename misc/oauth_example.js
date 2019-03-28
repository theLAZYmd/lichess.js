const express = require('express');
const simpleOauth = require('simple-oauth2');
const axios = require('axios');
const config = require('../src/config.json');

/* Create your lichess OAuth app on https://lichess.org/account/oauth/app/create
 * Homepage URL: http://localhost:8087
 * Callback URL: http://localhost:8087/callback
 */

/* --- Fill in your app config here --- */
const port = 3000;
const clientId = config.id;
const clientSecret = config.secret;
const redirectUri = `http://localhost:${port}/callback`;
// uncomment the scopes you need
// list of scopes: https://lichess.org/api#section/Authentication
const scopes = [];/*[
    'game:read',
    'preference:read', //- Read your preferences
    'preference:write', //- Write your preferences
    'email:read', //- Read your email address
    'challenge:read', //- Read incoming challenges
    'challenge:write', //- Create, accept, decline challenges
    'tournament:write', //- Create tournaments
    'bot:play'
];*/
/* --- End of your app config --- */

/* --- Lichess config --- */
const tokenHost = 'https://oauth.lichess.org';
const authorizePath = '/oauth/authorize';
const tokenPath = '/oauth';
/* --- End of lichess config --- */

const oauth2 = simpleOauth.create({
    client: {
        id: clientId,
        secret: clientSecret,
    },
    auth: {
        tokenHost,
        tokenPath,
        authorizePath,
    },
});

const state = Math.random().toString(36).substring(2);
const authorizationUri = `${tokenHost}${authorizePath}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&state=${state}`;

const app = express();

// Show the "log in with lichess" button
app.get('/', (req, res) => res.send('Hello<br><a href="/auth">Log in with lichess</a>'));

// Initial page redirecting to Lichess
app.get('/auth', (req, res) => {
    console.log(authorizationUri);
    res.redirect(authorizationUri);
});

// Redirect URI: parse the authorization token and ask for the access token
app.get('/callback', async (req, res) => {
    try {
        const result = await oauth2.authorizationCode.getToken({
            code: req.query.code,
            redirect_uri: redirectUri
        });
        console.log(result);
        const token = oauth2.accessToken.create(result);
        const userInfo = await getUserInfo(token.token);
        res.send(`<h1>Success!</h1>Your lichess user info: <pre>${JSON.stringify(userInfo.data)}</pre>`);
    } catch (error) {
        console.error(error);
        res.status(500).json('Authentication failed');
    }
});

app.listen(port, () => console.log(`Express server started on port ${port}`));

function getUserInfo(token) {
    return axios.get('/api/account', {
        baseURL: 'https://lichess.org/',
        headers: {
            'Authorization': 'Bearer ' + token.access_token
        }
    });
}