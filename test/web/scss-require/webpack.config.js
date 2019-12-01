/* eslint-env node */
'use strict';
const getConfig = require('@wildpeaks/webpack-config-web');

module.exports = function(){
	return getConfig({
		mode: 'development',
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		scss: `
			$primary: rgb(0, 255, 0);
		`,
		entry: {
			'app-scss-require': './src/application.ts'
		},
		pages: [
			{
				filename: 'index.html',
				chunks: ['app-scss-require']
			}
		]
	});
};
