# Tsconfig Shared Configs


## Config: CLI

First, add `@wildpeaks/tsconfig-cli` to your devDependencies.

Key features:
 - sources in /src
 - compatible with local modules in /src/node_modules
 - outputs CommonJS modules (es2017) in /lib
 - lib 2017

Then reference it in `tsconfig.json`:
````json
{
	"extends": "@wildpeaks/tsconfig-cli",
}
````

## TODO

More packages:
 - web
 - web + webworker
 - TS package

