/* eslint-env node */
'use strict';
const {join} = require('path');
const {writeFileSync} = require('fs');
const {removeSync, mkdirpSync} = require('fs-extra');
const {devDependencies} = require('../package.json');
const tmpFolder = join(__dirname, `tmp`);
const execCommand = require('./execCommand');


async function setup(id, extraPackages){
	const targetFolder = join(tmpFolder, id);
	try {
		removeSync(targetFolder);
	} catch(e){} // eslint-disable-line no-empty
	mkdirpSync(targetFolder);

	const {dependencies} = require(`../packages/tsconfig-${id}/package.json`); // eslint-disable-line global-require
	const targetPackage = {
		private: true,
		dependencies
	};
	for (const packageId of extraPackages){
		targetPackage.dependencies[packageId] = devDependencies[packageId];
	}
	writeFileSync(join(targetFolder, 'package.json'), JSON.stringify(targetPackage), 'utf8');
	writeFileSync(join(targetFolder, 'tsconfig.json'), '{"extends":"@wildpeaks/tsconfig-node"}', 'utf8');

	await execCommand('npm install --no-save', targetFolder);
}


async function main(){ // eslint-disable-line require-await
	await setup('node', ['typescript']);
	// await setup('web', ['typescript', 'webpack', 'webpack-cli', '@wildpeaks/webpack-config/web']);
}
main().then(() => {}, () => {}); // eslint-disable-line no-empty-function

