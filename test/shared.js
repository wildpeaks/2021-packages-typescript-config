/* eslint-env node */
/* eslint-disable no-empty */
"use strict";
const {exec} = require("child_process");
const {writeFileSync} = require("fs");
const {join, relative} = require("path");
const {copySync, removeSync} = require("fs-extra");
const rreaddir = require("recursive-readdir");


function execCommand(command, folder) {
	return new Promise(resolve => {
		exec(command, {cwd: folder}, (error, stdout, stderr) => {
			const output = stdout.trim().split("\n").map(line => line.trim()).filter(line => (line !== ""));
			const errors = stderr.trim().split("\n").map(line => line.trim()).filter(line => (line !== ""));
			if (error) {
				errors.push(error);
			}
			resolve({output, errors});
		});
	});
}


function copyConfig(configId = "node") {
	const fromPackageFolder = join(__dirname, `../packages/tsconfig-${configId}`);
	const toPackageFolder = join(__dirname, `tmp/${configId}/node_modules/@wildpeaks/tsconfig-${configId}`);
	try {
		removeSync(toPackageFolder);
	} catch (e) {}

	copySync(fromPackageFolder, toPackageFolder);
}


async function getFiles(folder) {
	const files = await rreaddir(folder);
	return files.map(filepath => relative(folder, filepath).replace(/\\/g, "/")).sort().filter(filepath => !filepath.startsWith("node_modules"));
}


async function compileFixture(configId, fixtureId, command) {
	const fromFixtureFolder = join(__dirname, fixtureId);
	const toTmpFolder = join(__dirname, `tmp/${configId}`);

	try {
		removeSync(join(toTmpFolder, "bin"));
	} catch (e) {}
	try {
		removeSync(join(toTmpFolder, "src"));
	} catch (e) {}
	try {
		removeSync(join(toTmpFolder, "custom-path"));
	} catch (e) {}
	try {
		removeSync(join(toTmpFolder, "lib"));
	} catch (e) {}
	try {
		removeSync(join(toTmpFolder, "dist"));
	} catch (e) {}
	try {
		removeSync(join(toTmpFolder, "webpack.config.js"));
	} catch (e) {}
	try {
		removeSync(join(toTmpFolder, "tsconfig.json"));
	} catch (e) {}

	try {
		copySync(join(fromFixtureFolder, "bin"), join(toTmpFolder, "bin"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "src"), join(toTmpFolder, "src"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "custom-path"), join(toTmpFolder, "custom-path"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "webpack.config.js"), join(toTmpFolder, "webpack.config.js"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "tsconfig.json"), join(toTmpFolder, "tsconfig.json"));
	} catch (e) {}
	writeFileSync(join(toTmpFolder, "package.json"), JSON.stringify({private: true, scripts: {build: command}}), "utf8");

	const filesBefore = await getFiles(toTmpFolder);
	const {output, errors} = await execCommand("npm run build", toTmpFolder);
	const filesAfter = await getFiles(toTmpFolder);

	return {
		output,
		errors,
		folder: toTmpFolder,
		filesBefore,
		filesAfter
	};
}


module.exports.execCommand = execCommand;
module.exports.getFiles = getFiles;
module.exports.copyConfig = copyConfig;
module.exports.compileFixture = compileFixture;
