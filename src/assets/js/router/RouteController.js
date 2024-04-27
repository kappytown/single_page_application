import utils from '../utils/utils.js';
import constants from '../utils/constants.js';
import pubsub from './../utils/PubSub.js';
import lazyload from './../utils/Lazyload.js';
import viewManager from './../ViewManager.js';
import router from './Router.js';

export default class RouteController {
	/**
	 * 
	 */
	gotoIgnore() {
		viewManager.cleanup();

	}

	/**
	 * 
	 */
	gotoHome() {
		this.#loadController('home', './../views/HomeView.js', { css: ['assets/css/views/home.css'] });
	}

	/**
	 * 
	 * @param {JSON} params 
	 */
	gotoProducts(params) {
		this.#loadController('products', './../views/ProductsView.js', { css: ['assets/css/views/products.css'] }, params)
	}

	/**
	 * 
	 * @param {JSON} params
	 */
	gotoProduct(params) {
		this.#loadController('product', './../views/ProductView.js', { css: ['assets/css/views/product.css'] }, params);
	}

	/**
	 * 
	 */
	gotoLogin() {
		this.#loadController('login', './../views/LoginView.js', { css: ['assets/css/views/login.css'] });
	}

	/**
	 * 
	 */
	gotoLogout() {
		pubsub.publish(constants.events.LOGOUT);
	}

	/**
	 * 
	 */
	gotoContactUs() {
		this.#loadController('contact_us', './../views/ContactUsView.js', { css: ['assets/css/views/contact_us.css'] });
	}

	/**
	 * 
	 */
	gotoPageNotFound() {
		this.#loadController('pagenotfound', './../views/PageNotFoundView.js');
	}

	/**
	 * 
	 */
	gotoMyAccount() {
		this.#loadController('my_account', './../views/MyAccountView.js', { css: ['assets/css/views/my_account.css'] });
	}

	/**
	 * Force reloads the current view
	 */
	gotoPageRefresh() {
		utils.reload(true);
	}

	/**
	 * To reduce redundancy, this method will load all the assets and modules for every view
	 * 
	 * @param {string} id 			The id of the view
	 * @param {string} modulePath 	The module path to load
	 * @param {JSON} assets 		An object of all the assets to be loaded
	 * @param {JSON} params 		Object containing parameters to pass to the view
	 * @param {Function} callback 	Handler to execute after view has been rendered if required
	 */
	#loadController(id, modulePath, assets, params, callback) {
		viewManager.cleanup();
		let view;

		// Called when the module is loaded
		// Renders the view
		const onModuleLoaded = () => {
			viewManager.setCurrentView(view);

			// Once the data is received from the server, let's display it and pass any params
			view.render(params);

			if (callback) callback();
		}

		// Called when all assets are loaded
		// This will then load the module
		const onAssetsLoaded = () => {
			view = viewManager.getView(id);

			if (!view) {
				// loads the module
				// modulePath is the relative path from the router directory
				import(modulePath).then(module => {
					const ViewClass = module.default;
					view = new ViewClass();
					viewManager.register(id, view);

					onModuleLoaded();
				}).catch(error => {
					utils.logger.log(`Module (${modulePath}) not found.`, error.message);
					/* TODO: Load error page */
					pubsub.publish(constants.events.VIEW_LOAD_FAILED, { id: id, view: modulePath });
				});
			} else {
				onModuleLoaded();
			}

		}

		if (assets) {
			lazyload.load(assets, onAssetsLoaded);
		} else {
			onAssetsLoaded();
		}
	}
};