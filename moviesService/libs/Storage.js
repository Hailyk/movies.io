'use strict';

const fs = require('./FileSystem.js');

function construct(directory, options, callback){
    fs.stat(directory, (err, stats)=>{
        if(err) return callback(err);
        else{
            if(stats.isDirectory){
                return callback(null, new Storage(directory, options));
            }
            else return callback(new Error("Must be directory"));
        }
    });
}

class Storage{

    constructor(directory, options){
        this.directory = directory;
        this.options = options;
        if(options){
            if(typeof options === "object"){
                this.index = options.index;
            }
            else{
                throw new Error('options are not a accept type');
            }
        }
    }

}

function init(){
    if(this.index){
        fs.readDir(directory, (err, files)=>{
            if(err){
                throw new Error('Failed to read from directory');
            }
            else{
                if(files.include('.fileIndex')){

                }
            }
        });
    }
}

module.export = construct;