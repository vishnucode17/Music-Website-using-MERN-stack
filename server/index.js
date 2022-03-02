const express= require('express');
const mongoose= require('mongoose');
const cors= require('cors');
const dotenv=require('dotenv');
const jwt=require('jsonwebtoken');
var passport= require('passport');
const crypto = require('crypto');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const path=require('path');
dotenv.config({path:'./config.env'});
require('./db/connect');
const User = require('./models/user_schema');
const Audio_details = require('./models/audio_details');
const port=8000;
const app=express();
app.use(express.json());
// app.use(require('./routes/auth'));
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin' , 'http://localhost:3000');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append("Access-Control-Allow-Headers", "Origin, Accept,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.append('Access-Control-Allow-Credentials', true);
    next();
});
app.listen(port,()=>{
    console.log(`Server listening on port ${port}`);
})

app.use(bodyParser.json());
app.use(methodOverride('_method'));


const MongoURI = 'mongodb+srv://new_user:123@cluster0.cr02s.mongodb.net/JustAudio?retryWrites=true&w=majority';
const conn=mongoose.createConnection(MongoURI,{ useNewUrlParser: true, useUnifiedTopology: true });
var gfs;

conn.once('open', function () {
    var gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('audio');
});

var audio_details={
    audioID:'',
    audio_name:'',
    audio_imgID:'',
    audio_tags:[],
    audio_author:'',
};

const storage = new GridFsStorage({
    url: MongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const audio_extensions=['.mp3','.wav','.flac','.ogg'];
          const audio_img_extensions=['.jpg','.jpeg','.png'];
          if (audio_extensions.includes(path.extname(file.originalname))) {
            const fileInfo = {
              filename: filename,
              bucketName: 'audio'
            };
            resolve(fileInfo);
            audio_details.audioID=filename;
          }
          else if (audio_img_extensions.includes(path.extname(file.originalname))) {
            const fileInfo = {
              filename: filename,
              bucketName: 'audio_img'
            };
            resolve(fileInfo);
            audio_details.audio_imgID=filename;
          }
          
        });
      });
    }
  });
const upload = multer({ storage });

app.post('/upload', upload.fields([{name:'file',maxCount:1},{name:'audioimg',maxCount:1}]), (req, res, next) => {
    // for (let i = 0; i < req.files.length; i++) {
    //     console.log(req.files[i].filename);
    // }
    const file=req.files.file;
    const audioimg=req.files.audioimg;
    const audioname=req.body.audioname;
    const audiolanguage=req.body.audiolanguage;
    const audioauthor = req.body.audioauthor;
    const audiotags = req.body.audiotags;
    const audiodescription=req.body.audiodescription;
    audio_details.audio_name=audioname;
    audio_details.audio_author=audioauthor;
    audio_details.audio_tags=audiotags;
    audio_details.audio_description=audiodescription;
    audio_details.audio_language=audiolanguage;
    if (!file || file.length === 0) {
      const error = new Error('No File')
      error.httpStatusCode = 400
      console.log('No File');
      return next(error)
    }
    if (!audioimg || audioimg.length === 0) {
      const error = new Error('No Image File')
      error.httpStatusCode = 400
      console.log('No Image File');
      return next(error)
    }
    if (!audioname || !audioauthor || !audiotags || !audiodescription || !audiolanguage) {
      const error = new Error('No Audio Details')
      error.httpStatusCode = 400
      console.log('No Audio Details');
      return next(error)
    }
      
    
      
      if(audio_details.audio_name!==''||audio_details.audio_author!==''||audio_details.audio_tags!==''||audio_details.audio_imgID!==''||audio_details.audioID!==''||audio_details.audio_description!=='' ){
        const new_audio_details=new Audio_details(audio_details);
        new_audio_details.save();
        res.status(201).json({message:"Audio file created successfully"});
      }
      // res.send(file);
      // res.send(audioimg);
      
  });

app.get('/file/:language',async (req,res)=>{
    const language=req.params.language;
    const audio_details= await Audio_details.find({audio_language:language});
    // gfs.collection('audio_details');
    // gfs.files.find().toArray((err,files)=>{
    //     if(!files || files.length === 0){
    //         return res.status(404).json({
    //             err: 'No files exist'
    //         });
    //     }
    //     return res.json(files);
    // }
    return res.json(audio_details);

});
app.get('/files/:filename', (req, res) => {
    var gfs = Grid(conn.db, mongoose.mongo);
    const audio_extensions=['.mp3','.wav','.flac','.ogg'];
    const audio_img_extensions=['.jpg','.jpeg','.png'];
    if (audio_extensions.includes(path.extname(req.params.filename))) {
        gfs.collection('audio');
    }
    else if (audio_img_extensions.includes(path.extname(req.params.filename))) {
      gfs.collection('audio_img');
    }
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // File exists
      return res.json(file);
    });
  });

  app.get('/audio/:filename', (req, res) => {
    var gfs = Grid(conn.db, mongoose.mongo);
    const audio_extensions=['.mp3','.wav','.flac','.ogg'];
    const audio_img_extensions=['.jpg','.jpeg','.png'];
    if (audio_extensions.includes(path.extname(req.params.filename))) {
        gfs.collection('audio');
    }
    else if (audio_img_extensions.includes(path.extname(req.params.filename))) {
      gfs.collection('audio_img');
    }
  
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      // console.log(file.length);
      // console.log(file);
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // Check if image
      if (file.contentType === 'audio/mpeg' || file.contentType === 'audio/wav' || file.contentType=='image/jpeg' || file.contentType=='image/png' || file.contentType=='image/jpg') {
        // Read output to browser
        console.log(file.filename);
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });



  app.get('/details/:filename',async (req, res) => {
    const audio_details= await Audio_details.findOne({audioID:req.params.filename});
    if(!audio_details){
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    const audio_details_obj={
      audio_name:audio_details.audio_name,
      audio_author:audio_details.audio_author,
      audio_tags:audio_details.audio_tags,
      audio_description:audio_details.audio_description,
      audio_imgID:audio_details.audio_imgID
    }
    return res.json(audio_details_obj);
      
  })