const utils = {
	/**
	 * Used to append the version number to the end of each request to cache bust updates
	 * 
	 * @returns {string} the current version of the product
	 */
	getAppVersion: function () {
		return '@@APP_VERSION';
	},

	/**
	 * Logs the specified message to the console
	 */
	logger: {
		/**
		 * 
		 * @param {string} message 
		 */
		log: function (message) {
			console.log.apply(this, arguments);
		}
	},

	/**
	 * 
	 */
	loading: {
		/**
		 * 
		 * @param {string} message 
		 * @param {JqueryElement} $context 
		 */
		show: (message, $context) => {
			$context = $context || $(document.body);
			let $el = $('.loading', $context);
			message = message || 'Loading';

			// Don't allow scrolling outside of screen
			$(document.body).addClass('modal-open');

			if ($el[0]) {
				$el.remove();
			}
			$el = $(`<div class="loading"><div class="wrapper"><div cleass="message">${message}</div><div class="spinner-border text-primary" role="status"></div></div>`);
			$el.appendTo($context);
		},

		/**
		 * Removes the element from the DOM
		 * 
		 * @param {JqueryElement} $context 
		 */
		hide: ($context) => {
			$context = $context || $(document.body);
			const $el = $('.loading', $context);
			$(document.body).removeClass('modal-open');

			if ($el[0]) {
				$el.remove();
			}
		}
	},

	/**
	 * Adds a spinner to the specified jQuery element
	 * 
	 * @param {jQueryElement} $el 
	 */
	addLoadingIcon($el) {
		utils.removeLoadingIcon($el);
		$el.append('<div class="spinner-border text-info"></div>');
	},

	/**
	 * Removes the spinner from the specified jQuery element
	 * 
	 * @param {jQueryElement} $el 
	 */
	removeLoadingIcon($el) {
		$el.find('.spinner-border').remove();
	},

	/**
	 * 
	 * @param {bool} force 
	 */
	reload(force) {
		location.reload(force);
	}
}

export default utils;