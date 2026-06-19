import { Search, X, UserPlus, Check } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

function UsersList({ users, setMembersids, membersIds }) {

    let [selectedUsers, setSelectedUsers] = useState([])
    let token = localStorage.getItem('token')
    let [userData, setUserData] = useState([])
    let [usersearchInput, setUserSearchInput] = useState("")

    let getCurrentUser = async () => {
        try {
            let currentUser = await axios.get('http://localhost:3000/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUserData(currentUser.data)
            setSelectedUsers([currentUser.data])
        } catch (err) {
            console.log("error getting user info", err)
        }
    }

    let selectUserFunc = (e, user) => {
        e.preventDefault()

        if (!selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user])
            setMembersids([...membersIds, user._id])
        } else {
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))
            setMembersids(membersIds.filter(id => id !== user._id))
        }
    }

    useEffect(() => {
        getCurrentUser()
    }, [])

    return (
        <div className="h-80 overflow-y-auto px-3 py-2 space-y-4">

            {/* SELECTED USERS */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-600 mb-2">
                    Selected Members
                </p>

                <div className="flex flex-wrap gap-2">
                    {selectedUsers.length === 0 ? (
                        <p className="text-xs text-gray-500">
                            No members selected yet
                        </p>
                    ) : (
                        selectedUsers.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                                {user.username}
                                {user._id !== userData._id && (
                                    <X
                                        size={14}
                                        className="cursor-pointer hover:text-red-600"
                                        onClick={(e) => selectUserFunc(e, user)}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SEARCH */}
            <div className="sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2 px-3 py-2 border rounded-full shadow-sm focus-within:border-blue-500 transition">
                    <Search size={18} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full outline-none text-sm"
                        onChange={(e) => setUserSearchInput(e.target.value)}
                        value={usersearchInput}
                    />
                    {usersearchInput && (
                        <X
                            size={16}
                            className="text-gray-500 cursor-pointer hover:text-red-500"
                            onClick={() => setUserSearchInput("")}
                        />
                    )}
                </div>
            </div>

            {/* USERS LIST */}
            <div className="space-y-2">

                <p className="text-xs uppercase tracking-wide text-gray-400 px-1">
                    All Users
                </p>

                {users
                    .filter((user) =>
                        user.username.toLowerCase().includes(usersearchInput.toLowerCase())
                    )
                    .map((user, index) => {

                        const isCurrentUser = user._id === userData._id
                        const isSelected = selectedUsers.find(u => u._id === user._id)

                        return (
                            <div
                                key={user._id}
                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                            >

                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                                        {user.username[0]?.toUpperCase()}
                                    </div>

                                    <span className="text-sm font-medium text-gray-700">
                                        {user.username}
                                    </span>
                                </div>

                                {isCurrentUser ? (
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                        You
                                    </span>
                                ) : (
                                    <button
                                        onClick={(e) => selectUserFunc(e, user)}
                                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition
                                            ${isSelected
                                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                    >
                                        {isSelected ? <X size={14} /> : <UserPlus size={14} />}
                                        {isSelected ? "Remove" : "Add"}
                                    </button>
                                )}
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

export default UsersList