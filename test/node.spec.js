/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {deepStrictEqual} = require("assert");
const {copySync} = require("fs-extra");
const {copyConfig, compileFixture, execCommand} = require("./shared");
const tmpFolder = join(process.cwd(), "tmp/node");

function testFixture(
	{
		id,
		title,
		sourceFiles,
		tscFiles,
		copyFiles,
		mainFilename,
		expectTypecheckError,
		expectRuntimeError,
		expectedOutput
	} = {copyFiles: {}}
) {
	it(
		title,
		/* @this */ async function() {
			this.slow(10000);
			this.timeout(15000);

			const typechecked = await compileFixture("node", `node/${id}`, "tsc --build tsconfig.json");
			deepStrictEqual(typechecked.filesBefore, sourceFiles.sort(), "Before TSC");
			if (expectTypecheckError) {
				if (typechecked.errors.length === 0) {
					throw new Error("Expected fixture to fail typecheck");
				}
				return;
			}
			deepStrictEqual(typechecked.errors, [], "No TSC errors");
			deepStrictEqual(typechecked.filesAfter, sourceFiles.concat(tscFiles).sort(), "After TSC");

			if (typeof copyFiles === "object" && copyFiles !== null) {
				for (const relativeSrc in copyFiles) {
					const relativeDest = copyFiles[relativeSrc];
					copySync(join(tmpFolder, relativeSrc), join(tmpFolder, relativeDest));
				}
			}

			const runtime = await execCommand(`node ${mainFilename}`, typechecked.folder);
			if (expectRuntimeError) {
				if (runtime.errors.length === 0) {
					throw new Error("Expected fixtured to fail runtime");
				}
				return;
			}
			deepStrictEqual(runtime, {
				errors: [],
				output: expectedOutput
			});
		}
	);
}

before("Setup", function() {
	copyConfig("node");
});

