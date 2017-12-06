'use strict';

let fs = require("fs");

class FileSystem {
    
    constructor(rootDir){
        fs.stat(rootDir, (error,status)=>{
            if(error){
                throw new Error(error);
            }
            if(status.isDirectory()){
                this.rootDir=rootDir;
            }
            else{
                throw new Error("Root Directory for FileSystem must be a folder.");
            }
        });
    }
    
    // writes data to a file
    writeFile(location, data, callback){
        location = this.rootDir + location;
        fs.writeFile(location, data, (error)=>{
            if(error){
                return callback(error);
            }
            return callback();
        })
    }
    
    // read file at location
    readFile(location, callback){
        location = this.rootDir + location;
        fs.readFile(location, (error, data)=>{
            if(error){
                return callback(error);
            }
            return callback(null, data);
        });
    }
    
    createReadStream(location, start, end, callback){
        let args = arguments;
        location = this.rootDir + args.shift();
        callback = args.pop();
        fs.stat(location,(error,stats)=>{
            if(error){
                return callback(error);
            }
            if(args.length > 0){
                start = args.shift();
                if(args.length > 0){
                    end = args.shift();
                }
                else{
                    end = stats.size;
                }
            }
            else{
                start = 0;
                end = stats.size;
            }
            let rs = fs.createReadStream(location,{start:start,end:end});
            return callback(null, rs);
        });
    }
    
    createWriteStream(location, start, callback){
        let args = arguments;
        location = this.rootDir + args.shift();
        callback = args.pop();
        if(args.length > 0){
            start = args.shift();
        }
        else{
            start = 0;
        }
        let ws = fs.createWriteStream(location,{start:start});
        return callback(null, ws);
    }
}

module.exports = FileSystem;