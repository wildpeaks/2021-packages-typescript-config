/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual} = require('assert');
const {copyConfig, compileFixture/*, execCommand*/} = require('./shared');


describe('Package: Web', function(){
	before('Setup', function(){
		copyConfig('web');
	});

	//
	// TODO express must serve /dist for Puppeteer
	//


	it(`DOM`, /* @this */ async function(){
		this.slow(10000);
		this.timeout(15000);

		const {filesBefore, filesAfter, errors} = await compileFixture('web', 'web-dom', 'webpack');
		const inputFiles = [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-dom.ts'
		];
		const outputFiles = [
			'dist/index.html',
			'dist/app-dom.js'
		];
		deepStrictEqual(filesBefore, inputFiles.sort(), 'Files before');
		deepStrictEqual(errors, [], 'No errors');
		deepStrictEqual(filesAfter, inputFiles.concat(outputFiles).sort(), 'Files after');

		//
		// TODO pupeteer + express
		//
	});


	it(`DOM + Exports`, /* @this */ async function(){
		this.slow(10000);
		this.timeout(15000);

		const {filesBefore, filesAfter, errors} = await compileFixture('web', 'web-exports', 'webpack');
		const inputFiles = [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-exports.ts'
		];
		const outputFiles = [
			'dist/index.html',
			'dist/app-exports.js'
		];
		deepStrictEqual(filesBefore, inputFiles.sort(), 'Files before');
		deepStrictEqual(errors, [], 'No errors');
		deepStrictEqual(filesAfter, inputFiles.concat(outputFiles).sort(), 'Files after');

		//
		// TODO pupeteer + express
		//
	});


	it(`DOM + Preact`, /* @this */ async function(){
		this.slow(10000);
		this.timeout(15000);

		const {filesBefore, filesAfter, errors} = await compileFixture('web', 'web-preact', 'webpack');
		const inputFiles = [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-preact.ts'
		];
		const outputFiles = [
			'dist/index.html',
			'dist/app-preact.js'
		];
		deepStrictEqual(filesBefore, inputFiles.sort(), 'Files before');
		deepStrictEqual(errors, [], 'No errors');
		deepStrictEqual(filesAfter, inputFiles.concat(outputFiles).sort(), 'Files after');

		//
		// TODO pupeteer + express
		//
	});
});
