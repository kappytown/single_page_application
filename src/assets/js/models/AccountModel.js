import Model from './Model.js';

export default class AccountModel extends Model {
	/**
	 * 
	 */
	constructor() {
		super();
		this.account = {};
	}

	/**
	 * 
	 */
	fetchAccount() {
		const url = this.service.getAPI('USER', { id: 1 });
		this.service.get(url, {}, {},
			(data) => {
				this.account = data;
				this.onChange(this.account);
			},

			(error) => {
				this.onError(error);
			}
		);
	}
}