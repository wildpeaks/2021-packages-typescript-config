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

		const typechecked = await compileFixture('web', `web/${id}`, 'tsc --build tsconfig.json');
		deepStrictEqual(typechecked.filesBefore, sourceFiles.sort(), 'Before TSC');
		if (expectTypecheckError){
			if (typechecked.errors.length === 0){
				throw new Error('Expected fixture to fail typecheck');
			}
			return;
		}
		deepStrictEqual(typechecked.errors, [], 'No TSC errors');
		deepStrictEqual(typechecked.filesAfter, sourceFiles.concat(tscFiles).sort(), 'After TSC');

		const compiled = await compileFixture('web', `web/${id}`, 'webpack');
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


describe('[web] useDefineForClassFields: true (default)', function(){
	// Class 1
	testFixture({
		id: 'class-1-variant-1-define-true',
		title: 'Class 1 - Variant 1',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-1-define-true.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 1 DEFINE TRUE] undefined MODIFIED'
	});
	testFixture({
		id: 'class-1-variant-2-define-true',
		title: 'Class 1 - Variant 2',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'class-1-variant-3-define-true',
		title: 'Class 1 - Variant 3',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-3-define-true.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 3 DEFINE TRUE] CHILD MODIFIED'
	});
	testFixture({
		id: 'class-1-variant-4-define-true',
		title: 'Class 1 - Variant 4',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-4-define-true.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 4 DEFINE TRUE] undefined MODIFIED'
	});
	testFixture({
		id: 'class-1-variant-5-define-true',
		title: 'Class 1 - Variant 5',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-5-define-true.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 5 DEFINE TRUE] CHILD MODIFIED'
	});

	// Class 2
	testFixture({
		id: 'class-2-variant-1-define-true',
		title: 'Class 2 - Variant 1',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-1-define-true.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 1 DEFINE TRUE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-2-variant-2-define-true',
		title: 'Class 2 - Variant 2',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'class-2-variant-3-define-true',
		title: 'Class 2 - Variant 3',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-3-define-true.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 3 DEFINE TRUE] CHILD MODIFIED'
	});
	testFixture({
		id: 'class-2-variant-4-define-true',
		title: 'Class 2 - Variant 4',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-4-define-true.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 4 DEFINE TRUE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-2-variant-5-define-true',
		title: 'Class 2 - Variant 5',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-5-define-true.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 5 DEFINE TRUE] CHILD MODIFIED'
	});

	// Class 3
	testFixture({
		id: 'class-3-variant-1-define-true',
		title: 'Class 3 - Variant 1',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-1-define-true.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 1 DEFINE TRUE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-3-variant-2-define-true',
		title: 'Class 3 - Variant 2',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'class-3-variant-3-define-true',
		title: 'Class 3 - Variant 3',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-3-define-true.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 3 DEFINE TRUE] CHILD MODIFIED'
	});
	testFixture({
		id: 'class-3-variant-4-define-true',
		title: 'Class 3 - Variant 4',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-4-define-true.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 4 DEFINE TRUE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-3-variant-5-define-true',
		title: 'Class 3 - Variant 5',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-5-define-true.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 5 DEFINE TRUE] CHILD MODIFIED'
	});
});


describe('[web] useDefineForClassFields: false (legacy)', function(){
	// Class 1
	testFixture({
		id: 'class-1-variant-1-define-false',
		title: 'Class 1 - Variant 1',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-1-define-false.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 1 DEFINE FALSE] undefined MODIFIED'
	});
	testFixture({
		id: 'class-1-variant-2-define-false',
		title: 'Class 1 - Variant 2',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-2-define-false.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 2 DEFINE FALSE] undefined MODIFIED'
	});
	testFixture({
		id: 'class-1-variant-3-define-false',
		title: 'Class 1 - Variant 3',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-3-define-false.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 3 DEFINE FALSE] CHILD MODIFIED'
	});
	testFixture({
		id: 'class-1-variant-4-define-false',
		title: 'Class 1 - Variant 4',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-4-define-false.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 4 DEFINE FALSE] undefined MODIFIED'
	});
	testFixture({
		id: 'class-1-variant-5-define-false',
		title: 'Class 1 - Variant 5',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-1-variant-5-define-false.js'
		],
		expectedHTML: '[CLASS 1 VARIANT 5 DEFINE FALSE] CHILD MODIFIED'
	});

	// Class 2
	testFixture({
		id: 'class-2-variant-1-define-false',
		title: 'Class 2 - Variant 1',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-1-define-false.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 1 DEFINE FALSE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-2-variant-2-define-false',
		title: 'Class 2 - Variant 2',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-2-define-false.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 2 DEFINE FALSE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-2-variant-3-define-false',
		title: 'Class 2 - Variant 3',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-3-define-false.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 3 DEFINE FALSE] CHILD MODIFIED'
	});
	testFixture({
		id: 'class-2-variant-4-define-false',
		title: 'Class 2 - Variant 4',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-4-define-false.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 4 DEFINE FALSE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-2-variant-5-define-false',
		title: 'Class 2 - Variant 5',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-2-variant-5-define-false.js'
		],
		expectedHTML: '[CLASS 2 VARIANT 5 DEFINE FALSE] CHILD MODIFIED'
	});

	// Class 3
	testFixture({
		id: 'class-3-variant-1-define-false',
		title: 'Class 3 - Variant 1',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-1-define-false.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 1 DEFINE FALSE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-3-variant-2-define-false',
		title: 'Class 3 - Variant 2',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-2-define-false.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 2 DEFINE FALSE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-3-variant-3-define-false',
		title: 'Class 3 - Variant 3',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-3-define-false.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 3 DEFINE FALSE] CHILD MODIFIED'
	});
	testFixture({
		id: 'class-3-variant-4-define-false',
		title: 'Class 3 - Variant 4',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-4-define-false.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 4 DEFINE FALSE] BASE MODIFIED'
	});
	testFixture({
		id: 'class-3-variant-5-define-false',
		title: 'Class 2 - Variant 5',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application.ts'
		],
		tscFiles: [
			'lib/application.js',
			'lib/application.js.map'
		],
		webpackFiles: [
			'dist/index.html',
			'dist/app-class-3-variant-5-define-false.js'
		],
		expectedHTML: '[CLASS 3 VARIANT 5 DEFINE FALSE] CHILD MODIFIED'
	});
});
