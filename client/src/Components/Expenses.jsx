import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { X, Search } from 'lucide-react'
import { motion, AnimatePresence, time } from "framer-motion"



function Expenses() {
    let [expenses, setExpenses] = useState([])
    let [expensesTemp, setExpensesTemp] = useState([])
    let [expensePopup, setExpensePopup] = useState(false)
    let [currentExpense, setCurrentExpense] = useState([]);
    // in one expense
    let [totalExpenseOfAUserInOneExpense, setTotalExpenseOfAUserInOneExpense] = useState([])

    // all expenses
    let [minimumtransactionOfUserInAllExpenses, setminimumtransactionOfUserInAllExpenses] = useState([])

    let [amountOwedByUser, setAmountOwedByUser]=useState()
    let [amountToBeRecievedByUserTotal, setAmountToBeRecievedByUserTotal]=useState()
    let token = localStorage.getItem('token')

    let [searchInput, setSearchInput] = useState("")
    let [timeFilter, setTimeFilter] = useState("None")
    let timeFilterArray;

    let getAllExpenses = async () =>{
        try{
            let allexpensesfrombackend = await axios.get('http://localhost:3000/expenses/', {
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

        // console.log(allexpensesfrombackend.data.allexpensesGivenToFrontend)

        setExpenses(allexpensesfrombackend.data.allexpensesGivenToFrontend)
        setExpensesTemp(allexpensesfrombackend.data.allexpensesGivenToFrontend)
        }catch(err){
            console.log("error getting all expenses", err)
        }
    }

    let minimumTransactionOfUserInAllExpneses = async () => {
        try{
            let minimumtransactionofallexpensesofuser = await axios.get('http://localhost:3000/expenses/minimumTransactionInAllExpenses', {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            setTotalExpenseOfAUserInOneExpense(minimumtransactionofallexpensesofuser.data.amountToBePaidByCurrentUser)
            setminimumtransactionOfUserInAllExpenses(minimumtransactionofallexpensesofuser.data.minimumtransactionOfUserInAllExpenses)

            // setAmountOwedByUser(minimumtransactionofallexpensesofuser.data.amountOwedByUserTotal[0].totalAmount)
            // setAmountToBeRecievedByUserTotal(minimumtransactionofallexpensesofuser.data.amountToBeRecievedByUserTotal[0].totalAmount)

        }catch(err){
            console.log("error getting minimum transaction of user in all expenses",err)
        }
    }

    let timeAgo = (timeGiven) =>{
        let timeDiff = (new Date().getTime() - new Date(timeGiven).getTime())/(1000*60*60*24)
        console.log(timeDiff)
        
        if(timeDiff < 1){
            console.log((new Date().getTime() - new Date(timeGiven).getTime()))
            timeFilterArray = ["Today", "This Month", "This Week", "This Year", "None"]
                console.log(timeFilterArray)

            return timeFilterArray
        }

        if(timeDiff < 7){
            console.log("2")
                timeFilterArray = ["This Month", "This Week", "This Year", "None"]
                console.log(timeFilterArray)

            return timeFilterArray
        }
        if(timeDiff < 31){
            console.log("3")
                timeFilterArray = ["This Month", "This Year", "None"]
                console.log(timeFilterArray)
            return timeFilterArray
        }
        if(timeDiff/31 < 12){
            console.log("3")
                timeFilterArray = [ "This Year", "None"]
                console.log(timeFilterArray)
            return timeFilterArray
        }
        else if(timeDiff/31 > 12){
            console.log("3")
                timeFilterArray = ["Other", "None"]
                console.log(timeFilterArray)
            return timeFilterArray
        }
        

    }

    useEffect(()=>{
        getAllExpenses()
        minimumTransactionOfUserInAllExpneses()
    }, [])

  return (
    <div>

        <AnimatePresence>
            {expensePopup && 
           <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}>
           <div className='inset-0 fixed flex flex-col justify-center items-center h-screen w-screen backdrop-blur-sm bg-black/50'>
                <div className='flex justify-between items-center w-[90%]'>
                    <button className='opacity-0'><X/></button>
                    
                </div>
                <div className='bg-[#eef3ff] border-2 border-[#1e2230]/20 min-h-95 w-[500px] rounded-xl pb-5'>
                    <div className='ml-6 mt-6 flex flex-col justify-center items-start'>
                        <div className='flex justify-between items-center w-[95%] mb-2'>
                            <p className='text-[#1e4ed8] text-3xl font-bold mb-2'>{currentExpense.expenseName}</p>
                            <button className='cursor-pointer text-white bg-[#1d4ed8] py-0.5 px-1.5 flex justify-center items-center gap-1 hover:bg-[#1d4ed8]/60' onClick={(e)=>{
                            setExpensePopup(false)
                            document.body.style.overflow = "auto"
                            document.documentElement.style.overflow = "auto"
                            }}>Close<X/></button>
                        </div>
                        <p className='text-gray-600 w-[80%]'>{currentExpense.expenseDescription}</p>

                        <div className='mt-4'>
                            <p><span className='text-[#2563eb] font-semibold text-[20px] mb-2'>Payer</span> : {currentExpense.paidBy}</p>
                            <p><span className='text-[#2563eb] font-semibold text-[20px]'>Total Amount</span> : {currentExpense.totalAmount}</p>
                        </div>

                        <div className='mt-4'>
                            <p><span className='text-[#2563eb] font-semibold text-[20px]'>Split Type</span> : {currentExpense.splitType}</p>
                        </div>

                        <div className='mt-4 flex flex-col'>
                            <p className='mb-2'><span className='text-[#2563eb] font-semibold text-[20px]'>Contributors : </span></p>
                            <div className='flex gap-3'>
                                <div className='flex flex-col'>
                                {
                                    Object.keys(currentExpense.percentages).map((user, index)=>{
                                        return <p key={index}>{user}{" : "}</p>
                                    })
                                }
                                </div>
                                
                                <div className='flex flex-col'>
                                {

                                    // 
                                    Object.values(currentExpense.percentages).map((amount, index)=>{
                                        return <p key={index}>{
                                            currentExpense.splitType === "Percentage" ? amount : 
                                            (currentExpense.splitType === "Equal"? 
                                                (currentExpense.totalAmount/currentExpense.contributorsLength).toFixed(2)  : (currentExpense.totalAmount/currentExpense.contributorsLength).toFixed(2))
                                                
                                        }{currentExpense.splitType === "Percentage" ? " %" : " /-"}</p>
                                    })
                                }

                                
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div></motion.div>}
           </AnimatePresence>
        <div className='flex justify-center items-center flex-col ml-60 '>

           

        <div className='flex justify-between items-center mr-6 ml-6 my-6 w-[95%] mb-6'>
            <p className='text-4xl font-bold text-[#1d4ed8]'>Your Expenses!</p>
            <button className='opacity-0 bg-[#1d4ed8] px-2 py-0.5 hover:bg-blue-700/60 text-white'>Add Group</button>
        </div>

        <div className='flex items-center justify-between w-130 bg-gray-70 rounded-full border py-2 px-3 gap-2 border-[#c5cdde] mt-5 mb-5 transition '>
              <div className='flex justify-start items-center w-[90%] gap-4'>
                <Search/><input type="text" placeholder='Search By Expense Name' className={`outline-none text-md`} value={searchInput}  onChange={(e)=>{
                setSearchInput(e.target.value)
              }}/>
              </div>

              <X className={`cursor-pointer mr-2 ${searchInput.trim() == "" ? "opacity-0" : "opacity-100"}`} onClick={(e)=>{
                setSearchInput("")
              }}/>
            </div>

        <div className='flex justify-start w-[70vw] gap-5 my-3 flex-col mb-5'>
            <div className='flex gap-10'>
                <p>Filter By : </p>
                <div className='flex gap-14'>
                <p className={`cursor-pointer ${timeFilter=="None"?"text-[#1d4ed8]" : ""}`} onClick={(e)=>{setTimeFilter("None")}}>None</p>
                <p className={`cursor-pointer ${timeFilter=="Today"?"text-[#1d4ed8]" : ""}`} onClick={(e)=>{setTimeFilter("Today")}}>Today</p>
                <p className={`cursor-pointer ${timeFilter=="This Week"?"text-[#1d4ed8]" : ""}`}onClick={(e)=>setTimeFilter("This Week")}>This Week</p>
                <p className={`cursor-pointer ${timeFilter=="This Month"?"text-[#1d4ed8]" : ""}`} onClick={(e)=>setTimeFilter("This Month")}>This Month</p>
                <p className={`cursor-pointer ${timeFilter=="This Year"?"text-[#1d4ed8]" : ""}`} onClick={(e)=>setTimeFilter("This Year")}>This Year</p>
                <p className={`cursor-pointer ${timeFilter=="Other"?"text-[#1d4ed8]" : ""}`} onClick={(e)=>setTimeFilter("Other")}>Other</p>
                </div>
            </div>
            {/* <div className='flex gap-10'>
                <p className='opacity-0'>Filter By : </p>
                <div className='flex gap-14'>
                <p className={`cursor-pointer ${owedFilter=="Owed"?"text-[#1d4ed8]" : ""}`} onClick={(e)=>{setOwedFilter("Owed")}}>Owed</p>
                <p className={`cursor-pointer ${owedFilter=="To Recieve"?"text-[#1d4ed8]" : ""}`}onClick={(e)=>setOwedFilter("To Recieve")}>To Recieve</p>
                </div>
            </div> */}

        </div>
        <div className='border-2 border-[#1d4ed8]/20 rounded-xl pt-4 mb-10 mt-3'>

        <div className='flex justify-evenly items-center border-b border-b-gray-300 pb-3 w-[70vw] text-gray-500 text-lg'>
          <p className='w-[14vw] flex justify-center items-center'>Index</p>
          <p className='w-[14vw] flex justify-center items-center'>Title</p>
          <p className='w-[14vw] flex justify-center items-center'>Paid By</p>
          <p className='w-[14vw] flex justify-center items-center'>Amount</p>
          <p className='w-[14vw] flex justify-center items-center'>Your Contribution</p>
        <button className='w-[14vw] flex justify-center items-center opacity-0'>View</button>
            </div>

            <div className=''>
        {
          expenses.filter((expense, index)=>{
            // console.log(timeFilter != "None")
            // console.log(timeFilter != "None" ? timeFilter == timeAgo(expense.createdAt) : true)
            console.log(new Date().getTime() - new Date(expense.createdAt).getTime())
            timeAgo(expense.createdAt)
            return expense.expenseName.toLowerCase().includes(searchInput.trim().toLowerCase()) && timeFilterArray.includes(timeFilter)
          }).map((expense, index)=>{
                    // timeAgo(expense.createdAt)
                    return <div className='flex justify-evenly items-center w-[70vw] border-b border-b-gray-300 py-7' key={index}>
                      <p className='w-[14vw] flex justify-center items-center'>{index+1}</p>
                      <p className='w-[14vw] flex justify-center items-center'>{expense.expenseName}</p>
                      <p className='w-[14vw] flex justify-center items-center'>{expense.paidBy}</p>
                      <p className='w-[14vw] flex justify-center items-center'>{expense.totalAmount}</p>


                      {/* <p className={`w-[14vw] flex justify-center items-center text-2xl ${!totalExpenseOfAUserInOneExpense?.[index]?.finalResult.amount.toFixed(2).includes("-") ? "text-green-600" : "text-red-600"}`}>{totalExpenseOfAUserInOneExpense?.[index]?.finalResult.amount.toFixed(2) ? "" : "-"} {totalExpenseOfAUserInOneExpense?.[index]?.finalResult.amount.toFixed(2)}</p> */}

                      <p 
                      className={`w-[14vw] flex justify-center items-center text-2xl ${!totalExpenseOfAUserInOneExpense?.[index]?.finalResult?.amount.toFixed(2).includes("-") ? "text-green-600" : "text-red-600"}`}>
                      {
                        totalExpenseOfAUserInOneExpense.map((totalSum,index2)=>{
                          if(totalExpenseOfAUserInOneExpense[index2]._id == expense._id){
                            return <span className={`${totalExpenseOfAUserInOneExpense[index2].finalResult.amount > 0 ? "text-green-600" : "text-red-600"}`}>{totalExpenseOfAUserInOneExpense[index2].finalResult.amount ? totalExpenseOfAUserInOneExpense[index2].finalResult.amount.toFixed(2

                            ) : "0"}</span>
                          }
                        })
                      }
                      </p>


                        <button className='w-[14vw] flex justify-center items-center cursor-pointer' onClick={(e)=>{
                            setCurrentExpense(expense)
                            setExpensePopup(true)
                            document.body.style.overflow = "hidden"
                            document.documentElement.style.overflow = "hidden"
                        }}>View</button>
                    </div>
                })

        }


            </div>

        </div>
    </div>
    </div>
  )
}

export default Expenses