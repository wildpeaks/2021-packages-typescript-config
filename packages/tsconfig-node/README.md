# Typescript Config: Node

**Typescript configuration for projects targeting Node, such as a CLI script.**


It outputs to `/lib`, targeting ES2017 CommonJS.

It is configured for ES2017 and accepts:
 - CommonJS modules
 - ES modules
 - JSON modules

Note: TSC only copies JSON files to `/lib` if they're imported using `import`.


## Usage

After adding it in your devDependencies, reference the package in your `tsconfig.json`:
````json
{
  "extends": "@wildpeaks/tsconfig-node"
}
````

You can also override its settings, for example:
````json
{
  "extends": "@wildpeaks/tsconfig-node",
  "compilerOptions": {
    "noImplicitAny": false
  }
}
````
