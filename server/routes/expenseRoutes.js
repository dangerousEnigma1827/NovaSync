let express = require('express')
let expenseModels = require('../models/expenseModels')
let router = express.Router()
let auth = require('../middlewares/auth')


// all expenses
router.get('/dashboard/:page/:limit', auth, async (req, res) => {

    let limit = req.params.limit
    let skipDocs = (req.params.page-1)*limit

    try{
    let allexpensesGivenToFrontend = await expenseModels.find(
        {contributors : req.user.username}
    ).skip(skipDocs).limit(limit)

    let allexpensesGivenToFrontendNumber = await expenseModels.find(
        {contributors : req.user.username}
    )



    res.json({allexpensesGivenToFrontend, "totalNumberOfExpenses":allexpensesGivenToFrontendNumber})

    }catch(err){
        console.log("error sending all expenses from backend", err)
    }
})


router.get('/', auth, async (req, res) => {
    try{
    let allexpensesGivenToFrontend = await expenseModels.find({
        contributors : req.user.username
    })

    res.json({allexpensesGivenToFrontend})
    }catch(err){
        console.log("error sending all expenses from backend", err)
    }
})


// expenses page me user ka total amount
router.get('/minimumTransactionInAllExpenses', auth, async (req, res)=>{
    try{
    let minimumtransactionOfUserInAllExpenses = await expenseModels.aggregate([
        {
            $project:{
                finalResult : {
                    $map:{
                    input: {"$objectToArray" : '$percentages'},
                    as : "oneuser",
                    in : {
                        "user":"$$oneuser.k",
                        "amount":{
                            $cond : [
                                {$eq : ["$$oneuser.k" , "$paidBy"]}
                            , 
                            {$subtract : ["$totalAmount", {$multiply : [{$divide : ["$totalAmount", 100]} , "$$oneuser.v"]}]},
                            {$multiply : [{$divide : ["$totalAmount", -100]} , "$$oneuser.v"]}
                                ]
                            }
                        }
                    }
                
                    }
                }
        },

        {$unwind : "$finalResult"},
            

        {
            $group:{
                "_id":"$finalResult.user",
                "totalAmount":{
                    $sum : "$finalResult.amount"
                }
            }
        },

        {
            $project:{
                user:"$_id",
                "totalAmount":1
            }
        }, {
            $match:{"user":req.user.username}
        }
    ])

    let amountOwedByUserTotal = await expenseModels.aggregate([
        {
            $project:{
                finalResult : {
                    $map:{
                    input: {"$objectToArray" : '$percentages'},
                    as : "oneuser",
                    in : {
                        "user":"$$oneuser.k",
                        "amount":{
                            $cond : [
                                {$eq : ["$$oneuser.k" , "$paidBy"]}
                            , 
                            {$subtract : ["$totalAmount", {$multiply : [{$divide : ["$totalAmount", 100]} , "$$oneuser.v"]}]},
                            {$multiply : [{$divide : ["$totalAmount", -100]} , "$$oneuser.v"]}
                                ]
                            }
                        }
                    }
                
                    }
                }
        },

        {$unwind : "$finalResult"},
            

        {
            $group:{
                "_id":"$finalResult.user",
                "totalAmount":{
                            $sum : {
                                $cond : [
                                    {$lt : ["$finalResult.amount", 0]},
                                    "$finalResult.amount",
                                    0
                                ]
                            }
                    }
            }
        },

        {
            $project:{
                user:"$_id",
                "totalAmount":1
            }
        }, 
        {
            $match:{"user":req.user.username}
        }
    ])

    let amountToBeRecievedByUserTotal = await expenseModels.aggregate([
        {
            $project:{
                finalResult : {
                    $map:{
                    input: {"$objectToArray" : '$percentages'},
                    as : "oneuser",
                    in : {
                        "user":"$$oneuser.k",
                        "amount":{
                            $cond : [
                                {$eq : ["$$oneuser.k" , "$paidBy"]}
                            , 
                            {$subtract : ["$totalAmount", {$multiply : [{$divide : ["$totalAmount", 100]} , "$$oneuser.v"]}]},
                            {$multiply : [{$divide : ["$totalAmount", -100]} , "$$oneuser.v"]}
                                ]
                            }
                        }
                    }
                
                    }
                }
        },

        {$unwind : "$finalResult"},
            

        {
            $group:{
                "_id":"$finalResult.user",
                "totalAmount":{
                            $sum : {
                                $cond : [
                                    {$gt : ["$finalResult.amount", 0]},
                                    "$finalResult.amount",
                                    0
                                ]
                            }
                    }
            }
        },

        {
            $project:{
                user:"$_id",
                "totalAmount":1
            }
        }, 
        {
            $match:{"user":req.user.username}
        }
    ])

    let amountToBePaidByCurrentUser = await expenseModels.aggregate([

            {
                $project : {
                    finalResult : {
                        $map:{
                            input:{"$objectToArray":"$percentages"},
                            as:"contributor",
                            in : {
                                    "user":"$$contributor.k",
                                    amount : {
                                        $cond :[
                                            {$eq : ["$$contributor.k", "$paidBy"]},
                                            {$subtract : ["$totalAmount", {$multiply : [{$divide : ["$totalAmount", 100]} , "$$contributor.v"]}]},
                                            {$multiply : [{$divide : ["$totalAmount", -100]} , "$$contributor.v"]}
                                        ]
                                    }
                            }
                        }
                    }
                }
            },

            {
                $unwind: "$finalResult"
            },
            
            {
                $match:{
                    "finalResult.user":req.user.username
                }
            }
    ])

   

    res.json({minimumtransactionOfUserInAllExpenses, amountToBePaidByCurrentUser, amountOwedByUserTotal, amountToBeRecievedByUserTotal})
}catch(err){
    console.log("errro sending minimum transaction of all expenses", err)
}
})



