import View from './View.js';
import utils from './../utils/utils.js';
import ProductsModel from './../models/ProductsModel.js';

export default class ProductsView extends View {
	/**
	 * Loads the template upon initialization
	 * 
	 * @override
	 */
	constructor() {
		super();

		this.id = 'products';					// ID name of the element to render in to
		this.viewName = 'ProductsView';
		this.templateID = `${this.id}_tmpl`;	// Use this if the template is already on the page
		this.templateName = this.id;			// Use this to load the template file
		this.events = {
			'click .product': 'onProductClick',
			'click .set-filters': 'onSetFiltersClick'
		}
		this.model = new ProductsModel();
		this.model.setChangeListener(this.showProducts.bind(this));
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

		const { category } = params.data;

		// Lazy-load the template
		this.loadTemplate(function (success) {
			if (success) {
				this.addViewToDOM();

				App.setSelectedTab('products');

				this.setFilters(category);
				this.applyFilters();

				if (this.isViewEmpty) {
					//this.populateView();

					// Get's a list of all available categories
					const _this = this;
					this.model.fetchCategories((categories) => {
						if (categories) {
							const $category = $('select[name="category"]', _this.$el);
							categories.forEach(categoryName => {
								const selected = category === categoryName ? 'selected' : '';
								$category.append(`<option value="${categoryName}" ${selected}>${categoryName}</option>`);
							});
						}
					});
				}
			}
		}.bind(this));

		return this;
	}

	/**
	 * 
	 */
	populateView() {
		utils.addLoadingIcon($('h1', this.$el));

		this.model.fetchProducts(1);
	}

	/**
	 * Updates the view with the list of products from the model
	 * 
	 * @param {array} products 
	 * @param {int} currentPage 
	 * @param {int} totalPages 
	 */
	showProducts(products, currentPage, totalPages) {
		utils.removeLoadingIcon($('h1', this.$el));
		$('.error', this.$el).hide();

		const $el = $('.products_list', this.$el).empty();

		if (products && products.length) {
			// Render the template
			$el.append(this.templateManager.getContent('partials/products_list.html', { products: products }));

			this.showPagination(currentPage, totalPages, (page) => {
				utils.addLoadingIcon($('h1', this.$el));

				this.model.fetchProducts(page)
			});
		} else {
			$el.html('<div class="mb3 row"><div class="col">No products found</div></div>');
			this.hidePagination();
		}
	}

	/**
	 * Sets the filters with the specified values
	 * 
	 * @param {string} category 
	 */
	setFilters(category) {
		category = category || '';

		// Set the initial values
		$('select[name="category"]').val(category);

		this.model.setFilters({ category });
	}

	/**
	 * 
	 */
	applyFilters() {
		this.populateView();
	}

	/**
	 * 
	 * @param {string} message 
	 */
	showError(message) {
		utils.removeLoadingIcon($('h1', this.$el));

		const $el = $('.error', this.$el);
		$el.html(message).show();
		setTimeout(() => {
			$el.hide();
		}, 5000);
	}

	/**
	 * 
	 * @param {Event} e 
	 */
	onProductClick(e) {
		const $el = $(e.currentTarget);
		const id = $el.data('id');
		this.router.navigate(`product/${id}`);
	}

	/**
	 * 
	 * @param {Event} e 
	 */
	onSetFiltersClick(e) {
		const $filters = $('.filters', this.$el);
		const category = $('select[name="category"]').find(':selected').val();
		this.model.setFilters({ category });
		this.applyFilters();
	}
};