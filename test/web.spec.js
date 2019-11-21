/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual} = require('assert');
const {copyConfig, compileFixture} = require('./shared');


describe('Package: Web', function(){
	before('Setup', function(){
		copyConfig('web');
	});

	//
	// TODO express must serve /dist for Puppeteer
	//


	it(`No import or export`, /* @this */ async function(){
		this.slow(20000);
		this.timeout(30000);
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
	});


	it(`Toplevel export`, /* @this */ async function(){
		this.slow(20000);
		this.timeout(30000);
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
	});


	it(`Preact`, /* @this */ async function(){
		this.slow(20000);
		this.timeout(30000);
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
	});


	it(`TSX`, /* @this */ async function(){
		this.slow(20000);
		this.timeout(30000);
		const {filesBefore, filesAfter, errors} = await compileFixture('web', 'web-tsx', 'webpack');
		const inputFiles = [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-tsx.tsx'
		];
		const outputFiles = [
			'dist/index.html',
			'dist/app-tsx.js'
		];
		deepStrictEqual(filesBefore, inputFiles.sort(), 'Files before');
		deepStrictEqual(errors, [], 'No errors');
		deepStrictEqual(filesAfter, inputFiles.concat(outputFiles).sort(), 'Files after');
	});


	it(`CSS`, /* @this */ async function(){
		this.slow(20000);
		this.timeout(30000);
		const {filesBefore, filesAfter, errors} = await compileFixture('web', 'web-css', 'webpack');
		const inputFiles = [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-css.ts',
			'src/node_modules/mymodule-css/index.ts',
			'src/node_modules/mymodule-css/styles.css'
		];
		const outputFiles = [
			'dist/index.html',
			'dist/app-css.js',
			'dist/app-css.css'
		];
		deepStrictEqual(filesBefore, inputFiles.sort(), 'Files before');
		deepStrictEqual(errors, [], 'No errors');
		deepStrictEqual(filesAfter, inputFiles.concat(outputFiles).sort(), 'Files after');
	});


	it(`SCSS`, /* @this */ async function(){
		this.slow(20000);
		this.timeout(30000);
		const {filesBefore, filesAfter, errors} = await compileFixture('web', 'web-scss', 'webpack');
		const inputFiles = [
			'package.json',
			'tsconfig.json',
			'webpack.config.js',
			'src/application-scss.ts',
			'src/node_modules/mymodule-scss/index.ts',
			'src/node_modules/mymodule-scss/styles.scss'
		];
		const outputFiles = [
			'dist/index.html',
			'dist/app-scss.js',
			'dist/app-scss.css'
		];
		deepStrictEqual(filesBefore, inputFiles.sort(), 'Files before');
		deepStrictEqual(errors, [], 'No errors');
		deepStrictEqual(filesAfter, inputFiles.concat(outputFiles).sort(), 'Files after');
	});
});