describe("[node] Basic features", function() {
	testFixture({
		id: "basic-cli",
		title: "Accepts: cli",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLI] Hello World"]
	});
	testFixture({
		id: "basic-local-modules",
		title: "Fails: local modules",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/node_modules/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});
	testFixture({
		id: "basic-relative-path",
		title: "Accepts: relative path, index.ts",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/modules/mymodule.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/modules/mymodule.js", "lib/modules/mymodule.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[RELATIVE PATH] 123"]
	});
	testFixture({
		id: "basic-relative-path-index",
		title: "Accepts: relative path, index.ts",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[RELATIVE PATH INDEX] 123"]
	});
	testFixture({
		id: "basic-relative-path-package",
		title: "Fails: relative path, custom.ts, package.json",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/custom.ts", "src/mymodule/package.json"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/custom.js", "lib/mymodule/custom.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});
});

describe("[node] JSON", function() {
	testFixture({
		id: "json-import-from",
		title: "Fails: import from",
		sourceFiles: ["package.json", "tsconfig.json", "src/data.json", "src/main.ts"],
		expectTypecheckError: true
	});
	testFixture({
		id: "json-import-star",
		title: "Accepts: import * from",
		sourceFiles: ["package.json", "tsconfig.json", "src/data.json", "src/main.ts"],
		tscFiles: ["lib/data.json", "lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ['[JSON IMPORT STAR] is ["hello","world"]']
	});
	testFixture({
		id: "json-import-require",
		title: "Accepts: import = require",
		sourceFiles: ["package.json", "tsconfig.json", "src/data.json", "src/main.ts"],
		tscFiles: ["lib/data.json", "lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ['[JSON IMPORT REQUIRE] is ["hello","world"]']
	});
	testFixture({
		id: "json-require",
		title: "Fails: require (without copy)",
		sourceFiles: ["package.json", "tsconfig.json", "src/data.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});
	testFixture({
		id: "json-require",
		title: "Accepts: require (with copy)",
		sourceFiles: ["package.json", "tsconfig.json", "src/data.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		copyFiles: {
			"src/data.json": "lib/data.json"
		},
		expectedOutput: ['[JSON REQUIRE] is ["hello","world"]']
	});
});

describe("[node] Import a CommonJS default object, without .d.ts", function() {
	testFixture({
		id: "commonjs-untyped-default-import-from",
		title: "Fails: import … from",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.js"],
		expectTypecheckError: true
	});
	testFixture({
		id: "commonjs-untyped-default-import-star",
		title: "Fails: import * from",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.js"],
		expectTypecheckError: true
	});
	testFixture({
		id: "commonjs-untyped-default-import-require",
		title: "Fails: import = require",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.js"],
		expectTypecheckError: true
	});
	testFixture({
		id: "commonjs-untyped-default-require",
		title: "Accepts: require",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.js"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		copyFiles: {
			"src/mymodule/index.js": "lib/mymodule/index.js"
		},
		mainFilename: "lib/main.js",
		expectedOutput: ["[COMMONJS UNTYPED DEFAULT, REQUIRE] Type is function"]
	});
});

describe("[node] Import a CommonJS named function, without .d.ts", function() {
	testFixture({
		id: "commonjs-untyped-named-import-from",
		title: "Fails: import … from",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.js"],
		expectTypecheckError: true
	});
	testFixture({
		id: "commonjs-untyped-named-import-star",
		title: "Fails: import * from",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.js"],
		expectTypecheckError: true
	});
	testFixture({
		id: "commonjs-untyped-named-import-require",
		title: "Fails: import = require",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.js"],
		expectTypecheckError: true
	});
	testFixture({
		id: "commonjs-untyped-named-require",
		title: "Accepts: require",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.js"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		copyFiles: {
			"src/mymodule/index.js": "lib/mymodule/index.js"
		},
		mainFilename: "lib/main.js",
		expectedOutput: ["[COMMONJS UNTYPED NAMED, REQUIRE] Type is function"]
	});
});

describe("[node] Import a CommonJS default object, with .d.ts", function() {
	testFixture({
		id: "commonjs-typed-default-import-from",
		title: "Fails: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		expectTypecheckError: true
	});
	testFixture({
		id: "commonjs-typed-default-import-star",
		title: "Fails: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		expectTypecheckError: true
	});
	testFixture({
		id: "commonjs-typed-default-import-require",
		title: "Fails: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		copyFiles: {
			"src/mymodule/package.json": "lib/mymodule/package.json",
			"src/mymodule/mymodule.js": "lib/mymodule/mymodule.js"
		},
		mainFilename: "lib/main.js",
		expectedOutput: ["[COMMONJS TYPED DEFAULT, IMPORT REQUIRE] Type is function"]
	});
	testFixture({
		id: "commonjs-typed-default-require",
		title: "Accepts: require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		copyFiles: {
			"src/mymodule/package.json": "lib/mymodule/package.json",
			"src/mymodule/mymodule.js": "lib/mymodule/mymodule.js"
		},
		mainFilename: "lib/main.js",
		expectedOutput: ["[COMMONJS TYPED DEFAULT, REQUIRE] Type is function"]
	});
});

describe("[node] Import a CommonJS named function, with .d.ts", function() {
	testFixture({
		id: "commonjs-typed-named-import-from",
		title: "Accepts: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		copyFiles: {
			"src/mymodule/package.json": "lib/mymodule/package.json",
			"src/mymodule/mymodule.js": "lib/mymodule/mymodule.js"
		},
		mainFilename: "lib/main.js",
		expectedOutput: ["[COMMONJS TYPED NAMED, IMPORT FROM] Type is function"]
	});
	testFixture({
		id: "commonjs-typed-named-import-star",
		title: "Accepts: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		copyFiles: {
			"src/mymodule/package.json": "lib/mymodule/package.json",
			"src/mymodule/mymodule.js": "lib/mymodule/mymodule.js"
		},
		mainFilename: "lib/main.js",
		expectedOutput: ["[COMMONJS TYPED NAMED, IMPORT STAR] Type is function"]
	});
	testFixture({
		id: "commonjs-typed-named-import-require",
		title: "Accepts: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		copyFiles: {
			"src/mymodule/package.json": "lib/mymodule/package.json",
			"src/mymodule/mymodule.js": "lib/mymodule/mymodule.js"
		},
		mainFilename: "lib/main.js",
		expectedOutput: ["[COMMONJS TYPED NAMED, IMPORT REQUIRE] Type is function"]
	});
	testFixture({
		id: "commonjs-typed-named-require",
		title: "Accepts: require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		copyFiles: {
			"src/mymodule/package.json": "lib/mymodule/package.json",
			"src/mymodule/mymodule.js": "lib/mymodule/mymodule.js"
		},
		mainFilename: "lib/main.js",
		expectedOutput: ["[COMMONJS TYPED NAMED, REQUIRE] Type is function"]
	});
});

