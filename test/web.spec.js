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


describe('[web] Basic features', function(){
	testFixture({
		id: 'web-basic-dom',
		title: 'Accepts: DOM',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-basic-dom.js'
		],
		expectedHTML: '[BASIC DOM] Type is object'
	});
	testFixture({
		id: 'web-basic-webworker',
		title: 'Accepts: Web Workers',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/types.d.ts',
			'src/application.ts',
			'src/example.webworker.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/example.webworker.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-basic-webworker.js',
			'dist/example.webworker.js'
		],
		expectedHTML: '[REQUEST] MAIN to WORKER [RESPONSE] WORKER to MAIN'
	});
});


describe('[web] Toplevel variables are global without "import" or "export"', function(){
	testFixture({
		id: 'web-entries',
		title: 'Global: no export or import',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application1.ts',
			'src/application2.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-entries-require',
		title: 'Global: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/shared.js',
			'src/application1.ts',
			'src/application2.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-entries-export',
		title: 'Local: export {}',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application1.ts',
			'src/application2.ts'
		],
		tscFiles: [
			'lib/application1.js',
			'lib/application2.js'
		],
		webpackFiles: [
			'dist/index1.html',
			'dist/index.html',
			'dist/app-entries-export-1.js',
			'dist/app-entries-export-2.js'
		],
		expectedHTML: '[ENTRIES EXPORT] Value is {"hello":"APP2"}'
	});
	testFixture({
		id: 'web-entries-import-from',
		title: 'Local: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/shared.ts',
			'src/application1.ts',
			'src/application2.ts'
		],
		tscFiles: [
			'lib/shared.js',
			'lib/application1.js',
			'lib/application2.js'
		],
		webpackFiles: [
			'dist/index1.html',
			'dist/index.html',
			'dist/app-entries-import-from-1.js',
			'dist/app-entries-import-from-2.js'
		],
		expectedHTML: '[ENTRIES IMPORT FROM] Value is {"hello":"APP2"}'
	});
	testFixture({
		id: 'web-entries-import-star',
		title: 'Local: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/shared.ts',
			'src/application1.ts',
			'src/application2.ts'
		],
		tscFiles: [
			'lib/shared.js',
			'lib/application1.js',
			'lib/application2.js'
		],
		webpackFiles: [
			'dist/index1.html',
			'dist/index.html',
			'dist/app-entries-import-star-1.js',
			'dist/app-entries-import-star-2.js'
		],
		expectedHTML: '[ENTRIES IMPORT STAR] Value is {"hello":"APP2"}'
	});
	testFixture({
		id: 'web-entries-import-require',
		title: 'Fails: import = require (cannot compile)',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/shared.js',
			'src/application1.ts',
			'src/application2.ts'
		],
		expectTypecheckError: true
	});
});


describe('[web] Import a CommonJS default object, without .d.ts', function(){
	testFixture({
		id: 'web-commonjs-untyped-default-import-from',
		title: 'Fails: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-untyped-default-import-star',
		title: 'Fails: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-untyped-default-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-untyped-default-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.js'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-commonjs-untyped-default-require.js'
		],
		expectedHTML: '[COMMONJS UNTYPED DEFAULT, REQUIRE] Type is function'
	});
});


describe('[web] Import a CommonJS named function, without .d.ts', function(){
	testFixture({
		id: 'web-commonjs-untyped-named-import-from',
		title: 'Fails: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-untyped-named-import-star',
		title: 'Fails: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-untyped-named-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-untyped-named-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.js'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-commonjs-untyped-named-require.js'
		],
		expectedHTML: '[COMMONJS UNTYPED NAMED, REQUIRE] Type is function'
	});
});


describe('[web] Import a CommonJS default object, with .d.ts', function(){
	testFixture({
		id: 'web-commonjs-typed-default-import-from',
		title: 'Fails: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-typed-default-import-star',
		title: 'Fails: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-typed-default-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-typed-default-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-commonjs-typed-default-require.js'
		],
		expectedHTML: '[COMMONJS TYPED DEFAULT, REQUIRE] Type is function'
	});
});


describe('[web] Import a CommonJS named function, with .d.ts', function(){
	testFixture({
		id: 'web-commonjs-typed-named-import-from',
		title: 'Accepts: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-commonjs-typed-named-import-from.js'
		],
		expectedHTML: '[COMMONJS TYPED NAMED, IMPORT FROM] Type is function'
	});
	testFixture({
		id: 'web-commonjs-typed-named-import-star',
		title: 'Accepts: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-commonjs-typed-named-import-star.js'
		],
		expectedHTML: '[COMMONJS TYPED NAMED, IMPORT STAR] Type is function'
	});
	testFixture({
		id: 'web-commonjs-typed-named-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-commonjs-typed-named-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-commonjs-typed-named-require.js'
		],
		expectedHTML: '[COMMONJS TYPED NAMED, REQUIRE] Type is function'
	});
});


