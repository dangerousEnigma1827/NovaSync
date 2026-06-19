const mongoose = require('mongoose')

let dbconnection = async () =>{
    try{
        await mongoose.connect('mongodb://localhost:27017/Novasync')
        console.log("done")
    }catch(err){
        console.log("Error occured while connecting to DB")
    }
}

module.exports = dbconnection