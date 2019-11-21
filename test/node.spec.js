/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual} = require('assert');
const {copyConfig, compileFixture, execCommand} = require('./shared');


describe('Package: Node', function(){
	before('Setup', function(){
		copyConfig('node');
	});

	it(`Basic`, /* @this */ async function(){
		this.slow(10000);
		this.timeout(15000);

		const {folder, filesBefore, filesAfter, errors} = await compileFixture('node', 'node-basic', 'tsc --build tsconfig.json');
		deepStrictEqual(
			filesBefore,
			[
				'package.json',
				'tsconfig.json',
				'src/main.ts'
			].sort(),
			'Files before'
		);
		deepStrictEqual(errors, [], 'No errors');
		deepStrictEqual(
			filesAfter,
			[
				'package.json',
				'tsconfig.json',
				'src/main.ts',
				'lib/main.js'
			].sort(),
			'Files after'
		);

		const executed = await execCommand('node lib/main.js', folder);
		deepStrictEqual(
			executed,
			{
				errors: [],
				output: [
					'Hello World'
				]
			}
		);
	});
});
