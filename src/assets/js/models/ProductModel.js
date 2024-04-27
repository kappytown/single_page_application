import Model from './Model.js';

export default class ProductModel extends Model {
	/**
	 * 
	 */
	constructor() {
		super();

		this.product = {};
	}

	/**
	 * 
	 * @param {int} id 
	 */
	fetchProduct(id) {
		// fetch products from the server
		const url = this.service.getAPI('PRODUCT', { id: id });
		this.service.get(url, {}, {},
			(data) => {
				this.product = data;
				this.onChange(this.product);
			},
			(error) => {
				this.onError(error);
			}
		);
	}
}