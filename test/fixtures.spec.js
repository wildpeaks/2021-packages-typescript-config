/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-empty */
'use strict';
const {strictEqual, deepStrictEqual} = require('assert');
const {exec} = require('child_process');
const {readdirSync, writeFileSync} = require('fs');
const {relative} = require('path');
const {copySync, removeSync, mkdirpSync} = require('fs-extra');
const {join} = require('path');
const fixturesFolder = join(process.cwd(), 'test/fixtures');
const packagesFolder = join(process.cwd(), 'packages');
const rreaddir = require('recursive-readdir');


function execCommand(command, folder){
	return new Promise((resolve, reject) => {
		exec(command, {cwd: folder}, (error, stdout, stderr) => {
			if (error){
				reject(error);
			} else {
				resolve({
					output: stdout.trim().split('\n').map(line => line.trim()).filter(line => (line !== '')),
					errors: stderr.trim().split('\n').map(line => line.trim()).filter(line => (line !== ''))
				});
			}
		});
	});
}


before('Setup', function(){
	const fixtureIds = readdirSync(fixturesFolder);
	for (const fixtureId of fixtureIds){
		const baseFolder = join(fixturesFolder, fixtureId);
		const modulesFolder = join(baseFolder, 'node_modules/@wildpeaks');
		try {
			removeSync(modulesFolder); // I'll need to delete subfolder instead of @wildpeaks once I need other packages from the namespace
		} catch(e){}
		try {
			removeSync(join(baseFolder, 'lib'));
		} catch(e){}
		try {
			removeSync(join(baseFolder, 'dist'));
		} catch(e){}
		mkdirpSync(modulesFolder);
		copySync(packagesFolder, modulesFolder);
	}
});


async function getFiles(folder){
	const files = await rreaddir(folder);
	return files.map(filepath => relative(folder, filepath).replace(/\\/g, '/')).sort().filter(filepath => !filepath.startsWith('node_modules'));
}


async function compileFixture(fixtureId, configId){
	const folder = join(fixturesFolder, fixtureId);
	writeFileSync(join(folder, 'tsconfig.json'), JSON.stringify({extends: `@wildpeaks/tsconfig-${configId}`}), 'utf8');
	const filesBefore = await getFiles(folder);

	let throws = false;
	try {
		await execCommand('tsc --build tsconfig.json', folder); // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	} catch(e){
		throws = e;
	}

	const filesAfter = await getFiles(folder);
	return {throws, folder, filesBefore, filesAfter};
}


describe('Package: Node', function(){

	it(`Basic`, /* @this */ async function(){
		this.slow(15000);
		const {folder, throws, filesBefore, filesAfter} = await compileFixture('basic', 'node');

		strictEqual(throws, false, 'No error');
		deepStrictEqual(
			filesBefore,
			[
				'package.json',
				'package-lock.json',
				'src/main.ts',
				'tsconfig.json'
			].sort(),
			'Files before'
		);
		deepStrictEqual(
			filesAfter,
			[
				'package.json',
				'package-lock.json',
				'lib/main.js',
				'src/main.ts',
				'tsconfig.json'
			].sort(),
			'Files after'
		);

		const output = await execCommand('node lib/main.js', folder);
		deepStrictEqual(
			output,
			{
				errors: [],
				output: [
					'[preact] object'
				]
			}
		);
	});
});

