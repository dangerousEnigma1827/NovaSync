import { Search, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

function UsersList({users, setMembersids, membersIds, createGroupPopup}) {

    let [selectedUsers, setSelectedUsers] = useState([])
    let token = localStorage.getItem('token')
    let [userData, setUserData] = useState([])

    let [usersearchInput, setUserSearchInput] = useState("")

    let getCurrentUser = async ()=>{
        try{
            let currentUser = await axios.get('http://localhost:3000/users/me', {

            headers:{
                Authorization:`Bearer ${token}`
            }

        })
        setUserData(currentUser.data)
        setSelectedUsers([...selectedUsers, currentUser.data])
        }catch(err){
            console.log("error getting user info", err)
        }
    }

    let selectUserFunc = (e, user) =>{
        e.preventDefault()
        if(!selectedUsers.includes(user)){
            setSelectedUsers([...selectedUsers, user])
            setMembersids([...membersIds, user._id])
        }else{
            let filteredSelectedUsers = selectedUsers.filter((userinFilter, index)=>{
                return userinFilter._id != user._id
            })

            let filteredIds = membersIds.filter((memberId, index)=>{
                return memberId != user._id
            })

            setMembersids(filteredIds)
            setSelectedUsers(filteredSelectedUsers)

        }
    }


    // get current user

    

    useEffect(()=>{
        getCurrentUser()
    }, [])

  return (
    // total div
    <div className='overflow-y-auto h-80 px-2'>
        {/* search Bar */}
        <div>

        </div>

        {/* selected users */}

        <div className='py-2'>
            <p className='text-gray-600 text-md ml-6 text-center mt-1'>Selected Users : </p>
            {selectedUsers.length===0 ? (<div className='flex'><p className='text-gray-600 text-sm my-2 ml-6'>No Members Selected Except Current User</p></div>) :
            
            (selectedUsers.map((user, index)=>{
                return <div key={user._id} className='flex justify-between items-center mr-6 ml-6 py-2 px-2 bg-blue-100 my-1 rounded'>
                    {index+1}{". "}{user.username}
                </div>
            }))}
        
        </div>


        {/* all users */}
        <div className='mt-2'>
            <p className='text-gray-600 text-md ml-6 text-center'>All Users : </p>

            <div className='w-full flex justify-center items-center'>
                <div className='flex items-center w-60 bg-gray-70 rounded-full border py-1 px-3 gap-2 border-[#c5cdde] mt-2 mb-4 transition-all focus:border-[#1d4ed8] '>
                    <Search className='text-gray-600' size={20}/><input type="text" placeholder='Search By User Name' className='outline-none text-md placeholder:text-sm w-40' onChange={(e)=>setUserSearchInput(e.target.value)} value={usersearchInput}/><X className={`text-gray-700 cursor-pointer ${usersearchInput.trim() === "" ? "opacity-0": "opacity-100"}`} size={20} onClick={(e)=>{
                        setUserSearchInput("")
                    }}/>
                </div>
            </div>

            {
                users.filter((user,index)=>{
                    return user.username.toLowerCase().includes(usersearchInput.toLowerCase())
                }).map((user, index)=>{
                return <div key={user._id} className='flex justify-between items-center mr-6 ml-6 py-2 px-2 bg-blue-100 my-1 rounded'>
                    {index+1}{". "}{user.username}
                    {user._id == userData._id ? (<button className={` text-black px-1 py-1 rounded`} >You</button>) :
                    
                    (<button className={`cursor-pointer text-white px-1 py-1 rounded ${!selectedUsers.includes(user) ? 'bg-blue-700': 'bg-red-600'}`} onClick={(e)=>selectUserFunc(e, user)} >{selectedUsers.includes(user) ? <X/> : "Add"}</button>)}
                </div>
                })
            
            }
            
        </div>
    </div>
  )
}

export default UsersList