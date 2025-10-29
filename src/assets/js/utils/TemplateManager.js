import utils from './utils.js';

/**
 * Manager that loads the specified template and stores it in cache for faster retrieval
 */
class TemplateManager {
	#cache = {};

	constructor() {
		if (!TemplateManager.instance) {
			TemplateManager.instance = this;
		}
		return TemplateManager.instance;
	}

	/**
	 * 
	 * @param {string} url 
	 * @returns {string} the template
	 */
	getTemplate(url) {
		let templateHtml = '';

		if (this.#cache[url]) {
			templateHtml = this.#cache[url];
		} else {

			$.ajax({
				url: `./assets/js/templates/${url}?v=${utils.getAppVersion()}`,
				method: 'GET',
				async: false,
				success: function (data) {
					templateHtml = data;
				}
			});

			this.#cache[url] = templateHtml;
		}

		return templateHtml;
	}

	/**
	 * 
	 * @param {string} url 
	 * @param {string} data 
	 * @returns {string} the content after the data is applied to the template
	 */
	getContent(url, data) {
		return _.template(this.getTemplate(url))({ App: App, ...data });
	}
};

const instance = new TemplateManager();
Object.freeze(instance);

export default instance;
