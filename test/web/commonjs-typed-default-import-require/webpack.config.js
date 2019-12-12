/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	return getConfig({
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-commonjs-typed-default-import-require": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-commonjs-typed-default-import-require"]
			}
		]
	});
};
