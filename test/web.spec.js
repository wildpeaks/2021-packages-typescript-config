/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {strictEqual, deepStrictEqual} = require('assert');
const {join} = require('path');
const express = require('express');
const puppeteer = require('puppeteer');
const {copyConfig, compileFixture} = require('./shared');

let app;
let server;
const port = 8888;
const outputFolder = join(__dirname, `tmp/web/dist`);


function sleep(duration){
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
}


function testFixture({id, title, sourceFiles, tscFiles, webpackFiles, expectTypecheckError, expectedHTML}){
	it(title, /* @this */ async function(){
		this.slow(30000);
		this.timeout(30000);

		const typechecked = await compileFixture('web', id, 'tsc --build tsconfig.json');
		deepStrictEqual(typechecked.filesBefore, sourceFiles.sort(), 'Before TSC');
		if (expectTypecheckError){
			if (typechecked.errors.length === 0){
				throw new Error('Expected fixtured to fail typecheck');
			}
			return;
		}
		deepStrictEqual(typechecked.errors, [], 'No TSC errors');
		deepStrictEqual(typechecked.filesAfter, sourceFiles.concat(tscFiles).sort(), 'After TSC');

		const compiled = await compileFixture('web', id, 'webpack');
		deepStrictEqual(compiled.filesBefore, sourceFiles.sort(), 'Before Webpack');
		deepStrictEqual(compiled.errors, [], 'No Webpack errors');
		deepStrictEqual(compiled.filesAfter, sourceFiles.concat(webpackFiles).sort(), 'After Webpack');

		const browser = await puppeteer.launch();
		try {
			const page = await browser.newPage();
			await page.goto(`http://localhost:${port}/`);
			await sleep(300);
			const actualHTML = await page.evaluate(() => {
				const el = document.getElementById('hello');
				if (el === null){
					return 'Error: #hello not found';
				}
				return el.innerHTML;
			});
			strictEqual(actualHTML, expectedHTML);
		} finally {
			await browser.close();
		}
	});
}


before('Setup', function(){
	return new Promise(resolve => {
		copyConfig('web');
		app = express();
		app.use(express.static(outputFolder));
		server = app.listen(port, () => {
			resolve();
		});
	});
});

after('Shutdown', function(){
	return new Promise(resolve => {
		server.close(() => {
			resolve();
		});
	});
});


