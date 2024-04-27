/**
 * Add, update, and remove data from localStorage if it's available otherwise from a cookie.
 */
export default class Storage {
	/**
	 * 
	 * @param {string} key 	The identifier
	 * @returns {mixed} 	The value of the specified key from localStorage or cookie
	 */
	get(key) {
		// check to see if localStorage is supported
		if (typeof window.localStorage !== 'undefined') {
			const dataStr = localStorage.getItem(key);

			if (!dataStr) return null;

			// Parse the object {data:'{..}', expiry:288383838}
			const data = JSON.parse(dataStr);
			const now = new Date();

			// If the time has expired, delete the key and return null otherwise return the key
			if (now.getTime() > data.expiry) {
				localStorage.removeItem(key);
				return null;
			}

			// If reset = true then we must reset the expiration
			if (data.reset) {
				this.set(key, data.value, data.minutes, data.reset);
			}

			return data.value;

		} else {
			// localStorage is not supported, fallback to cookie
			return this.getCookie(key);
		}
	}

	/**
	 * Saves the key/value pair using localStorage or cookie.
	 * 
	 * Set shouldResetExpiration to true if you want to reset the time 
	 * every time you request the value from the key.
	 * 
	 * @param {string} key 
	 * @param {mixed} value 
	 * @param {int} minutes 
	 * @param {bool} shouldResetExpiration 
	 */
	set(key, value, minutes, shouldResetExpiration) {
		// Default to 1 hour
		minutes = minutes || 60;
		shouldResetExpiration = shouldResetExpiration || false;

		// check to see if localStorage is supported
		// 60000 = 1 minute
		if (typeof window.localStorage !== 'undefined') {
			const now = new Date();
			const data = {
				value: value,
				minutes: minutes,
				reset: shouldResetExpiration,
				expiry: now.getTime() + minutes * 60000
			};

			localStorage.setItem(key, JSON.stringify(data));

		} else {
			// localStorage is not supported, fallback to cookie
			this.setCookie(key, value, minutes);
		}
	}

	/**
	 * Deletes the key from localStorage or cookie
	 * 
	 * @param {string} key 
	 */
	remove(key) {
		// check to see if localStorage is supported
		if (typeof window.localStorage !== 'undefined') {
			localStorage.removeItem(key);

		} else {
			// localStorage is not supported, fallback to cookie
			this.removeCookie(key);
		}
	}

	/**
	 * Fallback if localStorage is unavailable
	 * 
	 * @param {string} key 	Identifier of the cookie
	 * @returns {string} 	Value of the cookie 
	 */
	getCookie(key) {
		return $.cookie(key);
	}

	/**
	 * Fallback if localStorage is unavailable
	 * 
	 * @param {string} key 	Identifier of the cookie
	 * @param {mixed} value Value of the cookie
	 * @param {int} minutes Expiration time
	 */
	setCookie(key, value, minutes) {
		// minutes/1440 minutes in a day
		$.cookie(key, value, { expires: minutes / 1440, path: '/;SameSite=Lax' });
	}

	/**
	 * Fallback if localStorage is unavailable
	 * 
	 * @param {string} key 
	 */
	removeCookie(key) {
		$.removeCookie(key, { path: '/' });
	}
}