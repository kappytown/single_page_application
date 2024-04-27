import constants from './assets/js/utils/constants.js';
import utils from './assets/js/utils/utils.js';
import Storage from './assets/js/utils/Storage.js';

// Singletons - If not Singletons, the App must have intantiate them and expose them publicly to be used throughout the app. - App.cache, App.pubsub, etc.
import cache from './assets/js/utils/Cache.js';
import pubsub from './assets/js/utils/PubSub.js';
import viewManager from './assets/js/ViewManager.js';
import router from './assets/js/router/Router.js';

class Application {
	#pagesViewed = [];
	#isAppReady = true;
	#isActive = false;

	/**
	 * 
	 */
	constructor() {
		this.user = {};

		// Set dependencies
		this.storage = new Storage();					// Used to store data in localstorage or a cookie

		/*// These are now Singletons
		this.lazyload = new Lazyload();					// Used to load all the views assets
		this.pubsub = new PubSub(); 					// Used to publish and listen to app events
		this.templateManager = new TemplateManager();	// Used to load templates and return the contents
		this.viewManager = new ViewManager();			// Used to manage all the views that have been loaded
		this.router = new Router();						// Used to navigate between views
		this.cache = new Cache();						// Used to cache any data you may need cached such as an API response
		// This can be accessed anywhere via App.lazyload etc.
		*/

		// Event listeners
		pubsub.subscribe(constants.events.APP_READY, this.#onAppReady, this);
		pubsub.subscribe(constants.events.LOGGED_IN, this.#onLoggedIn, this);
		pubsub.subscribe(constants.events.LOGGED_OUT, this.#onLoggedOut, this);
		pubsub.subscribe(constants.events.REQUEST_DONE, this.#onRequestDone, this);
		pubsub.subscribe(constants.events.REQUEST_FAIL, this.#onRequestFail, this);
		pubsub.subscribe(constants.events.VIEW_LOAD_FAILED, this.#onViewLoadFailed, this);
		pubsub.subscribe(constants.events.LOGOUT, this.logout, this);

		// Setup the navigation menu hide/show functionality
		this.setMenu();
	}

	/**
	 * 
	 */
	init() {
		this.initRouter();

		pubsub.publish(constants.events.APP_READY);
	}

	/**
	 * 
	 */
	#onAppReady() {
		this.#isAppReady = true;
	}

	/**
	 * 
	 * @returns {bool}
	 */
	isAppReady() {
		return this.#isAppReady;
	}

	/**
	 * 
	 * @returns {bool}
	 */
	isActiveAccount() {
		return this.#isActive;
	}

	/**
	 * This will set the click handler for the hamburger menu
	 * which is used to hide and show it
	 */
	setMenu() {
		const $menu = $('#menu');
		$('.hamburger img').click(function (e) {
			if ($menu.hasClass('open')) {
				$menu.removeClass('open');
			} else {
				$menu.addClass('open');
			}
		});

		// Hide the nav menu on click
		$('li a', $menu).click(function (e) {
			$menu.removeClass('open');
		});
	}

	/**
	 * 
	 */
	initRouter() {
		utils.loading.show();

		setTimeout(() => {
			this.user = this.storage.get('user');
			if (this.user && this.user.token) {
				pubsub.publish(constants.events.LOGGED_IN);
			}

			// Authentication filter
			router.addFilter(() => {
				if ($.isEmptyObject(this.user)) {
					this.logout();
					return false;
				}
				return true;
			});
			router.init();

			utils.loading.hide();
		}, 100);
	}

	/**
	 * 
	 * @param {mixed} data 
	 */
	#onLoggedIn(data) {
		$('#menu .user').removeClass('hidden');
		$('#menu .not-user').addClass('hidden');

		if (data) {
			this.user = data;
			this.storage.set('user', data);
		}
	}

	/**
	 * 
	 * @param {mixed} data 
	 */
	#onLoggedOut(data) {
		$('#menu .user').addClass('hidden');
		$('#menu .not-user').removeClass('hidden');
	}

	/**
	 * 
	 * @param {mixed} data 
	 */
	#onRequestDone(data) {
		//utils.logger.log('onRequestDone called', data);
	}

	/**
	 * 
	 * @param {mixed} data 
	 */
	#onRequestFail(data) {
		//utils.logger.log('onRequestFail called', data);
	}

	/**
	 * 
	 * @param {JSON} data 
	 */
	#onViewLoadFailed(data) {
		utils.logger.log(data);
		data = data || {};
		if (data.id !== 'pagenotfound') router.navigate('pagenotfound');
	}

	/**
	 * 
	 * @param {string} page 
	 */
	#setPageViewed(page) {
		const index = this.#pagesViewed.findIndex(item => {
			return item.page === page;
		});
		if (index >= 0) {
			this.#pagesViewed[index].visits++;
		} else {
			this.#pagesViewed.push({ page: page, visits: 1 });
		}
	}

	/**
	 * Adds the class selected to the currrent routes associated navigation tab
	 * 
	 * @param {string} tab 
	 */
	setSelectedTab(tab) {
		const $menu = $('#menu');
		$('.selected', $menu).removeClass('selected');
		$('.' + tab, $menu).closest('li').addClass('selected');
	}

	/**
	 * 
	 */
	logout() {
		utils.loading.hide();

		// Clear app cache
		cache.empty();

		viewManager.disposeAll();

		this.user = {};
		this.storage.remove('user');
		router.navigate('login');

		pubsub.publish(constants.events.LOGGED_OUT);
	}
};

// Initialize the app
$(function () {
	window.App = new Application();
	App.init();
});