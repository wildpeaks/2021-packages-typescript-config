/* eslint-env node */
/* eslint-disable no-empty */
"use strict";
const {exec} = require("child_process");
const {writeFileSync} = require("fs");
const {join, relative} = require("path");
const {copySync, removeSync} = require("fs-extra");
const rreaddir = require("recursive-readdir");
const packagesFolder = join(__dirname, "../packages");
const tmpFolder = join(__dirname, "../tmp");

function execCommand(command, folder) {
	return new Promise(resolve => {
		exec(command, {cwd: folder}, (error, stdout, stderr) => {
			const output = stdout
				.trim()
				.split("\n")
				.map(line => line.trim())
				.filter(line => line !== "");
			const errors = stderr
				.trim()
				.split("\n")
				.map(line => line.trim())
				.filter(line => line !== "");
			if (error) {
				errors.push(error);
			}
			resolve({output, errors});
		});
	});
}

function copyConfig(configId = "node") {
	const fromPackageFolder = join(packagesFolder, `tsconfig-${configId}`);
	const toPackageFolder = join(tmpFolder, `${configId}/node_modules/@wildpeaks/tsconfig-${configId}`);
	try {
		removeSync(toPackageFolder);
	} catch (e) {}

	copySync(fromPackageFolder, toPackageFolder);
}

async function getFiles(folder) {
	const files = await rreaddir(folder);
	return files
		.map(filepath => relative(folder, filepath).replace(/\\/g, "/"))
		.sort()
		.filter(filepath => filepath.startsWith("node_modules/fake") || !filepath.startsWith("node_modules"));
}

async function compileFixture(configId, fixtureId, command) {
	const fromFixtureFolder = join(__dirname, fixtureId);
	const toTmpSubfolder = join(tmpFolder, configId);

	try {
		removeSync(join(toTmpSubfolder, "bin"));
	} catch (e) {}
	try {
		removeSync(join(toTmpSubfolder, "src"));
	} catch (e) {}
	try {
		removeSync(join(toTmpSubfolder, "custom-path"));
	} catch (e) {}
	try {
		removeSync(join(toTmpSubfolder, "node_modules/fake1"));
	} catch (e) {}
	try {
		removeSync(join(toTmpSubfolder, "node_modules/fake2"));
	} catch (e) {}
	try {
		removeSync(join(toTmpSubfolder, "lib"));
	} catch (e) {}
	try {
		removeSync(join(toTmpSubfolder, "dist"));
	} catch (e) {}
	try {
		removeSync(join(toTmpSubfolder, "webpack.config.js"));
	} catch (e) {}
	try {
		removeSync(join(toTmpSubfolder, "tsconfig.json"));
	} catch (e) {}

	try {
		copySync(join(fromFixtureFolder, "bin"), join(toTmpSubfolder, "bin"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "src"), join(toTmpSubfolder, "src"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "custom-path"), join(toTmpSubfolder, "custom-path"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "node_modules/fake1"), join(toTmpSubfolder, "node_modules/fake1"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "node_modules/fake2"), join(toTmpSubfolder, "node_modules/fake2"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "webpack.config.js"), join(toTmpSubfolder, "webpack.config.js"));
	} catch (e) {}
	try {
		copySync(join(fromFixtureFolder, "tsconfig.json"), join(toTmpSubfolder, "tsconfig.json"));
	} catch (e) {}
	writeFileSync(
		join(toTmpSubfolder, "package.json"),
		JSON.stringify({private: true, scripts: {build: command}}),
		"utf8"
	);

	const filesBefore = await getFiles(toTmpSubfolder);
	const {output, errors} = await execCommand("npm run build", toTmpSubfolder);
	const filesAfter = await getFiles(toTmpSubfolder);

	return {
		output,
		errors,
		folder: toTmpSubfolder,
		filesBefore,
		filesAfter
	};
}

module.exports = {
	tmpFolder,
	packagesFolder,
	execCommand,
	getFiles,
	copyConfig,
	compileFixture
};