// group me
router.get('/:groupId', auth, async (req, res)=>{

    try{
        let totalExpense
        // all expenses in a group 
        if(req.query.userFilter == "None"){
            totalExpense = await expenseModels.aggregate([
            {
                $match:{
                    "groupId":req.params.groupId,
                }
            }
        ])
        }else{
            totalExpense = await expenseModels.aggregate([
            {
                $match:{
                    "groupId":req.params.groupId,
                    "contributors":req.query.userFilter
                }
            }
        ])
        }

        // let totalExpense = await expenseModels.aggregate([
        //     {
        //         $match:{
        //             "groupId":req.params.groupId,
        //             "contributors":req.query.userFilter
        //         }
        //     }
        // ])

        // net +- contribution of user in one expense (5th column)
        let amountToBePaidByCurrentUser = await expenseModels.aggregate([
            {
                $match:{
                    "groupId" : req.params.groupId
                }
            },

            {
                $project : {
                    finalResult : {
                        $map:{
                            input:{"$objectToArray":"$percentages"},
                            as:"contributor",
                            in : {
                                    "user":"$$contributor.k",
                                    amount : {
                                        $cond :[
                                            {$eq : ["$$contributor.k", "$paidBy"]},
                                            {$subtract : ["$totalAmount", {$multiply : [{$divide : ["$totalAmount", 100]} , "$$contributor.v"]}]},
                                            {$multiply : [{$divide : ["$totalAmount", -100]} , "$$contributor.v"]}
                                        ]
                                    }
                            }
                        }
                    }
                }
            },

            {
                $unwind: "$finalResult"
            },
            
            {
                $match:{
                    "finalResult.user":req.query.userFilter
                }
            }
        ])

        console.log(amountToBePaidByCurrentUser)
        console.log("ok")

        res.json({
            "totalExpense" : totalExpense,
            // "amountToBePaidByUser":amountToBePaidByUser,
            "amountToBePaidByCurrentUser":amountToBePaidByCurrentUser
        })

    }catch(err){
        console.log("error getting all expenses in backend", err)
    }
})


