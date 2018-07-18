'use strict';

const path = require("path");
const fs = require("fs");
const concat = require("async").concat;
const each = require("async").each;


module.exports = class catalog{

    constructor(directory){
        this.directory = directory;
        this.catalog = [];
    }

    getDirectory(){
        return this.directory;
    }
    
    getCatalog(){
        return this.catalog;
    }
    
    writeCatalog(callback){
        fs.writeFile(path.join(this.directory, 'catalog.json'),this.catalog,'utf-8',(err)=>{
            if(err){
                return callback(err);
            }
            return callback(null);
        });
    }
    
    readCatalog(callback){
        fs.readFile(path.join(this.directory, 'catalog.json'),'utf-8',(err,data)=>{
            if(err){
                return callback(err);
            }
            data = JSON.parse(data);
            this.catalog = data;
            return callback(null, data);
        });
    }

    buildCatalog(callback){
        let arg = this.constructor.arrayLike2Array(arguments);
        callback = arg.pop();
        
        fs.readdir(this.directory, (err, folders)=>{
            if(err){
                return callback(err);
            }
            
            concat(folders, (folder, callback)=>{
                this.readMetadata(path.join(this.directory, folder), (err, metaData)=>{
                    if(err){
                        if(err.errno == '-2'){
                            return callback();
                        }
                        else{
                            return callback(err);
                        }
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

    repairDirectory(callback){
        fs.readdir(this.directory, (err, folders)=>{
            if(err){
                return callback(err);
            }
            
            each(folders, (folder, callback)=>{
                this.readMetadata(path.join(this.directory, folder), (err, metaData)=>{
                    if(err){
                        if(err.errno == '-2'){
                            this.removeDirRecursive(path.join(this.directory,folder), (err)=>{
                                return callback(err);
                            });
                        }
                        else{
                            return callback(err);
                        }
                    }
                    else{
                        if(folder != metaData.vid){
                            this.moveDirectory(folder, metaData.vid, (err)=>{
                                return callback(err);
                            });
                        }
                        else{
                            return callback(null);
                        }
                    }
                });
            }, (err)=>{
                if(err){
                    return callback(err);
                }
                this.buildCatalog(this.directory, (err,catalog)=>{
                    return callback(err, catalog);
                });
                
            });
            
        });
    }

    static arrayLike2Array(arrayLike){
        let array = [];
        for(let i=0;i<arrayLike.length;i++){
            array[i]=arrayLike[i];
        }
        return array;
    }

    moveDirectory(from, to, callback){
        
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
                if(err.errno != '-17'){
                    return callback(err);
                }
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
                this.removeDirRecursive(path.join(this.directory,from), (err)=>{
                    if(err){
                        return callback(err);
                    }
                    return callback(null);
                });
            });
        });
    }
    
    readMetadata(directory, callback){
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

    removeDirRecursive(location, callback){
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
                            this.removeDirRecursive(dirPath, (error)=>{
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
}