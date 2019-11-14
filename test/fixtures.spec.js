/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {exec} = require('child_process');
const {writeFileSync} = require('fs');
const {copySync, removeSync, mkdirpSync} = require('fs-extra');
const {join} = require('path');
const fixturesFolder = join(process.cwd(), 'test/fixtures');
const packagesFolder = join(process.cwd(), 'packages');


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

	//
	// TODO for every fixture
	//
	const modulesFolder = join(fixturesFolder, 'basic', 'node_modules/@wildpeaks');
	removeSync(modulesFolder);
	mkdirpSync(modulesFolder);
	copySync(packagesFolder, modulesFolder);
});


async function compileFixture(fixtureId, configId){
	const folder = join(fixturesFolder, fixtureId);
	writeFileSync(join(folder, 'tsconfig.json'), JSON.stringify({extends: `@wildpeaks/tsconfig-${configId}`}), 'utf8');
	await compile(folder);
	return {
		folder,
		files: [
			'AAAAAAAAAAAAAAAAA',
			'AAAAAAAAAAAAAAAAA',
			'AAAAAAAAAAAAAAAAA',
			'AAAAAAAAAAAAAAAAA',
			'AAAAAAAAAAAAAAAAA'
		]
	};
}


describe('Package: Node', function(){

	it(`Basic`, /* @this */ async function(){
		this.slow(15000);
		const {folder, files} = await compileFixture('basic', 'node');

		//
		// check list of generated files
		//

		//
		// TODO run
		//
	});
});

