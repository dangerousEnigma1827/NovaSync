const mongoose = require('mongoose')
// let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

let expenseSchema = new mongoose.Schema({
    
    groupId:{
        type:String,
        required:true

    },
    expenseName:{
        type:String,
        required:true
    },
    expenseDescription:{
        type:String,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    paidBy:{
        type:String,
        required:true
    },
    contributors:[
        String
    ],
    contributorsLength :{
        type:Number
    },
    splitType:{
        type:String
    },
    percentages:{
        type:Map,
        of:Number
    }
    
}, {timestamps:true})

// expenseSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("expenses", expenseSchema)