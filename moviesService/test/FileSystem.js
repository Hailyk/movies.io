'use strict';

const expect = require('chai').expect;
const parallel = require('async').parallel;
const each = require('async').each;

const filesystem = require("../libs/FileSystem.js");
const fs = require("fs");
const path = require("path");


const rootFolder = path.resolve(path.join(__dirname, 'test/'));

describe("FileSystem Library test", function(){

    beforeEach(function(done){
        fs.mkdir(rootFolder, (err)=>{
            expect(err).to.be.null;
            parallel([
                (ok)=>{
                    fs.writeFile(path.join(rootFolder,"test.test"),"this is a test file",'utf-8', (err)=>{
                        expect(err).to.be.null;
                        ok();
                    });
                },
                (ok)=>{
                    fs.mkdir(path.join(rootFolder, 'testFolder'), (err)=>{
                        expect(err).to.be.null;
                        fs.writeFile(path.join(rootFolder,"testintest.txt"),"this is another test file",'utf-8', function(err){
                            expect(err).to.be.null;
                            ok();
                        });
                    });
                },
                (ok)=>{
                    fs.mkdir(path.join(rootFolder, 'anotherTestFolder'), (err)=>{
                        expect(err).to.be.null;
                        ok();
                    });
                }
            ], (error)=>{
                expect(error).to.be.null;
                done();
            });
        });
    });

    afterEach(function(done){
        recursiveDelete(rootFolder, (err)=>{
            expect(err).to.be.null;
            done();
        });
    });

    describe('#stat()', function(){
        it('should return stats for location called', function(done){
            let useFile = path.join(rootFolder, 'test.test');
            filesystem.stat(useFile, (err, data)=>{
                expect(err).to.be.null;
                expect(data).to.be.an('Object');
                expect(data.isFile()).to.be.true;
                done();
            });
        });
    });

    describe('#setTime()', function(){
        it('should set current time if no time passed', function(done){
            let useFile = path.join(rootFolder, 'test1.test');
            let currentTime = Date.now();
            fs.writeFile(useFile, "hello", 'utf-8', (err)=>{
                expect(err).to.be.null;
                filesystem.setTime(useFile, (err)=>{
                    expect(err).to.be.null;
                    fs.stat(useFile, (err, data)=>{
                        expect(err).to.be.null;
                        let fileTime = new Date(data.atime);
                        expect(fileTime.getTime()).to.be.at.least(currentTime);
                        done();
                    });
                });
            });
        });
        it('should set accessTime', function(done){
            let useFile = path.join(rootFolder, 'test2.test');
            let currentTime = Date.now();
            fs.writeFile(useFile, "hello", 'utf-8', (err)=>{
                expect(err).to.be.null;
                let atime = new Date(1514531336263);
                filesystem.setTime(useFile,atime,(err)=>{
                    expect(err).to.be.null;
                    fs.stat(useFile, (err, data)=>{
                        expect(err).to.be.null;
                        let fileTime = new Date(data.atime);
                        expect(fileTime.getTime()).to.be.equal(atime.getTime());
                        done();
                    });
                });
            });
        });
        it('should set accessTime and modification time', function(done){
            let useFile = path.join(rootFolder, 'test3.test');
            let currentTime = Date.now();
            fs.writeFile(useFile, "hello", 'utf-8', (err)=>{
                expect(err).to.be.null;
                let atime = new Date(1514531336263);
                let mtime = new Date(1514531300000);
                filesystem.setTime(useFile,atime,mtime,(err)=>{
                    expect(err).to.be.null;
                    fs.stat(useFile, (err, data)=>{
                        expect(err).to.be.null;
                        let fileATime = new Date(data.atime);
                        let fileMTime = new Date(data.mtime);
                        expect(fileATime.getTime()).to.be.equal(atime.getTime());
                        expect(fileMTime.getTime()).to.be.equal(mtime.getTime());
                        done();
                    });
                });
            });
        });
    });

    describe('#rename()', function(){
        it('should rename a file', function(done){
            let useFile = path.join(rootFolder, 'test.test');
            let newFile = path.join(rootFolder, 'renamed.test');
            filesystem.rename(useFile, newFile, (err)=>{
                expect(err).to.be.null;
                fs.readdir(rootFolder, (err, files)=>{
                    expect(err).to.be.null;
                    expect(files.includes('renamed')).to.be.false;
                    done();
                });
            });
        });
    });

    describe('#createDir()', function(){
        it('should create a directory with given name', function(done) {
            let folderCreate = path.join(rootFolder, "createdFolder");
            filesystem.createDir(folderCreate, (err)=>{
                expect(err).to.be.null;
                fs.stat(rootFolder, (err, data)=>{
                    expect(err).to.be.null;
                    expect(data.isDirectory()).to.be.true;
                    fs.readdir(rootFolder, (err, files)=>{
                        expect(files.includes('createdFolder')).to.be.true;
                        done();
                    });
                });
            });
        });
    });

    describe('#append()', function(){

    });

    describe('#link()', function(){

    });

    describe('#copy()', function(){

    });

    describe('#checkCreateDir()', function(){

    });

    describe('#writeFile()', function(){

    });

    describe('#readFile()', function(){

    });

    describe('#createReadStream()', function(){

    });

    describe('#createWriteStream()', function(){

    });

    describe("#remove()", function(){
        it('should delete test directory', function(done){
            let folderrm = path.join(rootFolder, 'testFolder');
            filesystem.remove(folderrm, (err)=>{
                expect(err).to.be.null;
                fs.readdir(rootFolder, (err,files)=>{
                    expect(err).to.be.null;
                    expect(files.includes('testFolder')).to.be.false;
                    done();
                });
            });
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