import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, MoveLeft, MoveRight, Pencil, Users , X, CalendarFold, UserRoundX, MessageCircleMore} from 'lucide-react'
import { AnimatePresence, motion, time } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast";
import ExpenseComponent from './expenseComponent'

function ViewGroup() {

    let navigate = useNavigate()
    let {groupId} = useParams()
    let token = localStorage.getItem('token')
    let [viewGroupInfo, setViewGroupInfo] = useState([])
    let [createdBy, setCreatedBy] = useState([])
    let [isLoading, setIsloading] = useState(true)
    let [members, setMembers] = useState([])
    let [editPopup, setEditPopup] = useState(false)

    let [updatedGroupName, setUpdatedGroupName] = useState("")
    let [updatedGroupDescription, setUpdatedGroupDescription] = useState("")
    let [deleteGroupPopup, setDeleteGroupPopup] = useState(false)
    let [expensePopup, setExpensePopup] = useState(false)
    let [currentExpense, setCurrentExpense] = useState([]);
    let [recordOfTransactions, setRecordOfTransactions] = useState([])
    let [currentUserUsername, setCurrentUserUsername] = useState("")

    let [filterPopup, setFilterPopup] = useState(false)
    let [userFilter, setUserFilter] = useState("None")
    let [timeFilter, setTimeFilter] = useState("None")
    let timeFilterArray=[];


    // 
    let [totalExpense, setTotalExpense] = useState([])

    // for your contribution column
    let [amountToBePaidByCurrentUserInAnExpense, setAmountToBePaidByCurrentUserInAnExpense] = useState([])

    let [netbalanceOfUserInAGroup, setNetbalanceOfUserInAGroup] = useState([])

    let currentUser = async () =>{
        try{
            let userdetailsinfrontend = await axios.get('http://localhost:3000/users/me', {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })

            // console.log(userdetailsinfrontend.data)
            setCurrentUserUsername(userdetailsinfrontend.data.username)
        }catch(err){
            console.log("error getting current user in frontend", err)
        }
    }

    let fetchExpenses = async () =>{

        try{
            let allExpenses = await axios.get(`http://localhost:3000/expenses/${groupId}?timeFilter=${timeFilter}&userFilter=${userFilter}`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })

            // setExpenses(allExpenses.data.amountToBePaidByUser)

            setTotalExpense(allExpenses.data.totalExpense)
            setAmountToBePaidByCurrentUserInAnExpense(allExpenses.data.amountToBePaidByCurrentUser)
            // console.log(allExpenses.data.amountToBePaidByCurrentUser[1].finalResult.amount)
        }catch(err){
            console.log("error getting expenses in view group", err)
        }
    }


    let minimumTransaction = async () =>{
        
        try{
            let minimumTransaction = await axios.get(`http://localhost:3000/expenses/${groupId}/minimumTransaction?timeFilter=${timeFilter}&userFilter=${userFilter}`, 
            {
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

        setNetbalanceOfUserInAGroup(minimumTransaction.data.minimumTransactionsInBackendForCurrentuser[0].totalAmount)
        setIsloading(false)
        setRecordOfTransactions(minimumTransaction.data.recordOfTransactions)

        }catch(err){
            console.log("error occured while finding minimum transactions frontend", err)
        }
    }

    let fetchGroupInfo = async () =>{
        try{
            let fetchedData = await axios.get(`http://localhost:3000/groups/${groupId}`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })

            setViewGroupInfo(fetchedData.data[0])

            setCreatedBy(fetchedData.data[0].createdBy.username)
            setMembers(fetchedData.data[0].members)
            console.log(fetchedData)
            // console.log(fetchedData.data[0])
        }
            catch(err){
                console.log("error getting group info", err)
            }
    }


    let deleteGroupFunc = async () =>{
        try{
            let deletedGroupFrontendRequest = await axios.delete(`http://localhost:3000/groups/delete/${groupId}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            // console.log("deleted successfully")
            toast("Group Deleted Successfully",
            {
                style: {
                background: '#1d4ed8',
                color: '#fff',
            }})
            navigate('/groups')
        }catch(err){
            console.log("error deleting group", err)
        }
    }

    let updateGroup = async (e) =>{
        e.preventDefault()

        try{
            let updatedGroupKaBackendRequest = await axios.post(`http://localhost:3000/groups/update/${viewGroupInfo._id}`, {
                "updatedGroupName":updatedGroupName,
                "updatedGroupDescription":updatedGroupDescription
            }, {
                headers:{
                    Authorization:`Bearer ${token}`
                }  
            })

            toast("Saved Changes!",
            {
                style: {
                background: '#1d4ed8',
                color: '#fff',
            }})
            
        console.log("1")
        console.log("done updating")

        }catch(err){
            // console.log("error updating group data", err)
            toast(err.response.data.message,
            {
                style: {
                background: '#1d4ed8',
                color: '#fff',
            }})
        }finally{
            setEditPopup(false)
        }
    }

    let timeAgo = (timeGiven) =>{
        let timeDiff = (new Date().getTime() - new Date(timeGiven).getTime())/(1000*60*60*24)
        // console.log(timeDiff)
        
        if(timeDiff < 1){
            // console.log((new Date().getTime() - new Date(timeGiven).getTime()))
            timeFilterArray = ["Today", "This Month", "This Week", "This Year", "None"]
                // console.log(timeFilterArray)

            return timeFilterArray
        }

        if(timeDiff < 7){
            // console.log("2")
                timeFilterArray = ["This Month", "This Week", "This Year", "None"]
                // console.log(timeFilterArray)

            return timeFilterArray
        }
        if(timeDiff < 31){
            // console.log("3")
                timeFilterArray = ["This Month", "This Year", "None"]
                // console.log(timeFilterArray)
            return timeFilterArray
        }
        if(timeDiff/31 < 12){
            // console.log("3")
                timeFilterArray = [ "This Year", "None"]
                // console.log(timeFilterArray)
            return timeFilterArray
        }
        else if(timeDiff/31 > 12){
            // console.log("3")
                timeFilterArray = ["Other", "None"]
                // console.log(timeFilterArray)
            return timeFilterArray
        }
        

    }

    useEffect(()=>{
        fetchGroupInfo();
    }, [editPopup])

    useEffect(()=>{
        fetchExpenses()
        minimumTransaction()
    }, [userFilter, timeFilter])

    useEffect(()=>{
        currentUser()
    }, [])
        
    

  return (
    <div>

        <div className='fixed bottom-20 right-40 bg-[#1d4ed8] py-2 px-4 rounded-xl cursor-pointer flex justify-center items-center gap-2 hover:bg-[#10359b]' onClick={(e)=>{
            navigate(`/${groupId}/chat`)
        }}>
            <MessageCircleMore className='text-white' size={25}/> <p className='text-white'>Chat</p>
        </div>
        <AnimatePresence>{editPopup && 
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}>

        <div className='h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-100'>

          <div className='bg-[#eef3ff] h-130 w-120 rounded-xl border-[#1d4ed8]/20 border-2'>

            {/* top headings  and close button*/}
            <div className='flex justify-between items-center mt-5 mb-6'>

              <div className='flex flex-col justify-center items-start ml-6'>
                <p className='text-[#1e4ed8] text-3xl font-bold text-center'>Edit Group Details</p>
                {/* <p className='text-gray-600 text-center'>Enter the following information</p> */}
              </div>

              <div>
                 <button className='flex justify-center items-center cursor-pointer text-white text-lg bg-blue-700 px-3 mr-6 py-[3.6px] rounded hover:bg-blue-700/40' onClick={(e)=>{
                  setEditPopup(false);
                 }}>Close <X/></button>
              </div>

            </div>

            {/* bottom part */}
            <div className='flex flex-row justify-center items-center  ml-5 mr-5 gap-20'>
              {/* bottom left */}
              <div className='flex flex-col justify-center items-start gap-5'>
                <div className='flex flex-col justify-center items-start'>
                  <label htmlFor="">Group Name : </label>
                  <input type="text" className='w-80 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none  focus:border-[#1d4ed8]
                  transition' value={updatedGroupName} onChange={(e)=> setUpdatedGroupName(e.target.value)}/>
                </div>
                <div className='flex flex-col justify-center items-start'>
                  <label htmlFor="">Group Description : </label>
                  <textarea className='w-80 h-62 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none  focus:border-[#1d4ed8]
                  transition' value={updatedGroupDescription} onChange={(e)=> setUpdatedGroupDescription(e.target.value)}/>
                </div>
              </div>

            </div>

            <div className='flex justify-between items-center'>
              <p className='opacity-0'>xyz</p>
              <button className='flex justify-center items-center cursor-pointer text-white mt-4 bg-blue-700 px-3 py-[3.6px] rounded hover:bg-blue-700/40 mr-6' onClick={(e)=> updateGroup(e)}>Update</button>
            </div>

          </div>

        </div></motion.div>}
        </AnimatePresence>

        <AnimatePresence>
            {deleteGroupPopup && 
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}>
            <div className='h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-100'>

                <div className='bg-[#eef3ff] h-55 w-100 rounded-xl border-[#1d4ed8]/20 border-2'>
                    <div className='flex flex-col items-center w-full py-5'>
                                    {/* <p className='text-white text-[20px] my-1'>{title}</p> */}
                                    <p className='text-[#1e4ed8] text-2xl px-4 font-bold text-center'>Delete Group?</p>
                                    <p className='text-gray-600 text-[14px] mt-1'>Are You Sure About Deleting This Group?</p>
                                    {/* <p className='text-gray-600 text-center'>Enter the following information</p> */}
                                </div>
                    
                        <div className='flex flex-col justify-center items-center gap-5 mt-2'>
                            <button className='bg-blue-700 text-white rounded px-4 py-1 cursor-pointer w-[60%] hover:opacity-80' onClick={(e)=>{
                                e.preventDefault()
                                deleteGroupFunc()
                            }}>Delete</button>
                            <button className='bg-transparent border border-gray-600 w-[60%] text-gray-600 rounded px-py-1 cursor-pointer hover:border-black hover:text-black' onClick={(e)=>{setDeleteGroupPopup(false)}}>Cancel</button>
                        </div>
                </div>
            </div> 
        </motion.div>}
        </AnimatePresence>

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

        {filterPopup && 

          <div className='min-h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-10000'>
            <div className='bg-[#eef3ff] border-2 border-[#1e2230]/20 min-h-105 w-[550px] rounded-xl pb-5 flex flex-col justify-start items-center'>
                <div className='flex justify-between items-center w-[96%] mt-2'>
                    <p className='text-[#1e4ed8] text-3xl font-bold ml-3 mt-3'>Filter Expenses</p>
                    <button className='flex justify-center items-center cursor-pointer text-white text-lg bg-red-600 px-3 mr-3 py-[2px] rounded hover:bg-red-600/40' onClick={(e)=>{
                  setFilterPopup(false);
                  document.body.style.overflow = "auto"
                  document.documentElement.style.overflow = "auto"
                 }}>Discard <X/></button>
                </div>

                <div className='flex justify-between items-start w-[90%] mt-8'>
                    <div className='flex flex-col w-[45%]'>

                        <p className='flex justify-center items-center gap-2  pb-2'><UserRoundX size={18} className='text-[#1d4ed8]'/>Filter By Users</p>

                        <div className='bg-white rounded p-2 flex flex-col justify-start h-54 border border-[#1d4ed8] overflow-auto w-full'>
                            <div className='w-full flex flex-col gap-2 justify-start relative overflow-x-hidden'>
                                <div className='cursor-pointer flex justify-start items-center' onClick={(e)=>setUserFilter("None")}>
                                    <p className='opacity-0 w-5'>j</p>
                                    <p className={`${"None" == userFilter ? "text-[#1d4ed8]" : "text-gray-500"}`}>None</p>
                                </div>
                            {
                            members.map((user, index)=>{
                                return <div className='cursor-pointer flex justify-start items-center' key={index} onClick={(e)=>setUserFilter(user.username)}>
                                    <p className='opacity-0 w-5'>j</p>
                                    <p className={`${user.username == userFilter ? "text-[#1d4ed8]" : "text-gray-500"}`}>{user.username}</p>
                                </div>
                            })
                            }
                            </div>  
                        </div>
                    </div>
                    <div className='flex flex-col w-[45%] '>
                        <p className='flex justify-center items-center gap-2  pb-2'><CalendarFold size={18} className='text-[#1d4ed8]'/>Filter By Date</p>

                        <div className='bg-white rounded p-2 flex flex-col justify-start gap-2  border border-[#1d4ed8]'>
                            {/* {
                            members.map((user, index)=>{
                                return <div className='cursor-pointer' onClick={(e)=>setUserFilter(user.username)}>
                                    <p className={`${user.username == userFilter ? "text-[#1d4ed8]" : "text-gray-500"}`}>{user.username}</p>
                                </div>
                            })
                            }   */}

                            <div className='flex flex-col gap-2 h-50 relative left-5'>
                                
                            <p className={`cursor-pointer ${timeFilter=="None"?"text-[#1d4ed8]" : "text-gray-500"}`} onClick={(e)=>{setTimeFilter("None")}}>None</p>
                            <p className={`cursor-pointer ${timeFilter=="Today"?"text-[#1d4ed8]" : "text-gray-500"}`} onClick={(e)=>{setTimeFilter("Today")}}>Today</p>
                            <p className={`cursor-pointer ${timeFilter=="This Week"?"text-[#1d4ed8]" : "text-gray-500"}`}onClick={(e)=>setTimeFilter("This Week")}>This Week</p>
                            <p className={`cursor-pointer ${timeFilter=="This Month"?"text-[#1d4ed8]" : "text-gray-500"}`} onClick={(e)=>setTimeFilter("This Month")}>This Month</p>
                            <p className={`cursor-pointer ${timeFilter=="This Year"?"text-[#1d4ed8]" : "text-gray-500"}`} onClick={(e)=>setTimeFilter("This Year")}>This Year</p>
                            <p className={`cursor-pointer ${timeFilter=="Other"?"text-[#1d4ed8]" : "text-gray-500"}`} onClick={(e)=>setTimeFilter("Other")}>Other</p>
                            </div> 
                        </div>
                    </div>
                </div>

                <div className='flex justify-between items-center w-[92%] mt-8'>
                    <button className='opacity-0'>Set Filter</button>
                    <button className='bg-[#1d4ed8] px-3 py-1 rounded-sm cursor-pointer hover:bg-[#1d3796] text-white' onClick={(e)=>{
                        setFilterPopup(false)
                        document.body.style.overflow = "auto"
                        document.documentElement.style.overflow = "auto"
                    }}>Set Filter</button>

                </div>

            </div>
          </div>
        
        }

        {/* poora content */}
        <div className='sm:ml-60 '>

            {/* group info */}
            <div className='flex justify-between items-center mr-6 ml-6 mt-6 gap-4'>
                {/* group Info left part*/}
                <div className='flex flex-col justify-center items-start'>
                    <Link className='flex justify-center items-center gap-1 cursor-pointer mb-5' to={'/groups'}><ArrowLeft size={15}/>Back</Link>
                    <p className='text-4xl font-bold text-[#1d4ed8] mb-4'>{viewGroupInfo.groupName}</p>
                    {/* <p className='text-4xl font-bold text-[#1d4ed8]'>{viewGroupInfo.groupDescription}</p> */}
                    <p className='text-gray-600 my-1 text-md w-[80%]'>{viewGroupInfo.groupDescription}</p>
                    

                    <div className='flex justify-center items-center my-2 gap-2'>
                        <p className='text-[#1d4ed8] font-medium text-[19px]'>Created By : </p>
                        <p className='text-gray-600'>{" "}{createdBy}</p>
                    </div>

                    <div className='flex gap-2 justify-center items-center'>
                        <p className='text-[#1d4ed8] font-medium text-[19px]'>Members :</p>
                        <div className='flex justify-center items-center gap-2'>
                            {members.map((member, index)=>{
                            return <p key={member._id} className='text-gray-600'>{member.username}</p>
                        })}
                        </div>
                    </div>

                    <div className='flex justify-center items-center gap-3 my-4'>
                        <button className='bg-[#1d4ed8] text-white py-[2px] px-[8px] hover:bg-blue-700/40 flex justify-center items-center gap-1 text-md cursor-pointer' onClick={(e)=>{
                            setEditPopup(true)
                        }}>Edit Group <Pencil size={15}/></button>
                        <button className='bg-red-600 text-white py-[2px] px-[8px] text-md cursor-pointer' onClick={(e)=>{
                            e.preventDefault()
                            setDeleteGroupPopup(true)
                        }}>Delete Group</button>
                    </div>
                </div>

                {/* group Info ka right part*/}
                <div className='flex flex-col w-[30vw]'>
                    {/* created by */}
                </div>
            </div>


            {/* bottom part */}
            <div className='flex flex-col justify-center items-center w-full'>
                <div className='flex justify-between items-center w-[70vw] mt-10 mb-1'>
                    <p className='text-3xl font-bold text-[#1d4ed8]'>Expenses</p>
                    <Link to={`/groups/${groupId}/addExpense`} className='bg-[#1d4ed8] text-white py-[2px] px-[8px] flex justify-center items-center gap-1 text-md cursor-pointer hover:bg-blue-700/40'>Add Expense</Link>
                </div>

                {!isLoading && 
                    <div className='w-[70vw] flex flex-col justify-center items-start'>
                        
                        
                        <div className='flex flex-col justify-start items-start'>
                            <p className='text-[#1d4ed8] text-xl mb-3 font-semibold mt-6'>Who Owes Whom?</p>
                            <div className='flex flex-col gap-3'>
                                {
                                recordOfTransactions.map((transaction,index)=>{
                                    return <div key={index} className='flex flex-col justify-start items-center'>
                                        <p className='flex justify-center items-center gap-4'>{transaction.fromUser}<MoveRight strokeWidth={1}/>{transaction.toObj} { " : "}<span className={` ${transaction.fromUser == currentUserUsername ? "text-red-600 font-semibold" : ""}${transaction.toObj == currentUserUsername ? "text-green-600 font-semibold" : ""}`}>{transaction.amountTransferred.toFixed(2)}</span></p>
                                    </div>
                                })
                            }
                            </div>
                        </div>
                    </div>

                }
                
            </div>

            <div className='flex justify-center items-center'>
                <div className=' flex justify-between w-[66vw] items-center mt-10 mb-2'>
                <div>
                    <button className='bg-white border opacity-0 border-[#1d4ed8] text-[#1d4ed8] py-1/2 px-3 cursor-pointer rounded-sm'>{userFilter == "None" && timeFilter=="None" ? "Filter" : "Change Filter"}</button>
                </div>

                {userFilter != "None" ? 
                    <p className='text-2xl font-semibold'><span className='text-[#1d4ed8]'>{userFilter == currentUserUsername ? "Your" : userFilter}</span>{userFilter == currentUserUsername ? "" : "'s"} Expenses {timeFilter !="None" ? timeFilter : "Overall" }</p>:
                    <p className='text-2xl font-semibold'>All Expenses In This Group {timeFilter !="None" ? timeFilter : "" }</p>
                }

                <div>
                    <button className='bg-white border border-[#1d4ed8] text-[#1d4ed8] py-1/2 px-3 cursor-pointer rounded-sm hover:bg-[#1d4ed8] hover:text-white transition duration-100' onClick={(e)=>{
                        document.body.style.overflow = "hidden"
                        document.documentElement.style.overflow = "hidden"
                        setFilterPopup(true)
                    }}>{userFilter == "None" && timeFilter=="None" ? "Filter" : "Remove Filter"}</button>
                </div>
            </div>
            </div>

            <div className='flex justify-center items-center'>
                {
                !isLoading ? 
                <div className='w-[70vw] flex justify-between items-center mt-5'>

                <p className='flex justify-center items-center gap-4'>Net Balance : <span className={`text-2xl ${netbalanceOfUserInAGroup > 0 ? "text-green-600" : "text-red-600"}`}>{netbalanceOfUserInAGroup?.toFixed(2)}</span></p>
                </div> :
            ""
            }
            </div>

            <div className='my-5 flex justify-center items-center'>
                <ExpenseComponent totalExpense={totalExpense}  amountToBePaidByCurrentUserInAnExpense={amountToBePaidByCurrentUserInAnExpense} setExpensePopup={setExpensePopup} setCurrentExpense={setCurrentExpense} userFilter={userFilter} currentUserUsername={currentUserUsername} timeFilterArray={timeFilterArray} timeAgo={timeAgo} timeFilter={timeFilter}/>
            </div>


           

        </div>


    </div>

    // </div>
  )
}

export default ViewGroup