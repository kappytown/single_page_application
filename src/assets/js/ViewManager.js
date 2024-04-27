/**
 * This is used to reuse views and/or dispose of views so we don't have
 * to keep track of which ones are visible
 */
class ViewManager {
	#views = {};
	#currentView;

	// List of page ids that you do not want cached and reloaded on every visit
	#doNotCacheList = [];

	constructor() {
		if (!ViewManager.instance) {
			ViewManager.instance = this;
		}
		return ViewManager.instance;
	}

	/**
	 * 
	 * @param {string} view 
	 */
	setCurrentView(view) {
		if (this.#currentView) {
			if (typeof this.#currentView.onViewHidden === 'function') {
				this.#currentView.onViewHidden();
			}
		}

		this.#currentView = view;
	}

	/**
	 * 
	 * @returns {Class}
	 */
	getCurrentView() {
		return this.#currentView;
	}

	/**
	 * 
	 * @param {string} key 
	 * @param {mixed} view 
	 */
	register(key, view) {
		this.#views[key] = view;
	}

	/**
	 * 
	 * @param {string} key 
	 * @returns {Class}
	 */
	getView(key) {
		return this.#views[key];
	}

	/**
	 * 
	 * @param {string} key 
	 */
	dispose(key) {
		const view = this.#views[key];
		if (view) {
			// Check if view implements the dispose method
			if (typeof view.dispose === 'function') {
				view.dispose();
			}
			delete this.#views[key];
		}
	}

	/**
	 * 
	 */
	disposeAll() {
		// loop through the view
		for (let key in this.#views) {
			this.dispose(key);
		}
	}

	/**
	 * 
	 */
	reset() {
		// Calls dispose on all views
		this.disposeAll();

		// Empty array after reset
		this.#views = {};
	}

	/**
	 * 
	 * @returns {int} total number of views loaded
	 */
	count() {
		let count = 0;
		for (let key in this.#views) {
			count++;
		}
		return count;
	}

	/**
	 * 
	 */
	cleanup() {
		// Don't remove the app view
		if (this.#currentView && this.#currentView.$el) {
			for (let key in this.#views) {
				if ($.inArray(key, this.#doNotCacheList) != -1) {
					this.dispose(key);
				}
			}
		}
	}
};

const instance = new ViewManager();
Object.freeze(instance);

export default instance;