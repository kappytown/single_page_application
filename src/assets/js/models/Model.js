import Service from './../service/Service.js';

export default class Model {
	constructor() {
		this.service = new Service();
		this.pageSize = 10;
	}

	/**
	 * 
	 * @param {Function} callback 
	 */
	setChangeListener(callback) {
		this.onChange = callback;
	}

	/**
	 * 
	 * @param {Function} callback 
	 */
	setErrorListener(callback) {
		this.onError = callback;
	}
}