describe("[node] Import an ES Module default object", function() {
	testFixture({
		id: "export-default-import-from",
		title: "Accepts: import … from",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ['[EXPORT DEFAULT, IMPORT FROM] Value is {"mynumber":123}']
	});
	testFixture({
		id: "export-default-import-star",
		title: "Accepts: import * from",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ['[EXPORT DEFAULT, IMPORT STAR] Value is {"default":{"mynumber":123}}']
	});
	testFixture({
		id: "export-default-import-require",
		title: "Fails: import = require",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ['[EXPORT DEFAULT, IMPORT REQUIRE] Value is {"default":{"mynumber":123}}']
	});
	testFixture({
		id: "export-default-require",
		title: 'Accepts: require (wrapped in "{default: THEMODULE}")',
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ['[EXPORT DEFAULT, REQUIRE] Value is {"default":{"mynumber":123}}']
	});
});

describe("[node] Import an ES Module named function", function() {
	testFixture({
		id: "export-named-import-from",
		title: "Accepts: import … from",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[EXPORT NAMED, IMPORT FROM] Type is function"]
	});
	testFixture({
		id: "export-named-import-star",
		title: "Accepts: import * from",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[EXPORT NAMED, IMPORT STAR] Type is function"]
	});
	testFixture({
		id: "export-named-import-require",
		title: "Fails: import = require",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[EXPORT NAMED, IMPORT REQUIRE] Type is function"]
	});
	testFixture({
		id: "export-named-require",
		title: "Accepts: require",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts", "src/mymodule/index.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map", "lib/mymodule/index.js", "lib/mymodule/index.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[EXPORT NAMED, REQUIRE] Type is function"]
	});
});

describe("[node] Class & Properties", function() {
	testFixture({
		id: "class-not-initialized",
		title: "Accepts: public property",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS NOT INITIALIZED] undefined"]
	});
	testFixture({
		id: "class-initialized",
		title: "Accepts: public property, initialized",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS INITIALIZED] number"]
	});
	testFixture({
		id: "class-constructor-property-not-initialized",
		title: "Accepts: public property, constructor",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS CONSTRUCTOR PROPERTY NOT INITIALIZED] number"]
	});
	testFixture({
		id: "class-constructor-property-initialized",
		title: "Accepts: public property, initialized, constructor",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS CONSTRUCTOR PROPERTY INITIALIZED] number"]
	});
	testFixture({
		id: "class-generic-property-constructor",
		title: "Accepts: public property, generic type, constructor",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS GENERIC PROPERTY CONSTRUCTOR] number"]
	});
	testFixture({
		id: "class-generic-property-not-initialized",
		title: "Accepts: public property, generic type",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS GENERIC PROPERTY NOT INITIALIZED] undefined"]
	});
	testFixture({
		id: "class-getter-setter-constructor",
		title: "Accepts: private property, getter setter, constructor",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS GETTER SETTER CONSTRUCTOR] number"]
	});
	testFixture({
		id: "class-getter-setter-initialized",
		title: "Accepts: private property, getter setter, initialized",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS GETTER SETTER INITIALIZED] number"]
	});
	testFixture({
		id: "class-getter-setter-not-initialized",
		title: "Accepts: private property, getter setter",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS GETTER SETTER NOT INITIALIZED] undefined"]
	});
	testFixture({
		id: "class-optional-property-initialized",
		title: "Accepts: public property, optional, initialized",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS OPTIONAL PROPERTY INITIALIZED] number"]
	});
	testFixture({
		id: "class-optional-property-initialized-constructor",
		title: "Accepts: public property, optional, initialized, constructor",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS OPTIONAL PROPERTY INITIALIZED CONSTRUCTOR] number"]
	});
	testFixture({
		id: "class-optional-property-not-initialized",
		title: "Accepts: public property, optional",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS OPTIONAL PROPERTY NOT INITIALIZED] undefined"]
	});
	testFixture({
		id: "class-optional-property-not-initialized-constructor",
		title: "Accepts: public property, optional, constructor",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[CLASS OPTIONAL PROPERTY NOT INITIALIZED CONSTRUCTOR] number"]
	});
});

