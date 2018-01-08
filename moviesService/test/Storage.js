'use strict';

const fs = require('fs');
const path = require('path');
const each = require('async').each;
const expect = require('chai').expect;

const storage = require("../libs/Storage");
let where = path.join(__dirname, 'testStroage');

describe('Storage Object test', function(){
    
    let testObj
    
    before(function(done){
        storage(where, {index:true}, (err, obj)=>{
            expect(err).to.be.null;
            expect(obj).to.be.an('object');
            testObj = obj;
            done();
        });
    });
    
    after(function(done){
        recursiveDelete(where, (err)=>{
            expect(err).to.be.null;
            done();
        });
    });
});

function recursiveDelete(directory, callback){
    directory = path.normalize(directory);
    fs.readdir(directory, function(err, files){
        if(err){
            return callback(err);
        }
        else{
            each(files, function(filename, callback){
                let filePath = path.join(directory, filename);
                fs.stat(filePath, function(err, stat){
                    if(err){
                        return callback(err);
                    }
                    else if(stat.isFile()){
                        fs.unlink(filePath,function(error){
                            if(error) return callback(error);
                            else return callback(null);
                        });
                    }
                    else if(stat.isDirectory()){
                        let dirPath = path.join(directory,"/",filename,"/");
                        recursiveDelete(dirPath, function(error){
                            if(error) return callback(error);
                            else return callback(null);
                        });
                    }
                });
            }, function(err){
                if(err){
                    return callback(err);
                }
                else{
                    fs.rmdir(directory, function(error){
                        if(error) return callback(error);
                        else return callback(null);
                    });
                }
            });
        }
    });
}