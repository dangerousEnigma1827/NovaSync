let mongoose = require('mongoose')

let chatSchema = new mongoose.Schema({
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    chatMessage:String,
    groupId:String
}, {timestamps:true})

module.exports = mongoose.model('Chat', chatSchema)