describe('[web] Import an ES Module default object', function(){
	testFixture({
		id: 'web-export-default-import-from',
		title: 'Accepts: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-export-default-import-from.js'
		],
		expectedHTML: '[EXPORT DEFAULT, IMPORT FROM] Value is {"mynumber":123}'
	});
	testFixture({
		id: 'web-export-default-import-star',
		title: 'Accepts: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-export-default-import-star.js'
		],
		expectedHTML: '[EXPORT DEFAULT, IMPORT STAR] Value is {"default":{"mynumber":123}}'
	});
	testFixture({
		id: 'web-export-default-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-export-default-require',
		title: 'Accepts: require (wrapped in "{default: THEMODULE}")',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-export-default-require.js'
		],
		expectedHTML: '[EXPORT DEFAULT, REQUIRE] Value is {"default":{"mynumber":123}}'
	});
});


describe('[web] Import an ES Module named function', function(){
	testFixture({
		id: 'web-export-named-import-from',
		title: 'Accepts: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-export-named-import-from.js'
		],
		expectedHTML: '[EXPORT NAMED, IMPORT FROM] Type is function'
	});
	testFixture({
		id: 'web-export-named-import-star',
		title: 'Accepts: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-export-named-import-star.js'
		],
		expectedHTML: '[EXPORT NAMED, IMPORT STAR] Type is function'
	});
	testFixture({
		id: 'web-export-named-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-export-named-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-export-named-require.js'
		],
		expectedHTML: '[EXPORT NAMED, REQUIRE] Type is function'
	});
});


describe('[web] Preact', function(){
	testFixture({
		id: 'web-preact-h',
		title: 'Accepts: h()',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-preact-h.js'
		],
		expectedHTML: '<article class="example">[PREACT H] Hello World</article>'
	});
	testFixture({
		id: 'web-preact-class',
		title: 'Accepts: Class Component',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/components/MyComponentClass.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/components/MyComponentClass.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-preact-class.js'
		],
		expectedHTML: '<article class="example">[PREACT CLASS] PROP Hello World STATE 123</article>'
	});
	testFixture({
		id: 'web-preact-function',
		title: 'Accepts: Functional Component',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/components/MyFunctionalComponent.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/components/MyFunctionalComponent.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-preact-function.js'
		],
		expectedHTML: '<article class="example">[PREACT FUNCTION] Hello World</article>'
	});
	testFixture({
		id: 'web-preact-tsx',
		title: 'Accepts: TSX',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.tsx'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-preact-tsx.js'
		],
		expectedHTML: '<article class="example">[PREACT TSX] Hello World</article>'
	});
});


describe('[web] Import additional assets', function(){
	testFixture({
		id: 'web-assets-css',
		title: 'Accepts: CSS',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule-css/index.ts',
			'src/node_modules/mymodule-css/styles.css'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule-css/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-assets-css.js',
			'dist/app-assets-css.css'
		],
		expectedHTML: '[ASSETS CSS] .myclass is a string'
	});
	testFixture({
		id: 'web-assets-scss',
		title: 'Accepts: SCSS',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule-scss/index.ts',
			'src/node_modules/mymodule-scss/styles.scss'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule-scss/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-assets-scss.js',
			'dist/app-assets-scss.css'
		],
		expectedHTML: '[ASSETS SCSS] .myclass is a string'
	});
	testFixture({
		id: 'web-assets-images',
		title: 'Accepts: JPEG, PNG, SVG',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/node_modules/mymodule-jpg/index.ts',
			'src/node_modules/mymodule-jpg/example1.jpg',
			'src/node_modules/mymodule-png/index.ts',
			'src/node_modules/mymodule-png/example2.png',
			'src/node_modules/mymodule-svg/index.ts',
			'src/node_modules/mymodule-svg/example3.svg'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule-jpg/index.js',
			'lib/node_modules/mymodule-png/index.js',
			'lib/node_modules/mymodule-svg/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-assets-images.js',
			'dist/assets/example1.jpg',
			'dist/assets/example2.png',
			'dist/assets/example3.svg'
		],
		expectedHTML: '<img src="/assets/example1.jpg"><img src="/assets/example2.png"><img src="/assets/example3.svg">'
	});
	testFixture({
		id: 'web-assets-raw',
		title: 'Accepts: Local type definitions',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/types.d.ts',
			'src/application.ts',
			'src/node_modules/mymodule-raw/index.ts',
			'src/node_modules/mymodule-raw/example.md'
		],
		tscFiles: [
			'lib/application.js',
			'lib/node_modules/mymodule-raw/index.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-assets-raw.js'
		],
		expectedHTML: '# Hello World'
	});
});


describe('[web] JSON', function(){
	testFixture({
		id: 'web-json-import-from',
		title: 'Fails: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/asset-import-from.json'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-json-import-star',
		title: 'Accepts: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/asset-import-star.json'
		],
		tscFiles: [
			'lib/application.js',
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
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/asset-import-require.json'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'web-json-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts',
			'src/asset-require.json'
		],
		tscFiles: [
			'lib/application.js'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-json-require.js'
		],
		expectedHTML: 'JSON REQUIRE is ["hello","world"]'
	});
});
