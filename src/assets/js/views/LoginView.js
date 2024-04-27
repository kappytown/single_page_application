import View from './View.js';
import constants from './../utils/constants.js';
import UserModel from './../models/UserModel.js';
import pubsub from './../utils/PubSub.js';
import utils from './../utils/utils.js';

export default class LoginView extends View {
	/**
	 * Loads the template upon initialization
	 * 
	 * @override
	 */
	constructor() {
		super();

		this.id = 'login';						// ID name of the element to render in to
		this.viewName = 'LoginView';
		this.templateID = `${this.id}_tmpl`;	// Use this if the template is already on the page
		this.templateName = this.id;			// Use this to load the template file
		this.events = {
			'click .login': 'onLoginClick',
		}

		// We use the UserModel to separate the user login logic from the View Controller
		this.model = new UserModel();

		// Set the login success and error handlers
		this.model.setChangeListener(this.onLoggedIn.bind(this));
		this.model.setErrorListener(this.showError.bind(this));

		super.init();
	}

	/**
	 * Renders the template on to the page
	 * 
	 * @override
	 * @returns {View}
	 */
	render() {
		super.render();

		// Lazy-load the template
		this.loadTemplate(function (success) {
			if (success) {
				this.addViewToDOM();

				this.$errorDiv = $('.error', this.$el);

				// Set the selected tab
				App.setSelectedTab('login');

				// No point in showing the login screen if the user is logged in
				if (!$.isEmptyObject(App.user)) {
					this.router.navigate('home');
					return;
				}
			}
		}.bind(this));

		return this;
	}

	/**
	 * Login click handler
	 * 
	 * @param {DomElement} e 
	 */
	onLoginClick(e) {
		e.preventDefault();

		utils.addLoadingIcon($('.logo', this.$el));

		const email = $.trim($('#email', this.$el).val());
		const password = $.trim($('#password', this.$el).val());

		this.model.login(email, password);
	}

	/**
	 * 
	 * @param {JSON} data 
	 */
	onLoggedIn(data) {
		utils.removeLoadingIcon($('.logo', this.$el));

		// success, store the user
		const { status, ...user } = data;	// omit status

		// This will set the App.user, store it in localstorage, and navigate to the home page
		pubsub.publish(constants.events.LOGGED_IN, user);

		this.router.navigate('home');
	}

	/**
	 * 
	 * @param {string} message 
	 */
	showError(message) {
		utils.removeLoadingIcon($('.logo', this.$el));

		const $errDiv = $('.error', this.$el);
		$errDiv.html(message).removeClass('hidden');
	}

	/**
	 * 
	 */
	hideError() {
		$('.error', this.$el).addClass('hidden');
	}
};