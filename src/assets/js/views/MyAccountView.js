import View from './View.js';
import utils from './../utils/utils.js';
import AccountModel from './../models/AccountModel.js';

export default class MyAccountView extends View {
	/**
	 * Loads the template upon initialization
	 * 
	 * @override
	 */
	constructor() {
		super();

		this.id = 'my_account';					// ID name of the element to render in to
		this.viewName = 'MyAccountView';
		this.templateID = `${this.id}_tmpl`;	// Use this if the template is already on the page
		this.templateName = this.id;			// Use this to load the template file
		this.model = new AccountModel();
		this.model.setChangeListener(this.showAccount.bind(this));
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

				// Set the selected tab
				App.setSelectedTab('my-account');

				if (this.isViewEmpty) {
					this.populateView();
				}
			}
		}.bind(this));

		return this;
	}

	/**
	 * 
	 */
	populateView() {
		utils.addLoadingIcon($('.account_details', this.$el));
		this.model.fetchAccount();
	}

	/**
	 * 
	 * @param {JSON} account 
	 */
	showAccount(account) {
		utils.removeLoadingIcon($('.account_details', this.$el));

		// Get the account details template
		const template = this.templateManager.getTemplate('partials/account_details.html');
		$('.account_details', this.$el).append(_.template(template)({ account: account }));
	}

	/**
	 * 
	 * @param {string} message 
	 */
	showError(message) {
		utils.removeLoadingIcon($('.account_details', this.$el));

		const $el = $('.error', this.$el);
		$el.html(message).show();
		setTimeout(() => {
			$el.hide();
		}, 5000);
	}
};