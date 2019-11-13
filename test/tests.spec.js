/* eslint-env node, mocha */
/* eslint-disable no-undefined */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {strictEqual, deepStrictEqual} = require('assert');
const {readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const {exec} = require('child_process');

const Ajv = require('ajv');
const draft04 = require('ajv/lib/refs/json-schema-draft-04.json');
const schema = JSON.parse(readFileSync(join(__dirname, 'schema.json'), 'utf8'));

const packageIds = ['tsconfig-node'];
const packagesFolder = join(process.cwd(), 'packages');
const fixturesFolder = join(process.cwd(), 'test/fixtures');


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


function lintPackage(packageId){
	const parsed = JSON.parse(readFileSync(join(packagesFolder, packageId, 'tsconfig.json'), 'utf8'));
	const linter = new Ajv({meta: false, schemaId: 'id'});
	linter.addMetaSchema(draft04);
	const validate = linter.compile(schema);
	validate(parsed);
	deepStrictEqual(validate.errors, null);
}

describe('JSON Schema', () => {
	for (const packageId of packageIds){
		it(packageId, lintPackage.bind(null, packageId));
	}
});


describe('Package: Node', function(){
	const config = JSON.parse(readFileSync(join(packagesFolder, 'tsconfig-node/tsconfig.json'), 'utf8'));

	it(`Basic`, /* @this */ async function(){
		this.slow(30000);
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

