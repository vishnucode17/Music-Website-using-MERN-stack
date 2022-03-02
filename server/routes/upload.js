const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const Audio_details =require('../models/audio_details');

const app = express();

app.use(bodyParser.json());
app.use(methodOverride('_method'));


const MongoURI = 'mongodb+srv://new_user:123@cluster0.cr02s.mongodb.net/JustAudio?retryWrites=true&w=majority';
const conn=mongoose.createConnection(MongoURI,{ useNewUrlParser: true, useUnifiedTopology: true });
let gfs;

conn.once('open', function () {
    var gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('audio');
});

const storage = new GridFsStorage({
    url: MongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'audio'
          };
          resolve(fileInfo);
        });
      });
    }
  });
const upload = multer({ storage });

app.post('/',upload.single('file'),(req,res)=>{
    res.json({file:req.file});
});