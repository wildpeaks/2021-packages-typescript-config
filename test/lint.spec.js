/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {strictEqual, deepStrictEqual} = require('assert');
const {readFileSync} = require('fs');
const {join} = require('path');

const Ajv = require('ajv');
const draft04 = require('ajv/lib/refs/json-schema-draft-04.json');
const configSchema = JSON.parse(readFileSync(join(__dirname, 'preset.schema.json'), 'utf8'));
const tsconfigSchema = JSON.parse(readFileSync(join(__dirname, 'tsconfig.schema.json'), 'utf8'));
const presets = require('../src/presets');

function assertProperties(presetId){
	const linter = new Ajv();
	const validate = linter.compile(configSchema);
	validate(presets[presetId]);
	deepStrictEqual(validate.errors, null);
}

function assertSchema(presetId){
	const linter = new Ajv({meta: false, schemaId: 'id'});
	linter.addMetaSchema(draft04);
	const validate = linter.compile(tsconfigSchema);
	validate(presets[presetId].tsconfig);
	deepStrictEqual(validate.errors, null);
}


// Paths are unfortunately relative to the shared config package:
// https://github.com/Microsoft/TypeScript/issues/29172
function assertPath(text, id){
	strictEqual(text.startsWith('../../../') || text.startsWith('@wildpeaks'), id);
}


function assertPaths(presetId){
	const preset = presets[presetId];
	for (const id of ['outDir', 'outFile', 'rootDir']){
		if (id in preset){
			assertPath(preset[id]);
		}
	}
	for (const id of ['include', 'files']){
		if (id in preset){
			assertPath(preset[id]);
		}
	}
}


for (const presetId in presets){
	describe(`Lint: ${presetId}`, function(){
		it('Preset', assertProperties.bind(null, presetId));
		it('TS Config', assertSchema.bind(null, presetId));
		it('Paths', assertPaths.bind(null, presetId));
	});
}
