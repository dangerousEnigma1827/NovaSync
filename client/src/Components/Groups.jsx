import React, { useEffect, useState } from 'react'
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"
import { Cross, Search, X } from 'lucide-react';
import UsersList from './UsersList';
import { Link } from 'react-router-dom';

function Groups() {
  let [createGroupPopup, setCreateGroupPopup] = useState(false)
  let token = localStorage.getItem('token')
  let [groupName, setGroupName] = useState("")
  let [groupDescription, setGroupDescription] = useState("")
  let [groups, setGroups] = useState([])
  let [users, setUsers] = useState([])
  let [membersIds, setMembersids] = useState([])

  let [groupNameSearch, setGroupNameSearch] = useState("")

  let [userFilter, setUserFilter] = useState("None")


  let createGroup = async (e) =>{
    // e.preventDefault()

      console.log("0")



    try{
      let newGroup = await axios.post('http://localhost:3000/groups/create', {
        "groupName":groupName,
        "groupDescription":groupDescription,
        "members":membersIds
      },{
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      
      console.log("1")

      setGroupDescription("")
      setGroupName("")
      setMembersids([])

      console.log("2")



      setCreateGroupPopup(false)


      toast("Group Created Successfully!",{
          style: {
          background: '#1d4ed8',
          color: '#fff',
        },                       
      });

    }catch(err){
      // console.log("error while sending group data", err)
      toast(err.response.data.message,
            {
                style: {
                background: '#1d4ed8',
                color: '#fff',
            }})
    }
  }

  let fetchGroups = async () =>{
    try{
      let groupsPost = await axios.get('http://localhost:3000/groups', {
        headers:{
          Authorization: `Bearer ${token}`
        }
      })

      setGroups(groupsPost.data)
    }catch(err){
      console.log("error in getting group list ", err)
    }   
  }

  let fetchUsers = async () => {
    try{
      let allUsers = await axios.get('http://localhost:3000/users', {
        headers:{
          Authorization : `Bearer ${token}`
        }
      })

      // console.log("done fetching users")
      // console.log(allUsers.data)
      setUsers(allUsers.data)
    }catch(err){
      console.log("error sending request to get users", err)
    }
  }

  useEffect(()=>{
    fetchGroups()
  }, [createGroupPopup])

  useEffect(()=>{
    fetchUsers()
  }, [])

  let searchFunc = (e) =>{
    console.log(e.target.value)
    setGroupNameSearch(e.target.value)
    console.log(e.target.value)
  }

  return (
    <div className=''>
      {/* total div */}
        <AnimatePresence>
          {createGroupPopup && 
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}>

        <div className='min-h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-100'>

          <div className='bg-[#eef3ff] min-h-135 max-w-[900px] rounded-xl border-[#1d4ed8]/20 border-2'>

            {/* top headings  and close button*/}
            <div className='flex justify-between items-center mt-5 mb-6'>

              <div className='flex flex-col justify-center items-start ml-6'>
                <p className='text-[#1e4ed8] text-3xl font-bold text-center'>Create A New Group!</p>
                <p className='text-gray-600 text-center'>Enter the following information</p>
              </div>

              <div>
                 <button className='flex justify-center items-center cursor-pointer text-white text-lg bg-blue-700 px-3 mr-6 py-[3.6px] rounded hover:bg-blue-700/40' onClick={(e)=>{
                  document.documentElement.style.overflow = "auto"
                  document.body.style.overflow = "auto"
                  setCreateGroupPopup(false);

                  setGroupName("");
                  setGroupDescription("");
                  setMembersids([])
                 }}>Close <X/></button>
              </div>

            </div>

            {/* bottom part */}
            <div className='flex flex-col md:flex-row justify-center items-center  ml-5 mr-5 gap-6 px-10'>
              {/* bottom left */}
              <div className='flex flex-col justify-center items-start gap-5'>
                <div className='flex flex-col justify-center items-start'>
                  <label htmlFor="">Group Name : </label>
                  <input type="text" className='w-80 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none  focus:border-[#1d4ed8]
                  transition' value={groupName} onChange={(e)=>setGroupName(e.target.value)}/>
                </div>
                <div className='flex flex-col justify-center items-start'>
                  <label htmlFor="">Group Description : </label>
                  <textarea className='w-80 h-62 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none  focus:border-[#1d4ed8]
                  transition' value={groupDescription} onChange={(e)=>setGroupDescription(e.target.value)}/>
                </div>
              </div>

              {/* bottom right */}
              <div className='flex justify-center items-start flex-col h-90'>
                <p>Select Members : </p>
                <div className='bg-white h-90 w-80 rounded-xl border border-[#1e2230]/15 shadow-[0_2px_6px_rgba(0,0,0,0.05)]'>
                  <UsersList users={users} setMembersids={setMembersids} membersIds={membersIds} createGroupPopup={createGroupPopup}/>
              </div>
              </div>
            </div>

            <div className='flex justify-between items-center'>
              <p className='opacity-0'>xyz</p>
              <button className='flex justify-center items-center cursor-pointer text-white mt-4 bg-blue-700 px-3 py-[3.6px] rounded hover:bg-blue-700/40 mr-6' onClick={(e)=>createGroup(e)}>Create</button>
            </div>

          </div>

        </div></motion.div>}
        </AnimatePresence>

        

        <div className='sm:ml-60 flex flex-col'>

          <div className='flex justify-between items-center mr-6 ml-6 my-6'>
            <p className='text-4xl font-bold text-[#1d4ed8]'>Your Groups!</p>
            <button onClick={(e)=>{
              setCreateGroupPopup(true)
              document.body.style.overflow = "hidden"
              document.documentElement.style.overflow = "hidden"
            }
            } className='cursor-pointer bg-[#1d4ed8] px-2 py-0.5 hover:bg-blue-700/60 text-white'>Add Group</button>
          </div>

          <div className='w-full flex justify-center items-center'>
            <div className='flex items-center w-100 bg-gray-70 rounded-full border py-2 px-3 gap-2 border-[#c5cdde] mt-5 mb-10 transition-all focus:border-[#1d4ed8] transition'>
              <Search/><input type="text" placeholder='Search By Group Name' className='outline-none text-md w-80' onChange={(e)=>searchFunc(e)} value={groupNameSearch}/><X className={`text-gray-700 cursor-pointer ${groupNameSearch.trim() === "" ? "opacity-0" : "opacity-100"}`} onClick={(e)=>{setGroupNameSearch("")}}/>
            </div>
          </div>

          <div className='flex gap-14 flex-wrap justify-center items-center mb-10'>
            
            {groups.length ?  groups.filter((group, index)=>{
              return group.groupName.toLowerCase().includes(groupNameSearch.trim().toLowerCase() || "")
            }).map((group, index)=>{
              let numberOfMembers = group.members.length
                return <div className='flex gap-2 flex-col bg-[#eef3ff] w-100 min-h-50 justify-center rounded shadow-sm p-4' key={group._id}>
                {/* <p>Group {index+1} : </p> */}
                <p className='text-2xl text-[#1e2230] font-semibold'>{group.groupName}</p>
                <p className='text-gray-600 my-1 text-sm'>{group.groupDescription}</p>
                <p className='text-[15px]'>Created By : {group.createdBy.username}</p>
                <div className='flex justify-between items-center w-full mr-10'>
                  <p className='text-[#1e2230]'>Members : {numberOfMembers}</p>
                  <Link className='bg-[#1d4ed8] text-white py-[1px] px-[6px] cursor-pointer' to={`/groups/${group._id}`}>View</Link>
                </div>
                </div>
              // </div>
            })
            : <p className='text-3xl text-gray-500 font-semibold mt-10'>No Groups Found!</p>}

            

            
          </div>
        </div>
    </div>
  )
}

export default Groups