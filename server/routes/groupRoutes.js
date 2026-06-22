let express = require('express')
let groupModels = require('../models/groupModels')
let router = express.Router()
let auth = require('../middlewares/auth')

router.post('/create', auth, async (req, res)=>{

    if(req.body.groupName.trim() == "" || req.body.groupDescription.trim() == "")
    {
        return res.status(400).json({
            message:"Please Fill All The Inputs!"
        })
    }
    try{
        let newGroup = await groupModels.create({
            "groupName":req.body.groupName,
            "groupDescription":req.body.groupDescription,
            "createdBy": req.user.id,
            "members": [...req.body.members, req.user.id]
        }, {timestamps:true})
        res.json(newGroup)
    }catch(err){
        console.log("error in creating group", err)

        return res.json({
            message:"error in creating group"
        })
    }
})

router.get('/', auth, async (req, res)=>{
    try{
        let groupsList = await groupModels.find({"members":req.user.id}).populate("createdBy members", "username")
        res.send(groupsList)
    }catch(err){
        console.log("error in getting post lists", err)
    }
})

router.get('/:groupId', auth, async (req, res)=>{
    try{
        let viewedGroup = await groupModels.find({_id : req.params.groupId}).populate("createdBy", "username").populate("members", "username")
        res.send(viewedGroup)
    }catch(err){
        console.log("error getting viewed group data")
    }
})


router.post('/update/:groupId', auth, async (req, res)=>{

    if(req.body.updatedGroupName.trim() == "" || req.body.updatedGroupDescription.trim() == ""){
        return res.status(400).json({
            message:"Please Fill All The Inputs"
        })
    }

    try{
        let updatedGroup = await groupModels.findOneAndUpdate(
            {_id : req.params.groupId}, 
            {$set: {
                "groupName":req.body.updatedGroupName,
                "groupDescription":req.body.updatedGroupDescription
            }},
            { new : true}
        )
        res.send(updatedGroup)
    }
    
    catch(err){

        console.log("error in update backend", err)

        return res.json({
            message: "Updation me error"
        })
    }
})

router.delete('/delete/:groupId', auth, async (req,res)=>{
    try{
        let groupToDelete = await groupModels.findOneAndDelete({_id : req.params.groupId})

        res.json({
            groupToDelete
        })
    }catch(err){
        console.log("error deleting group in bakcend", err)

        return res.json({
            message : "Error deleting"
        })
    }
})

module.exports = router