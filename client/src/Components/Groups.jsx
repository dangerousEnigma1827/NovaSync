import React, { useEffect, useMemo, useState } from 'react'
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"
import { Search, X } from 'lucide-react';
import UsersList from './UsersList';
import { Link } from 'react-router-dom';

function Groups() {
  const [createGroupPopup, setCreateGroupPopup] = useState(false)
  const token = localStorage.getItem('token')
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groups, setGroups] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [users, setUsers] = useState([])
  const [membersIds, setMembersids] = useState([])

  const [groupNameSearch, setGroupNameSearch] = useState("")

  const toastStyle = { style: { background: '#1d4ed8', color: '#fff' } }

  const openCreatePopup = () => {
    setCreateGroupPopup(true)
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
  }

  const closeCreatePopup = () => {
    setCreateGroupPopup(false)
    document.body.style.overflow = "auto"
    document.documentElement.style.overflow = "auto"
    setGroupName("")
    setGroupDescription("")
    setMembersids([])
  }

  const createGroup = async () => {
    try {
      await axios.post('http://localhost:3000/groups/create', {
        groupName,
        groupDescription,
        members: membersIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      closeCreatePopup()
      toast("Group Created Successfully!", toastStyle)
    } catch (err) {
      toast(err?.response?.data?.message || "Something went wrong creating the group", toastStyle)
    }
  }

  const fetchGroups = async () => {
    try {
      const groupsPost = await axios.get('http://localhost:3000/groups', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGroups(groupsPost.data)
    } catch (err) {
      console.log("error in getting group list ", err)
    } finally {
      setLoadingGroups(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const allUsers = await axios.get('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(allUsers.data)
    } catch (err) {
      console.log("error sending request to get users", err)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [createGroupPopup])

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredGroups = useMemo(() => {
    const query = groupNameSearch.trim().toLowerCase()
    return groups.filter((group) => group.groupName?.toLowerCase().includes(query))
  }, [groups, groupNameSearch])

  return (
    <div>
      <AnimatePresence>
        {createGroupPopup &&
          <motion.div
            className='min-h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCreatePopup}
          >
            <motion.div
              className='bg-[#eef3ff] min-h-135 max-w-[900px] w-[92%] rounded-xl border-[#1d4ed8]/20 border-2 shadow-xl'
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* top headings and close button */}
              <div className='flex justify-between items-center mt-5 mb-6'>
                <div className='flex flex-col justify-center items-start ml-6'>
                  <p className='text-[#1e4ed8] text-3xl font-bold text-center'>Create A New Group!</p>
                  <p className='text-gray-600 text-center'>Enter the following information</p>
                </div>

                <button
                  className='flex justify-center items-center cursor-pointer text-white text-lg bg-blue-700 gap-1 px-3 mr-6 py-1.5 rounded transition-colors hover:bg-blue-700/70'
                  onClick={closeCreatePopup}
                >
                  Close <X size={18} />
                </button>
              </div>

              {/* bottom part */}
              <div className='flex flex-col md:flex-row justify-center items-center ml-5 mr-5 gap-6 px-10'>
                <div className='flex flex-col justify-center items-start gap-5'>
                  <div className='flex flex-col justify-center items-start'>
                    <label className='mb-1'>Group Name : </label>
                    <input
                      type="text"
                      className='w-80 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none focus:border-[#1d4ed8] transition'
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  <div className='flex flex-col justify-center items-start'>
                    <label className='mb-1'>Group Description : </label>
                    <textarea
                      className='w-80 h-62 px-2 py-1 bg-white border border-[#1e2230]/20 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none focus:border-[#1d4ed8] transition resize-none'
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className='flex justify-center items-start flex-col h-90'>
                  <p className='mb-1'>Select Members : </p>
                  <div className='bg-white h-90 w-80 rounded-xl border border-[#1e2230]/15 shadow-[0_2px_6px_rgba(0,0,0,0.05)]'>
                    <UsersList users={users} setMembersids={setMembersids} membersIds={membersIds} createGroupPopup={createGroupPopup} />
                  </div>
                </div>
              </div>

              <div className='flex justify-end items-center px-6 mt-4'>
                <button
                  className='flex justify-center items-center cursor-pointer text-white bg-blue-700 px-4 py-1.5 rounded transition-colors hover:bg-blue-700/70 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={!groupName.trim()}
                  onClick={createGroup}
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      <div className='sm:ml-60 flex flex-col'>
        <div className='flex justify-between items-center mr-6 ml-6 my-6'>
          <p className='text-4xl font-bold text-[#1d4ed8]'>Your Groups!</p>
          <button
            onClick={openCreatePopup}
            className='cursor-pointer bg-[#1d4ed8] px-3 py-1.5 rounded hover:bg-blue-700/70 transition-colors text-white'
          >
            Add Group
          </button>
        </div>

        <div className='w-full flex justify-center items-center'>
          <div className='flex items-center w-100 bg-white rounded-full border py-2 px-3 gap-2 border-[#c5cdde] mt-5 mb-10 shadow-sm focus-within:border-[#1d4ed8] transition-colors'>
            <Search className='text-gray-400' size={18} />
            <input
              type="text"
              placeholder='Search By Group Name'
              className='outline-none text-md w-80 bg-transparent'
              onChange={(e) => setGroupNameSearch(e.target.value)}
              value={groupNameSearch}
            />
            <X
              className={`text-gray-400 hover:text-[#1d4ed8] transition-colors cursor-pointer ${groupNameSearch.trim() === "" ? "opacity-0" : "opacity-100"}`}
              size={18}
              onClick={() => setGroupNameSearch("")}
            />
          </div>
        </div>

        <div className='flex gap-8 flex-wrap justify-center items-stretch mb-10 px-6'>
          {loadingGroups && (
            <p className='text-xl text-gray-400 mt-10'>Loading your groups…</p>
          )}

          {!loadingGroups && filteredGroups.length === 0 && (
            <p className='text-3xl text-gray-500 font-semibold mt-10'>No Groups Found!</p>
          )}

          {!loadingGroups && filteredGroups.map((group) => {
            const numberOfMembers = group.members?.length ?? 0
            return (
              <div
                className='flex gap-2 flex-col bg-[#eef3ff] w-100 min-h-50 justify-center rounded-lg shadow-sm hover:shadow-md transition-shadow p-4'
                key={group._id}
              >
                <p className='text-2xl text-[#1e2230] font-semibold'>{group.groupName}</p>
                <p className='text-gray-600 my-1 text-sm line-clamp-2'>{group.groupDescription}</p>
                <p className='text-[15px]'>Created By : {group.createdBy?.username}</p>
                <div className='flex justify-between items-center w-full mr-10'>
                  <p className='text-[#1e2230]'>Members : {numberOfMembers}</p>
                  <Link
                    className='bg-[#1d4ed8] text-white py-1 px-3 rounded-sm cursor-pointer hover:bg-blue-700/70 transition-colors'
                    to={`/groups/${group._id}`}
                  >
                    View
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Groups