describe('Package: Web', function(){
	// testFixture({
	// 	id: 'web-dom',
	// 	title: 'No import or export',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/application-dom.ts'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-dom.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-dom.js'
	// 	],
	// 	expectedHTML: '[DOM] Type of window is object'
	// });

	// testFixture({
	// 	id: 'web-exports',
	// 	title: 'Toplevel export',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/application-exports.ts'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-exports.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-exports.js'
	// 	],
	// 	expectedHTML: '[EXPORTS] Type of window is object'
	// });

	// testFixture({
	// 	id: 'web-preact',
	// 	title: 'Preact',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/application-preact.ts'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-preact.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-preact.js'
	// 	],
	// 	expectedHTML: '<article class="example">TS Hello World</article>'
	// });

	// testFixture({
	// 	id: 'web-tsx',
	// 	title: 'TSX',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/application-tsx.tsx'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-tsx.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-tsx.js'
	// 	],
	// 	expectedHTML: '<article class="example">TSX Hello World</article>'
	// });

	// testFixture({
	// 	id: 'web-css',
	// 	title: 'CSS',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/application-css.ts',
	// 		'src/node_modules/mymodule-css/index.ts',
	// 		'src/node_modules/mymodule-css/styles.css'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-css.js',
	// 		'lib/node_modules/mymodule-css/index.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-css.js',
	// 		'dist/app-css.css'
	// 	],
	// 	expectedHTML: 'CSS .myclass is a string'
	// });

	// testFixture({
	// 	id: 'web-scss',
	// 	title: 'SCSS',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/application-scss.ts',
	// 		'src/node_modules/mymodule-scss/index.ts',
	// 		'src/node_modules/mymodule-scss/styles.scss'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-scss.js',
	// 		'lib/node_modules/mymodule-scss/index.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-scss.js',
	// 		'dist/app-scss.css'
	// 	],
	// 	expectedHTML: 'SCSS .myclass is a string'
	// });

	// testFixture({
	// 	id: 'web-images',
	// 	title: 'Images',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/application-images.ts',
	// 		'src/node_modules/mymodule-jpg/index.ts',
	// 		'src/node_modules/mymodule-jpg/example1.jpg',
	// 		'src/node_modules/mymodule-png/index.ts',
	// 		'src/node_modules/mymodule-png/example2.png',
	// 		'src/node_modules/mymodule-svg/index.ts',
	// 		'src/node_modules/mymodule-svg/example3.svg'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-images.js',
	// 		'lib/node_modules/mymodule-jpg/index.js',
	// 		'lib/node_modules/mymodule-png/index.js',
	// 		'lib/node_modules/mymodule-svg/index.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-images.js',
	// 		'dist/assets/example1.jpg',
	// 		'dist/assets/example2.png',
	// 		'dist/assets/example3.svg'
	// 	],
	// 	expectedHTML: '<img src="/assets/example1.jpg"><img src="/assets/example2.png"><img src="/assets/example3.svg">'
	// });

	// testFixture({
	// 	id: 'web-webworker',
	// 	title: 'Webworker',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/types.d.ts',
	// 		'src/application-webworker.ts',
	// 		'src/example.webworker.ts'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-webworker.js',
	// 		'lib/example.webworker.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-webworker.js',
	// 		'dist/example.webworker.js'
	// 	],
	// 	expectedHTML: '[REQUEST] MAIN to WORKER [RESPONSE] WORKER to MAIN'
	// });

	// testFixture({
	// 	id: 'web-raw',
	// 	title: 'Local type definitions',
	// 	sourceFiles: [
	// 		'package.json',
	// 		'tsconfig.json',
	// 		'webpack.config.js',
	// 		'src/types.d.ts',
	// 		'src/application-raw.ts',
	// 		'src/node_modules/mymodule-raw/index.ts',
	// 		'src/node_modules/mymodule-raw/example.md'
	// 	],
	// 	tscFiles: [
	// 		'lib/application-raw.js',
	// 		'lib/node_modules/mymodule-raw/index.js'
	// 	],
	// 	webpackFiles: [
	// 		'dist/index.html',
	// 		'dist/app-raw.js'
	// 	],
	// 	expectedHTML: '# Hello World'
	// });

	testFixture({
		id: 'web-json-import-from',
		title: 'JSON: import from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-json-import-from.ts',
			'src/asset-import-from.json'
		],
		tscFiles: [
			'lib/application-json-import-from.js',
			'lib/asset-import-from.json'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-json-import-from.js'
		],
		expectTypecheckError: true
	});

	testFixture({
		id: 'web-json-import-star',
		title: 'JSON: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-json-import-star.ts',
			'src/asset-import-star.json'
		],
		tscFiles: [
			'lib/application-json-import-star.js',
			'lib/asset-import-star.json'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-json-import-star.js'
		],
		expectedHTML: 'JSON IMPORT STAR is {"default":["hello","world"]}'
	});

	testFixture({
		id: 'web-json-import-require',
		title: 'JSON: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-json-import-require.ts',
			'src/asset-import-require.json'
		],
		tscFiles: [
			'lib/application-json-import-require.js',
			'lib/asset-import-require.json'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-json-import-require.js'
		],
		expectTypecheckError: true
	});

	testFixture({
		id: 'web-json-require',
		title: 'JSON: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-json-require.ts',
			'src/asset-require.json'
		],
		tscFiles: [
			'lib/application-json-require.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-json-require.js'
		],
		expectedHTML: 'JSON REQUIRE is ["hello","world"]'
	});
});
