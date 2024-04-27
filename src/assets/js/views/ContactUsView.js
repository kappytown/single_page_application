import View from './View.js';
import Modal from './../utils/Modal.js';

export default class ContactUsView extends View {
	/**
	 * Loads the template upon initialization
	 * 
	 * @override
	 */
	constructor() {
		super();

		this.id = 'contact_us';					// ID name of the element to render in to
		this.viewName = 'ContactUsView';
		this.templateID = `${this.id}_tmpl`;	// Use this if the template is already on the page
		this.templateName = this.id;			// Use this to load the template file
		this.events = {
			'click .show-faqs': 'onShowFAQsClick',
			'click .contact-us-submit': 'onSubmitClick'
		};

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
				App.setSelectedTab('contact-us');
			}
		}.bind(this));

		return this;
	}

	/**
	 * Click handler 
	 * 
	 * @param {Event} e 
	 */
	onShowFAQsClick(e) {
		const modal = new Modal();
		const body = this.templateManager.getContent('modals/contact_us_faqs.html', { account: { name: 'Trevor' } });
		modal.show('modal_contact_us_faq_details', { class: 'info', title: "Frequently Asked Questions", body: body, closeButton: true, actionButtonText: null });
		$('.row.question', $('#modal_contact_us_faq_details')).unbind('click').click(function () {
			const $this = $(this);
			if ($this.hasClass('on')) {
				$this.removeClass('on');
				$('.a', $this).slideUp(200);
			} else {
				$this.addClass('on');
				$('.a', $this).slideDown(200);
			}
		});
	}

	/**
	 * 
	 * @param {Event} e 
	 * @returns 
	 */
	onSubmitClick(e) {
		$('.error', this.$el).addClass('hidden');

		const _this = this;
		let error = '';
		const $error = $('.error', this.$el);
		const $name = $('#contact-us-name', this.$el);
		const $email = $('#contact-us-email', this.$el);
		const $message = $('#contact-us-message', this.$el);
		const nameVal = $.trim($name.val());
		const emailVal = $.trim($email.val());
		const messageVal = $.trim($message.val());

		if (!nameVal || !emailVal || !messageVal) {
			error = 'All fields are required';

			if (error) {
				$error.html(error).removeClass('hidden');
				return false;
			}

			return false;
		}
	}
};