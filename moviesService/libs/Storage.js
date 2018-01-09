'use strict';

const fs = require('./FileSystem.js');
const path = require("path");

function construct(directory, options, callback){
    fs.stat(directory, (err, stats)=>{
        if(err) return callback(err);
        else{
            if(stats.isDirectory){
                let obj = new Storage(directory, options);
                obj.init();
                return callback(null, obj);
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

    init(callback){
        if(this.index){
            fs.readDir(this.directory, (err, files)=>{
                if(err){
                    throw new Error('Failed to read from directory');
                }
                else{
                    let indexFile = path.join(this.directory, '.fileIndex');
                    if(files.include('.fileIndex')){
                        let fileIndex = require(indexFile);
                        fs.readFile(indexFile, 'utf-8', (err, data)=>{
                            if(err){
                                return callback(err);
                            }
                            else{
                                this.fileIndex = JSON.parse(fileIndex);
                                return callback(null);
                            }
                        });
                    }
                    else{
                        let indexData = {};
                        indexData.cTime = new Date();
                        indexData.mTime = indexData.cTime;
                        indexData.
                        fs.writeFile(indexFile, indexData, 'utf-8', (err)=>{
                            if(err){
                                throw err;
                            }
                            else{
                                this.fileIndex = indexData;
                                return callback(null);
                            }
                        });
                    }
                }
            });
        }
    }
}

module.export = construct;