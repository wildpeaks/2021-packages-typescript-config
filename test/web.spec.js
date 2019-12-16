/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const {join} = require("path");
const express = require("express");
const puppeteer = require("puppeteer");
const {copyConfig, compileFixture} = require("./shared");

let app;
let server;
const port = 8888;
const outputFolder = join(__dirname, `tmp/web/dist`);

function sleep(duration) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
}

function testFixture({id, title, sourceFiles, tscFiles, webpackFiles, expectTypecheckError, expectBuildError, expectedHTML}) {
	it(
		title,
		/* @this */ async function() {
			this.slow(30000);
			this.timeout(30000);

			const typechecked = await compileFixture("web", `web/${id}`, "tsc --build tsconfig.json");
			deepStrictEqual(typechecked.filesBefore, sourceFiles.sort(), "Before TSC");
			if (expectTypecheckError) {
				if (typechecked.errors.length === 0) {
					throw new Error("Expected fixture to fail typecheck");
				}
			} else {
				deepStrictEqual(typechecked.errors, [], "No TSC errors");
				deepStrictEqual(typechecked.filesAfter, sourceFiles.concat(tscFiles).sort(), "After TSC");
			}

			const compiled = await compileFixture("web", `web/${id}`, "webpack");
			deepStrictEqual(compiled.filesBefore, sourceFiles.sort(), "Before Webpack");
			if (expectBuildError) {
				if (compiled.errors.length === 0) {
					throw new Error("Expected fixture to fail build");
				}
			} else {
				deepStrictEqual(compiled.errors, [], "No Webpack errors");
				deepStrictEqual(compiled.filesAfter, sourceFiles.concat(webpackFiles).sort(), "After Webpack");
				const browser = await puppeteer.launch();
				try {
					const page = await browser.newPage();
					await page.goto(`http://localhost:${port}/`);
					await sleep(300);
					const actualHTML = await page.evaluate(() => {
						const el = document.getElementById("hello");
						if (el === null) {
							return "Error: #hello not found";
						}
						return el.innerHTML;
					});
					strictEqual(actualHTML, expectedHTML);
				} finally {
					await browser.close();
				}
			}
		}
	);
}

before("Setup", function() {
	return new Promise(resolve => {
		copyConfig("web");
		app = express();
		app.use(express.static(outputFolder));
		server = app.listen(port, () => {
			resolve();
		});
	});
});

after("Shutdown", function() {
	return new Promise(resolve => {
		server.close(() => {
			resolve();
		});
	});
});

describe("[web] Basic features", function() {
	testFixture({
		id: "basic-local-modules",
		title: "Accepts: local modules",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/node_modules/mymodule/index.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-basic-local-modules.js"],
		expectedHTML: "[LOCAL MODULES] 123"
	});
	testFixture({
		id: "basic-relative-path",
		title: "Accepts: relative path, index.ts",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/modules/mymodule.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/modules/mymodule.js",
			"lib/modules/mymodule.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-basic-relative-path.js"],
		expectedHTML: "[RELATIVE PATH] 123"
	});
	testFixture({
		id: "basic-relative-path-index",
		title: "Accepts: relative path, index.ts",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/mymodule/index.js",
			"lib/mymodule/index.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-basic-relative-path-index.js"],
		expectedHTML: "[RELATIVE PATH INDEX] 123"
	});
	testFixture({
		id: "basic-relative-path-package",
		title: "Accepts: relative path, custom.ts, package.json",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/custom.ts",
			"src/mymodule/package.json"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/mymodule/custom.js",
			"lib/mymodule/custom.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-basic-relative-path-package.js"],
		expectedHTML: "[RELATIVE PATH PACKAGE] 123"
	});
	testFixture({
		id: "basic-dom",
		title: "Accepts: DOM",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-basic-dom.js"],
		expectedHTML: "[BASIC DOM] Type is object"
	});
	testFixture({
		id: "basic-webworker",
		title: "Accepts: Web Workers",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/types.d.ts",
			"src/application.ts",
			"src/example.webworker.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/example.webworker.js",
			"lib/example.webworker.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-basic-webworker.js", "dist/example.webworker.js"],
		expectedHTML: "[REQUEST] MAIN to WORKER [RESPONSE] WORKER to MAIN"
	});
});

