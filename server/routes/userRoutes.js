const express = require('express')
const router = express.Router()
const userModels = require('../models/userModels')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middlewares/auth')

router.post('/register', async (req, res)=>{
    try{

        let exists = await userModels.findOne({"email" : req.body.email})
        let userNameToCheckFoundOrNot = await userModels.findOne({"username":req.body.username})

        if(userNameToCheckFoundOrNot){
            return res.status(404).json({
                "message":"Username Already Exists"
            })
        }
        
        if(exists){
            return res.status(401).json({"message" : "User Already Exists"})
        }

        let hashedPassword = await bcrypt.hash(req.body.password, 10)

        let newUser = await userModels.create({
            "username" : req.body.username,
            "email": req.body.email,
            "password": hashedPassword
        })       

        res.send(newUser)
    }catch(err){
        console.log("error in userRoutes register")
    }
})


router.post('/login', async (req, res) =>{
    try{
        let userToCheckFoundOrNot = await userModels.findOne({"email":req.body.email})
        

        if(!userToCheckFoundOrNot){
            return res.status(404).json({"message":"User Not Found!"})
        }

        let passwordVerify = await bcrypt.compare(req.body.password, userToCheckFoundOrNot.password)

        if(!passwordVerify){
            return res.status(401).json({"message":"Incorrect Password"})
        }

        let token = jwt.sign(
            {"email" : userToCheckFoundOrNot.email, "id":userToCheckFoundOrNot._id, "username":userToCheckFoundOrNot.username},
            process.env.JWTCODE
        )

        res.json({
            user : userToCheckFoundOrNot,
            "token" : token
        })

    }catch(err){
        console.log(err)
    }
})

router.get('/me', auth, async (req, res)=>{
    try{
        let usertoFind = await userModels.findById(req.user.id)
        res.json(usertoFind)
    }catch(err){
        console.log("error in /me route", err)
    }
})

router.get('/', auth, async (req, res)=>{
    try{
        let allUsers = await userModels.find()
        // console.log("done fetching all users")
        res.json(allUsers)
    }catch(err){
        console.log("error fetching users", err)
    }
})

router.get('/:userId', auth, async (req, res)=>{
    try{
        let createdByInfo = await userModels.find({_id : req.params.userId})
        res.send(createdByInfo);
        // console.log("done getting user info, groups")
    }catch(err){
        console.log("error getting created by info", err)
    }
})

module.exports = router