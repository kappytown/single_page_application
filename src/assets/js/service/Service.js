import utils from './../utils/utils.js';
import constants from './../utils/constants.js';
import pubsub from './../utils/PubSub.js';
import cache from './../utils/Cache.js';

export default class Service {
	#api_path = '@@API_PATH';
	#csrfToken = '';

	// All the different Content-Type options if needed. Default is JSON
	options = {
		JSON: { contentType: 'application/json; charset=UTF-8' },
		FORM: { contentType: 'application/x-www-form-urlencoded; charset=UTF-8' },
		TEXT: { contentType: 'text/plain; charset=UTF-8' },
		MULTI: { contentType: 'multipart/form-data; boundary=' }
	};

	// Contains a list of all the available APIs
	apis = {
		APP_VERSION: this.#api_path + '/app/version/{{version}}',

		USER_LOGIN: this.#api_path + '/auth/login',
		USERS: this.#api_path + '/users',
		USER: this.#api_path + '/users/{{id}}',

		PRODUCTS: this.#api_path + '/products',
		PRODUCTS_BY_CATEGORY: this.#api_path + '/products/category/{{category}}',
		PRODUCT: this.#api_path + '/products/{{id}}',
		PRODUCT_CATEGORIES: this.#api_path + '/products/categories'
	};

	/**
	 * 
	 * @param {string} method 
	 * @param {string} url 
	 * @param {JSON} data 
	 * @param {JSON} options 
	 * @param {int} timeout 
	 * @returns {JSON}
	 */
	async #request(method, url, data = {}, options = {}, timeout = 5000) { // timeout in milliseconds
		url = `${url}${url.indexOf('?') >= 0 ? '&' : '?'}v=${utils.getAppVersion()}`;
		const headers = {};
		headers['Content-Type'] = this.options.JSON.contentType;

		// Set CSRF token if available
		if (this.#csrfToken) {
			headers['X-CSRF-TOKEN'] = this.#csrfToken;
		}

		// AbortController to cancel the fetch request if needed
		const controller = new AbortController();
		const signal = controller.signal;

		// Merge user provided options with AbortSignal
		const mergedOptions = Object.assign({}, {
			method: method,
			headers: headers,
			cache: 'no-cache',
			signal: signal // Add the abort signal to the fetch options
		}, options);

		if (method !== 'GET') {
			mergedOptions.body = JSON.stringify(data);
		}

		// Set a timeout to abort the request
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		let response;
		let responseData;
		let isOk = false;

		try {
			response = await fetch(url, mergedOptions);
			clearTimeout(timeoutId); // Clear the timeout upon successful fetch

			responseData = await response.json();
			isOk = response.ok;

		} catch (error) {
			clearTimeout(timeoutId); // Ensure the timeout is cleared if an error occurs

			responseData = {};
			response = response || {};
			response.status = response.status || 0;
			response.statusText = response.statusText || 'Unable to process your request, please try again.';
		}

		// Handle response or HTTP errors (401, 403) as needed
		if (response.status === 401 || response.status === 403) {
			//if (!this.#canIgnoreResponse(url, method)) {
			pubsub.publish(constants.events.LOG_OUT);
			return { ok: false, status: response.status, responseData: [], statusText: 'Unauthorized' };
			//}
		}

		if (isOk) {
			pubsub.publish(constants.events.REQUEST_DONE, response, responseData);
		} else {
			pubsub.publish(constants.events.REQUEST_FAIL, response, response.statusText);
		}