describe('[web] Toplevel variables are global without "import" or "export"', function() {
	testFixture({
		id: "entries",
		title: "Fails typecheck: global, no export or import",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application1.ts",
			"src/application2.ts"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-entries-1.js",
			"dist/app-entries-2.js",
			"dist/index.html",
			"dist/index1.html"
		],
		expectedHTML: '[ENTRIES] Value is {"hello":"APP2"}'
	});
	testFixture({
		id: "entries-require",
		title: "Fails typecheck: Global, require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/shared.js",
			"src/application1.ts",
			"src/application2.ts"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-entries-require-1.js",
			"dist/app-entries-require-2.js",
			"dist/index.html",
			"dist/index1.html"
		],
		expectedHTML: '[ENTRIES REQUIRE] Value is {"hello":"APP2"}'
	});
	testFixture({
		id: "entries-export",
		title: "Accepts: local, export {}",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application1.ts",
			"src/application2.ts"
		],
		tscFiles: ["lib/application1.js", "lib/application1.js.map", "lib/application2.js", "lib/application2.js.map"],
		webpackFiles: [
			"dist/index1.html",
			"dist/index.html",
			"dist/app-entries-export-1.js",
			"dist/app-entries-export-2.js"
		],
		expectedHTML: '[ENTRIES EXPORT] Value is {"hello":"APP2"}'
	});
	testFixture({
		id: "entries-import-from",
		title: "Accepts: local, import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/shared.ts",
			"src/application1.ts",
			"src/application2.ts"
		],
		tscFiles: [
			"lib/shared.js",
			"lib/shared.js.map",
			"lib/application1.js",
			"lib/application1.js.map",
			"lib/application2.js",
			"lib/application2.js.map"
		],
		webpackFiles: [
			"dist/index1.html",
			"dist/index.html",
			"dist/app-entries-import-from-1.js",
			"dist/app-entries-import-from-2.js"
		],
		expectedHTML: '[ENTRIES IMPORT FROM] Value is {"hello":"APP2"}'
	});
	testFixture({
		id: "entries-import-star",
		title: "Accepts: local, import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/shared.ts",
			"src/application1.ts",
			"src/application2.ts"
		],
		tscFiles: [
			"lib/shared.js",
			"lib/shared.js.map",
			"lib/application1.js",
			"lib/application1.js.map",
			"lib/application2.js",
			"lib/application2.js.map"
		],
		webpackFiles: [
			"dist/index1.html",
			"dist/index.html",
			"dist/app-entries-import-star-1.js",
			"dist/app-entries-import-star-2.js"
		],
		expectedHTML: '[ENTRIES IMPORT STAR] Value is {"hello":"APP2"}'
	});
	testFixture({
		id: "entries-import-require",
		title: "Fails typecheck: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/shared.js",
			"src/application1.ts",
			"src/application2.ts"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-entries-import-require-1.js",
			"dist/app-entries-import-require-2.js",
			"dist/index.html",
			"dist/index1.html"
		],
		expectedHTML: '[ENTRIES IMPORT REQUIRE] Value is {"hello":"APP2"}'
	});
});

describe("[web] Import a CommonJS default object, without .d.ts", function() {
	testFixture({
		id: "commonjs-untyped-default-import-from",
		title: "Fails typecheck: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.js"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-commonjs-untyped-default-import-from.js",
			"dist/index.html"
		],
		expectedHTML: "[COMMONJS UNTYPED DEFAULT, IMPORT FROM] Type is function"
	});
	testFixture({
		id: "commonjs-untyped-default-import-star",
		title: "Fails typecheck: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.js"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-commonjs-untyped-default-import-star.js",
			"dist/index.html"
		],
		expectedHTML: "[COMMONJS UNTYPED DEFAULT, IMPORT STAR] Type is function"
	});
	testFixture({
		id: "commonjs-untyped-default-import-require",
		title: "Fails typecheck: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.js"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-commonjs-untyped-default-import-require.js",
			"dist/index.html"
		],
		expectedHTML: "[COMMONJS UNTYPED DEFAULT, IMPORT REQUIRE] Type is undefined"
	});
	testFixture({
		id: "commonjs-untyped-default-require",
		title: "Accepts: require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.js"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-commonjs-untyped-default-require.js"],
		expectedHTML: "[COMMONJS UNTYPED DEFAULT, REQUIRE] Type is function"
	});
});

describe("[web] Import a CommonJS named function, without .d.ts", function() {
	testFixture({
		id: "commonjs-untyped-named-import-from",
		title: "Fails typecheck: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.js"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-commonjs-untyped-named-import-from.js",
			"dist/index.html"
		],
		expectedHTML: "[COMMONJS UNTYPED NAMED, IMPORT FROM] Type is function"
	});
	testFixture({
		id: "commonjs-untyped-named-import-star",
		title: "Fails: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.js"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-commonjs-untyped-named-import-star.js",
			"dist/index.html"
		],
		expectedHTML: "[COMMONJS UNTYPED NAMED, IMPORT STAR] Type is function"
	});
	testFixture({
		id: "commonjs-untyped-named-import-require",
		title: "Fails: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.js"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/app-commonjs-untyped-named-import-require.js",
			"dist/index.html"
		],
		expectedHTML: "Error: #hello not found"
	});
	testFixture({
		id: "commonjs-untyped-named-require",
		title: "Accepts: require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.js"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-commonjs-untyped-named-require.js"],
		expectedHTML: "[COMMONJS UNTYPED NAMED, REQUIRE] Type is function"
	});
});

