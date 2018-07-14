'use strict';

const path = require("path");
const fs = require("fs");
const concat = require("async").concat;
const each = require("async").each;

function movieScanner(directory){
    this.directory = directory;
    this.getDirectory = getDirectory;
    this.getCatalog = getCatalog;
    this.buildCatalog = buildCatalog;
    this.repairDirectory = repairDirectory;
    this.catalog = [];
}

function getDirectory(){
    return this.directory;
}

function getCatalog(){
    return this.catalog;
}

function buildCatalog(callback){
    fs.readdir(this.directory, (err, files)=>{
        if(err){
            return callback(err);
        }
        
        concat(files, (file, callback)=>{
            readMetadata(path.join(this.directory, file), (err, metaData)=>{
                if(err){
                    return callback(err);
                }
                return callback(null,metaData);
            });
        }, (err, metaDatas)=>{
            if(err){
                return callback(err);
            }
            let catalog=[];
            for(let i=0;i<metaDatas.length;i++){
                catalog.push(metaDatas[i]);
            }
            this.catalog = catalog
            return callback(null,catalog);
        });
        
    });
}

function repairDirectory(callback){
    fs.readdir(this.directory, (err, files)=>{
        if(err){
            return callback(err);
        }
        
        each(files, (file, callback)=>{
            readMetadata(path.join(this.directory, file), (err, metaData)=>{
                if(err){
                    return callback(err);
                }
                if(file != metaData.vid){
                    moveDirectory(file, metaData.vid, (err)=>{
                        if(err){
                            return callback(err);
                        }
                        return callback(null);
                    });
                }
            });
        }, (err)=>{
            if(err){
                return callback(err);
            }
            buildCatalog((err,catalog)=>{
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
            
        });
        
    });
}

function moveDirectory(from, to, callback){
    if(from == undefined || typeof from != "string"){
        return callback(new Error("invalid directory: "+from));
    }
    if(to == undefined || typeof to != "string"){
        return callback(new Error("invalid directory: "+to));
    }
    
    const oldDir = path.join(this.directory, from);
    const newDir = path.join(this.directory, to);
    
    fs.mkdir(newDir, (err)=>{
        if(err){
            return callback(err);
        }
        each(['meta.json', 'video.mp4'], (file, callback)=>{
            const oldLocation = path.join(oldDir, file);
            const newLocation = path.join(newDir, file);
            
            fs.copyFile(oldLocation, newLocation, (err)=>{
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
            
        }, (err)=>{
            if(err){
                return callback(err);
            }
            removeDirRecursive(path.join(this.directory,from), (err)=>{
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
}

function readMetadata(directory, callback){
    if(directory == undefined || typeof directory != "string"){
        return callback(new Error("invalid directory ID: "+directory));
    }
    fs.readFile(path.join(directory, 'meta.json'), 'utf-8', (err, data)=>{
        if(err){
            return callback(err);
        }
        data = JSON.parse(data);
        return callback(null,data);
    });
}

function removeDirRecursive(location, callback){
    location = path.normalize(location);
    fs.readdir(location, (error, files)=>{
        if(error) return callback(error);
        else{
            each(files, (file,thiscallback)=>{
                let filePath = path.join(location, file);
                fs.stat(filePath, (error,stats)=>{
                    if(error) return thiscallback(error);
                    else if(stats.isFile()){
                        fs.unlink(filePath,(error)=>{
                            if(error) return thiscallback(error);
                            else return thiscallback(null);
                        });
                    }
                    else if(stats.isDirectory()){
                        let dirPath = path.join(location,file);
                        removeDirRecursive(dirPath, (error)=>{
                            if(error) return thiscallback(error);
                            else return thiscallback(null);
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

module.exports = movieScanner;