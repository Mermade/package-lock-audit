# package-lock-audit

![CI](https://github.com/Mermade/package-lock-audit/workflows/CI/badge.svg)

A simple audit/lint/security tool for checking `npm` `package-lock.json` files against the following security issues:

* Missing `integrity` properties
* `http` instead of `https` `resolved` properties
* `resolved` URLs pointing at non-`npmjs.org` repositories
* Mismatches between dependency version and `resolved` URL version
* Mismatches between dependency package names and `resolved` URL names

It returns a non-zero exit code in the event of errors, so is suitable for use in a CI pipeline.

## Usage

* `npx package-lock-audit [--verbose 1] [...package-lock.json]`

or

```js
const audit = require('package-lock-audit').audit;

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
* Support [`lockfileVersion` 2](https://gitlab.com/gitlab-org/gitlab/-/issues/273651)
* Finish `--fix` feature for trivial fixes like `http://` => `https://`
* Add tests

## Out of Scope

* Support for `yarn` / `pnpm` / `tink` etc - see https://github.com/lirantal/lockfile-lint
