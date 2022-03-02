const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken'); 
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date_joined: {
        type: Date,
        default: Date.now
    },
    last_login:{
        type:Date,

    },
    tokens:
        [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ]

});
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        console.log('password changed');
        this.password = await bcrypt.hash(this.password, 11);
    }
    next();
});
UserSchema.methods.generateAuthToken = async function(){
    try{
        let token=jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
    }
    catch(err){
        console.log(err);
    }
}
module.exports = mongoose.model('User', UserSchema);