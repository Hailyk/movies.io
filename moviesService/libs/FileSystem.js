'use strict';

const fs = require("fs");
const path = require("path");
const each = require('async').each;

exports.stat = stat;
exports.readDir = readDir;
exports.setTime = setTime;
exports.rename = rename;
exports.createDir = createDir;
exports.append = append;
exports.link = link;
exports.copy = copy;
exports.checkCreateDir = checkCreateDir;
exports.writeFile = writeFile;
exports.readFile = readFile;
exports.createReadStream = createReadStream;
exports.createWriteStream = createWriteStream;
exports.remove = remove;


function stat(location, callback){
    location = path.normalize(location);
    fs.stat(location, (error, stats)=>{
        if(error){
            return callback(error);
        }
        else{
            return callback(null, stats);
        }
    });
}

function readDir(location, callback){
    location = path.normalize(path.normalize(location));
    fs.readdir(location, (err, files)=>{
        if(err){
            return callback(err);
        }
        else{
            return callback(null, files);
        }
    });
}

function setTime(location, accessTime, modifyTime, callback){
    let arg = Array.from(arguments);
    location = arg.shift();
    callback = arg.pop();
    let now = new Date();
    if(arg.length > 0){
        accessTime = arg.shift();
        if(arg.length > 0){
            modifyTime = arg.shift();
        }
        else{
            modifyTime = now;
        }
    }
    else{
        accessTime = now;
        modifyTime = now;
    }
    location = path.normalize(location);
    fs.utimes(location, accessTime, modifyTime, (error)=>{
        if(error){
            return callback(error);
        }
        else{
            return callback(null);
        }
    });
}

function rename(location, newLocation, callback){
    location = path.normalize(location);
    newLocation = path.normalize(newLocation);
    fs.rename(location, newLocation, (error)=>{
       if(error){
           return callback(error);
       }
       else{
           return callback(null);
       }
    });
}

function createDir(location, callback){
    location = path.normalize(location);
    fs.mkdir(location,(err)=>{
        if(err){
            return callback(err);
        }
        else{
            return callback(null);
        }
    });
}

function append(location, data, encoding, callback){
    let arg = Array.from(arguments);
    callback = arg.pop();
    location = arg.shift();
    data = arg.shift();
    if(arg.length > 0 ){
        encoding = arg.shift();
    }
    else{
        encoding = 'utf-8'
    }
    location = path.normalize(location);
    fs.stat(location, (error, stats)=>{
        if(error){
            return callback(error);
        }
        else if(stats.isFile()){
            fs.appendFile(location, data, encoding, (err)=>{
                if(err){
                    return callback(err);
                }
                else{
                    return callback(null);
                }
            });
        }
        else if (stats.isDirectory()){
            let error = new Error("Can not append to a directory");
            return callback(error);
        }
    });
}

function link(existingPath, newPath, callback){
    existingPath = path.normalize(existingPath);
    newPath = path.normalize(newPath);
    fs.link(existingPath, newPath, (error)=>{
        if(error){
            return callback(error);
        }
        else{
            return callback(null);
        }
    });
}

function copy(location, destination, callback){
    location = path.resolve(path.normalize(location));
    destination = path.resolve(path.normalize(destination));
    fs.stat(location, (error, stats)=>{
        if(error){
            return callback(error);
        }
        else if(stats.isFile()){
            fs.copyFile(location, destination, (error)=>{
                if(error){
                    return callback(error);
                }
                else{
                    return callback(null);
                }
            });
        }
        else if(stats.isDirectory()){
            copyDir(location, destination, (error)=>{
                if(error){
                    return callback(error);
                }
                else{
                    return callback(null);
                }
            });
        }
    });
}

