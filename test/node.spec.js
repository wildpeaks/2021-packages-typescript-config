/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {join} = require('path');
const {deepStrictEqual} = require('assert');
const {copySync} = require('fs-extra');
const {copyConfig, compileFixture, execCommand} = require('./shared');
const tmpFolder = join(__dirname, 'tmp/node');


function testFixture({id, title, sourceFiles, tscFiles, copyFiles, mainFilename, expectTypecheckError, expectRuntimeError, expectedOutput} = {copyFiles: {}}){
	it(title, /* @this */ async function(){
		this.slow(10000);
		this.timeout(15000);

		const typechecked = await compileFixture('node', `node/${id}`, 'tsc --build tsconfig.json');
		deepStrictEqual(typechecked.filesBefore, sourceFiles.sort(), 'Before TSC');
		if (expectTypecheckError){
			if (typechecked.errors.length === 0){
				throw new Error('Expected fixture to fail typecheck');
			}
			return;
		}
		deepStrictEqual(typechecked.errors, [], 'No TSC errors');
		deepStrictEqual(typechecked.filesAfter, sourceFiles.concat(tscFiles).sort(), 'After TSC');

		if ((typeof copyFiles === 'object') && (copyFiles !== null)){
			for (const relativeSrc in copyFiles){
				const relativeDest = copyFiles[relativeSrc];
				copySync(
					join(tmpFolder, relativeSrc),
					join(tmpFolder, relativeDest)
				);
			}
		}

		const runtime = await execCommand(`node ${mainFilename}`, typechecked.folder);
		if (expectRuntimeError){
			if (runtime.errors.length === 0){
				throw new Error('Expected fixtured to fail runtime');
			}
			return;
		}
		deepStrictEqual(
			runtime,
			{
				errors: [],
				output: expectedOutput
			}
		);
	});
}


before('Setup', function(){
	copyConfig('node');
});


describe('[node] Basic features', function(){
	testFixture({
		id: 'basic-cli',
		title: 'CLI',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[CLI] Hello World'
		]
	});
});


describe('[node] JSON', function(){
	testFixture({
		id: 'json-import-from',
		title: 'Fails: import from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'json-import-star',
		title: 'Accepts: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/data.json',
			'lib/main.js',
			'lib/main.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[JSON IMPORT STAR] is ["hello","world"]'
		]
	});
	testFixture({
		id: 'json-import-require',
		title: 'Accepts: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/data.json',
			'lib/main.js',
			'lib/main.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[JSON IMPORT REQUIRE] is ["hello","world"]'
		]
	});
	testFixture({
		id: 'json-require',
		title: 'Fails: require (without copy)',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		mainFilename: 'lib/main.js',
		expectRuntimeError: true
	});
	testFixture({
		id: 'json-require',
		title: 'Accepts: require (with copy)',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/data.json',
			'src/main.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		mainFilename: 'lib/main.js',
		copyFiles: {
			'src/data.json': 'lib/data.json'
		},
		expectedOutput: [
			'[JSON REQUIRE] is ["hello","world"]'
		]
	});
});


describe('[node] Import a CommonJS default object, without .d.ts', function(){
	testFixture({
		id: 'commonjs-untyped-default-import-from',
		title: 'Fails: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'commonjs-untyped-default-import-star',
		title: 'Fails: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'commonjs-untyped-default-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'commonjs-untyped-default-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.js'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		copyFiles: {
			'src/node_modules/mymodule/index.js': 'lib/node_modules/mymodule/index.js'
		},
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[COMMONJS UNTYPED DEFAULT, REQUIRE] Type is function'
		]
	});
});


describe('[node] Import a CommonJS named function, without .d.ts', function(){
	testFixture({
		id: 'commonjs-untyped-named-import-from',
		title: 'Fails: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'commonjs-untyped-named-import-star',
		title: 'Fails: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'commonjs-untyped-named-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.js'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'commonjs-untyped-named-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.js'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		copyFiles: {
			'src/node_modules/mymodule/index.js': 'lib/node_modules/mymodule/index.js'
		},
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[COMMONJS UNTYPED NAMED, REQUIRE] Type is function'
		]
	});
});


describe('[node] Import a CommonJS default object, with .d.ts', function(){
	testFixture({
		id: 'commonjs-typed-default-import-from',
		title: 'Fails: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'commonjs-typed-default-import-star',
		title: 'Fails: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		expectTypecheckError: true
	});
	testFixture({
		id: 'commonjs-typed-default-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		copyFiles: {
			'src/node_modules/mymodule/package.json': 'lib/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js': 'lib/node_modules/mymodule/mymodule.js'
		},
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[COMMONJS TYPED DEFAULT, IMPORT REQUIRE] Type is function'
		]
	});
	testFixture({
		id: 'commonjs-typed-default-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		copyFiles: {
			'src/node_modules/mymodule/package.json': 'lib/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js': 'lib/node_modules/mymodule/mymodule.js'
		},
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[COMMONJS TYPED DEFAULT, REQUIRE] Type is function'
		]
	});
});


