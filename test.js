'use strict';

const movieScanner = require('./movieScanner.js');
const fs = require('fs');
const path = require('path');

let fss = new movieScanner(path.join(__dirname,"movies"));

fss.buildCatalog((err, catalog)=>{
  if(err){
    console.log(err);
  }
  else{
    console.dir(catalog);
  }
});