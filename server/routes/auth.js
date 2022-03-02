const express = require('express');
const router = express.Router();
const User = require('../models/user_schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const auth = require('../middleware/auth');
const test_middleware = require('../middleware/test');
const middleware=(req,res,next)=>{
    console.log("middleware is handling the data");
    next();
}
app=express();
app.use(middleware);
router.get('/',middleware,(req,res)=>{
    res.send("Hi, Working fine");
})
router.post('/register',async(req,res)=>{
    const {username,name,email,password}=req.body;
    console.log(req.body);
    if (!username|| !name || !email || !password){
        return res.status(422).json({error:"Please add all the fields"});
    }
    const userExists=await User.findOne({username:username});
    try{
        if (userExists){
            return res.status(422).json({error:"User already exists"});
        }
        const user = new User({username,name,email,password});
        await user.save();
        res.status(201).json({message:"User created successfully"});
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
})
router.post('/login',async (req, res) => {
    const {username,password}=req.body;
    if(!username || !password){
        return res.status(422).json({error:"All fields are required"});
    }
    try{
        const user= await User.findOne({username:username});
        if (!user){
            return res.status(422).json({error:"User does not exist"});
        }
        const isMatch= await bcrypt.compare(password,user.password);
        if (!isMatch){
            return res.status(422).json({error:"Invalid password"});
        }
        User.updateOne({username:username},{$set:{last_login:Date.now()}});
        const token=await user.generateAuthToken();
        res.status(200).json({message:"User logged in successfully"});
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
})
router.get('/about_me',auth,(req,res)=>{
    console.log("Receiving the data")
    res.send("This is a private page");
})
router.get('*',(req,res)=>{
    res.send("Page not found");
})
module.exports = router;