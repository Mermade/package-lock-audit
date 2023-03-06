# package-lock-audit

![CI](https://github.com/Mermade/package-lock-audit/workflows/CI/badge.svg)

A simple audit/lint/security tool for checking `npm` `package-lock.json` files against the following security issues:

* Missing `integrity` properties
* `http` instead of `https` `resolved` properties
* `resolved` URLs pointing at non-`npmjs.org` repositories
* Mismatches between dependency version and `resolved` URL version
* Mismatches between dependency package names and `resolved` URL names
* Erroneously installed packages which match a built-in module name
* Optionally checks for GPL-only licensed dependencies (with `--nogpl true`)

It returns a non-zero exit code in the event of errors, so is suitable for use in a CI pipeline.

## Usage

* `npx package-lock-audit [--verbose 1] [--nogpl true] [...package-lock.json]`

**Note**: it is safest to use `npx` to call this binary, and to do it **before** you do `npm i` for your project. There is no need to add it to your `devDependencies` unless you want to.

or

```js
const { audit } = require('package-lock-audit');

// read package-lock.json

const options = { verbose: false };
try {
  audit(lockfileObj, options);
}
catch (ex) {
  // ...
}
```

## TODO

* Optionally allow other repository URL patterns
* Optionally allow (specific?) `git://` protocol / GitHub dependencies - possibly only if listed in `package.json`
* Finish `--fix` feature for trivial fixes like `http://` => `https://`
* Add tests

## Out of Scope

* Support for `yarn` / `pnpm` / `tink` / `entropic` etc - see https://github.com/lirantal/lockfile-lint/issues
