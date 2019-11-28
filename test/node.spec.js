/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual} = require('assert');
const {copyConfig, compileFixture, execCommand} = require('./shared');


function testFixture({id, title, sourceFiles, tscFiles, mainFilename, expectTypecheckError, expectRuntimeError, expectedOutput}){
	it(title, /* @this */ async function(){
		this.slow(10000);
		this.timeout(15000);

		const typechecked = await compileFixture('node', `node/${id}`, 'tsc --build tsconfig.json');
		deepStrictEqual(typechecked.filesBefore, sourceFiles.sort(), 'Before TSC');
		if (expectTypecheckError){
			if (typechecked.errors.length === 0){
				throw new Error('Expected fixtured to fail typecheck');
			}
			return;
		}
		deepStrictEqual(typechecked.errors, [], 'No TSC errors');
		deepStrictEqual(typechecked.filesAfter, sourceFiles.concat(tscFiles).sort(), 'After TSC');

		const runtime = await execCommand(`node ${mainFilename}`, typechecked.folder);
		if (expectRuntimeError){
			if (runtime.errors.length === 0){
				throw new Error('Expected fixtured to fail runtime');
			}
			return;
		}
		deepStrictEqual(
			runtime,
			{
				errors: [],
				output: expectedOutput
			}
		);
	});
}


before('Setup', function(){
	copyConfig('node');
});


describe('[node] Basic features', function(){
	testFixture({
		id: 'basic-cli',
		title: 'CLI',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/main.js'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[CLI] Hello World'
		]
	});
});


describe('[node] JSON', function(){
	testFixture({
		id: 'json-import-from',
		title: 'JSON: import from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		// tscFiles: [
		// 	'lib/asset-import-from.json',
		// 	'lib/main.js'
		// ],
		// mainFilename: 'lib/main.js',
		expectTypecheckError: true
	});

	testFixture({
		id: 'json-import-star',
		title: 'JSON: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/data.json',
			'lib/main.js'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[JSON IMPORT STAR] is ["hello","world"]'
		]
	});

	testFixture({
		id: 'json-import-require',
		title: 'JSON: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/data.json',
			'lib/main.js'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[JSON IMPORT REQUIRE] is ["hello","world"]'
		]
	});

	testFixture({
		id: 'json-require',
		title: 'JSON: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/main.js'
		],
		mainFilename: 'lib/main.js',
		expectRuntimeError: true
	});
});
