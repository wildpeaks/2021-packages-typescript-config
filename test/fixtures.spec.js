/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-empty */
'use strict';
const {strictEqual, deepStrictEqual} = require('assert');
const {exec} = require('child_process');
const {readdirSync, writeFileSync} = require('fs');
const {relative} = require('path');
const {copySync, removeSync, mkdirpSync} = require('fs-extra');
const {join} = require('path');
const fixturesFolder = join(process.cwd(), 'test/fixtures');
const packagesFolder = join(process.cwd(), 'packages');
const rreaddir = require('recursive-readdir');


function compile(fixtureFolder){
	return new Promise((resolve, reject) => {
		exec('tsc --build tsconfig.json', {cwd: fixtureFolder}, (error, _stdout, _stderr) => {
			if (error){
				reject(error);
			} else {
				resolve();
			}
		});
	});
}


before('Setup', function(){
	const fixtureIds = readdirSync(fixturesFolder);
	for (const fixtureId of fixtureIds){
		const modulesFolder = join(fixturesFolder, fixtureId, 'node_modules/@wildpeaks');
		try {
			removeSync(modulesFolder);
		} catch(e){}
		mkdirpSync(modulesFolder);
		copySync(packagesFolder, modulesFolder);
	}
});


async function getFiles(folder){
	const files = await rreaddir(folder);
	return files.map(filepath => relative(folder, filepath).replace(/\\/g, '/')).sort().filter(filepath => !filepath.startsWith('node_modules'));
}


async function compileFixture(fixtureId, configId){
	const folder = join(fixturesFolder, fixtureId);
	writeFileSync(join(folder, 'tsconfig.json'), JSON.stringify({extends: `@wildpeaks/tsconfig-${configId}`}), 'utf8');
	const filesBefore = await getFiles(folder);

	let throws = false;
	try {
		await compile(folder);
	} catch(e){
		throws = e;
	}

	const filesAfter = await getFiles(folder);
	return {throws, folder, filesBefore, filesAfter};
}


describe('Package: Node', function(){

	it(`Basic`, /* @this */ async function(){
		this.slow(15000);
		const {throws, filesBefore, filesAfter} = await compileFixture('basic', 'node');

		strictEqual(throws, false, 'No error');
		deepStrictEqual(
			filesBefore,
			[
				'src/main.ts',
				'tsconfig.json'
			],
			'Files before'
		);
		deepStrictEqual(
			filesAfter,
			[
				'lib/main.js',
				'src/main.ts',
				'tsconfig.json'
			],
			'Files after'
		);

		//
		// TODO run in Node (or Puppeteer for web config)
		//
	});
});

