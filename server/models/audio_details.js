const mongoose =require('mongoose')

const AudioFileSchema=mongoose.Schema({
    audioID:{
        type:String,
        required:true
    },
    audio_name:{
        type:String,
        required:true
    },
    audio_language:{
        type:String,
        required:true

    },
    audio_imgID:{
        type:String,
        required:true
    },
    audio_tags:
       {
              type:String,
       },
    audio_description:{
        type:String,
    },
    audio_author:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0
    },
})

module.exports=mongoose.model('Audio_details',AudioFileSchema)