/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {writeFileSync} = require('fs');
const {join} = require('path');
const {exec} = require('child_process');
const fixturesFolder = join(process.cwd(), 'test/fixtures');
const configs = require('../src/configs');


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


describe('Package: Node', function(){
	const config = configs.node.tsconfig;

	it(`Basic`, /* @this */ async function(){
		this.slow(15000);
		const fixtureFolder = join(fixturesFolder, 'basic');
		writeFileSync(join(fixtureFolder, 'tsconfig.json'), JSON.stringify(config), 'utf8');
		await compile(fixtureFolder);

		//
		// check list of generated files
		//

		//
		// TODO run
		//
	});
});

