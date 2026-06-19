import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {Link, useParams} from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {ArrowLeft, X, Check} from 'lucide-react'
import toast from 'react-hot-toast'

function AddExpense() {

    let token = localStorage.getItem('token')
    let [paidBy, setPaidBy] = useState("")
    let [totalAmount, setTotalAmount] = useState()
    let [users, setUsers] = useState([])
    let [contributors, setContributors] = useState([])
    let [splitType, setSplitType] = useState("")
    let [percentages, setPercentages] = useState({})
    let {groupId} = useParams()
    let [expenseName, setExpenseName] = useState("")
    let [expenseDescription, setExpenseDescription] = useState("")

    let navigate = useNavigate()

    let selectContributor = async (e, user)=>{
        e.preventDefault()

        if(contributors.includes(user.username)){
            let newContributorsArray = contributors.filter((contributor)=>{
                return contributor != user.username
            })

            setContributors(newContributorsArray)
        }else{
            setContributors([...contributors, user.username])
        }
    }

    
    let getGroupInfo = async () => {
        try{
        let groupinfoInFrontend = await axios.get(`http://localhost:3000/groups/${groupId}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        } 
    )
        setUsers(groupinfoInFrontend.data[0].members)

        }catch(err){
            console.log("error getting group info in expense page", err)
        }
    }

    useEffect(()=>{
        getGroupInfo()
    },[])

    let addExpense = async (e) =>{
        e.preventDefault()
        console.log(percentages)

        navigate(`/groups/${groupId}`)

        try{
            let expenseDataSentFromFrontend = await axios.post(`http://localhost:3000/expenses/${groupId}/add`, {
            "groupId":groupId,
            "expenseName":expenseName,
            "expenseDescription":expenseDescription,
            "totalAmount":totalAmount,
            "paidBy":paidBy,
            "contributors":contributors,
            "contributorsLength":contributors.length,
            "splitType":splitType,
            "percentages":percentages
        }, 
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        }catch(err){
            if(err.response.data.message){
            toast(err.response.data.message,
            {
                style: {
                background: '#1d4ed8',
                color: '#fff',
            }})
            }
            console.log("error in sending expense info to backend",err)
        }
    }

    const splitTypeOptions = ["Equal", "Value Based", "Percentage"]

    const selectSplitType = (type) =>{
        setSplitType(type)

        if(type === "Equal"){
            let newPercentages = {}
            contributors.forEach((contributor)=>{
                newPercentages[contributor] = 100/contributors.length
            })
            setPercentages(newPercentages)
        }
    }

  return (
    <div className='bg-[#f7f9fc] min-h-screen md:ml-60'>
        <div className='px-6 md:px-10 py-8 max-w-5xl mx-auto'>

            <div className='bg-white rounded-2xl border border-[#1d4ed8]/10 shadow-sm p-6 md:p-8'>

                <div className='flex justify-between items-start mb-8'>
                    <div>
                        <Link className='flex items-center gap-1.5 text-gray-500 hover:text-[#1d4ed8] transition-colors w-fit text-sm mb-4' to={`/groups/${groupId}`}>
                            <ArrowLeft size={15}/>Back to Group
                        </Link>
                        <p className='text-3xl md:text-4xl font-bold text-[#1d4ed8] mb-1.5'>Add An Expense</p>
                        <p className='text-gray-500 text-[15px]'>Fill in the details below to split a new expense.</p>
                    </div>

                    <button
                        className='text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg cursor-pointer flex justify-center items-center gap-1.5 text-sm font-medium hover:bg-red-100 transition-colors shrink-0'
                        onClick={()=> navigate(`/groups/${groupId}`)}
                    >
                        Discard <X size={15}/>
                    </button>
                </div>

                {/* form grid — two equal columns that each fill their half */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

                    {/* left column */}
                    <div className='flex flex-col gap-5'>
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-sm font-medium text-gray-600'>Expense Name</label>
                            <input
                                type="text"
                                placeholder='e.g. Dinner at Olive Garden'
                                className='w-full px-3 py-2.5 bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 outline-none focus:border-[#1d4ed8] transition'
                                value={expenseName}
                                onChange={(e)=> setExpenseName(e.target.value)}
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label className='text-sm font-medium text-gray-600'>Expense Description</label>
                            <textarea
                                className='w-full h-40 px-3 py-2.5 bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 outline-none focus:border-[#1d4ed8] transition resize-none'
                                placeholder='Add any notes about this expense...'
                                value={expenseDescription}
                                onChange={(e)=> setExpenseDescription(e.target.value)}
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label className='text-sm font-medium text-gray-600'>Total Amount</label>
                            <input
                                type="text"
                                placeholder='0.00'
                                className='w-full px-3 py-2.5 bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 outline-none focus:border-[#1d4ed8] transition'
                                value={totalAmount}
                                onChange={(e)=> setTotalAmount(e.target.value)}
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label className='text-sm font-medium text-gray-600'>Paid By</label>
                            <div className='flex flex-wrap gap-2'>
                                {users.map((user)=>(
                                    <button
                                        key={user._id}
                                        onClick={()=> setPaidBy(user.username)}
                                        className={`cursor-pointer text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                                            user.username === paidBy
                                                ? "bg-[#1d4ed8] text-white border-[#1d4ed8]"
                                                : "bg-white text-gray-600 border-[#1e2230]/15 hover:border-[#1d4ed8]/40"
                                        }`}
                                    >
                                        {user.username}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label className='text-sm font-medium text-gray-600'>Split Type</label>
                            <div className='flex flex-wrap gap-2'>
                                {splitTypeOptions.map((type)=>(
                                    <button
                                        key={type}
                                        onClick={()=> selectSplitType(type)}
                                        className={`cursor-pointer text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                                            splitType === type
                                                ? "bg-[#1d4ed8] text-white border-[#1d4ed8]"
                                                : "bg-white text-gray-600 border-[#1e2230]/15 hover:border-[#1d4ed8]/40"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {splitType === "Percentage" && contributors.length > 0 &&
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-sm font-medium text-gray-600'>Percentage Split</label>
                                <div className='bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg p-3 flex flex-col gap-2.5'>
                                    {contributors.map((contributor, index)=>(
                                        <div className='flex justify-between items-center gap-3' key={index}>
                                            <p className='text-sm text-gray-700'>{contributor}</p>
                                            <div className='flex items-center gap-1.5 w-28'>
                                                <input
                                                    type="number"
                                                    className='w-full px-2.5 py-1.5 bg-white border border-[#1e2230]/15 rounded-lg text-[#1e2230] outline-none focus:border-[#1d4ed8] transition text-sm'
                                                    onChange={(e)=> setPercentages({...percentages, [contributor]:e.target.value})}
                                                />
                                                <span className='text-sm text-gray-400'>%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }

                        {splitType === "Value Based" && contributors.length > 0 &&
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-sm font-medium text-gray-600'>Amount Split</label>
                                <div className='bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg p-3 flex flex-col gap-2.5'>
                                    {contributors.map((contributor, index)=>(
                                        <div className='flex justify-between items-center gap-3' key={index}>
                                            <p className='text-sm text-gray-700'>{contributor}</p>
                                            <input
                                                type="number"
                                                className='w-28 px-2.5 py-1.5 bg-white border border-[#1e2230]/15 rounded-lg text-[#1e2230] outline-none focus:border-[#1d4ed8] transition text-sm'
                                                onChange={(e)=> setPercentages({...percentages, [contributor]:e.target.value*100/totalAmount})}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                    </div>

                    {/* right column */}
                    <div className='flex flex-col h-full'>
                        <label className='text-sm font-medium text-gray-600 mb-1.5'>Select Contributors</label>
                        <p className='text-xs text-gray-400 mb-3'>Includes the user who paid, if they're sharing the cost.</p>

                        <div className='bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg p-3 flex flex-col gap-2 flex-1 overflow-auto'>
                            {users.length === 0 &&
                                <p className='text-gray-400 text-sm text-center py-6'>No members found in this group.</p>
                            }
                            {users.map((user, index)=>{
                                const isSelected = contributors.includes(user.username)
                                return (
                                    <div
                                        className='flex justify-between items-center bg-white border border-[#1e2230]/10 rounded-lg px-4 py-3'
                                        key={user._id}
                                    >
                                        <div className='flex items-center gap-3'>
                                            <span className='text-gray-400 text-sm w-5'>{index+1}.</span>
                                            <span className='text-[#1e2230] font-medium'>{user.username}</span>
                                        </div>
                                        <button
                                            onClick={(e)=> selectContributor(e, user)}
                                            className={`cursor-pointer text-white text-sm font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                                                isSelected ? "bg-red-600 hover:bg-red-700" : "bg-[#1d4ed8] hover:bg-[#1742b8]"
                                            }`}
                                        >
                                            {isSelected ? <>Remove</> : <>Add <Check size={14}/></>}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className='flex justify-end items-center mt-8 pt-6 border-t border-[#1d4ed8]/10'>
                    <button
                        className='flex justify-center items-center cursor-pointer text-white bg-[#1d4ed8] px-6 py-2.5 rounded-lg font-medium hover:bg-[#1742b8] transition-colors'
                        onClick={(e)=> addExpense(e)}
                    >
                        Add Expense
                    </button>
                </div>

            </div>
        </div>
    </div>
  )
}

export default AddExpense