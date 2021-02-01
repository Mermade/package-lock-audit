# package-lock-audit

A simple audit/lint/security tool for checking `npm` `package-lock.json` files against the following security issues:

* Missing `integrity` properties
* `http` instead of `https` `resolved` properties
* `resolved` URLs pointing at non-`npmjs.org` repositories
* Mismatches between dependency version and `resolved` URL version
* Mismatches between dependency package names and `resolved` URL names

It returns a non-zero exit code in the event of errors, so is suitable for use in a CI pipeline.

## Usage

* `npx package-lock-audit [...package-lock.json]`

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

* Optionally support other repository URL patterns
* Optionally support `git://` protocol / GitHub dependencies
* Support `lockfileVersion` 2

## Out of Scope

* Support for `yarn` - see https://github.com/lirantal/lockfile-lint
