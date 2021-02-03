#!/usr/bin/env node

'use strict';

const fs = require('fs');
const argv = require('tiny-opts-parser')(process.argv);
const audit = require('./index.js').audit;

const failures = [];
let count = 0;

for (let i=2;i<argv._.length;i++) {
  console.log(argv._[i],'...');
  const obj = JSON.parse(fs.readFileSync(argv._[i],'utf8'));
  try {
    count++;
    audit(obj,argv);
  }
  catch (ex) {
    console.error(ex.message);
    failures.push(argv._[i]);
    process.exitCode = 1;
  }
}

if ((failures.length > 1) || (failures.length && count > 1)) {
  console.warn('\nFailures:');
  for (let failure of failures) {
    console.warn(failure);
  }
}
