import Model from './Model.js';

export default class ProductsModel extends Model {
	/**
	 * 
	 */
	constructor() {
		super();
		this.products = [];
		this.filters = {};
	}

	/**
	 * 
	 * @param {int} page 
	 */
	fetchProducts(page = 1) {
		// fetch products from the server
		let url = `${this.service.apis.PRODUCTS}?limit=${this.pageSize}`;

		if (this.filters.category) {
			url = `${this.service.getAPI('PRODUCTS_BY_CATEGORY', { category: this.filters.category })}?limit=${this.pageSize}`;
		}

		this.service.get(url, {}, {},
			(data) => {
				this.products = data;
				this.onChange(this.products, 1, 1);

				// for pagination:
				//this.onChange(this.products, page, Math.ceil(totalCount / this.pageSize));
			},
			(error) => {
				this.onError(error);
			}
		);
	}

	/**
	 * 
	 * @param {Function} callback 
	 */
	fetchCategories(callback) {
		// fetch products from the server
		this.service.get(this.service.apis.PRODUCT_CATEGORIES, {}, {},
			(data) => {
				callback(data);
			},
			(error) => {
				callback(null);
			}
		);
	}

	/**
	 * 
	 * @param {JSON} filters 
	 */
	setFilters(filters) {
		this.filters = { ...this.filters, ...filters };
	}
}