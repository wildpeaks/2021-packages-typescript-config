/* eslint-env node */
'use strict';
const {join} = require('path');
const {writeFileSync} = require('fs');
const {removeSync, mkdirpSync} = require('fs-extra');
const {devDependencies} = require('../package.json');
const tmpFolder = join(__dirname, `tmp`);
const {execCommand} = require('./shared');


async function setupFolder(id, extraPackages){
	const targetFolder = join(tmpFolder, id);
	try {
		removeSync(targetFolder);
	} catch(e){} // eslint-disable-line no-empty
	mkdirpSync(targetFolder);

	const {dependencies} = require(`../packages/tsconfig-${id}/package.json`); // eslint-disable-line global-require
	const settings = {
		private: true,
		dependencies
	};
	for (const packageId of extraPackages){
		settings.dependencies[packageId] = devDependencies[packageId];
	}
	writeFileSync(join(targetFolder, 'package.json'), JSON.stringify(settings), 'utf8');
	writeFileSync(join(targetFolder, 'tsconfig.json'), `{"extends":"@wildpeaks/tsconfig-${id}"}`, 'utf8');

	const {output, errors} = await execCommand('npm install --no-save', targetFolder);
	console.log(output.join('\n'));
	if (errors.length > 0){
		throw new Error(errors);
	}
}


async function main(){ // eslint-disable-line require-await
	await setupFolder('node', ['typescript']);
	await setupFolder('web', ['typescript', 'webpack', 'webpack-cli', '@wildpeaks/webpack-config/web']);
}
main().then(
	() => {
		console.log('[OK] Done.');
	},
	e => {
		console.log('[ERROR]', e);
	}
);
