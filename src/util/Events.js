const events = require('events');
const EventEmitter = events.EventEmitter;

class Events extends events {

	constructor() {
		super(arguments);
	}

	/**
     * @since v11.13.0  
     * Creates a Promise that is resolved when the EventEmitter emits the given event or that is rejected when the EventEmitter emits 'error'. The Promise will resolve with an array of all the arguments emitted to the given event.
     * @param {EventEmitter} emitter 
     * @param {'string'} name 
     * @returns {<Promise>}
     */
	static once(emitter, name) {
		return new Promise((resolve, reject) => {
			const eventListener = (...args) => {
				if (errorListener !== undefined) {
					emitter.removeListener('error', errorListener);
				}
				resolve(args);
			};
			let errorListener;

			// Adding an error listener is not optional because
			// if an error is thrown on an event emitter we cannot
			// guarantee that the actual event we are waiting will
			// be fired. The result could be a silent way to create
			// memory or file descriptor leaks, which is something
			// we should avoid.
			if (name !== 'error') {
				errorListener = (err) => {
					emitter.removeListener(name, eventListener);
					reject(err);
				};

				emitter.once('error', errorListener);
			}

			emitter.once(name, eventListener);
		});
	}

}

module.exports = Events;