function copyDir(location, destination, callback){
    location = path.resolve(path.normalize(location));
    destination = path.normalize(path.normalize(destination));
    fs.readdir(location, (error, files)=>{
        if(error){
            return callback(error);
        }
        else{
            fs.mkdir(destination, (err)=>{
                if(err){
                    return callback(err);
                }
                each(files, (file, callback)=>{
                    location = path.join(location, file);
                    destination = path.join(destination, file);
                    fs.stat(location, (error, stats)=>{
                        if(error){
                            return callback(error);
                        }
                        else if(stats.isFile()){
                            fs.copyFile(location, destination, (error)=>{
                                if(error){
                                    return callback(error);
                                }
                                else{
                                    return callback(null);
                                }
                            });
                        }
                        else if(stats.isDirectory()){
                            copyDir(location, destination, (error)=>{
                                if(error){
                                    return callback(error);
                                }
                                else{
                                    return callback(null);
                                }
                            });
                        }
                    });
                }, (error)=>{
                    if(error){
                        return callback(error);
                    }
                    else{
                        return callback(null);
                    }
                });
            });
        }
    });
}

// check if directory exist if not create it
function checkCreateDir(location, callback){
    location = path.resolve(path.normalize(location));
    let previousDir = path.join(location, "..");
    previousDir = path.normalize(previousDir);
    fs.readdir(previousDir, (err, files)=>{
        if(err){
            return callback(err);
        }
        else{
            if(files.includes(path.basename(location))){
                return callback();
            }
            else{
                fs.mkdir(location, (err)=>{
                    if(err){
                        return callback(err);
                    }
                    else{
                        return callback(null);
                    }
                });
            }
        }
    });
}

// writes data to a file
function writeFile(location, data, callback){
    let dir = path.dirname(location);
    checkCreateDir(dir,(error)=>{
        if(error){
            callback(error);
        }
        else{
            fs.writeFile(location, data, (error)=>{
                if(error){
                    return callback(error);
                }
                else{
                    return callback(null);
                }
            });
        }
        
    });
}

// read file at location
function readFile(location, encoding, callback){
    let args = Array.from(arguments);
    location = args.shift();
    callback = args.pop();
    if(args.length > 0){
        encoding = args.pop();
    }
    else{
        encoding = 'utf-8';
    }
    fs.readFile(location, encoding, (error,data)=>{
        if(error){
            return callback(error);
        }
        else{
            return callback(null, data);
        }
    });
}

function createReadStream(location, encoding, start, end, callback){
    let args = Array.from(arguments);
    location = args.shift();
    encoding = args.shift();
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
        let rs = fs.createReadStream(location,{encoding:encoding,start:start,end:end});
        return callback(null, rs);
    });
}

function createWriteStream(location, encoding, start, callback){
    let args = Array.from(arguments);
    location = args.shift();
    encoding = args.shift();
    callback = args.pop();
    if(args.length > 0){
        start = args.shift();
    }
    else{
        start = 0;
    }
    let dir = path.dirname(location);
    checkCreateDir(dir,(error)=>{
        if(error){
            return callback(error);
        }
        else{
            let ws = fs.createWriteStream(location,{encoding:encoding,start:start});
            return callback(null, ws); 
        }
    });
}

function removeDirRecursive(location, callback){
    location = path.normalize(location);
    fs.readdir(location, (error, files)=>{
        if(error) return callback(error);
        else{
            each(files, (file,callback)=>{
                let filePath = path.join(location, file);
                fs.stat(filePath, (error,stats)=>{
                    if(error) return callback(error);
                    else if(stats.isFile()){
                        fs.unlink(filePath,(error)=>{
                            if(error) return callback(error);
                            else return callback(null);
                        });
                    }
                    else if(stats.isDirectory()){
                        let dirPath = path.join(location,"/",file,"/");
                        removeDirRecursive(dirPath, (error)=>{
                            if(error) return callback(error);
                            else return callback(null);
                        });
                    }
                });
            },
            (error)=>{
                if(error) return callback(error);
                else{
                    fs.rmdir(location, (error)=>{
                        if(error) return callback(error);
                        else return callback(null);
                    });
                }
            });
        }
    });
}

function remove(location, callback){
    fs.stat(location, (error, stats)=>{
        if(stats.isFile()){
            fs.unlink(location, (error)=>{
                if(error){
                    return callback(error);
                }
                else{
                    return callback(null);
                }
            });
        }
        else if(stats.isDirectory()){
            removeDirRecursive(location, (error)=>{
                if(error){
                    return callback(error);
                }
                else{
                    return callback(null);
                }
            });
        }
    });
}