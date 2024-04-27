import utils from './../utils/utils.js';
import constants from './../utils/constants.js';
import pubsub from './../utils/PubSub.js';
import lazyload from './../utils/Lazyload.js';

import templateManager from './../utils/TemplateManager.js';
import router from './../router/Router.js';

export default class View {
	// Parameters passed into the view that we send to the model
	params = {};

	// To manage the views data layer
	model = {};

	// This will contain the view
	$el = [];

	// The element tag name to store the view in
	tagName = 'div';

	// Event handlers to listen to: { 'event selector': 'handler' }
	events = {};

	/**
	 * 
	 * @returns {JSON}
	 */
	templateHelpers() {
		return {};
	}

	/**
	 * 
	 */
	constructor(data) {
		// holds a reference to the templateManager and router instances
		this.templateManager = templateManager;
		this.router = router;
	}

	/**
	 * This should be called at the bottom of the child class constructor
	 */
	init() {
		if (this.id) {
			this.$el = $(`<${this.tagName} id="${this.id}" />`);
		} else if (this.className) {
			this.$el = $(`<${this.tagName} class="${this.className}" />`);
		}

		this.attachEvents();
	}

	/**
	 * 
	 */
	render(params = {}) {
		this.params = params;

		// Set to true if view is already in the DOM.
		// This prevents us from adding the view to the DOM again
		this.isViewEmpty = this.$el.is(':empty');

		pubsub.publish(constants.events.VIEW_RENDERED, this.id);
	}

	/**
	 * Loops over all of the events and attaches them to the specified elements
	 * 
	 * example: this.events = {'click .some-element': 'onClickHandler'}
	 */
	attachEvents() {
		for (let e in this.events) {
			const arr = e.split(' ');
			const event = arr.shift();
			const selector = arr.join(' ');

			// Need to off first
			this.$el.off(event, selector, [this.events[e]]);
			this.$el.on(event, selector, this[this.events[e]].bind(this));
		}
	}

	/**
	 * This uses Underscore's templating library
	 * 
	 * @returns {string} the template(if found) after applying any template helper objects.
	 */
	getTemplate() {
		const template = $(`#${this.templateID}`);
		if (template.length > 0) {
			return _.template(template.html())(this.templateHelpers());
		}
		return '';
	}

	/**
	 * Loads the template specified in the class variable named "templateName"
	 * 
	 * @param {Function} callback 
	 */
	loadTemplate(callback) {
		const _this = this;

		// Load the template
		lazyload.load({ 'tmpl': [{ 'src': `assets/js/templates/${this.templateName}.html`, 'id': this.templateID }] }, function () {
			// Get the template after applying any data required to populate it
			_this.template = _this.getTemplate();
			const success = _this.template;

			if (!success) {
				utils.logger.log(`ERROR LOADING TEMPLATE: ${_this.templateID}`);
			}

			callback(success);

			_this.onViewShown();
		});
	}

	/**
	 * Gets the view from the javascript template and adds it to the view
	 */
	addViewToDOM() {
		// Only add the view if it is not already there
		if (this.isViewEmpty) {
			this.$el.html(this.template);
		}

		// Remove the active class from all view to hide them
		$('#content').find('.active').removeClass('active');

		// Add the view if not already there and add the active class to show it
		if (!$('#content').find('#' + this.$el.attr('id')).length) {
			this.$el.addClass('active');
			$('#content').append(this.$el);
		} else {
			$('#' + this.$el.attr('id')).addClass('active');
		}

		pubsub.publish(constants.events.VIEW_IN_DOM, this.id);
	}

	/**
	 * Appends the back button to the page
	 * 
	 * @param {string} location 
	 */
	addBackButton(location) {
		const _this = this;
		if (!$('.nav-back', this.$el)[0]) {
			this.$el.prepend('<div class="col-12 nav-back"><a href="#"><span class="bi bi-chevron-left"></span> Back</a></div>');
			$('.nav-back', this.$el).click(function (e) {
				e.preventDefault();
				_this.router.navigate(location);
			})
		}
	}

	/**
	 * 
	 * @param {int} currentPage 
	 * @param {int} totalPages 
	 * @param {Function} handler 
	 */
	showPagination(currentPage, totalPages, handler) {
		const $pagination = $('.pagination', this.$el).empty();
		for (let i = 1; i <= totalPages; i++) {
			const button = $(`<button data-page="${i}">${i}</button>`);
			button.click((e) => {
				const page = $(e.currentTarget).data('page');
				handler(page);
			});
			if (i === currentPage) {
				button.prop('disabled', true);
			}
			$pagination.append(button);
		}
	}

	hidePagination() {
		$('.pagination', this.$el).empty();
	}

	/**
	 * Override this method to reactivate view vars if needed
	 */
	onViewShown() {

	}

	/**
	 * Override this method to cleanup when view is hidden
	 */
	onViewHidden() {

	}

	/**
	 * This should be overwritten to remove any listeners, custom objects, etc.
	 */
	dispose() {
		if (this.$el) {
			this.$el.remove();
		}
	}
}