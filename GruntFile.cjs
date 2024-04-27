module.exports = function (grunt) {
	var path = require('path');
	//var wrench = require('wrench');

	// App Source Paths
	var src_root = path.normalize('src');
	var src_assets_root = path.normalize(src_root + '/assets');
	var src_css_root = path.normalize(src_assets_root + '/css');
	var src_js_root = path.normalize(src_assets_root + '/js');
	var src_img_root = path.normalize(src_assets_root + '/img');

	// App Build Paths
	var build_root = path.normalize('build');
	var build_assets_root = path.normalize(build_root + '/assets');
	var build_css_root = path.normalize(build_assets_root + '/css');
	var build_js_root = path.normalize(build_assets_root + '/js');
	var build_img_root = path.normalize(build_assets_root + '/img');

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// Removes files/folders
		clean: {
			build: {
				// Removes the entire build folder
				src: [build_root]
			},

			post_build: {
				// Remove all scss files as well as the third-party folder
				src: [`${build_css_root}/**/*.scss`, `${build_js_root}/third_party/`]
			}
		},

		// Copies files/folders
		copy: {
			main: {
				options: { mode: true },
				files: [
					// Copies all files within path and its sub-directories
					// to exclude scss files, add '!**/css/**/*scss' */
					{ expand: true, cwd: src_assets_root, src: ['**'], dest: `${build_assets_root}/` },
					{ src: `${src_root}/index.html`, dest: `${build_root}/index.html` }
				]
			}
		},

		// Replaces @@VARIABLE_NAME within the specified files
		replace: {
			dev: {
				options: {
					patterns: [
						{
							match: "API_PATH",
							replacement: "https://fakestoreapi.com"
						},
						{
							match: "APP_VERSION",
							replacement: "v1.00.00"
						}
					]
				},
				files: [
					{ expand: true, cwd: `${build_js_root}/`, src: ['**/*'], dest: `${build_js_root}/` },
					{ src: `${build_root}/index.html`, dest: `${build_root}/index.html` }
				]
			},
		},

		// Converts .scss to .css
		sass: {
			main: {
				options: {
					sourcemap: 'none'
				},
				files: [
					{ expand: true, cwd: `${build_assets_root}/css`, src: ['**/*.scss'], dest: `${build_assets_root}/css`, ext: '.css' }
				]
			}
		},

		// Concatinates files into 1 files
		concat: {
			app_css: {
				options: {
					separator: '\n\n/* ========= NEW FILE ========== */\n\n'
				},
				src: [
					`${build_assets_root}/css/app.css`,
					`${build_assets_root}/js/third_party/syntax_highlighter/highlight.css`
				],
				dest: `${build_root}/app.css`
			},

			app_bundle: {
				options: {
					separator: '\n\n/* ========= NEW FILE ========== */\n\n'
				},
				src: [
					`${build_assets_root}/js/third_party/jquery-3.7.1.min.js`,
					`${build_assets_root}/js/third_party/jquery.cookie.js`,
					`${build_assets_root}/js/third_party/underscore-1.13.6.min.js`,
					`${build_assets_root}/js/third_party/bootstrap.min.js`,
					`${build_assets_root}/js/third_party/navigo-8.11.1.min.js`,
					`${build_assets_root}/js/third_party/syntax_highlighter/highlight.min.js`
				],
				dest: `${build_root}/bundle.js`
			},

			app_js: {
				options: {
					separator: '\n\n'
				},
				src: [
					`${build_assets_root}/js/App.js`
				],
				dest: `${build_root}/app.js`
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');


	/* PROCESS:
	 1) Delete the build directory
	 2) Move files to app directory for processing
	 3) Replace variables
	 4) Convert SCSS to CSS
	 5) Concatinate necessary files (app.js, app.css)
	 6) Clean up by removing files that are not needed
	 */

	// Default task(s).
	grunt.registerTask('deploy-dev', ['clean:build', 'copy:main', 'replace:dev', 'sass:main', 'concat:app_css', 'concat:app_bundle', 'concat:app_js', 'clean:post_build']);
	grunt.registerTask('dev', ['deploy-dev']);
};