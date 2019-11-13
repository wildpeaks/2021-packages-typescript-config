# Tsconfig Shared Configs


## Config: Node

For transpiled packages targeting Node.

Key features:
 - sources in /src
 - compatible with local modules in /src/node_modules
 - outputs CommonJS modules (es2017) in /lib
 - lib 2017

First, install package `@wildpeaks/tsconfig-node`.
Then reference it in `tsconfig.json`:
````json
{
  "extends": "@wildpeaks/tsconfig-node"
}
````

## TODO

More packages:
 - web
 - web + webworker
 - TS package

