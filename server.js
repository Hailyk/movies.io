'use strict';

const fs = require('fs');
const express = require("express");
const path = require('path');

const app = express();
const port = process.env.PORT;
const maxChunkSize = 3072000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/video', function(req, res) {
    const video = path.join(__dirname, 'video.mp4');
    fs.stat(video, (err, stat)=>{
        
        if(err){
            console.error(err);
        }
        
        const fileSize = stat.size;
        const range = req.headers.range;
    
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            let chunksize = 0;
            
            if((end - start) + 1 > maxChunkSize){
                end = start + maxChunkSize;
                chunksize = maxChunkSize;
            }
            else{
                chunksize = (end - start) + 1;
            }
            
            const file = fs.createReadStream(video, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
    
            res.writeHead(206, head);
            file.pipe(res);
        }
        else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(video).pipe(res);
        }
    });
})

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log('server listening on port ' + port);
    }
});