'use strict';

const expect = require('chai').expect;
const parallel = require('async').parallel;
const each = require('async').each;

const filesystem = require("../libs/FileSystem.js");
const fs = require("fs");
const path = require("path");


const rootFolder = path.resolve(path.join(__dirname, 'test/'));

describe("FileSystem Library test", function(){

    before(function(done){
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

    after(function(done){
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
                        expect(data.atime.getTime()).to.be.at.most(currentTime);
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
                let atime = new Date(1514531336000);
                filesystem.setTime(useFile,atime,(err)=>{
                    expect(err).to.be.null;
                    fs.stat(useFile, (err, data)=>{
                        expect(err).to.be.null;
                        expect(data.atime.getTime()).to.be.equal(atime.getTime());
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
                let atime = new Date(1514531336000);
                let mtime = new Date(1514531300000);
                filesystem.setTime(useFile,atime,mtime,(err)=>{
                    expect(err).to.be.null;
                    fs.stat(useFile, (err, data)=>{
                        expect(err).to.be.null;
                        expect(data.atime.getTime()).to.be.equal(atime.getTime());
                        expect(data.mtime.getTime()).to.be.equal(mtime.getTime());
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
                    expect(files.includes('renamed.test')).to.be.true;
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
        it('should add to end of file', function(done){
            let useFile = path.join(rootFolder, 'test.txt');
            fs.writeFile(useFile, "hello ", 'utf-8', (err)=>{
                expect(err).to.be.null;
                filesystem.append(useFile, "world", "utf-8", (err)=>{
                    expect(err).to.be.null;
                    fs.readFile(useFile, 'utf-8', (err,data)=>{
                        expect(err).to.be.null;
                        expect(data).to.be.a('String');
                        expect(data).to.be.equal('hello world');
                        done();
                    });
                });
            });
        });
    });

    describe('#link()', function(){
        it('should create new link', function(done){
            let useFile = path.join(rootFolder, 'testLink.txt');
            let newFile = path.join(rootFolder, 'testLink.doc');
            fs.writeFile(useFile, "hello world", 'utf-8', (err)=>{
                expect(err).to.be.null;
                filesystem.link(useFile, newFile, (err)=>{
                    expect(err).to.be.null;
                    fs.readFile(newFile, 'utf-8', (err,data)=>{
                        expect(err).to.be.null;
                        expect(data).to.be.a('String');
                        expect(data).to.be.equal('hello world');
                        done();
                    });
                });
            });
        });
    });

    describe('#copy()', function(){
        it('should create copy a file', function(done){
            let useFile = path.join(rootFolder, 'testCopy.txt');
            let newFile = path.join(rootFolder, 'testCopy.doc');
            fs.writeFile(useFile, "hello world", 'utf-8', (err)=>{
                expect(err).to.be.null;
                filesystem.copy(useFile, newFile, (err)=>{
                    expect(err).to.be.null;
                    fs.readFile(newFile, 'utf-8', (err,data)=>{
                        expect(err).to.be.null;
                        expect(data).to.be.a('String');
                        expect(data).to.be.equal('hello world');
                        fs.readFile(useFile, 'utf-8', (err,data)=>{
                            expect(err).to.be.null;
                            expect(data).to.be.a('String');
                            expect(data).to.be.equal('hello world');
                            done();
                        });
                    });
                });
            });
        });
        it('should create copy a folder', function(done){
            let useFolder = path.join(rootFolder, 'oldtestCopy/');
            let newFolder = path.join(rootFolder, 'newtestCopy/');
            fs.mkdir(useFolder, (err)=>{
                expect(err).to.be.null;
                fs.writeFile(path.join(useFolder,'test.txt'),"hello", 'utf-8',(err)=>{
                    expect(err).to.be.null;
                    filesystem.copy(useFolder, newFolder, (err)=>{
                        expect(err).to.be.null;
                        fs.readdir(rootFolder, (err, files)=>{
                            expect(err).to.be.null;
                            console.log(files);
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#checkCreateDir()', function(){
        it('should check and create a directory if not exist', function(done){
            let useFolder = path.join(rootFolder, 'checkCreateDir/');
            filesystem.checkCreateDir(useFolder, (err)=>{
                expect(err).to.be.null;
                fs.readdir(rootFolder, (err, files)=>{
                    expect(files.includes('checkCreateDir')).to.be.true;
                    done();
                });
            });
        });
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