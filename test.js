'use strict';

const catalog = require('./catalog.js');
const fs = require('fs');
const path = require('path');

let movies = new catalog(path.join(__dirname,"movies"));

let time = process.hrtime();
movies.buildCatalog((err, catalog)=>{
  if(err){
    console.error(err);
  }
  time = process.hrtime(time);
  time = time[0]+"."+time[1];
  console.log(time+" second/s");
  console.dir(catalog);
});