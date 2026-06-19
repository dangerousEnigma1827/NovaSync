// import React, { useEffect, useState } from 'react'
// import {useParams, Link, useNavigate} from 'react-router-dom'
// import { ArrowLeft, MoveLeft, Pencil, Users , X} from 'lucide-react'
// import axios from 'axios'

// function AddExpense() {

//     let {groupId} = useParams()
//     let [paidBy, setPaidBy] = useState()
//     let token = localStorage.getItem('token')
//     let [users, setUsers] = useState([])
//     let [contributors, setContributors] = useState([])
//     let [splitType, setSplitType] = useState()
//     let [isPercentage, setIsPercentage] = useState(false)
//     let [percentages, setPercentages] = useState({})
//     let [totalAmount, setTotalAmount] = useState()



//     let getUsers = async () =>{
//         try{
//             let allUsersResponseInFrontend = await axios.get('http://localhost:3000/users/', {
//                 headers:{
//                     Authorization : `Bearer ${token}`
//                 }
//             })

//             setUsers(allUsersResponseInFrontend.data)
//         }catch(err){
//             console.log("error getting all users", err)
//         }
//     }

//     let addExpenseFunc = async (e) =>{
//         console.log(percentages)
//         console.log(totalAmount)
//         console.log(contributors)
//         console.log(paidBy)
//         try{
//             let expenseSentToBackend = await axios.post('http://localhost:3000/expenses/add', 
//             {
//                 "paidBy":paidBy,
//                 "totalAmount":totalAmount,
//                 "contributors":contributors,
//                 "percentages":percentages
//             }, 
//             {
//                 headers:{
//                     Authorization:`Bearer ${token}`
//                 }
//             })

//             console.log(expenseSentToBackend.data)
//         }catch(err){
//             console.log("err", err)
//         }
//     }


//     let selectContributor = async (e, user) =>{
//         e.preventDefault()
//         if(!contributors.includes(user.username)){
//             setContributors([...contributors, user.username])
//         }else{
//             let filteredContributors = contributors.filter((contributors, index)=>{
//                 return contributors != user.username
//             })

//             setContributors(filteredContributors)
//             console.log(contributors)
//         }
//     }

//     useEffect(()=>{
//         getUsers()
//     }, [])

//   return (
//     <div className='ml-60'>
//         <Link to={`/groups/${groupId}`}> <ArrowLeft/>Back</Link>
//         <div>
//             <label htmlFor="">Subject</label>
//             <input type="text" className='border border-black'/>
//         </div>
//         <div>
//             <label htmlFor="">Total Amount</label>
//             <input type="text" className='border border-black' onChange={(e)=>setTotalAmount(e.target.value)}/>
//         </div>

//         <div>

//             <div className='flex gap-2'>
//                 <p>PaidBy</p>
//                 {users.map((user, index)=>{
//                     return <div key={user.username} className='flex gap-4'>
//                         <button className={`cursor-pointer ${paidBy == user.username ? "text-red-700" : ""}`} onClick={(e)=>{
//                             setPaidBy(user.username)
//                             setContributors([...contributors, user.username])
//                             setPercentages({...percentages, [user.username]:totalAmount})
//                         }}>{user.username}</button>
//                     </div>
//                 })}
//             </div>

//             <p>Select Contributors</p>

//             {users.filter((user, index)=>{
//                 return user.username != paidBy
//             }).map((user, index)=>{
//                 return <div key={user.username} className={`flex gap-4`}>
//                     {user.username}
//                     <button onClick={(e)=>{selectContributor(e, user)}}>{contributors.includes(user.username) ? "Remove" : "Add"}</button>
//                     {/* <button onClick={(e)=>{selectContributor(e, user)}}>Add</button> */}
//                 </div>
//             })}

//         </div>

        

//         <div className='flex gap-4'>
//             <p>Splitting type</p>
//             <button onClick={(e)=>{
//                 setSplitType("Equal")
//                 setIsPercentage(false)

//             }} className={`cursor-pointer ${splitType == "Equal" ? "text-red-700" : ""}`}>Equal</button>
//             <button onClick={(e)=>{
//                 setSplitType("Percentage")
//                 setIsPercentage(true)
//             }} className={`cursor-pointer ${splitType == "Percentage" ?"text-red-700" : ""}`}>Percentage</button>
//         </div>

//         {
//             isPercentage && 
//             <div>

//                 {contributors.filter((contribor)=>{
//                     return contribor != paidBy
//                 })
//                 .map((contributor, index)=>{
//                     return <div key={contributor} className={`flex gap-4 ${paidBy === contributor ? "none": ""}`}>
//                         <p className={`cursor-pointer ${paidBy == contributor ? "text-red-700" : ""}`} onClick={(e)=>setPaidBy(contributor)}>{contributor}</p>
//                         <input type="text" className='border border-black' onChange={(e)=>{
//                             setPercentages({...percentages, 
//                                 [contributor]:e.target.value
//                             })

//                             console.log(percentages)
//                         } }/>
//                 </div>
//                 })}

//             </div>
//         }

//         <button onClick={(e)=>addExpenseFunc(e)}>Add Expense</button>
//     </div>
//   )
// }

// export default AddExpense


