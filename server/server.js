const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const dbconnection = require('./database')
const app = express()

dotenv.config()

dbconnection()

const userRoutes = require('./routes/userRoutes')
const groupRoutes = require('./routes/groupRoutes')
let expenseRoutes = require('./routes/expenseRoutes')
let chatRoutes = require('./routes/chatRoutes')

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

app.use('/users', userRoutes)
app.use('/groups', groupRoutes)
app.use('/expenses', expenseRoutes)
app.use('/chats', chatRoutes)

let userModels = require('./models/userModels')

app.get('/', async (req,res)=>{
    let allUsers = await userModels.find()
})

app.listen(process.env.PORT || 3000, ()=>{
    console.log("successfully running")
})