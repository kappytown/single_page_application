/**
 * This is a Singleton since it must maintain the events state
 * 
 * Observer class for handling all events
 */
class PubSub {
	#events = {};

	constructor() {
		if (!PubSub.instance) {
			PubSub.instance = this;
		}
		return PubSub.instance;
	}

	/**
	 * 
	 * @param {string} eventName 
	 * @param {Function} func 
	 * @returns {bool}
	 */
	#alreadyRegistered(eventName, func) {
		const event = this.#events[eventName];
		if (event) {
			for (let i = 0; i < registeredCbs.length; i++) {
				const registeredCb = registeredCbs[i];
				if (func == registeredCb.func)
					return true;
			}

			return false;
		}
	}

	/**
	 * 
	 * @param {string} evt 
	 * @param {Function} func 
	 * @param {mixed} context 
	 */
	subscribe(eventName, func, ctx) {
		const event = this.#events[eventName];
		const obj = {
			event: eventName,
			func: func,
			ctx: ctx
		}
		if (!event) {
			this.#events[eventName] = [obj];
		} else {
			if (!this.#alreadyRegistered(eventName, func)) {
				event.push(obj);
			}
		}
	}

	/**
	 * 
	 * @param {string} eventName 
	 */
	publish(eventName) {
		const event = this.#events[eventName];

		if (event) {
			event.map(obj => {
				obj.func.apply(obj.ctx, Array.prototype.slice.call(arguments, 1));
			});
		}
	}

	/**
	 * 
	 * @param {string} eventName 
	 * @param {Function} func 
	 */
	unsubscribe(eventName, func) {
		const event = this.#events[eventName];

		if (event) {
			this.#events[eventName] = event.filter(obj => obj.func !== func);
		}
	}
};

const instance = new PubSub();
Object.freeze(instance);

export default instance;