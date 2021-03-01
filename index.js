'use strict';

const assert = require('assert');
const mods = require('module');
const recurse = require('reftools/lib/recurse.js').recurse;

// allowed installs of packages matching built-in module names
const allowList = ['events','punycode','string_decoder'];

let dep = {};

function audit(obj,argv) {
  assert.equal(obj.lockfileVersion,1,'Expected lockfileVersion 1');
  console.log('Checking',obj.name,obj.version);
  recurse(obj,{},function(obj,key,state){
    if (key === 'dependencies' && typeof obj[key] === 'object') {
      for (let d in obj.dependencies) {
        const depPackage = d.split('/').pop();
        dep = obj.dependencies[d];
        if (argv.verbose) console.log('  Dependency',d,dep.version);
        assert.ok((allowList.indexOf(d)>=0) || (mods.builtinModules.indexOf(d)<0),`Do not require a built-in module ${d}:${dep.version}`);
        assert.ok(dep.integrity,`Expected an integrity string: ${d}:${dep.version}`);
        if (argv.fix) {
          dep.resolved = dep.resolved.replace('http:','https:');
        }
        const compare = `https://registry.npmjs.org/${d}/-/${depPackage}-${dep.version}.tgz`;
        assert.equal(dep.resolved,compare);
      }
    }
  });
  return true;
}

module.exports = {
  audit,dep
};

