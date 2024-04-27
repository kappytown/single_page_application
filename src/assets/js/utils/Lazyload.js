import utils from './utils.js';

/**
 * This is a Singleton since it must maintain the loaded state
 * 
 * Lazy load assets, call callback fn after all assets have loaded.
 * 
 * Usage:
 * lazyload.load({
 * 		js: ['js/file.js'],
 * 		'tmpl': [{src: 'tpl/event.tpl', id: 'event-view'}],
 * 		'css': ['css/file.css']
 * 	});
 *
 * lazyload.load({js: ['js/file.js']});
 */
class Lazyload {
	#loaded = { js: [], tmpl: [], css: [] };

	constructor() {
		if (!Lazyload.instance) {
			Lazyload.instance = this;
		}
		return Lazyload.instance;
	}
	/**
	 * 
	 * @param {string} type 
	 * @param {JSON} asset 
	 */
	#addLoaded(type, asset) {
		if (!type || !asset) return;
		this.#loaded[type].push(asset);
	}

	/**
	 * 
	 * @param {string} type 
	 * @param {JSON} asset 
	 * @returns {bool}
	 */
	#isLoaded(type, asset) {
		// If tmpl, check the src since that is what we store
		if (type === 'tmpl') {
			asset = asset.src;
		}
		return this.#loaded[type].indexOf(asset) > -1;
	}

	/**
	 * 
	 * @param {string} asset 
	 * @returns {string}
	 */
	#appendVersion(asset) {
		return `${asset}?v=${utils.getAppVersion()}`;
	}

	/**
	 * Loads all the specified assets
	 * 
	 * @param {JSON} assets 	Assets (css, js, tmpl) to load
	 * @param {Function} fn 	Callback handler
	 */
	load(assets, fn) {
		let asset;
		let assetsLoaded = 0;
		let assetCount = 0;

		/**
		 * Load handler when assets has been loaded
		 * 
		 * @param {string} assetType 
		 * @param {string} asset 
		 */
		const onLoad = (assetType, asset) => {
			assetsLoaded++;

			// Only add the src if tmpl
			if (assetType === 'tmpl') {
				this.#addLoaded(assetType, asset.src);
			} else {
				this.#addLoaded(assetType, asset);
			}

			if (assetsLoaded == assetCount)
				fn && fn();
		}

		const onLoadDelegate = (assetType, asset) => {
			return () => {
				onLoad(assetType, asset);
			};
		}

		// Increment the assets counter
		for (let type in assets) {
			for (let i = 0, al = assets[type].length; i < al; i++) {
				assetCount++;
			}
		}

		// Load the assets
		for (let type in assets) {
			switch (type) {
				case 'js':
					for (let i = 0, al = assets[type].length; i < al; i++) {
						const t = type;
						const a = this.#appendVersion(assets[t][i]);
						// Only load once!
						if (this.#isLoaded(t, a)) {
							onLoad();
							continue;
						}

						let script = document.createElement('script');
						script.async = true;
						script.type = 'module';
						script.src = a;
						script.onload = () => { onLoad(t, a) };
						document.body.appendChild(script);
					}
					break;

				case 'tmpl':
					for (let i = 0, al = assets[type].length; i < al; i++) {
						const t = type;
						const a = assets[type][i];
						a.src = this.#appendVersion(a.src);
						// Only load once!
						if (this.#isLoaded(t, a)) {
							onLoad();
							continue;
						}

						let tplEl = $(`<script type="text/html" id="${a.id}"></script>`);
						$('body').append(tplEl);
						tplEl.load(a.src, () => { onLoad(t, a) });
					}
					break;

				case 'css':
					for (let i = 0, al = assets[type].length; i < al; i++) {
						const t = type;
						const a = this.#appendVersion(assets[type][i]);
						// Only load once!
						if (this.#isLoaded(t, a)) {
							onLoad();
							continue;
						}

						const styleEl = $('<style type="text/css"></style>');
						$('head').append(styleEl);
						styleEl.load(a, () => { onLoad(t, a) });
					}
					break;
			}
		}
	}

	/**
	 * 
	 * @param {string} url 
	 * @param {Function} callback 
	 */
	get(url, callback) {
		$.ajax({
			url: url,
			method: 'GET',
			async: true,
			contentType: 'text',
			success: callback,
			error: callback
		});
	}
};

const instance = new Lazyload();
Object.freeze(instance);

export default instance;