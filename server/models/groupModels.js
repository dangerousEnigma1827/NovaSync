let mongoose = require('mongoose')

let groupModel = new mongoose.Schema({
    groupName:{
        type:String,
        required:true
    },
    groupDescription:{
        type:String,
        required:true
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]
})

module.exports = mongoose.model("Group", groupModel)