describe("[node] Include", function() {
	testFixture({
		id: "include-src-default",
		title: "Accepts: src, default list",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[INCLUDE SRC DEFAULT] Hello World"]
	});
	testFixture({
		id: "include-src-inside",
		title: "Accepts: src, inside list",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[INCLUDE SRC INSIDE] Hello World"]
	});
	testFixture({
		id: "include-src-outside",
		title: "Fails: src, outside list",
		sourceFiles: ["package.json", "tsconfig.json", "src/main.ts"],
		expectTypecheckError: true
	});

	testFixture({
		id: "include-custom-default",
		title: "Accepts: custom path, default list",
		sourceFiles: ["package.json", "tsconfig.json", "custom-path/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[INCLUDE CUSTOM DEFAULT] Hello World"]
	});
	testFixture({
		id: "include-custom-inside",
		title: "Accepts: custom path, inside list",
		sourceFiles: ["package.json", "tsconfig.json", "custom-path/main.ts"],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectedOutput: ["[INCLUDE CUSTOM INSIDE] Hello World"]
	});
	testFixture({
		id: "include-custom-outside",
		title: "Fails: custom path, outside list",
		sourceFiles: ["package.json", "tsconfig.json", "custom-path/main.ts"],
		expectTypecheckError: true
	});
});

describe("[node] Include node_modules", function() {
	testFixture({
		id: "npm-ts-index-default",
		title: "Fails: TS index, JS index, no include",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/index.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});
	testFixture({
		id: "npm-ts-index-inside",
		title: "Accepts: TS index.ts, inside list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/index.ts"
		],
		tscFiles: [
			"lib/src/main.js",
			"lib/src/main.js.map",
			"lib/node_modules/fake1/index.js",
			"lib/node_modules/fake1/index.js.map"
		],
		mainFilename: "lib/src/main.js",
		expectedOutput: ["[NPM TS INDEX INSIDE] Value is 111"]
	});
	testFixture({
		id: "npm-ts-index-outside",
		title: "Fails: TS index.ts, outside list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/index.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});

	testFixture({
		id: "npm-ts-package-default",
		title: "Fails: TS package.json, JS index, no include",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/package.json",
			"node_modules/fake1/custom.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});
	testFixture({
		id: "npm-ts-package-inside",
		title: "Fails: TS package.json, inside list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/package.json",
			"node_modules/fake1/custom.ts"
		],
		tscFiles: [
			"lib/src/main.js",
			"lib/src/main.js.map",
			"lib/node_modules/fake1/custom.js",
			"lib/node_modules/fake1/custom.js.map"
		],
		mainFilename: "lib/src/main.js",
		expectRuntimeError: true
	});
	testFixture({
		id: "npm-ts-package-outside",
		title: "Fails: TS package.json, outside list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/package.json",
			"node_modules/fake1/custom.ts"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});

	testFixture({
		id: "npm-ts-index-js-index-default",
		title: "Fails: TS index, JS index, no include",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/index.ts",
			"node_modules/fake2/index.js"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});
	testFixture({
		id: "npm-ts-index-inside-js-index-inside",
		title: "Accepts: TS index inside, JS index inside",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/index.ts",
			"node_modules/fake2/index.js"
		],
		tscFiles: [
			"lib/src/main.js",
			"lib/src/main.js.map",
			"lib/node_modules/fake1/index.js",
			"lib/node_modules/fake1/index.js.map"
		],
		mainFilename: "lib/src/main.js",
		expectedOutput: ["[NPM TS INDEX INSIDE JS INDEX INSIDE] Value is 111 222"]
	});
	testFixture({
		id: "npm-ts-index-outside-js-index-inside",
		title: "Fails: TS index outside, JS index inside",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"src/main.ts",
			"node_modules/fake1/index.ts",
			"node_modules/fake2/index.js"
		],
		tscFiles: ["lib/main.js", "lib/main.js.map"],
		mainFilename: "lib/main.js",
		expectRuntimeError: true
	});
});
