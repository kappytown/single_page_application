const validators = {
	/**
	 * Validates an email address.
	 * 
	 * @param {string} email - The email address to validate.
	 * @returns {boolean} True if the email is valid, false otherwise.
	 */
	isValidEmail: (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	},

	/**
	 * Validates a password by checking if the password is at least 8 characters long, contains a number,
	 * an uppercase letter, and a lowercase letter. Adjust the regex as necessary.
	 * 
	 * @param {string} password - The password to validate.
	 * @returns {bool} True if the password meets the criteria, false otherwise.
	 */
	isValidPassword: (password) => {
		// ?= positive look ahead, 
		// (?=.*\d) looks anywhere in the string for a number
		// (?=.*[a-z]) looks anywhere in the string for a lowercase letter
		// (?=.*[A-Z]) looks anywhere in the string for an uppercase letter
		// . matches any character but line breaks
		// {8,} quantifier - must contain at least 8 characters
		const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
		return passwordRegex.test(password);
	},

	/**
	 * Validates a username to ensure it only contains alphanumeric characters, and is 3-24 characters long.
	 * 
	 * @param {string} username - The username to validate.
	 * @returns {bool} True if the username is valid, false otherwise.
	 */
	isValidUsername: (username) => {
		const usernameRegex = /^[a-zA-Z0-9]{3,24}$/;
		return usernameRegex.test(username);
	}

	// You can add more static methods for other types of validation as needed.
}

export default validators;
