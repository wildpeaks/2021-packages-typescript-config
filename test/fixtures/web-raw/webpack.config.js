/* eslint-env node */
'use strict';
const getConfig = require('@wildpeaks/webpack-config-web');

module.exports = function(){
	return getConfig({
		mode: 'development',
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		rawExtensions: ['md'],
		entry: {
			'app-raw': './src/application-raw.ts'
		},
		pages: [
			{
				filename: 'index.html',
				chunks: ['app-raw']
			}
		]
	});
};
