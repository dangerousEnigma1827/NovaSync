const jwt = require('jsonwebtoken')

let auth = async (req, res, next)=>{
    let token = req.header("Authorization").split(" ")[1]

    if(!token) return res.status(401)?.json({"message":"No Token Exists"})

    try{
        let userInfo = jwt.verify(token, process.env.JWTCODE)
        req.user = userInfo
        // console.log(req.user)
        next()
    }catch(err){
        return res.status(404).json({
            "message":"User Not Verified"
        })
    }
}

module.exports = auth


// If you want next, I can:

// teach $lookup (JOINs)

// show pagination with aggregation

// build a dashboard API

// give interview questions + answers

// Just say 👍