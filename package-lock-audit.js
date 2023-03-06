#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const argv = require('tiny-opts-parser')(process.argv);
const { audit, checkGPL } = require('./index.js');

const failures = [];
let count = 0;

async function main() {
  for (let i=2;i<argv._.length;i++) {
    console.log(argv._[i],'...');
    const obj = JSON.parse(fs.readFileSync(argv._[i],'utf8'));
    try {
      count++;
      audit(obj,argv);
      if (argv.nogpl) {
        const result = await checkGPL(path.dirname(argv._[i]),argv);
        if (result) {
          console.error('Packages are licensed GPL only:',result);
          failures.push(argv._[i]);
          process.exitCode = 1;
        }
      }
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
}

main();