import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {Link, useParams} from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {ArrowLeft, X} from 'lucide-react'
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



  return (
    <div className='ml-60 flex flex-col justify-center items-center min-h-screen overflow-scroll '>

        <div className='bg-[#eef3ff] ml-6 w-[90%] rounded-xl p-6 border-[#1d4ed8]/20 border-2'>

        <div className='flex justify-between items-center mb-4'>
           <div>
             <p className='text-4xl font-bold text-[#1d4ed8] mb-2'>Add An Expense!</p>
            <p className='text-gray-600 my-1 text-md'>Kindly Fill The Below Inputs In Order</p>
           </div>

           <div className='text-white bg-red-600 px-1 py-[2px] cursor-pointer flex justify-center items-center hover:bg-red-600/30' onClick={(e)=>{
            navigate(`/groups/${groupId}`)}}>
            Discard<X/>
           </div>
        </div>


        {/* div with left and right */}
        <div className='flex flex-row justify-center gap-10 items-start mt-2'>

            {/* left wala part */}
            <div>
                <div className='flex items-center'>
                    <p className='w-50'>Expense Name : </p>
                    <input type="text" className='w-80 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 outline-none  focus:border-[#1d4ed8]
                    transition' value={expenseName} onChange={(e)=> setExpenseName(e.target.value)}/>
                </div>

            <div className='flex  items-start mt-5'>
                <p className='w-50'>Expense Description : </p>
                <textarea className='w-80 h-62 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none  focus:border-[#1d4ed8]
                transition' value={expenseDescription} onChange={(e)=> setExpenseDescription(e.target.value)} placeholder=''/>
            </div>


            <div className='flex  items-center mt-5'>
                <p className='w-50'>Total Amount : </p>
                <input type="text" className='w-80 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none  focus:border-[#1d4ed8]
                transition' value={totalAmount} onChange={(e)=> setTotalAmount(e.target.value)}/>
            </div>

            <div className='flex mt-5 '>
                <p className='w-50'>Paid By : </p>

                <div className='flex flex-wrap gap-3'> 
                {users.map((user, index)=>{
                    return <button onClick={(e)=>{
                        setPaidBy(user.username)
                    }} className={` cursor-pointer ${user.username == paidBy ? "text-blue-700": "text-gray-500"}`} key={user._id}>{user.username}</button>
                })}
                </div>
            </div>
            </div>

            {/* right wala part */}

        <div>
        <div className=''>
            <p className='mb-4'>Select Contributors  : <br/>(Including User Who Has Paid)</p>
            
            <div className='bg-white overflow-auto w-80 flex flex-col justify-center items-center py-4'>
                {users.map((user, index)=>{
                    return <div className='flex gap-2 bg-blue-100 my-1 p-2 rounded justify-between items-center w-75' key={user._id}>
                        <p>{index+1}.                                                {user.username}</p>
                        <button onClick={(e)=>selectContributor(e, user)} className={`cursor-pointer text-white px-1 py-1 rounded ${!contributors.includes(user.username) ? "bg-blue-700" : "bg-red-600"}`}>{contributors.includes(user.username) ? "Remove" : "Add"}</button>
                    </div>
                })}
            </div>
        </div>

        <div className='flex gap-3 mt-8'>
            <p>Split type : </p>
            <button onClick={(e)=>{
                setSplitType("Equal")

                let newPercentages = {}
                contributors.forEach((contributor, index)=>{
                    newPercentages[contributor] = 100/contributors.length
                })

                setPercentages(newPercentages)


            }}  className={` ${splitType == "Equal" ? "text-blue-700" : "text-gray-500"} cursor-pointer`}>Equal</button>
            <button onClick={(e)=>{setSplitType("Value Based")}} className={` ${splitType == "Value Based" ? "text-blue-700" : "text-gray-500"} cursor-pointer`}>Value Based</button>
            <button onClick={(e)=>{setSplitType("Percentage")}} className={`  ${splitType == "Percentage" ? "text-blue-700" : "text-gray-500"} cursor-pointer`}>Percentage</button>
        </div>


        {splitType == "Equal" && 
        
            <div className='my-4'>
                       
            </div>
        }
        {splitType == "Percentage" && 
        
            <div className='my-4'>
            {contributors.map((contributor, index)=>{
                return <div className='flex gap-2 items-center mt-2' key={index}>
                    <p className='w-18'>{contributor}</p>
                    <input type="number" className='px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none  focus:border-[#1d4ed8]
                    transition'   onChange={(e)=>{
                        setPercentages({...percentages, [contributor]:e.target.value})
                    }} />
                </div>
            })}            
            </div>
        }


        {splitType == "Value Based" && 
        
            <div className='my-4'>
            {contributors.map((contributor, index)=>{
                return <div className='flex gap-2 items-center mt-2' key={index}>
                    <p className='w-18'>{contributor}</p>
                    <input type="number" className='px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none  focus:border-[#1d4ed8]
                    transition' onChange={(e)=>{
                        setPercentages({...percentages, [contributor]:e.target.value*100/totalAmount})
                    }} />
                </div>
            })}            
            </div>
        }

        {/* <button onClick={(e)=>addExpense(e)} className='ml-6'>Add Expense</button> */}

            <div className='flex justify-between items-center w-[110%]'>
        <button className='flex justify-center items-center cursor-pointer text-white mt-4 bg-blue-700 px-3 py-[3.6px] rounded hover:bg-blue-700/40 mr-6 opacity-0'>Add Expense</button>
        <button className='flex justify-center items-center cursor-pointer text-white mt-4 bg-blue-700 px-3 py-[3.6px] rounded hover:bg-blue-700/40 mr-6' onClick={(e)=>addExpense(e)}>Add Expense</button>

            </div>

            </div>
        </div>



        </div>
    </div>
  )
}

export default AddExpense