describe("[web] Import a CommonJS default object, with .d.ts", function() {
	testFixture({
		id: "commonjs-typed-default-import-from",
		title: "Fails typecheck: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-commonjs-typed-default-import-from.js"],
		expectedHTML: "[COMMONJS TYPED DEFAULT, IMPORT FROM] Type is function"
	});
	testFixture({
		id: "commonjs-typed-default-import-star",
		title: "Fails typecheck: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-commonjs-typed-default-import-star.js"],
		expectedHTML: "[COMMONJS TYPED DEFAULT, IMPORT STAR] Type is function"
	});
	testFixture({
		id: "commonjs-typed-default-import-require",
		title: "Fails typecheck: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-commonjs-typed-default-import-require.js"],
		expectedHTML: "[COMMONJS TYPED DEFAULT, IMPORT REQUIRE] Type is undefined"
	});
	testFixture({
		id: "commonjs-typed-default-require",
		title: "Accepts: require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-commonjs-typed-default-require.js"],
		expectedHTML: "[COMMONJS TYPED DEFAULT, REQUIRE] Type is function"
	});
});

describe("[web] Import a CommonJS named function, with .d.ts", function() {
	testFixture({
		id: "commonjs-typed-named-import-from",
		title: "Accepts: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-commonjs-typed-named-import-from.js"],
		expectedHTML: "[COMMONJS TYPED NAMED, IMPORT FROM] Type is function"
	});
	testFixture({
		id: "commonjs-typed-named-import-star",
		title: "Accepts: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-commonjs-typed-named-import-star.js"],
		expectedHTML: "[COMMONJS TYPED NAMED, IMPORT STAR] Type is function"
	});
	testFixture({
		id: "commonjs-typed-named-import-require",
		title: "Fails: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-commonjs-typed-named-import-require.js"],
		expectedHTML: "Error: #hello not found"

	});
	testFixture({
		id: "commonjs-typed-named-require",
		title: "Accepts: require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/package.json",
			"src/mymodule/mymodule.js",
			"src/mymodule/mymodule.d.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-commonjs-typed-named-require.js"],
		expectedHTML: "[COMMONJS TYPED NAMED, REQUIRE] Type is function"
	});
});

describe("[web] Import an ES Module default object", function() {
	testFixture({
		id: "export-default-import-from",
		title: "Accepts: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/mymodule/index.js",
			"lib/mymodule/index.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-export-default-import-from.js"],
		expectedHTML: '[EXPORT DEFAULT, IMPORT FROM] Value is {"mynumber":123}'
	});
	testFixture({
		id: "export-default-import-star",
		title: "Accepts: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/mymodule/index.js",
			"lib/mymodule/index.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-export-default-import-star.js"],
		expectedHTML: '[EXPORT DEFAULT, IMPORT STAR] Value is {"default":{"mynumber":123}}'
	});
	testFixture({
		id: "export-default-import-require",
		title: "Fails: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-export-default-import-require.js"],
		expectedHTML: "Error: #hello not found"
	});
	testFixture({
		id: "export-default-require",
		title: 'Accepts: require (wrapped in "{default: THEMODULE}")',
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/mymodule/index.js",
			"lib/mymodule/index.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-export-default-require.js"],
		expectedHTML: '[EXPORT DEFAULT, REQUIRE] Value is {"default":{"mynumber":123}}'
	});
});

describe("[web] Import an ES Module named function", function() {
	testFixture({
		id: "export-named-import-from",
		title: "Accepts: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/mymodule/index.js",
			"lib/mymodule/index.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-export-named-import-from.js"],
		expectedHTML: "[EXPORT NAMED, IMPORT FROM] Type is function"
	});
	testFixture({
		id: "export-named-import-star",
		title: "Accepts: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/mymodule/index.js",
			"lib/mymodule/index.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-export-named-import-star.js"],
		expectedHTML: "[EXPORT NAMED, IMPORT STAR] Type is function"
	});
	testFixture({
		id: "export-named-import-require",
		title: "Fails: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-export-named-import-require.js"],
		expectedHTML: "Error: #hello not found"
	});
	testFixture({
		id: "export-named-require",
		title: "Accepts: require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/mymodule/index.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/mymodule/index.js",
			"lib/mymodule/index.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-export-named-require.js"],
		expectedHTML: "[EXPORT NAMED, REQUIRE] Type is function"
	});
});

