'use strict';

let filesystem = require("../libs/FileSystem.js");
let fs = require("fs");
let path = require("path");


let folder = path.join(__dirname, 'test/');

fs.utimes("./test", Date.now(), Date.now(), (error)=>{
    if(error){
        console.log(error);
    }
});