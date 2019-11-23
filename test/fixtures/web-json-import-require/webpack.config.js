/* eslint-env node */
'use strict';
const getConfig = require('@wildpeaks/webpack-config-web');

module.exports = function(){
	return getConfig({
		mode: 'development',
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			'app-json-import-require': './src/application-json-import-require.ts'
		},
		pages: [
			{
				filename: 'index.html',
				chunks: ['app-json-import-require']
			}
		]
	});
};
