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
			'src/main.ts'
		],
		tscFiles: [
			'lib/main.js'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'Hello World'
		]
	});
});
