import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { ArrowRight, Info, X , ChevronLeft, ChevronRight} from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from 'react-router-dom'

function Dashboard() {

  let [expenses, setExpenses] = useState([])
  let [expensePopup, setExpensePopup] = useState(false)
  let [currentExpense, setCurrentExpense] = useState([]);
  let [totalExpenseOfAUserInOneExpense, setTotalExpenseOfAUserInOneExpense] = useState([])
        
  let [minimumtransactionOfUserInAllExpenses, setminimumtransactionOfUserInAllExpenses] = useState([])
        
  let [amountOwedByUser, setAmountOwedByUser]=useState()
  let [amountToBeRecievedByUserTotal, setAmountToBeRecievedByUserTotal]=useState()
  let token = localStorage.getItem('token')
  let [usernameOfCurrentUser, setUsernameOfCurrentUser] = useState("")

  let [limit, setLimit] = useState(5)

  let navigate = useNavigate();

  let getCurrentUser = async () => {
    try{
      let currentUserInfo = await axios.get('http://localhost:3000/users/me', {
        headers:{
          Authorization: `Bearer ${token}`
        }
      })

      setUsernameOfCurrentUser(currentUserInfo.data.username)
    }catch(err){
      console.log("error getting current user info for dashboard")
    }
  }

  let [pagePart, setPage] = useState(1)
  let [numberOfPages, setNumberOfPages] = useState()


  let getAllExpenses = async () =>{
        try{
            let allexpensesfrombackend = await axios.get(`http://localhost:3000/expenses/dashboard/${pagePart}/${limit} `, {
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

        // console.log(allexpensesfrombackend.data.allexpensesGivenToFrontend)
        setNumberOfPages(Math.ceil(allexpensesfrombackend.data.totalNumberOfExpenses.length/limit))
        console.log(Math.ceil(allexpensesfrombackend.data.totalNumberOfExpenses.length/limit))


        setExpenses(allexpensesfrombackend.data.allexpensesGivenToFrontend)
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
            // console.log(minimumtransactionofallexpensesofuser.data.amountToBePaidByCurrentUser)
            setminimumtransactionOfUserInAllExpenses(minimumtransactionofallexpensesofuser.data.minimumtransactionOfUserInAllExpenses)
            // console.log(minimumtransactionofallexpensesofuser.data.minimumtransactionOfUserInAllExpenses[0].totalAmount)

            setAmountOwedByUser(minimumtransactionofallexpensesofuser.data.amountOwedByUserTotal[0].totalAmount)
            setAmountToBeRecievedByUserTotal(minimumtransactionofallexpensesofuser.data.amountToBeRecievedByUserTotal[0].totalAmount)

        }catch(err){
            console.log("error getting minimum transaction of user in all expenses",err)
        }
    }

    useEffect(()=>{
        minimumTransactionOfUserInAllExpneses()
        getCurrentUser()
    }, [])

    useEffect(()=>{
        getAllExpenses()
    }, [pagePart])

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
                    <button className='cursor-pointer text-white' onClick={(e)=>{
                        setExpensePopup(false)
                        document.body.style.overflow = "auto"
                        document.documentElement.style.overflow = "auto"
                    }}><X/></button>
                </div>
                <div className='bg-[#eef3ff] border-2 border-[#1e2230]/20 min-h-115 w-[800px] rounded-xl'>
                    <div className='ml-6 mt-6 flex flex-col justify-center items-start'>
                        <p className='text-[#1e4ed8] text-3xl font-bold mb-2'>{currentExpense.expenseName}</p>
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
                                            currentExpense.splitType === "Percentage" ? "1" : 
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

      <div className='sm:ml-60 flex flex-col items-center justify-center '>

       

      <div className='flex justify-start items-center mt-6 ml-6 w-[95%]'>
        <div>
          <p className='mb-2'>Welcome, {usernameOfCurrentUser}</p>
          <p className='text-[#1d4ed8] text-4xl font-bold'>Dashboard</p>
        </div>

        <div>
          <button className='opacity-0'>..</button>
        </div>
      </div>

      <div className='flex justify-center items-center w-[70vw] gap-8 mt-3 flex-col'>
            
            <div className='flex justify-between items-center w-full'>
              <p className='opacity-0'>Overview</p>
              <p className='flex justify-center items-center gap-2 text-[#1e2230]'><Info size={20} className='cursor-pointer'/> Overview</p>
            </div>

            <div className='flex justify-center items-center gap-10 w-full mb-6 sm:flex-row flex-col'>
              <div className='flex justify-center items-center w-[33%] border-2 border-[#1d4ed8]/20 rounded-xl p-2'>
                <p className='flex flex-col justify-center items-start my-4 gap-1'>Net Balance : <span className={` text-3xl ${minimumtransactionOfUserInAllExpenses[0]?.totalAmount > 0 ? "text-green-600" : "text-red-600"}`}>{minimumtransactionOfUserInAllExpenses[0]?.totalAmount.toFixed(2)}</span></p>
            </div>

           <div className='flex justify-center items-center w-[33%] border-2 border-[#1d4ed8]/20 rounded-xl p-2'>
                <p className='flex flex-col justify-center items-start my-4 gap-1'>Amount Owed : <span className={` text-3xl ${minimumtransactionOfUserInAllExpenses[0]?.totalAmount? "text-red-600" : "text-red-600"}`}>{amountOwedByUser?.toFixed(2)}</span></p>
            </div> 

           <div className='flex justify-center items-center w-[33%] border-2 border-[#1d4ed8]/20 rounded-xl p-2'>
                <p className='flex flex-col justify-center items-start my-4 gap-1'>Amount To Recieve : <span className={` text-3xl ${minimumtransactionOfUserInAllExpenses[0]?.totalAmount? "text-green-600" : "text-green-600"}`}>{amountToBeRecievedByUserTotal?.toFixed(2)}</span></p>
            </div> 
            </div>

      </div>

        <div className='flex justify-between items-center mr-6 ml-6 my-6 w-[70vw] mb-6'>
            <p className='text-3xl font-bold text-[#1d4ed8]'>Your Expenses!</p>
        </div>

        <div className='border-2 border-[#1d4ed8]/20 rounded-xl pt-4 mb-2 '>

        <div className='flex justify-evenly items-center border-b border-b-gray-300 pb-3 w-[70vw] text-gray-500 text-lg'>
          <p className='w-[14vw] flex justify-center items-center'>Index</p>
          <p className='w-[14vw] flex justify-center items-center'>Title</p>
          <p className='w-[14vw] flex justify-center items-center'>Paid By</p>
          <p className='w-[14vw] flex justify-center items-center'>Amount</p>
          <p className='w-[14vw] flex justify-center items-center'>Your Contribution</p>
          <div className='w-[14vw] flex justify-center items-center'>
            <button className='flex justify-center items-center gap-2 hover:bg-[#1d4ed8]/40 bg-[#1d4ed8] text-white px-3 py-1 cursor-pointer' onClick={(e)=>{
              navigate('/expenses')
          }}>View All <ArrowRight size={20}/></button>
          </div>
        </div>

        <div className=''>
        {
          expenses.map((expense, index)=>{
                    
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
                            return <span className={`${totalExpenseOfAUserInOneExpense[index2].finalResult.amount > 0 ? "text-green-600" : "text-red-600"}`}>{(totalExpenseOfAUserInOneExpense[index2].finalResult.amount >0 || totalExpenseOfAUserInOneExpense[index2].finalResult.amount <= 0) ? totalExpenseOfAUserInOneExpense[index2].finalResult.amount.toFixed(2) : "0"}</span>
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

        <div className='flex justify-between items-center w-[68vw] mb-6'>
          <div className='opacity-0'>
            <button className='cursor-pointer' onClick={(e)=>{setPage(pagePart-1)}}><ChevronLeft/></button>
            <button className='cursor-pointer' onClick={(e)=>{setPage(pagePart+1)}}><ChevronRight/></button>
          </div>
          <div className='flex gap-2 justify-center items-center'>
            <p >Page {pagePart} / {numberOfPages}</p>
            <button className='cursor-pointer text-gray-400 hover:text-gray-600' onClick={(e)=>{if(pagePart >= numberOfPages){
              setPage(pagePart-1)
            }}}><ChevronLeft/></button>
            <button className={`cursor-pointer text-gray-400 hover:text-gray-600`} onClick={(e)=>{if(pagePart <= numberOfPages){
              setPage(pagePart+1)
            }}}><ChevronRight/></button>
          </div>
        </div>


    </div>
    </div>
  )
}

export default Dashboard