		return { ok: isOk, status: response.status, responseData: responseData, statusText: response.statusText };
	}

	/**
	 * Returns true if we should ignore 401-403 response codes
	 * 
	 * @param {string} url 
	 * @param {string} method 
	 * @returns {bool}
	 */
	#canIgnoreResponse(url, method) {
		const ignoreList = { 'GET': ['session'], 'POST': ['login', 'logout', 'sign-up'], 'DELETE': ['session'] };
		const items = ignoreList[method] || [];
		let match = false;

		items.forEach(item => {
			if (url.indexOf(item) !== -1) {
				match = true;
			}
		});
		return match;
	}

	/**
	 * 
	 * @param {string} method 
	 * @returns {bool}
	 */
	#csrfSafeMethod(method) {
		// these HTTP methods do not require CSRF protection
		return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	}

	/**
	 * Replaces all the values in the url
	 * 
	 * example:
	 * url = replaceVars('/account/{{account_id}}/user/{{user_id}}/dosomething', {"account_id":1, "user_id":30});
	 * response - "/account/1/user/30/dosomething";
	 * 
	 * @param {string} url 
	 * @param {JSON} data 
	 * @returns {string}
	 */
	#replaceVars(url, data) {
		for (let key in data) {
			const find = '{{' + key + '}}';
			if (url.indexOf(find) !== -1) {
				url = url.replace(find, data[key]);

				// Remove the element as it is no longer needed
				delete data[key];
			}
		}

		return url;
	}

	/**
	 * 
	 * @param {string} url 
	 * @param {JSON} data 
	 * @param {JSON} options 
	 * @param {Function} successCB 
	 * @param {Function} errorCB 
	 * @returns {JSON}
	 */
	async get(url, data, options, successCB, errorCB) {
		const response = await this.#request('GET', url, data, options);
		if (response.ok) {
			successCB(response.responseData, response);
		} else {
			errorCB(response.statusText, response);
		}
	}

	/**
	 * 
	 * @param {string} url 
	 * @param {JSON} data 
	 * @param {JSON} options 
	 * @param {Function} successCB 
	 * @param {Function} errorCB 
	 * @returns {JSON}
	 */
	async post(url, data, options, successCB, errorCB) {
		const response = await this.#request('POST', url, data, options);
		if (response.ok) {
			successCB(response.responseData, response);
		} else {
			errorCB(response.statusText, response);
		}
	}

	/**
	 * 
	 * @param {string} url 
	 * @param {JSON} data 
	 * @param {JSON} options 
	 * @param {Function} successCB 
	 * @param {Function} errorCB 
	 * @returns {JSON}
	 */
	async put(url, data, options, successCB, errorCB) {
		const response = await this.#request('PUT', url, data, options);
		if (response.ok) {
			successCB(response.responseData, response);
		} else {
			errorCB(response.statusText, response);
		}
	}

	/**
	 * 
	 * @param {string} url 
	 * @param {JSON} data 
	 * @param {JSON} options 
	 * @param {Function} successCB 
	 * @param {Function} errorCB 
	 * @returns {JSON}
	 */
	async delete(url, data, options, successCB, errorCB) {
		const response = await this.#request('DELETE', url, data, options);
		if (response.ok) {
			successCB(response.responseData, response);
		} else {
			errorCB(response.statusText, response);
		}
	}

	/**
	 * 
	 * @param {string} url 
	 * @param {JSON} data 
	 * @param {JSON} options 
	 * @param {Function} successCB 
	 * @param {Function} errorCB 
	 * @returns {JSON}
	 */
	async head(url, data, options, successCB, errorCB) {
		const response = await this.#request('HEAD', url, data, options);
		if (response.ok) {
			successCB(response.responseData, response);
		} else {
			errorCB(response.statusText, response);
		}
	}

	/**
	 * This will cache the API response for up to an hour.
	 * 
	 * How to use: service.cacheRequest('unique-key', 'post', '/products', {category:'mens'}, {}, successCallback, errorCallback);
	 * 
	 * @param {string} id 			The unique cache key
	 * @param {string} url 			API
	 * @param {JSON} data 			data to pass to the API request
	 * @param {JSON} options 		options to modify the fetch request
	 * @param {Function} successCB 	Success callback
	 * @param {Function} errorCB 	Error callback
	 * @returns {JSON}	So we can abort the request if needed
	 */
	async cacheRequest(id, method, url, data, options, successCB, errorCb) {
		// Get the response from cache otherwise create it a new entry that we will populate with the response
		let cached = cache.get(id) || cache.add(id, null, { url: url, callback: callback, processing: false });

		const successHandler = (data, response) => {
			cached.processing = false;
			cached.data = data;

			if (successCB) successCB(data, response);
		}

		const errorHandler = (message, response) => {
			// prevents caching so the request is made again
			cache.remove(id);

			if (errorCb) errorCb(message, response);
		}

		if (cached.data !== null) {
			successHandler(cached.data);
			return;

		} else if (cached.processing === true) {
			// Prevent from making duplicate requests
			return;
		}

		cached.processing = true;
		cached.url = url;

		// Make the call
		return await this[method.toLowerCase()](url, data, options, successHandler, errorHandler);
	}

	/**
	 * Removes the cached data by the specified id
	 * 
	 * @param {string} id 
	 */
	removeFromCache(id) {
		cache.empty(id);
	}

	/**
	 * 
	 * @param {string} key 
	 * @param {JSON} data 
	 * @returns {string}
	 */
	getAPI(key, data) {
		return this.#replaceVars(this.apis[key], data);
	}
}