describe("[web] Preact", function() {
	testFixture({
		id: "preact-h",
		title: "Accepts: h()",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-preact-h.js"],
		expectedHTML: '<article class="example">[PREACT H] Hello World</article>'
	});
	testFixture({
		id: "preact-class",
		title: "Accepts: Class Component",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/components/MyComponentClass.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/components/MyComponentClass.js",
			"lib/components/MyComponentClass.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-preact-class.js"],
		expectedHTML: '<article class="example">[PREACT CLASS] PROP Hello World STATE 123</article>'
	});
	testFixture({
		id: "preact-function",
		title: "Accepts: Functional Component",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/components/MyFunctionalComponent.ts"
		],
		tscFiles: [
			"lib/application.js",
			"lib/application.js.map",
			"lib/components/MyFunctionalComponent.js",
			"lib/components/MyFunctionalComponent.js.map"
		],
		webpackFiles: ["dist/index.html", "dist/app-preact-function.js"],
		expectedHTML: '<article class="example">[PREACT FUNCTION] Hello World</article>'
	});
	testFixture({
		id: "preact-tsx",
		title: "Accepts: TSX",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.tsx"],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-preact-tsx.js"],
		expectedHTML: '<article class="example">[PREACT TSX] Hello World</article>'
	});
});

describe("[web] JPEG, PNG, SVG", function() {
	testFixture({
		id: "images-import-from",
		title: "Accepts: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/example1.jpg",
			"src/example2.png",
			"src/example3.svg"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: [
			"dist/index.html",
			"dist/app-images-import-from.js",
			"dist/assets/example1.jpg",
			"dist/assets/example2.png",
			"dist/assets/example3.svg"
		],
		expectedHTML:
			'<div>"/assets/example1.jpg"</div><div>"/assets/example2.png"</div><div>"/assets/example3.svg"</div>'
	});
	testFixture({
		id: "images-import-star",
		title: 'Accepts: import * from (wrapped in "{default: THEMODULE}")',
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/example1.jpg",
			"src/example2.png",
			"src/example3.svg"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: [
			"dist/index.html",
			"dist/app-images-import-star.js",
			"dist/assets/example1.jpg",
			"dist/assets/example2.png",
			"dist/assets/example3.svg"
		],
		expectedHTML:
			'<div>{"default":"/assets/example1.jpg"}</div><div>{"default":"/assets/example2.png"}</div><div>{"default":"/assets/example3.svg"}</div>'
	});
	testFixture({
		id: "images-import-require",
		title: "Fails: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/example1.jpg",
			"src/example2.png",
			"src/example3.svg"
		],
		expectTypecheckError: true,
		webpackFiles: [
			"dist/index.html",
			"dist/app-images-import-require.js"
		],
		expectedHTML: ""

	});
	testFixture({
		id: "images-require",
		title: 'Accepts: require (wrapped in "{default: THEMODULE}")',
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/example1.jpg",
			"src/example2.png",
			"src/example3.svg"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: [
			"dist/index.html",
			"dist/app-images-require.js",
			"dist/assets/example1.jpg",
			"dist/assets/example2.png",
			"dist/assets/example3.svg"
		],
		expectedHTML:
			'<div>{"default":"/assets/example1.jpg"}</div><div>{"default":"/assets/example2.png"}</div><div>{"default":"/assets/example3.svg"}</div>'
	});
});

describe("[web] CSS", function() {
	testFixture({
		id: "css-import-from",
		title: "Fails typecheck: import … from",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/styles.css"],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-css-import-from.js", "dist/app-css-import-from.css"],
		expectedHTML: "[CSS IMPORT FROM] Type is string"
	});
	testFixture({
		id: "css-import-star",
		title: "Accepts: import * from",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/styles.css"],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-css-import-star.js", "dist/app-css-import-star.css"],
		expectedHTML: "[CSS IMPORT STAR] Type is string"
	});
	testFixture({
		id: "css-import-require",
		title: "Fails: import = require",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/styles.css"],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-css-import-require.js"],
		expectedHTML: "Error: #hello not found"
	});
	testFixture({
		id: "css-require",
		title: "Accepts: require",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/styles.css"],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-css-require.js", "dist/app-css-require.css"],
		expectedHTML: "[CSS REQUIRE] Type is string"
	});
});

