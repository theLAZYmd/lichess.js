# Lichess.JS

A wrapper for the [Lichess HTTP API](https://lichess.org/api).

Actively developed, built to be as systematic and intuitive for a user as possible. Endpoints are structured as imperatively as possible. 

Current categories of endpoints are:
- Users
- Tournaments
- Games
- Profile

And these are all easily called as a property of the package.
To get started, use `npm install lichess`.

Use in a file is simple. Example:

```js
let lila = require('lichess');

(async () => {

    console.log(await lila.users.get('theLAZYmd')); // returns a User object for theLAZYmd

    console.log(await lila.users.status(['opperwezen', 'thibault'])); // returns the status of multiple users

    console.log(await lila.tournaments.get('4UZLRsPb'));

})()
```

Full documentation of list of endpoints to be published shortly.

This library is **promise-based**, which means the result of each method returns a promise that must be `await`-ed or chained with a `.then()` method.
