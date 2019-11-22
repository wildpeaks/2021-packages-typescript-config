/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual} = require('assert');
const {copyConfig, compileFixture, execCommand} = require('./shared');


function testFixture({id, title, sourceFiles, tscFiles, mainFilename, expectedOutput}){
	it(title, /* @this */ async function(){
		this.slow(10000);
		this.timeout(15000);

		const typechecked = await compileFixture('node', id, 'tsc --build tsconfig.json');
		deepStrictEqual(typechecked.filesBefore, sourceFiles.sort(), 'Before TSC');
		deepStrictEqual(typechecked.errors, [], 'No TSC errors');
		deepStrictEqual(typechecked.filesAfter, sourceFiles.concat(tscFiles).sort(), 'After TSC');

		const executed = await execCommand(`node ${mainFilename}`, typechecked.folder);
		deepStrictEqual(
			executed,
			{
				errors: [],
				output: expectedOutput
			}
		);
	});
}


describe('Package: Node', function(){
	before('Setup', function(){
		copyConfig('node');
	});

	testFixture({
		id: 'node-basic',
		title: 'Basic',
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

	testFixture({
		id: 'node-json-import-from',
		title: 'JSON: import * from',
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
		expectedOutput: [
			'JSON IMPORT FROM is ["hello","world"]'
		]
	});

	testFixture({
		id: 'node-json-import-require',
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
});
