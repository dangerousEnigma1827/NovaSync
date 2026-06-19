import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Users } from 'lucide-react'
import UsersList from './UsersList'
import { Link } from 'react-router-dom'

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
      toast(err?.response?.data?.message || "Something went wrong", toastStyle)
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await axios.get('http://localhost:3000/groups', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGroups(res.data)
    } catch (err) {
      console.log("error getting groups", err)
    } finally {
      setLoadingGroups(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (err) {
      console.log("error getting users", err)
    }
  }

  useEffect(() => { fetchGroups() }, [createGroupPopup])
  useEffect(() => { fetchUsers() }, [])

  const filteredGroups = useMemo(() => {
    const query = groupNameSearch.trim().toLowerCase()
    return groups.filter((g) => g.groupName?.toLowerCase().includes(query))
  }, [groups, groupNameSearch])

  return (
    <div className="bg-[#f7f9fc] min-h-screen">

      {/* Create group popup */}
      <AnimatePresence>
        {createGroupPopup && (
          <motion.div
            className="min-h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCreatePopup}
          >
            <motion.div
              className="bg-white w-[92%] max-w-[860px] rounded-2xl border border-[#1d4ed8]/10 shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-[#1d4ed8]/10">
                <div>
                  <p className="text-[#1e4ed8] text-2xl font-bold">Create a New Group</p>
                  <p className="text-gray-400 text-sm mt-0.5">Add members and give it a name</p>
                </div>
                <button
                  className="cursor-pointer text-[#1d4ed8] hover:bg-[#1d4ed8]/10 rounded-full p-1.5 transition-colors"
                  onClick={closeCreatePopup}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex flex-col md:flex-row gap-6 px-6 py-6">
                {/* Left: name + description */}
                <div className="flex flex-col gap-4 md:w-1/2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-600">Group Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none focus:border-[#1d4ed8] transition"
                      value={groupName}
                      placeholder="e.g. Trip to Goa"
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-gray-600">Description (optional)</label>
                    <textarea
                      className="w-full flex-1 min-h-[160px] px-3 py-2 bg-[#f7f9fc] border border-[#1e2230]/15 rounded-lg text-[#1e2230] placeholder:text-[#1e2230]/40 focus:outline-none focus:border-[#1d4ed8] transition resize-none"
                      value={groupDescription}
                      placeholder="What's this group for?"
                      onChange={(e) => setGroupDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Right: member picker */}
                <div className="flex flex-col gap-1.5 md:w-1/2">
                  <label className="text-sm font-medium text-gray-600">Select Members</label>
                  <div className="bg-[#f7f9fc] rounded-lg border border-[#1e2230]/15 overflow-hidden flex-1 min-h-[220px]">
                    <UsersList
                      users={users}
                      setMembersids={setMembersids}
                      membersIds={membersIds}
                      createGroupPopup={createGroupPopup}
                    />
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end items-center gap-3 px-6 pb-6">
                <button
                  className="text-gray-500 px-4 py-2 rounded-lg font-medium hover:text-gray-800 transition-colors cursor-pointer"
                  onClick={closeCreatePopup}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#1d4ed8] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#1742b8] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!groupName.trim()}
                  onClick={createGroup}
                >
                  Create Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="md:ml-60 px-6 md:px-10 py-8 max-w-7xl mx-auto">

        {/* Page header */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-3xl md:text-4xl font-bold text-[#1d4ed8]">Your Groups</p>
          <button
            onClick={openCreatePopup}
            className="bg-[#1d4ed8] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#1742b8] transition-colors cursor-pointer"
          >
            New Group
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white rounded-xl border border-[#1d4ed8]/10 shadow-sm py-2.5 px-4 gap-2 mb-8 max-w-sm focus-within:border-[#1d4ed8] transition-colors">
          <Search className="text-gray-400 shrink-0" size={17} />
          <input
            type="text"
            placeholder="Search groups…"
            className="outline-none text-sm w-full bg-transparent text-[#1e2230] placeholder:text-gray-400"
            value={groupNameSearch}
            onChange={(e) => setGroupNameSearch(e.target.value)}
          />
          <X
            className={`text-gray-400 hover:text-[#1d4ed8] transition-colors cursor-pointer shrink-0 ${groupNameSearch.trim() === "" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            size={17}
            onClick={() => setGroupNameSearch("")}
          />
        </div>

        {/* Groups grid */}
        {loadingGroups && (
          <p className="text-gray-400 mt-10 text-center">Loading your groups…</p>
        )}

        {!loadingGroups && filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 gap-3 text-center">
            <div className="bg-[#1d4ed8]/8 rounded-full p-4">
              <Users size={28} className="text-[#1d4ed8]" />
            </div>
            <p className="text-xl font-semibold text-[#1e2230]">No groups found</p>
            <p className="text-gray-400 text-sm">
              {groupNameSearch ? "Try a different search term." : "Create your first group to get started."}
            </p>
          </div>
        )}

        {!loadingGroups && filteredGroups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.map((group) => {
              const numberOfMembers = group.members?.length ?? 0
              return (
                <div
                  key={group._id}
                  className="bg-white rounded-2xl border border-[#1d4ed8]/10 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-3"
                >
                  <p className="text-lg font-bold text-[#1e2230] leading-snug">{group.groupName}</p>

                  {group.groupDescription && (
                    <p className="text-gray-500 text-sm line-clamp-2">{group.groupDescription}</p>
                  )}

                  <div className="flex items-center gap-1.5 mt-auto">
                    <span className="text-xs text-gray-400">Created by</span>
                    <span className="text-xs font-medium text-gray-600">{group.createdBy?.username}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="bg-[#1d4ed8]/8 rounded-full p-1">
                        <Users size={12} className="text-[#1d4ed8]" />
                      </div>
                      <span className="text-xs font-medium text-[#1d4ed8]">
                        {numberOfMembers} member{numberOfMembers !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <Link
                      className="bg-[#1d4ed8] text-white py-1.5 px-4 rounded-lg text-sm font-medium hover:bg-[#1742b8] transition-colors"
                      to={`/groups/${group._id}`}
                    >
                      View
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default Groups