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
  assert.ok(obj.lockfileVersion <= 3,'Expected lockfileVersion 1, 2 or 3');
  console.log('Checking',obj.name,obj.version);
  recurse(obj,{},function(obj,key,state){
    if (key === 'dependencies' && typeof obj[key] === 'object') {
      for (let d in obj.dependencies) {
        const depPackage = d.split('/').pop();
        dep = obj.dependencies[d];
        const version = d.dep ?  d.dep.version : dep;
        if (argv.verbose) console.log('  Dependency',d,version);
        assert.ok((allowList.indexOf(d)>=0) || (mods.builtinModules.indexOf(d)<0),`Do not require a built-in module ${d}:${dep.version}`);
        if (obj.lockfileVersion === 1) {
          assert.ok(dep.integrity||dep.bundled,`Expected an integrity string: ${d}:${version}`);
          if (argv.fix) {
            dep.resolved = dep.resolved.replace('http:','https:');
          }
          if (!dep.bundled) {
            const compare = `https://registry.npmjs.org/${d}/-/${depPackage}-${version}.tgz`;
            assert.equal(dep.resolved,compare);
          }
        }
      }
    }
    if ((key === 'packages') && (typeof obj[key] === 'object')) {
      for (let pkg in obj.packages) {
        const dep = obj.packages[pkg];
        const version = obj.packages[pkg].version;
        pkg = pkg.split('node_modules/').pop();
        if (argv.verbose) console.log('  Module',pkg||'main');
        if (pkg) {
          assert.ok(dep.integrity||dep.bundled,`Expected an integrity string: ${pkg}:${version}`);
          if (!dep.bundled) {
            const pkgname = pkg.split('/').pop();
            const compare = `https://registry.npmjs.org/${pkg}/-/${pkgname}-${version}.tgz`;
            assert.equal(dep.resolved,compare);
          }
        }
      }
    }
  });
  return true;
}

async function checkGPL(dir,argv) {
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