describe("[web] SCSS", function() {
	testFixture({
		id: "scss-import-from",
		title: "Fails typecheck: import … from",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/styles.scss"],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-scss-import-from.js", "dist/app-scss-import-from.css"],
		expectedHTML: "[SCSS IMPORT FROM] Type is string"
	});
	testFixture({
		id: "scss-import-star",
		title: "Accepts: import * from",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/styles.scss"],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-scss-import-star.js", "dist/app-scss-import-star.css"],
		expectedHTML: "[SCSS IMPORT STAR] Type is string"
	});
	testFixture({
		id: "scss-import-require",
		title: "Fails: import = require",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/styles.scss"],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-scss-import-require.js"],
		expectedHTML: "Error: #hello not found"
	});
	testFixture({
		id: "scss-require",
		title: "Accepts: require",
		sourceFiles: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/styles.scss"],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-scss-require.js", "dist/app-scss-require.css"],
		expectedHTML: "[SCSS REQUIRE] Type is string"
	});
});

describe("[web] Raw assets & Local type definition", function() {
	testFixture({
		id: "raw-import-from",
		title: "Accepts: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/types.d.ts",
			"src/application.ts",
			"src/example.md"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-raw-import-from.js"],
		expectedHTML: '[RAW IMPORT FROM] "# Hello World"'
	});
	testFixture({
		id: "raw-import-star",
		title: 'Accepts: import * from (wrapped in "{default: THEMODULE}")',
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/types.d.ts",
			"src/application.ts",
			"src/example.md"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-raw-import-star.js"],
		expectedHTML: '[RAW IMPORT STAR] {"default":"# Hello World"}'
	});
	testFixture({
		id: "raw-import-require",
		title: "Fails: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/types.d.ts",
			"src/application.ts",
			"src/example.md"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-raw-import-require.js"],
		expectedHTML: "Error: #hello not found"
	});
	testFixture({
		id: "raw-require",
		title: 'Accepts: require (wrapped in "{default: THEMODULE}")',
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/types.d.ts",
			"src/application.ts",
			"src/example.md"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-raw-require.js"],
		expectedHTML: '[RAW REQUIRE] {"default":"# Hello World"}'
	});
});

describe("[web] JSON", function() {
	testFixture({
		id: "json-import-from",
		title: "Fails typecheck: import … from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/asset-import-from.json"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-json-import-from.js"],
		expectedHTML: 'JSON IMPORT FROM is ["hello","world"]'
	});
	testFixture({
		id: "json-import-star",
		title: "Accepts: import * from",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/asset-import-star.json"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map", "lib/asset-import-star.json"],
		webpackFiles: ["dist/index.html", "dist/app-json-import-star.js"],
		expectedHTML: 'JSON IMPORT STAR is {"default":["hello","world"]}'
	});
	testFixture({
		id: "json-import-require",
		title: "Fails: import = require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/asset-import-require.json"
		],
		expectTypecheckError: true,
		webpackFiles: ["dist/index.html", "dist/app-json-import-require.js"],
		expectedHTML: "Error: #hello not found"
	});
	testFixture({
		id: "json-require",
		title: "Accepts: require",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/asset-require.json"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-json-require.js"],
		expectedHTML: 'JSON REQUIRE is ["hello","world"]'
	});
});

describe("[web] Include", function() {
	testFixture({
		id: "include-src-default",
		title: "Accepts: src, default list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-include-src-default.js"],
		expectedHTML: "[INCLUDE SRC DEFAULT] Type is object"
	});
	testFixture({
		id: "include-src-inside",
		title: "Accepts: src, inside list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-include-src-inside.js"],
		expectedHTML: "[INCLUDE SRC INSIDE] Type is object"
	});
	testFixture({
		id: "include-src-outside",
		title: "Fails typecheck: src, outside list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts"
		],
		expectTypecheckError: true,
		expectBuildError: true
	});
	testFixture({
		id: "include-custom-default",
		title: "Accepts: custom path, default list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"custom-path/application.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-include-custom-default.js"],
		expectedHTML: "[INCLUDE CUSTOM DEFAULT] Type is object"
	});
	testFixture({
		id: "include-custom-inside",
		title: "Accepts: custom path, inside list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"custom-path/application.ts"
		],
		tscFiles: ["lib/application.js", "lib/application.js.map"],
		webpackFiles: ["dist/index.html", "dist/app-include-custom-inside.js"],
		expectedHTML: "[INCLUDE CUSTOM INSIDE] Type is object"
	});
	testFixture({
		id: "include-custom-outside",
		title: "Fails typecheck: custom path, outside list",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"custom-path/application.ts"
		],
		expectTypecheckError: true,
		expectBuildError: true
	});
});
