let express = require('express')
let chatModels = require('../models/chatModels')
let auth = require('../middlewares/auth')
let router = express.Router()

router.get('/:groupId', auth, async (req, res)=>{
    try{
        let chatsToGiveFromBackend = await chatModels.find({groupId : req.params.groupId}).populate('createdBy', 'username')

        res.json({chatsToGiveFromBackend})

    }catch(err){
        console.log("error getting chats from backend", err)
    }

})

router.post('/:groupId/add', auth, async (req, res)=>{
    if(req.body.chatMessage.trim() == ""){
        return res.status(400).json({
            "message":"Cant Send An Empty Message!"
        })
    }
    try{
        let newChat = await chatModels.create(req.body)
        res.json({newChat})

    }catch(err){
        console.log("error creating a new chat", err)
    }

})

module.exports = router