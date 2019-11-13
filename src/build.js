/* eslint-env node, mocha */
'use strict';
const {join} = require('path');
const {mkdirSync, writeFileSync} = require('fs');
const {version} = require('../package.json');
const presets = require('./presets');
const packagesFolder = join(__dirname, '../packages');


function generatePackage(id){
	const preset = presets[id];
	const packageId = `tsconfig-${id}`;
	const packageFolder = join(packagesFolder, packageId);
	mkdirSync(packageFolder);

	writeFileSync(
		join(packageFolder, 'tsconfig.json'),
		JSON.stringify(preset.tsconfig),
		'utf8'
	);
	writeFileSync(
		join(packageFolder, 'package.json'),
		JSON.stringify({
			name: `@wildpeaks/${packageId}`,
			version,
			description: preset.description,
			author: 'Cecile Muller',
			license: 'MIT',
			keywords: ['wildpeaks', 'typescript', 'tsconfig'],
			homepage: 'https://github.com/wildpeaks/packages-typescript-config#readme',
			repository: 'https://github.com/wildpeaks/packages-typescript-config',
			bugs: {
				url: 'https://github.com/wildpeaks/packages-typescript-config/issues'
			},
			main: 'tsconfig.json',
			files: ['tsconfig.json']
		}),
		'utf8'
	);
	writeFileSync(
		join(packageFolder, 'README.md'),
		[
			`# Typescript Config: ${preset.title}`,
			'',
			preset.description
			//
			// TODO add usage example
			//
		].join('\n'),
		'utf8'
	);
}


describe('Build', () => {
	mkdirSync(packagesFolder);
	for (const id in presets){
		it(id, generatePackage.bind(null, id));
	}
});


//
// TODO test the packages after they've been written
//