describe('[node] Import a CommonJS named function, with .d.ts', function(){
	testFixture({
		id: 'commonjs-typed-named-import-from',
		title: 'Accepts: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		copyFiles: {
			'src/node_modules/mymodule/package.json': 'lib/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js': 'lib/node_modules/mymodule/mymodule.js'
		},
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[COMMONJS TYPED NAMED, IMPORT FROM] Type is function'
		]
	});
	testFixture({
		id: 'commonjs-typed-named-import-star',
		title: 'Accepts: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		copyFiles: {
			'src/node_modules/mymodule/package.json': 'lib/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js': 'lib/node_modules/mymodule/mymodule.js'
		},
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[COMMONJS TYPED NAMED, IMPORT STAR] Type is function'
		]
	});
	testFixture({
		id: 'commonjs-typed-named-import-require',
		title: 'Accepts: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		copyFiles: {
			'src/node_modules/mymodule/package.json': 'lib/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js': 'lib/node_modules/mymodule/mymodule.js'
		},
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[COMMONJS TYPED NAMED, IMPORT REQUIRE] Type is function'
		]
	});
	testFixture({
		id: 'commonjs-typed-named-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js',
			'src/node_modules/mymodule/mymodule.d.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map'
		],
		copyFiles: {
			'src/node_modules/mymodule/package.json': 'lib/node_modules/mymodule/package.json',
			'src/node_modules/mymodule/mymodule.js': 'lib/node_modules/mymodule/mymodule.js'
		},
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[COMMONJS TYPED NAMED, REQUIRE] Type is function'
		]
	});
});


describe('[node] Import an ES Module default object', function(){
	testFixture({
		id: 'export-default-import-from',
		title: 'Accepts: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map',
			'lib/node_modules/mymodule/index.js',
			'lib/node_modules/mymodule/index.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[EXPORT DEFAULT, IMPORT FROM] Value is {"mynumber":123}'
		]
	});
	testFixture({
		id: 'export-default-import-star',
		title: 'Accepts: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map',
			'lib/node_modules/mymodule/index.js',
			'lib/node_modules/mymodule/index.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[EXPORT DEFAULT, IMPORT STAR] Value is {"default":{"mynumber":123}}'
		]
	});
	testFixture({
		id: 'export-default-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map',
			'lib/node_modules/mymodule/index.js',
			'lib/node_modules/mymodule/index.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[EXPORT DEFAULT, IMPORT REQUIRE] Value is {"default":{"mynumber":123}}'
		]
	});
	testFixture({
		id: 'export-default-require',
		title: 'Accepts: require (wrapped in "{default: THEMODULE}")',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map',
			'lib/node_modules/mymodule/index.js',
			'lib/node_modules/mymodule/index.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[EXPORT DEFAULT, REQUIRE] Value is {"default":{"mynumber":123}}'
		]
	});
});


describe('[node] Import an ES Module named function', function(){
	testFixture({
		id: 'export-named-import-from',
		title: 'Accepts: import … from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map',
			'lib/node_modules/mymodule/index.js',
			'lib/node_modules/mymodule/index.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[EXPORT NAMED, IMPORT FROM] Type is function'
		]
	});
	testFixture({
		id: 'export-named-import-star',
		title: 'Accepts: import * from',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map',
			'lib/node_modules/mymodule/index.js',
			'lib/node_modules/mymodule/index.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[EXPORT NAMED, IMPORT STAR] Type is function'
		]
	});
	testFixture({
		id: 'export-named-import-require',
		title: 'Fails: import = require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map',
			'lib/node_modules/mymodule/index.js',
			'lib/node_modules/mymodule/index.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[EXPORT NAMED, IMPORT REQUIRE] Type is function'
		]
	});
	testFixture({
		id: 'export-named-require',
		title: 'Accepts: require',
		sourceFiles: [
			'package.json',
			'tsconfig.json',
			'src/main.ts',
			'src/node_modules/mymodule/index.ts'
		],
		tscFiles: [
			'lib/main.js',
			'lib/main.js.map',
			'lib/node_modules/mymodule/index.js',
			'lib/node_modules/mymodule/index.js.map'
		],
		mainFilename: 'lib/main.js',
		expectedOutput: [
			'[EXPORT NAMED, REQUIRE] Type is function'
		]
	});
});
