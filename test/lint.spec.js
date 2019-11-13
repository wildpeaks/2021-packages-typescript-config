/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual} = require('assert');
const {readFileSync} = require('fs');
const {join} = require('path');

const Ajv = require('ajv');
const draft04 = require('ajv/lib/refs/json-schema-draft-04.json');
const configSchema = JSON.parse(readFileSync(join(__dirname, 'config.schema.json'), 'utf8'));
const tsconfigSchema = JSON.parse(readFileSync(join(__dirname, 'tsconfig.schema.json'), 'utf8'));
const configs = require('../src/configs');


function assertProperties(configId){
	const linter = new Ajv();
	const validate = linter.compile(configSchema);
	validate(configs[configId].tsconfig);
	deepStrictEqual(validate.errors, null);
}

function assertSchema(configId){
	const linter = new Ajv({meta: false, schemaId: 'id'});
	linter.addMetaSchema(draft04);
	const validate = linter.compile(tsconfigSchema);
	validate(configs[configId].tsconfig);
	deepStrictEqual(validate.errors, null);
}

for (const configId in configs){
	describe(`Lint: ${configId}`, function(){
		it('Properties', assertProperties.bind(null, configId));
		it('JSON Schema', assertSchema.bind(null, configId));
	});
}

