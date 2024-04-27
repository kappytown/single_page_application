import Model from './Model.js';
import validators from './../utils/validators.js';

export default class UserModel extends Model {
	/**
	 * 
	 */
	constructor() {
		super();

		this.user = {};
	}

	/**
	 * 
	 * @param {string} email 
	 * @param {string} password 
	 * @returns 
	 */
	login(email, password) {
		// Basic validation
		if (!email || !password) {
			this.onError({ message: 'Member ID and Password are required.' });
			return;
		}

		if (!validators.isValidEmail(email)) {
			this.onError({ message: 'Invalid email address' });
			return;
		}

		if (!validators.isValidPassword(password)) {
			this.onError({ message: 'Invalid password. Ensure you password is at least 8 characters long, contains a number, and uppercase letter, and a lowercase letter.' });
			return;
		}

		this.service.post(this.service.apis.USER_LOGIN, { 'username': 'mor_2314', 'password': '83r5^_' }, {},
			(data) => {
				this.user = { ...data, email: 'test@email.com', name: 'John Doe' };
				this.onChange(this.user);
			},
			(error) => {
				this.onError(error);
			}
		);
	}
}