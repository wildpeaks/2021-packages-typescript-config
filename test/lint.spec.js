/* eslint-env node, mocha */
'use strict';
const {deepStrictEqual} = require('assert');
const {readFileSync} = require('fs');
const {join} = require('path');
const Ajv = require('ajv');
const draft04 = require('ajv/lib/refs/json-schema-draft-04.json');
const schema = JSON.parse(readFileSync(join(__dirname, 'schema.json'), 'utf8'));

const packagesFolder = join(process.cwd(), 'packages');
const packageIds = ['tsconfig-node'];


function runTest(packageId){
	const parsed = JSON.parse(readFileSync(join(packagesFolder, packageId, 'tsconfig.json'), 'utf8'));
	const linter = new Ajv({meta: false, schemaId: 'id'});
	linter.addMetaSchema(draft04);
	const validate = linter.compile(schema);
	validate(parsed);
	deepStrictEqual(validate.errors, null);
}


describe('JSON Schema', () => {
	for (const packageId of packageIds){
		it(packageId, runTest.bind(null, packageId));
	}
});
