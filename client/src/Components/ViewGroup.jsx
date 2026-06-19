import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, MoveRight, Pencil, X, CalendarFold, UserRoundX, MessageCircleMore, SlidersHorizontal } from 'lucide-react'
import { AnimatePresence, motion } from "framer-motion"
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

            setTotalExpense(allExpenses.data.totalExpense)
            setAmountToBePaidByCurrentUserInAnExpense(allExpenses.data.amountToBePaidByCurrentUser)
        }catch(err){
            console.log("error getting expenses in view group", err)
        }
    }


    let minimumTransaction = async () => {
    try {
        let res = await axios.get(
            `http://localhost:3000/expenses/${groupId}/minimumTransaction?timeFilter=${timeFilter}&userFilter=${userFilter}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        const data =
            res.data?.minimumTransactionsInBackendForCurrentuser

        // SAFE GUARD
        const netBalance = data?.[0]?.totalAmount ?? 0

        setNetbalanceOfUserInAGroup(netBalance)
        setRecordOfTransactions(res.data?.recordOfTransactions || [])
        setIsloading(false)

    } catch (err) {
        console.log("error occured while finding minimum transactions frontend", err)
        setNetbalanceOfUserInAGroup(0)
        setRecordOfTransactions([])
        setIsloading(false)
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

        }catch(err){
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
        
        if(timeDiff < 1){
            timeFilterArray = ["Today", "This Month", "This Week", "This Year", "None"]
            return timeFilterArray
        }

        if(timeDiff < 7){
                timeFilterArray = ["This Month", "This Week", "This Year", "None"]
            return timeFilterArray
        }
        if(timeDiff < 31){
                timeFilterArray = ["This Month", "This Year", "None"]
            return timeFilterArray
        }
        if(timeDiff/31 < 12){
                timeFilterArray = [ "This Year", "None"]
            return timeFilterArray
        }
        else if(timeDiff/31 > 12){
                timeFilterArray = ["Other", "None"]
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


    useEffect(()=>{
        const anyPopupOpen = editPopup || deleteGroupPopup || expensePopup || filterPopup
        document.body.style.overflow = anyPopupOpen ? "hidden" : "auto"
        document.documentElement.style.overflow = anyPopupOpen ? "hidden" : "auto"

        return ()=>{
        }
    }, [editPopup, deleteGroupPopup, expensePopup, filterPopup])

    const isFiltered = userFilter !== "None" || timeFilter !== "None"

  return (
    <div className="bg-[#f7f9fc] min-h-screen">

        {/* floating chat button */}
        <button
            className="fixed bottom-8 right-8 z-40 bg-[#1d4ed8] py-3 px-5 rounded-full cursor-pointer flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20 hover:bg-[#1742b8] transition-colors"
            onClick={()=> navigate(`/${groupId}/chat`)}
        >
            <MessageCircleMore className='text-white' size={20}/>
            <span className='text-white font-medium'>Chat</span>
        </button>

        {/* Edit group popup */}
        <AnimatePresence>
            {editPopup &&
                <motion.div
                    className='h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-100'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={()=> setEditPopup(false)}
                >
                    <motion.div
                        className='bg-white w-[420px] max-w-[90%] rounded-2xl border border-[#1d4ed8]/10 shadow-xl overflow-hidden'
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onClick={(e)=> e.stopPropagation()}
                    >
                        <div className='flex justify-between items-center px-6 py-5 border-b border-[#1d4ed8]/10'>
                            <p className='text-[#1e4ed8] text-2xl font-bold'>Edit Group Details</p>
                            <button
                                className='cursor-pointer text-[#1d4ed8] hover:bg-[#1d4ed8]/10 rounded-full p-1.5 transition-colors'
                                onClick={()=> setEditPopup(false)}
                                aria-label="Close"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        <div className='flex flex-col gap-4 px-6 py-6'>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-sm font-medium text-gray-600'>Group Name</label>
                                <input
                                    type="text"
                                    className='w-full px-3 py-2 bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none focus:border-[#1d4ed8] transition'
                                    value={updatedGroupName}
                                    onChange={(e)=> setUpdatedGroupName(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-sm font-medium text-gray-600'>Group Description</label>
                                <textarea
                                    className='w-full h-40 px-3 py-2 bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none focus:border-[#1d4ed8] transition resize-none'
                                    value={updatedGroupDescription}
                                    onChange={(e)=> setUpdatedGroupDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='flex justify-end items-center px-6 pb-6'>
                            <button
                                className='cursor-pointer text-white bg-[#1d4ed8] px-5 py-2 rounded-lg font-medium hover:bg-[#1742b8] transition-colors'
                                onClick={(e)=> updateGroup(e)}
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>

        {/* Delete group popup */}
        <AnimatePresence>
            {deleteGroupPopup &&
                <motion.div
                    className='h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-100'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={()=> setDeleteGroupPopup(false)}
                >
                    <motion.div
                        className='bg-white w-[380px] max-w-[90%] rounded-2xl border border-[#1d4ed8]/10 shadow-xl px-6 py-7 flex flex-col items-center'
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onClick={(e)=> e.stopPropagation()}
                    >
                        <p className='text-[#1e4ed8] text-2xl font-bold text-center'>Delete Group?</p>
                        <p className='text-gray-500 text-sm mt-2 text-center'>This action can't be undone. All expenses in this group will be removed.</p>

                        <div className='flex flex-col w-full gap-3 mt-6'>
                            <button
                                className='bg-red-600 text-white rounded-lg px-4 py-2.5 cursor-pointer w-full font-medium hover:bg-red-700 transition-colors'
                                onClick={(e)=>{ e.preventDefault(); deleteGroupFunc() }}
                            >
                                Delete Group
                            </button>
                            <button
                                className='bg-transparent border border-gray-300 w-full text-gray-600 rounded-lg px-4 py-2.5 cursor-pointer font-medium hover:border-gray-400 hover:text-gray-800 transition-colors'
                                onClick={()=> setDeleteGroupPopup(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>

        {/* Expense detail popup */}
        <AnimatePresence>
            {expensePopup &&
                <motion.div
                    className='inset-0 fixed flex justify-center items-center h-screen w-screen backdrop-blur-sm bg-black/50 z-50'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={()=>{
                        setExpensePopup(false)
                    }}
                >
                    <motion.div
                        className='bg-white border border-[#1e2230]/10 min-h-95 w-[90%] max-w-[500px] rounded-2xl shadow-xl pb-6'
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onClick={(e)=> e.stopPropagation()}
                    >
                        <div className='flex justify-between items-center px-6 pt-5 pb-3 border-b border-[#1d4ed8]/10'>
                            <p className='text-[#1e4ed8] text-2xl font-bold'>{currentExpense.expenseName}</p>
                            <button
                                className='cursor-pointer text-[#1d4ed8] hover:bg-[#1d4ed8]/10 rounded-full p-1.5 transition-colors'
                                onClick={()=>{
                                    setExpensePopup(false)
                                }}
                                aria-label="Close"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        <div className='px-6 pt-4 flex flex-col items-start'>
                            {currentExpense.expenseDescription &&
                                <p className='text-gray-600 w-[95%]'>{currentExpense.expenseDescription}</p>
                            }

                            <div className='mt-4 space-y-1.5'>
                                <p><span className='text-[#2563eb] font-semibold text-[18px]'>Payer</span> : {currentExpense.paidBy}</p>
                                <p><span className='text-[#2563eb] font-semibold text-[18px]'>Total Amount</span> : {currentExpense.totalAmount}</p>
                                <p><span className='text-[#2563eb] font-semibold text-[18px]'>Split Type</span> : {currentExpense.splitType}</p>
                            </div>

                            <div className='mt-5 flex flex-col w-[95%]'>
                                <p className='text-[#2563eb] font-semibold text-[18px] mb-2'>Contributors</p>
                                <div className='flex flex-col gap-2'>
                                    {currentExpense.percentages &&
                                        Object.entries(currentExpense.percentages).map(([user, value], index)=>{
                                            const contributorsLength = currentExpense.contributorsLength || 1
                                            const displayValue = currentExpense.splitType === "Percentage"
                                                ? `${value} %`
                                                : `${(currentExpense.totalAmount / contributorsLength).toFixed(2)} /-`
                                            return (
                                                <div key={index} className='flex justify-between items-center bg-[#f7f9fc] rounded-lg px-3 py-1.5'>
                                                    <span className='text-gray-700'>{user}</span>
                                                    <span className='font-medium text-[#1e2230]'>{displayValue}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>

        {/* Filter popup */}
        <AnimatePresence>
            {filterPopup &&
                <motion.div
                    className='min-h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-[10000]'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={()=> setFilterPopup(false)}
                >
                    <motion.div
                        className='bg-white border border-[#1e2230]/10 w-[550px] max-w-[92%] rounded-2xl shadow-xl pb-6 flex flex-col'
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onClick={(e)=> e.stopPropagation()}
                    >
                        <div className='flex justify-between items-center px-6 pt-5 pb-3 border-b border-[#1d4ed8]/10'>
                            <p className='text-[#1e4ed8] text-2xl font-bold'>Filter Expenses</p>
                            <button
                                className='cursor-pointer text-[#1d4ed8] hover:bg-[#1d4ed8]/10 rounded-full p-1.5 transition-colors'
                                onClick={()=>{
                                    setFilterPopup(false)
                                }}
                                aria-label="Close"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        <div className='flex justify-between items-start gap-6 px-6 mt-6'>
                            <div className='flex flex-col w-1/2'>
                                <p className='flex items-center gap-2 pb-2 text-sm font-semibold text-gray-700'>
                                    <UserRoundX size={16} className='text-[#1d4ed8]'/>Filter By User
                                </p>
                                <div className='bg-[#f7f9fc] rounded-lg p-2.5 flex flex-col gap-1.5 h-48 border border-[#1d4ed8]/15 overflow-auto'>
                                    <div
                                        className='cursor-pointer rounded-md px-2 py-1.5 hover:bg-[#1d4ed8]/5 transition-colors'
                                        onClick={()=> setUserFilter("None")}
                                    >
                                        <p className={`text-sm ${"None" === userFilter ? "text-[#1d4ed8] font-medium" : "text-gray-500"}`}>None</p>
                                    </div>
                                    {members.map((user, index)=>(
                                        <div
                                            className='cursor-pointer rounded-md px-2 py-1.5 hover:bg-[#1d4ed8]/5 transition-colors'
                                            key={index}
                                            onClick={()=> setUserFilter(user.username)}
                                        >
                                            <p className={`text-sm ${user.username === userFilter ? "text-[#1d4ed8] font-medium" : "text-gray-500"}`}>{user.username}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='flex flex-col w-1/2'>
                                <p className='flex items-center gap-2 pb-2 text-sm font-semibold text-gray-700'>
                                    <CalendarFold size={16} className='text-[#1d4ed8]'/>Filter By Date
                                </p>
                                <div className='bg-[#f7f9fc] rounded-lg p-2.5 flex flex-col gap-1.5 h-48 border border-[#1d4ed8]/15 overflow-auto'>
                                    {TIME_OPTIONS.map((option)=>(
                                        <div
                                            key={option}
                                            className='cursor-pointer rounded-md px-2 py-1.5 hover:bg-[#1d4ed8]/5 transition-colors'
                                            onClick={()=> setTimeFilter(option)}
                                        >
                                            <p className={`text-sm ${timeFilter === option ? "text-[#1d4ed8] font-medium" : "text-gray-500"}`}>{option}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-end items-center gap-3 px-6 mt-6'>
                            <button
                                className='text-gray-500 px-4 py-2 rounded-lg font-medium hover:text-gray-800 transition-colors cursor-pointer'
                                onClick={()=>{
                                    setFilterPopup(false)
                                }}
                            >
                                Discard
                            </button>
                            <button
                                className='bg-[#1d4ed8] px-5 py-2 rounded-lg cursor-pointer hover:bg-[#1742b8] text-white font-medium transition-colors'
                                onClick={()=>{
                                    setFilterPopup(false)
                                }}
                            >
                                Apply Filter
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>

        {/* main content */}
        <div className='md:ml-60 px-6 md:px-10 py-8 max-w-7xl mx-auto'>

            {/* group header card */}
            <div className='bg-white rounded-2xl border border-[#1d4ed8]/10 shadow-sm p-6 md:p-8'>
                <Link className='flex items-center gap-1.5 text-gray-500 hover:text-[#1d4ed8] transition-colors w-fit text-sm mb-5' to={'/groups'}>
                    <ArrowLeft size={15}/>Back to Groups
                </Link>

                <div className='flex flex-col md:flex-row md:justify-between md:items-start gap-6'>
                    <div className='flex flex-col items-start gap-3'>
                        <p className='text-3xl md:text-4xl font-bold text-[#1d4ed8]'>{viewGroupInfo.groupName}</p>
                        {viewGroupInfo.groupDescription &&
                            <p className='text-gray-500 text-[15px] max-w-md'>{viewGroupInfo.groupDescription}</p>
                        }

                        <div className='flex items-center gap-2 mt-1'>
                            <span className='text-gray-400 text-sm'>Created by</span>
                            <span className='text-gray-700 text-sm font-medium'>{createdBy}</span>
                        </div>

                        <div className='flex items-center gap-2 flex-wrap mt-1'>
                            <span className='text-gray-400 text-sm'>Members</span>
                            <div className='flex items-center gap-1.5 flex-wrap'>
                                {members.map((member)=>(
                                    <span key={member._id} className='text-xs font-medium bg-[#1d4ed8]/8 text-[#1d4ed8] px-2.5 py-1 rounded-full'>
                                        {member.username}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center gap-2 md:flex-col md:items-stretch'>
                        <button
                            className='bg-[#1d4ed8] text-white py-2 px-4 rounded-lg hover:bg-[#1742b8] transition-colors flex items-center justify-center gap-1.5 text-sm font-medium cursor-pointer'
                            onClick={()=> setEditPopup(true)}
                        >
                            Edit Group <Pencil size={14}/>
                        </button>
                        <button
                            className='bg-white border border-red-200 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium cursor-pointer'
                            onClick={(e)=>{ e.preventDefault(); setDeleteGroupPopup(true) }}
                        >
                            Delete Group
                        </button>
                    </div>
                </div>
            </div>

            {!isLoading &&
                <div className='bg-white rounded-2xl border border-[#1d4ed8]/10 shadow-sm p-6 md:p-8 mt-6'>
                    <p className='text-[#1d4ed8] text-xl font-semibold mb-4'>Who Owes Whom?</p>

                    {recordOfTransactions.length === 0 ?
                        <p className='text-gray-400 text-sm'>Everyone's settled up — no pending transfers.</p>
                        :
                        <div className='flex flex-col gap-2.5'>
                            {recordOfTransactions.map((transaction, index)=>(
                                <div key={index} className='flex items-center gap-3 bg-[#f7f9fc] rounded-lg px-4 py-2.5 text-sm'>
                                    <span className={`font-medium ${transaction.fromUser === currentUserUsername ? "text-red-600" : "text-[#1e2230]"}`}>
                                        {transaction.fromUser}
                                    </span>
                                    <MoveRight size={16} className='text-gray-400 shrink-0'/>
                                    <span className={`font-medium ${transaction.toObj === currentUserUsername ? "text-green-600" : "text-[#1e2230]"}`}>
                                        {transaction.toObj}
                                    </span>
                                    <span className='ml-auto font-semibold text-[#1d4ed8]'>{transaction.amountTransferred.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            }

            <div className='mt-10'>
                <div className='flex justify-between items-center mb-5'>
                    <p className='text-2xl md:text-3xl font-bold text-[#1d4ed8]'>Expenses</p>
                    <Link
                        to={`/groups/${groupId}/addExpense`}
                        className='bg-[#1d4ed8] text-white py-2 px-4 rounded-lg flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:bg-[#1742b8] transition-colors'
                    >
                        Add Expense
                    </Link>
                </div>

                <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5'>
                    {userFilter !== "None" ?
                        <p className='text-lg font-semibold text-[#1e2230]'>
                            <span className='text-[#1d4ed8]'>{userFilter === currentUserUsername ? "Your" : userFilter}</span>
                            {userFilter === currentUserUsername ? "" : "'s"} Expenses
                            <span className='text-gray-400 font-normal'> · {timeFilter !== "None" ? timeFilter : "Overall"}</span>
                        </p>
                        :
                        <p className='text-lg font-semibold text-[#1e2230]'>
                            All Expenses
                            {timeFilter !== "None" && <span className='text-gray-400 font-normal'> · {timeFilter}</span>}
                        </p>
                    }

                    <button
                        className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition-colors border ${
                            isFiltered
                                ? "bg-[#1d4ed8] text-white border-[#1d4ed8] hover:bg-[#1742b8]"
                                : "bg-white text-[#1d4ed8] border-[#1d4ed8] hover:bg-[#1d4ed8]/5"
                        }`}
                        onClick={()=>{
                            setFilterPopup(true)
                        }}
                    >
                        <SlidersHorizontal size={15}/>
                        {isFiltered ? "Edit Filter" : "Filter"}
                    </button>
                </div>

                {!isLoading &&
                    <div className='flex items-center justify-end bg-white rounded-xl border border-[#1d4ed8]/10 shadow-sm px-5 py-3.5 mb-5'>
                        <p className='flex items-center gap-2 text-sm text-gray-500'>
                            Net Balance
                            <span className={`text-xl font-bold ${netbalanceOfUserInAGroup > 0 ? "text-green-600" : "text-red-600"}`}>
                                {netbalanceOfUserInAGroup?.toFixed(2)}
                            </span>
                        </p>
                    </div>
                }

                <div className='bg-white rounded-2xl border flex justify-center items-center border-[#1d4ed8]/10 shadow-sm overflow-hidden'>
                    <ExpenseComponent
                        totalExpense={totalExpense}
                        amountToBePaidByCurrentUserInAnExpense={amountToBePaidByCurrentUserInAnExpense}
                        setExpensePopup={setExpensePopup}
                        setCurrentExpense={setCurrentExpense}
                        userFilter={userFilter}
                        currentUserUsername={currentUserUsername}
                        timeFilterArray={timeFilterArray}
                        timeAgo={timeAgo}
                        timeFilter={timeFilter}
                    />
                </div>
            </div>

        </div>
    </div>
  )
}

const TIME_OPTIONS = ["None", "Today", "This Week", "This Month", "This Year", "Other"]

export default ViewGroup