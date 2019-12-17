# Typescript Config: Web

**Typescript configuration for Web projects.**


It outputs to `/lib`, targeting ES5 + ES Modules.

It is configured for ES2017 and accepts:
 - CommonJS modules
 - ES modules
 - JSON modules
 - Stylesheets (.css and .scss)
 - Images (.jpg, .png, .gif, .svg)
 - Webworkers

See the [test fixtures](https://github.com/wildpeaks/packages-typescript-config/tree/master/test/web) for examples.

Note that your Webpack configuration still requires matching loaders when you import non-TS files.
The easiest way is using the preconfigured [@wildpeaks/webpack-config-web](https://www.npmjs.com/package/@wildpeaks/webpack-config-web) package.


## Usage

After adding it in your devDependencies, reference the package in your `tsconfig.json`:
````json
{
  "extends": "@wildpeaks/tsconfig-web"
}
````

You can also override its settings, for example:
````json
{
  "extends": "@wildpeaks/tsconfig-web",
  "compilerOptions": {
    "noImplicitAny": false
  }
}
````
