import utils from './utils.js';

/**
 * This is a Singleton to maintain the cache state
 * 
 * Simple session caching function to cache anything for any specified period of time.
 * If timeout is not defined, the item will be cleared at the default timeout (1 hour).
 * If the cache length in kb exceeds 2mb, the first item will be removed before a new item is added.
 */
class Cache {
	#cache = [];			// {id:'', data:[], timeout:0}
	#duration = 3600000;	// 1 hour

	/**
	 * 
	 * @returns 
	 */
	constructor() {
		if (!Cache.instance) {
			Cache.instance = this;
		}
		return Cache.instance;
	}

	/**
	 * 
	 * @param {string} id 
	 * @returns {JSON} the element from the this.#cache array
	 */
	get(id) {
		//const item = this.#cache.find(x => x.id === id);
		const item = this.#findItem(id);

		if (item) {
			// renew timeout
			this.#setTimeout(item, item.duration);

			// Returns a reference to the item
			return item;
		}
		return null;
	}

	/**
	 * Adds an element to the this.#cache array
	 * 
	 * @param {string} id 
	 * @param {JSON} data 
	 * @param {JSON} metadata 
	 * @param {long} duration 
	 * @returns {JSON} the item added
	 */
	add(id, data, metadata, duration) {
		duration = duration || this.#duration;

		if (this.size() >= 2000) {	// 2000kb = 2mb
			utils.logger.log('Cache limit exceeded, removing first object');

			// remove first item in array
			this.remove(this.#cache[0].id);
		}

		let item = { id: id, data: data, timeout: null, duration: duration };

		// If additional key/value pairs are to be added...
		if (metadata) {
			item = $.extend(item, metadata);
		}

		this.#cache.push(item);

		this.#setTimeout(item, duration);

		return item;
	}

	/**
	 * Removes an element from the this.#cache array specified by id
	 * 
	 * @param {string} id 
	 */
	remove(id) {
		const index = this.#findIndex(id);

		if (index >= 0) {
			const item = this.#cache[index];
			clearTimeout(item.timeout);
			this.#cache.splice(index, 1);
		}

		//utils.logger.log('cache - removed item (' + id + ')');
	}

	/**
	 * Empties the entire this.#cache array of removes the element specified by id
	 * 
	 * @param {string} id 
	 */
	empty(id) {
		if (id) {
			this.remove(id);

		} else {
			// Clear all the timeouts then reset this.#cache
			for (let i = 0; i < this.#cache.length; i++) {
				const item = this.#cache[i];
				clearTimeout(item.timeout);
			}
			this.#cache = [];
		}
	}

	/**
	 * This is used to remove items if cache gets too big
	 * 
	 * @returns {int} the length of the this.#cache array in kilobytes
	 */
	size() {
		const s = JSON.stringify(this.#cache).replace(/[\[\]\,\"]/g, '');

		return (s.length / 1024).toFixed(2);
	}

	/**
	 * Used for debugging purposes
	 * 
	 * @returns the entire cache object
	 */
	getCache() {
		return this.#cache;
	}

	/**
	 * Sets the timeout used to remove an item from the this.#cache array
	 * 
	 * @param {JSON} item 
	 * @param {long} duration 
	 */
	#setTimeout(item, duration) {
		const _this = this;
		duration = duration || this.#duration;

		if (item) {
			clearTimeout(item.timeout);

			item.timeout = setTimeout(function () {
				_this.remove(item.id);
			}, duration);
		}
	}

	/**
	 * Helper function to find an item in the this.#cache array
	 * 
	 * @param {string} id 
	 * @returns {JSON} the item with the specified id
	 */
	#findItem(id) {
		return this.#cache.find(function (item) {
			return item.id === id;
		});
	}

	/**
	 * Helper function to find the index of an item in the this.#cache array
	 * 
	 * @param {string} id 
	 * @returns {int} the index of the item with the specified id
	 */
	#findIndex(id) {
		return this.#cache.findIndex(function (item) {
			return item.id === id;
		});
	}
};

const instance = new Cache();
Object.freeze(instance);

export default instance;