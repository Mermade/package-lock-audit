'use strict';

const assert = require('assert');
const util = require('util');
const mods = require('module');
const nlf = require('nlf');
const recurse = require('reftools/lib/recurse.js').recurse;

const nlfp = util.promisify(nlf.find);

// allowed installs of packages matching built-in module names
const allowList = ['events','punycode','querystring','string_decoder','url'];

// blocked licenses
const lblock = ['GPL','AGPL','GPL-3.0','GPL-2.0','AGPL-2.0','AGPL-3.0'];

let dep = {};

function audit(obj,argv) {
  assert.ok(obj.lockfileVersion <= 2,'Expected lockfileVersion 1 or 2');
  delete obj.packages; // lockfileversion 2 packages object contains objects called dependencies with a different structure
  console.log('Checking',obj.name,obj.version);
  recurse(obj,{},function(obj,key,state){
    if (key === 'dependencies' && typeof obj[key] === 'object') {
      for (let d in obj.dependencies) {
        const depPackage = d.split('/').pop();
        dep = obj.dependencies[d];
        if (argv.verbose) console.log('  Dependency',d,dep.version);
        assert.ok((allowList.indexOf(d)>=0) || (mods.builtinModules.indexOf(d)<0),`Do not require a built-in module ${d}:${dep.version}`);
        assert.ok(dep.integrity||dep.bundled,`Expected an integrity string: ${d}:${dep.version}`);
        if (argv.fix) {
          dep.resolved = dep.resolved.replace('http:','https:');
        }
        if (!dep.bundled) {
          const compare = `https://registry.npmjs.org/${d}/-/${depPackage}-${dep.version}.tgz`;
          assert.equal(dep.resolved,compare);
        }
      }
    }
  });
  return true;
}

async function checkGPL(dir) {
  let result = false;
  const data = await nlfp({ directory: dir, production: true })
  for (let p of data) {
    const ls = p.licenseSources;
    if (ls.package && ls.package.sources) {
      const s = ls.package.sources;
      let blocked;
      for (let l of s) {
        if (lblock.indexOf(l.license)>=0) {
          blocked = p.id;
        }
      }
      if (blocked && s.length === 1) {
        result = blocked;
      }
    }
  }
  return result;
}

module.exports = {
  audit,dep,checkGPL
};

