/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable global-require */
"use strict";
const {deepStrictEqual} = require("assert");
const {join} = require("path");
const Ajv = require("ajv");
const draft04 = require("ajv/lib/refs/json-schema-draft-04.json");
const tsconfigSchema = require("./tsconfig.schema.json");
const {packagesFolder} = require("./shared");

function assertSchema(tsconfig) {
	const linter = new Ajv({meta: false, schemaId: "id"});
	linter.addMetaSchema(draft04);
	const validate = linter.compile(tsconfigSchema);
	validate(tsconfig);
	deepStrictEqual(validate.errors, null);
}

describe("Lint", function() {
	it("Node", function() {
		const tsconfig = require(join(packagesFolder, "tsconfig-node/tsconfig.json"));
		assertSchema(tsconfig);
	});
	it("Web", function() {
		const tsconfig = require(join(packagesFolder, "tsconfig-web/tsconfig.json"));
		assertSchema(tsconfig);
	});
});
