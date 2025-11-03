import RouteController from './RouteController.js';
import utils from './../utils/utils.js';

/**
 * Navigo router Wrapper
 * https://github.com/krasimir/navigo
 */
class Router {
	// 
	#router;
	#cachedRoutes = [];
	#currentRoute = 'home';	// default
	#previousRoute;
	#filters = [];	// list of filters to use to check if it's ok to nagivate to certain routes

	constructor() {
		if (!Router.instance) {
			// Instantiate the Navigo router
			this.#router = new Navigo('/', { hash: true });

			// Define the route controller
			this.controller = new RouteController();

			// You can apply hooks to all routes here if you want to know when ...
			// before the route is rendered, after the route has been rendered, when you left the route, and when you load a route that is already the current route
			/*this.#router.hooks({
				before(done, match) {
					const route = match && match.route ? match.route.name : '__NOT_FOUND__';
					utils.logger.log('before: ' + route);
					// do something
					done();
				},
				after(match) {
					const route = match && match.route ? match.route.name : '__NOT_FOUND__';
					utils.logger.log('after: ' + route);
				},
				leave(done, match) {
					const route = match && match.route ? match.route.name : '__NOT_FOUND__';
					utils.logger.log('leave: ' + route);
					// do something
					done();
				},
				already(match) {
					const route = match && match.route ? match.route.name : '__NOT_FOUND__';
					utils.logger.log('already: ' + route);
				}
			});*/

			// Routes
			this.on('/', () => this.#handler(true, 'gotoHome'));
			this.on('home', () => this.#handler(true, 'gotoHome'));
			this.on('ignore', () => this.#handler(false, 'gotoIgnore'));
			this.on('login', () => this.#handler(false, 'gotoLogin'));
			this.on('logout', () => this.#handler(false, 'gotoLogout'));
			this.on('products', () => this.#handler(true, 'gotoProducts'));
			this.on('products/:category', (params) => this.#handler(true, 'gotoProducts', params));
			this.on('product/:id', (params) => this.#handler(true, 'gotoProduct', params));
			this.on('contact-us', () => this.#handler(false, 'gotoContactUs'));
			this.on('refresh', () => this.#handler(false, 'gotoPageRefresh'));
			this.on('pagenotfound', () => this.#handler(false, 'gotoPageNotFound'));

			// protected routes:
			this.on('my-account', () => this.#handler(true, 'gotoMyAccount'));

			// Handles unmatched routes and if the hash is empty, it will navigate to the home route
			this.#router.notFound((route) => {
				if (route && route.route.name !== '__NOT_FOUND__') {
					this.navigate('home');
					return;
				}
				this.#handler(false, 'gotoPageNotFound');
			});

			Router.instance = this;
		}

		return Router.instance;
	}

	/**
	 * @param {bool} applyFilters - true if this route needs to run through a filter check such as authentication
	 * @param {string} id 
	 * @param {JSON} params 
	 */
	#handler(applyFilters, id, params = {}) {
		const handleRoute = () => {
			params = $.isEmptyObject(params) ? { data: {}, queryString: '' } : params;
			// Bind itself so the controller instance
			this.controller[id].bind(this.controller)(params);
		}

		if (applyFilters) {
			this.#runFilters(handleRoute);
		} else {
			handleRoute();
		}

	}

	/**
	 * 
	 * @param {Function} callback 
	 */
	#runFilters(callback) {
		let pass = true;

		// Execute all the filters and if one of them fails, we do NOT navigate to the route - the filters should manage failures
		for (let filter of this.#filters) {
			pass = filter();
			if (!pass) break;
		};

		if (pass) callback();
	}

	/**
	 * 
	 * @returns
	 */
	on() {
		this.#cachedRoutes.push(arguments[0]);
		return this.#router.on.apply(this.#router, arguments);
	}

	/**
	 * 
	 * @returns 
	 */
	navigate() {
		this.#previousRoute = this.#currentRoute;
		this.#currentRoute = arguments[0];
		return this.#router.navigate.apply(this.#router, arguments);
	}

	/**
	 * 
	 * @returns 
	 */
	resolve() {
		this.#previousRoute = this.#currentRoute;
		this.#currentRoute = arguments[0];
		return this.#router.resolve.apply(this.#router, arguments);
	}

	/**
	 * 
	 * @returns 
	 */
	getCurrentRoute() {
		return this.#currentRoute;
	}

	/**
	 * 
	 * @returns 
	 */
	getPreviousRoute() {
		return this.#previousRoute;
	}

	/**
	 * 
	 * @param {Function} filter 
	 */
	addFilter(filter) {
		this.#filters.push(filter);
	}

	/**
	 * Used to navigate to the appropriate route when page is first loaded/refreshed
	 */
	init() {
		// Get the hash to navigate to otherwise go to the home
		let hash = decodeURI(window.location.hash);
		//hash = hash.replace(/^#*\/*/, '');
		if (hash) {
			this.resolve(hash);
		} else {
			this.navigate('home');
		}
	}
};

const instance = new Router();
Object.freeze(instance);

export default instance;
