const assert = require('assert');
const recurse = require('reftools/lib/recurse.js').recurse;

let dep = {};

function audit(obj,argv) {
  assert.equal(obj.lockfileVersion,1,'Expected lockfileVersion 1');
  console.log('Checking',obj.name,obj.version);
  recurse(obj,{},function(obj,key,state){
    if (key === 'dependencies' && typeof obj[key] === 'object') {
      for (let d in obj.dependencies) {
        let package = d.split('/').pop();
        dep = obj.dependencies[d]; 
        if (argv.verbose) console.log('  Dependency',d,dep.version);
        assert.ok(dep.integrity,'Expected an integrity string');
        if (argv.fix) {
          dep.resolved = dep.resolved.replace('http:','https:');
        }
        const compare = `https://registry.npmjs.org/${d}/-/${package}-${dep.version}.tgz`;
        assert.equal(dep.resolved,compare);
      }
    }
  }); 
  return true;
}

module.exports = {
  audit,dep
};

