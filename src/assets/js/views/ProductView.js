import View from './View.js';
import utils from './../utils/utils.js';
import ProductModel from './../models/ProductModel.js';

export default class ProductView extends View {
	product_id;

	/**
	 * Loads the template upon initialization
	 * 
	 * @override
	 */
	constructor() {
		super();

		this.id = 'product';					// ID name of the element to render in to
		this.viewName = 'ProductView';			// Could replace with this.constructor.name
		this.templateID = `${this.id}_tmpl`;	// Use this if the template is already on the page
		this.templateName = this.id;			// Use this to load the template file
		this.events = {
			'click .breadcrumb a': 'onBreadcrumbClick'
		}

		this.model = new ProductModel();
		this.model.setChangeListener(this.showProduct.bind(this));
		this.model.setErrorListener(this.showError.bind(this));

		super.init();
	}

	/**
	 * Renders the template on to the page
	 * 
	 * @override
	 * @returns {View}
	 */
	render(params) {
		super.render(params);

		const { id } = params.data;
		this.product_id = id;

		// Lazy-load the template
		this.loadTemplate(function (success) {
			if (success) {
				this.addViewToDOM();

				App.setSelectedTab('products');

				if (this.isViewEmpty) {
					this.populateView();
				}

				utils.addLoadingIcon($('.product_details', this.$el));

				this.model.fetchProduct(id);
			}
		}.bind(this));

		return this;
	}

	/**
	 * 
	 */
	populateView() {
		this.addBackButton('products');
	}

	/**
	 * Displays the details of the specified product object
	 * 
	 * @param {JSON} product 
	 */
	showProduct(product) {
		utils.removeLoadingIcon($('.product_details', this.$el));

		const $el = $('.product_details', this.$el);

		// Get product list template
		const template = this.templateManager.getTemplate('partials/product_details.html');

		$el.html(_.template(template)({ product: product }));
	}

	/**
	 * Display the specified error message
	 * 
	 * @param {string} message 
	 */
	showError(message) {
		utils.removeLoadingIcon($('.product_details', this.$el));

		const $el = $('.error', this.$el);
		$el.html(message).show();
		setTimeout(() => {
			$el.hide();
		}, 5000);
	}

	/**
	 * Navigates to the route specified in the data route attribute
	 * 
	 * @param {Event} e 
	 */
	onBreadcrumbClick(e) {
		e.preventDefault();
		const $el = $(e.currentTarget);
		const route = $el.data('route');
		this.router.navigate(route);
	}
};