router.get('/:groupId/minimumTransaction', auth, async (req,res)=>{
    try{

        // minimum transaction of all users in a group, total to pay (+- of all expenses)
        let minimumTransactionsInBackend = await expenseModels.aggregate([
            {
                $match:{
                    "groupId" : req.params.groupId
                }
            },

            {
                $project : {
                    finalResult : {
                        $map:{
                            input:{"$objectToArray":"$percentages"},
                            as:"contributor",
                            in : {
                                    "user":"$$contributor.k",
                                    amount : {
                                        $cond :[
                                            {$eq : ["$$contributor.k", "$paidBy"]},
                                            {$subtract : ["$totalAmount", {$multiply : [{$divide : ["$totalAmount", 100]} , "$$contributor.v"]}]},
                                            {$multiply : [{$divide : ["$totalAmount", -100]} , "$$contributor.v"]}
                                        ]
                                    }
                            }
                        }
                    }
                }
            },

            {$unwind : "$finalResult"},
            

            {
                $group:{
                    "_id":"$finalResult.user",
                    "totalAmount":{
                        $sum : "$finalResult.amount"
                    }
                }
            },

            {
                $project:{
                    user:"$_id",
                    "totalAmount":1
                }
            }
        ])

        console.log(minimumTransactionsInBackend)


        // // console.log(minimumTransactionsInBackend)
        // for(let i=0; i< minimumTransactionsInBackend.length; i++){
        //     if(minimumTransactionsInBackend[i].totalAmount > 0){
        //         positiveUsers = [...positiveUsers, Math.round(minimumTransactionsInBackend[i].totalAmount)]
        //     }
        //     if(minimumTransactionsInBackend[i].totalAmount < 0){
        //         negativeUsers = [...negativeUsers, Math.round(minimumTransactionsInBackend[i].totalAmount)]
        //     }
        // }

        // let oneTransaction = (tempObj) => {

        //     let positiveNumIndexInPositiveUsers=0, negativeNumIndexInNegativeUsers=0


        //     // let allSorted=true;

        //     // for(let i=0; i<tempObj.length; i++)
        //     // {
        //     //     if(tempObj[i].totalAmount != 0){
        //     //         allSorted = false;
        //     //     }
        //     // }

        //     // if(allSorted){
        //     //     console.log("returning")
        //     //     return recordOfTransactions
        //     // }

        //     let maxPositive=0, maxNeg=0;

        //     for(let i=0; i<positiveUsers.length; i++){
        //         if(positiveUsers[i] > maxPositive){
        //             maxPositive = positiveUsers[i]
        //             positiveNumIndexInPositiveUsers = i
        //         }
        //     }
        //     for(let i=0; i<negativeUsers.length; i++){
        //         if(Math.abs(negativeUsers[i]) > Math.abs(maxNeg)){
        //             maxNeg = negativeUsers[i]
        //             negativeNumIndexInNegativeUsers = i
        //         }
        //     }

        //     // console.log(maxNeg, maxPositive, "1")

        //     let positiveNumIndex, negativeNumIndex


        //     for(let i=0; i<tempObj.length; i++)
        //     {
        //         if(tempObj[i].totalAmount == maxPositive){
        //             positiveNumIndex = i
        //         }
        //         if(tempObj[i].totalAmount == maxNeg){
        //             negativeNumIndex = i
        //         }
        //     }

        //     if(Math.round(Math.abs(maxNeg)) > Math.round(maxPositive)){

        //         console.log("case 1", maxNeg, maxPositive)

        //         console.log(negativeNumIndex)
        //         // tempObj[negativeNumIndex].totalAmount = Math.round(maxNeg)+Math.round(maxPositive)
        //         // tempObj[positiveNumIndex].totalAmount = 0

        //         // recordOfTransactions = [...recordOfTransactions, {
        //         //     "from":tempObj[negativeNumIndex].user,
        //         //     "to":tempObj[positiveNumIndex].user,
        //         //     "totalAmount":Math.round(maxNeg)+Math.round(maxPositive)
        //         // }]

        //         recordOfTransactions = [...recordOfTransactions, {
        //             "from":tempObj[negativeNumIndex].user,
        //             "to":tempObj[positiveNumIndex].user,
        //             "totalAmount": maxPositive
        //         }]


        //         positiveUsers[positiveNumIndexInPositiveUsers] = 0
        //         negativeUsers[negativeNumIndexInNegativeUsers] = Math.round(maxNeg)+Math.round(maxPositive)
        //     }

        //     if(Math.round(maxPositive)+Math.round(maxNeg) > 0){
        //         console.log("case 2", maxNeg, maxPositive)

        //         tempObj[positiveNumIndex].totalAmount = Math.round(maxNeg)+Math.round(maxPositive)
        //         tempObj[negativeNumIndex].totalAmount = 0

        //         recordOfTransactions = [...recordOfTransactions, {
        //             "from":tempObj[negativeNumIndex].user,
        //             "to":tempObj[positiveNumIndex].user,
        //             "totalAmount":  Math.round(Math.abs(maxNeg))
        //         }]

        //         negativeUsers[negativeNumIndexInNegativeUsers] = 0
        //         positiveUsers[positiveNumIndexInPositiveUsers] = Math.round(maxNeg)+Math.round(maxPositive)
        //     }

        //     if(Math.round(maxNeg) + Math.round(maxPositive) == 0){

        //         console.log("case 3", maxNeg, maxPositive)

        //         tempObj[positiveNumIndex].totalAmount = Math.round(maxNeg)+Math.round(maxPositive)
        //         tempObj[negativeNumIndex].totalAmount = 0

        //         recordOfTransactions = [...recordOfTransactions, {
        //             "from":tempObj[negativeNumIndex].user,
        //             "to":tempObj[positiveNumIndex].user,
        //             "totalAmount": maxPositive
        //         }]

        //         negativeUsers[negativeNumIndexInNegativeUsers] = 0
        //         positiveUsers[positiveNumIndexInPositiveUsers] = Math.round(maxNeg)+Math.round(maxPositive)
        //     }

        //     // console.log(tempObj)
        //     console.log(recordOfTransactions)


        // }
        
        // oneTransaction(tempObj)
        // oneTransaction(tempObj)

        // maxPositive = 0, maxNeg = 0

        // for(let i=0; i<positiveUsers.length; i++){
        //     if(positiveUsers[i] > maxPositive){
        //         maxPositive = positiveUsers[i]
        //         positiveNumIndexInPositiveUsers = i
        //     }
        // }

        // for(let i=0; i<negativeUsers.length; i++){
        //     if(Math.abs(negativeUsers[i]) > Math.abs(maxNeg)){
        //         maxNeg = negativeUsers[i]
        //         negativeNumIndexInNegativeUsers = i
        //     }
        // }

        // console.log(maxNeg, maxPositive)

        
        let positiveUsers = []
        let negativeUsers = []
        let negativeUsersTemp = []

        let tempObj = minimumTransactionsInBackend


        let recordOfTransactions = []

        console.log(tempObj)

        for(let i=0; i<tempObj.length; i++)
        {
            if(tempObj[i].totalAmount > 0){
                positiveUsers = [...positiveUsers, (tempObj[i].totalAmount)]
            }
            if(tempObj[i].totalAmount < 0){
                negativeUsers = [...negativeUsers, (tempObj[i].totalAmount)]
                negativeUsersTemp = [...negativeUsersTemp, (-1*tempObj[i].totalAmount)]
            }
        }


        let oneTransaction = (tempObj) => {
            let maxNeg=0, maxPos=0
            let maxPosIndex, maxNegIndex

            let isSorted=1

            for(let i=0; i<tempObj.length; i++){
                if(tempObj[i].totalAmount > 0.0000001){
                    isSorted=0
                    break;
                }
            }

            
            if(isSorted){
                console.log("done")
                return;
            }
            // console.log("returing")

            for(let i=0; i<positiveUsers.length; i++)
            {
                if(maxPos < positiveUsers[i]){
                    maxPos = positiveUsers[i]
                    maxPosIndex=i
                }
            }

            for(let i=0; i<negativeUsers.length; i++)
            {
                if(maxNeg > (negativeUsers[i])){
                    maxNeg = negativeUsers[i]
                    maxNegIndex=i
                }
            }

            // console.log(positiveUsers, negativeUsers)
            // console.log(maxNeg, maxPos)

            let userindexintempMax, userindexintempMin

            for(let i=0; i<tempObj.length; i++)
            {
                if(tempObj[i].totalAmount == maxNeg){
                    userindexintempMin=i
                }
                if(tempObj[i].totalAmount == maxPos){
                    userindexintempMax=i
                }
            }

            

            if(maxPos < Math.abs(maxNeg)){
                console.log("case1", maxNeg, maxPos)
                positiveUsers[maxPosIndex]=0
                negativeUsers[maxNegIndex] = maxPos+maxNeg
                tempObj[userindexintempMax].totalAmount = 0
                tempObj[userindexintempMin].totalAmount = maxNeg+maxPos

                recordOfTransactions = [
                    ...recordOfTransactions, {
                        "fromUser":tempObj[userindexintempMin].user,
                        "toObj":tempObj[userindexintempMax].user,
                        "amountTransferred":maxPos
                    }
                ]
            }
            if(maxPos > Math.abs(maxNeg)){
                console.log("case2", maxNeg, maxPos)
                positiveUsers[maxPosIndex]=maxPos+maxNeg
                negativeUsers[maxNegIndex] = 0

                tempObj[userindexintempMin].totalAmount = 0
                tempObj[userindexintempMax].totalAmount = maxNeg+maxPos

                recordOfTransactions = [
                    ...recordOfTransactions, {
                        "fromUser":tempObj[userindexintempMin].user,
                        "toObj":tempObj[userindexintempMax].user,
                        "amountTransferred":maxNeg*(-1)
                    }
                ]
            }
            if(maxPos == Math.abs(maxNeg)){
                console.log("case3", maxNeg, maxPos)
                positiveUsers[maxPosIndex]=maxPos+maxNeg
                negativeUsers[maxNegIndex] = 0

                tempObj[userindexintempMin].totalAmount = 0
                tempObj[userindexintempMax].totalAmount = 0

                recordOfTransactions = [
                    ...recordOfTransactions, {
                        "fromUser":tempObj[userindexintempMin].user,
                        "toObj":tempObj[userindexintempMax].user,
                        "amountTransferred":maxPos
                    }
                ]
            }

            // console.log(recordOfTransactions)
            // console.log(tempObj)
            // console.log(positiveUsers, negativeUsers)

            
            oneTransaction(tempObj)
        }


        oneTransaction(tempObj)

        // minimum transaction only of current user in a group
        let minimumTransactionsInBackendForCurrentuser = await expenseModels.aggregate([
            {
                $match:{
                    "groupId" : req.params.groupId
                }
            },

            {
                $project : {
                    finalResult : {
                        $map:{
                            input:{"$objectToArray":"$percentages"},
                            as:"contributor",
                            in : {
                                    "user":"$$contributor.k",
                                    amount : {
                                        $cond :[
                                            {$eq : ["$$contributor.k", "$paidBy"]},
                                            {$subtract : ["$totalAmount", {$multiply : [{$divide : ["$totalAmount", 100]} , "$$contributor.v"]}]},
                                            {$multiply : [{$divide : ["$totalAmount", -100]} , "$$contributor.v"]}
                                        ]
                                    }
                            }
                        }
                    }
                }
            },

            {$unwind : "$finalResult"},
            

            {
                $group:{
                    "_id":"$finalResult.user",
                    "totalAmount":{
                        $sum : "$finalResult.amount"
                    }
                }
            },

            {
                $project:{
                    user:"$_id",
                    "totalAmount":1
                }
            },

            {
                $match : {
                    "user":req.query.userFilter
                }
            }
        ])

    res.json({
        minimumTransactionsInBackend, minimumTransactionsInBackendForCurrentuser,
        "recordOfTransactions":recordOfTransactions
    })

    }catch(err){
        console.log("error getting minmum transactions", err)
    }

})


router.post('/:groupId/add', auth, async (req, res)=>{
    console.log(req.body)

    if(req.body.splitType == "" || !req.body.paidBy || !req.body.totalAmount || !req.body.expenseName || !req.body.expenseDescription) return res.status(400).json({"message":"Fill All The Provided Inputs!"})

    let expenseDataInBackend = await expenseModels.create(req.body)

    if(req.body.splitType == "Equal"){
        console.log("equal")
    } 
})


module.exports = router


