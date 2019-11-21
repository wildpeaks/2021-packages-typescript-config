/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual} = require('assert');
const {copyConfig, compileFixture} = require('./shared');


function testFixture({id, title, sourceFiles, tscFiles, webpackFiles, expectedOutput}){
	it(title, /* @this */ async function(){
		this.slow(30000);
		this.timeout(30000);

		const typechecked = await compileFixture('web', id, 'tsc --build tsconfig.json');
		deepStrictEqual(typechecked.filesBefore, sourceFiles.sort(), 'Before TSC');
		deepStrictEqual(typechecked.errors, [], 'No TSC errors');
		deepStrictEqual(typechecked.filesAfter, sourceFiles.concat(tscFiles).sort(), 'After TSC');

		const compiled = await compileFixture('web', id, 'webpack');
		deepStrictEqual(compiled.filesBefore, sourceFiles.sort(), 'Before Webpack');
		deepStrictEqual(compiled.errors, [], 'No Webpack errors');
		deepStrictEqual(compiled.filesAfter, sourceFiles.concat(webpackFiles).sort(), 'After Webpack');

		//
		// TODO test "expectedOutput" using Puppeteer
		//
	});
}


describe('Package: Web', function(){
	before('Setup', function(){
		copyConfig('web');
		//
		// TODO express must serve /dist for Puppeteer
		//
	});

	testFixture({
		id: 'web-dom',
		title: 'No import or export',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-dom.ts'
		],
		tscFiles: [
			'lib/application-dom.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-dom.js'
		]
	});

	testFixture({
		id: 'web-exports',
		title: 'Toplevel export',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-exports.ts'
		],
		tscFiles: [
			'lib/application-exports.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-exports.js'
		]
	});

	testFixture({
		id: 'web-preact',
		title: 'Preact',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-preact.ts'
		],
		tscFiles: [
			'lib/application-preact.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-preact.js'
		]
	});

	testFixture({
		id: 'web-tsx',
		title: 'TSX',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-tsx.tsx'
		],
		tscFiles: [
			'lib/application-tsx.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-tsx.js'
		]
	});

	testFixture({
		id: 'web-css',
		title: 'CSS',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-css.ts',
			'src/node_modules/mymodule-css/index.ts',
			'src/node_modules/mymodule-css/styles.css'
		],
		tscFiles: [
			'lib/application-css.js',
			'lib/node_modules/mymodule-css/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-css.js',
			'dist/app-css.css'
		]
	});

	testFixture({
		id: 'web-scss',
		title: 'SCSS',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-scss.ts',
			'src/node_modules/mymodule-scss/index.ts',
			'src/node_modules/mymodule-scss/styles.scss'
		],
		tscFiles: [
			'lib/application-scss.js',
			'lib/node_modules/mymodule-scss/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-scss.js',
			'dist/app-scss.css'
		]
	});

	testFixture({
		id: 'web-images',
		title: 'Images',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-images.ts',
			'src/node_modules/mymodule-jpg/index.ts',
			'src/node_modules/mymodule-jpg/example1.jpg',
			'src/node_modules/mymodule-png/index.ts',
			'src/node_modules/mymodule-png/example2.png',
			'src/node_modules/mymodule-svg/index.ts',
			'src/node_modules/mymodule-svg/example3.svg'
		],
		tscFiles: [
			'lib/application-images.js',
			'lib/node_modules/mymodule-jpg/index.js',
			'lib/node_modules/mymodule-png/index.js',
			'lib/node_modules/mymodule-svg/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-images.js',
			'dist/assets/example1.jpg',
			'dist/assets/example2.png',
			'dist/assets/example3.svg'
		],
		expectedOutput: '[IMAGES] JPG string PNG string SVG string'
	});

	testFixture({
		id: 'web-webworker',
		title: 'Webworker',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-webworker.ts',
			'src/example.webworker.ts'
		],
		tscFiles: [
			'lib/application-webworker.js',
			'lib/example.webworker.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-webworker.js',
			'dist/example.webworker.js'
		],
		expectedOutput: '[REQUEST] MAIN to WORKER [RESPONSE] WORKER to MAIN'
	});
});
