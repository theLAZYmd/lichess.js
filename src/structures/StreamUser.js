const StatusUser = require('./StatusUser');

/**
 * Represents a Lichess user in a tournament
 * @extends {StatusUser]}
 * @implements {User}
 * @example
 * let obj ={
    "id": "chess-network",
    "name": "Chess-Network",
    "title": "NM",
    "online": true,
    "playing": true,
    "streaming": true,
    "patron": true
    }
 */
class StreamUser extends StatusUser {

    constructor(data) {
        super(data);
                
        /**
         * Whether or not the user is streaming
         * @type {Boolean}
         * @name StreamUser#streaming
         * @readonly
         */
        this.streaming = Boolean(true);
    }

}

module.exports = StreamUser;