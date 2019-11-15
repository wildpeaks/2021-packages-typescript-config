'use strict';

//
// TODO dependencies for @types/node, preact and @wildpeaks/vrmlscript
//

module.exports = {
	node: {
		title: 'Node',
		description: 'TODO description',
		dependencies: ['@types/node'],
		tsconfig: {
			compilerOptions: {
				newLine: 'LF',
				alwaysStrict: true,
				noEmitOnError: true,
				noImplicitAny: true,
				noImplicitReturns: true,
				noImplicitThis: true,
				noUnusedLocals: true,
				noUnusedParameters: true,
				strictNullChecks: true,
				preserveConstEnums: true,
				useDefineForClassFields: true,

				moduleResolution: 'node',
				resolveJsonModule: true,
				allowJs: false,
				module: 'commonjs',
				lib: ['es2017'],

				target: 'es2017',
				sourceMap: false,
				removeComments: true,
				outDir: '../../../lib'
			},
			include: [
				'../../../src/*.d.ts',
				'../../../src/*.ts',
				'../../../src/**/*.ts',
				'../../../src/node_modules/**/*.ts'

				// TODO fixture to test that it's safe for JS tests, and for TS tests in Wallaby/Jasmine/Mocha
				// '../../../test/*.d.ts',
				// '../../../test/*.ts',
				// '../../../test/**/*.ts'
			]
		}
	}
	// web: {
	// 	title: 'Web',
	// 	description: 'TODO description',
	// 	dependencies: ['@types/node', 'preact'],
	// 	tsconfig: {
	// 		compilerOptions: {
	// 			newLine: 'LF',
	// 			alwaysStrict: true,
	// 			noEmitOnError: true,
	// 			noImplicitAny: true,
	// 			noImplicitReturns: true,
	// 			noImplicitThis: true,
	// 			noUnusedLocals: true,
	// 			noUnusedParameters: true,
	// 			strictNullChecks: true,
	// 			preserveConstEnums: true,
	// 			useDefineForClassFields: true,

	// 			moduleResolution: 'node',
	// 			resolveJsonModule: true,
	// 			allowJs: false,
	// 			module: 'commonjs',
	// 			lib: ['es2017', 'dom'],

	// 			target: 'es5',
	// 			sourceMap: false,
	// 			removeComments: true,
	// 			outDir: '../../../lib',

	// 			// jsx: 'react',
	// 			// jsxFactory: 'h',

	// 			typeRoots: [
	// 				'../../../node_modules'
	// 			],
	// 			types: [
	// 				'@types/node'
	// 				// '@types/mocha'
	// 			]
	// 		},
	// 		include: [
	// 			'../../../src/*.d.ts',
	// 			'../../../src/*.ts',
	// 			'../../../src/**/*.ts',
	// 			'../../../src/node_modules/**/*.ts'
	// 		]
	// 	}
	// }
};
