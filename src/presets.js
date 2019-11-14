'use strict';

module.exports = {
	node: {
		title: 'Node',
		description: '',
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
			]
		}
	}
};
