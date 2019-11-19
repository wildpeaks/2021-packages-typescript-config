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
		deepStrictEqual(errors, [], 'No errors');

		const inputFiles = [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-dom.ts'
		];
		const outputFiles = [
			'dist/index.html',
			'dist/app.js'
		];
		deepStrictEqual(filesBefore, inputFiles.sort(), 'Files before');
		deepStrictEqual(filesAfter, inputFiles.concat(outputFiles).sort(), 'Files after');

		//
		// TODO pupeteer + express
		//
	});
});
