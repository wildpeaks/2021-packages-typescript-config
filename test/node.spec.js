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
			'src/main-basic.ts'
		],
		tscFiles: [
			'lib/main-basic.js'
		],
		mainFilename: 'lib/main-basic.js',
		expectedOutput: [
			'BASIC Hello World'
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
			'src/asset-import-from.json',
			'src/main-json-import-from.ts'
		],
		tscFiles: [
			'lib/asset-import-from.json',
			'lib/main-json-import-from.js'
		],
		mainFilename: 'lib/main-json-import-from.js',
		expectTypecheckError: true
	});

	testFixture({
		id: 'json-import-star',
		title: 'JSON: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/asset-import-star.json',
			'src/main-json-import-star.ts'
		],
		tscFiles: [
			'lib/asset-import-star.json',
			'lib/main-json-import-star.js'
		],
		mainFilename: 'lib/main-json-import-star.js',
		expectedOutput: [
			'JSON IMPORT STAR is ["hello","world"]'
		]
	});

	testFixture({
		id: 'json-import-require',
		title: 'JSON: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/asset-import-require.json',
			'src/main-json-import-require.ts'
		],
		tscFiles: [
			'lib/asset-import-require.json',
			'lib/main-json-import-require.js'
		],
		mainFilename: 'lib/main-json-import-require.js',
		expectedOutput: [
			'JSON IMPORT REQUIRE is ["hello","world"]'
		]
	});

	testFixture({
		id: 'json-require',
		title: 'JSON: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/asset-require.json',
			'src/main-json-require.ts'
		],
		tscFiles: [
			'lib/main-json-require.js'
		],
		mainFilename: 'lib/main-json-require.js',
		expectRuntimeError: true
	});
});
