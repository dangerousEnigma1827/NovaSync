import {useState} from 'react'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {ArrowLeft, MoveLeft, Send} from 'lucide-react'
import { useEffect } from 'react'
import toast from "react-hot-toast";


function Chat() {

  let {groupId} = useParams()
  let token = localStorage.getItem('token')

  let [chats, setChats] = useState([])
  let [chatMessage, setChatMessage] = useState("")
  let [currentUserId, setCurrentUserId] = useState()
  let navigate= useNavigate()

  let getChats = async () => {
    try{
      let cheatsFromBackend = await axios.get(`http://localhost:3000/chats/${groupId}`, {
        headers:{
          Authorization : `Bearer ${token}`
        }
      })
      setChats(cheatsFromBackend.data.chatsToGiveFromBackend)
      console.log("fetched chats", cheatsFromBackend.data.chatsToGiveFromBackend)
    }catch(err){
      console.log("error getting chats in frontend", err)
    }
  }

  let getCurrentUser = async () => {
    try{
      let currentUserData = await axios.get(`http://localhost:3000/users/me`, {
        headers:{
          Authorization : `Bearer ${token}`
        }
      })
      setCurrentUserId(currentUserData.data._id)
    }catch(err){
      console.log("error getting current user in frontend", err)
    }
  }

  let createChat = async () => {
    try{
      console.log(currentUserId)
      console.log(chatMessage)
      console.log(groupId)

      let chatToCreate = await axios.post(`http://localhost:3000/chats/${groupId}/add`, {
        "createdBy":currentUserId,
        "chatMessage":chatMessage,
        "groupId":groupId
      },{
        headers:{
          Authorization : `Bearer ${token}`

        }
      })
      console.log("done")
    }catch(err){
      console.log("error adding a comment", err)
      toast(err.response.data.message,
            {
                style: {
                background: '#1d4ed8',
                color: '#fff',
            }})
    }
  }

  useEffect(()=>{
    getChats()
    getCurrentUser()
  }, [])

  
  return (
    <div className='ml-60 h-screen flex justify-center items-center'>
      <div className='w-220 flex flex-col justify-start'>
        <button className='text-gray-600 cursor-pointer flex items-center gap-2 mb-2' onClick={(e)=> navigate(`/groups/${groupId}`)}><MoveLeft size={20}/> Back</button>
        <p className='text-4xl font-bold text-[#1d4ed8] mb-4'>CHAT</p>
        <div className='border border-[#1d4ed8] rounded-xl h-120 w-250 flex flex-col justify-between items-center shadow-sm'>
          <div className='overflow-auto w-[100%]'>
            <div className='w-[100%]'>
              {
              chats.length > 0 ? 
              chats.map((chat, index)=>{
                console.log()
                return <div key={chat._id} className={` w-[30%] relative ${chat.createdBy._id == currentUserId ? 'left-[69%]' : ""} flex flex-col justify-start items-start mt-4 gap-1`}>
                  <div className='flex justify-between items-center w-[96%]'>
                    <p className={`text-gray-600 text-sm ml-3 ${chat.createdBy._id == currentUserId ? "opacity-0" : ""}`}>{chat.createdBy.username}</p>
                    <p className={`text-gray-600 text-sm ml-3 ${chat.createdBy._id == currentUserId ? "opacity-100" : "opacity-0"}`}>You</p>
                  </div>
                  <div className={`${chat.createdBy._id == currentUserId ? 'text-white bg-[#1d4ed8] rounded-tr-xl rounded-bl-xl rounded-tl-xl mr-3' : 'text-black bg-gray-100 rounded-tr-xl rounded-tl-xl rounded-br-xl ml-3'} w-[100%]  px-3 py-2`}>
                    {chat.chatMessage}
                  </div>
                  <div className='flex justify-between items-center w-[96%]'>
                    <div className={`flex gap-1 ${chat.createdBy._id == currentUserId ? "opacity-0" : "opacity-100"} ml-3`}>
                      <p className='text-gray-600 text-sm'>{new Date(chat.createdAt).toString().split(" ")[4].substring(0,5)}</p>
                      <p className='text-gray-600 text-sm'>{Number(new Date(chat.createdAt).toString().split(" ")[4].substring(0,2)) > 12 ?"PM" : "AM"}</p>
                      <p className='text-gray-600 text-sm'>{new Date(chat.createdAt).toString().split(" ")[1]}</p>
                      <p className='text-gray-600 text-sm'>{new Date(chat.createdAt).toString().split(" ")[2]}</p>
                    </div>
                    <div className={`flex gap-1 ${chat.createdBy._id == currentUserId ? "opacity-100" : "opacity-0"}`}>
                      <p className='text-gray-600 text-sm'>{new Date(chat.createdAt).toString().split(" ")[4].substring(0,5)}</p>
                      <p className='text-gray-600 text-sm'>{Number(new Date(chat.createdAt).toString().split(" ")[4].substring(0,2)) > 12 ?"PM" : "AM"}</p>

                      <p className='text-gray-600 text-sm'>{new Date(chat.createdAt).toString().split(" ")[1]}</p>
                      <p className='text-gray-600 text-sm'>{new Date(chat.createdAt).toString().split(" ")[2]}</p>
                    </div>
                  </div>
                </div>
              }) :
              <div className='flex min-h-[54vh] w-full justify-center items-center overflow-hidden text-center'>
                <p className='text-xl font-semibol'>No Chats At The Moment! <br/>Be The First Person To Chat...</p>
              </div>
               }
            </div>
          </div>
          <div className='min-h-20 w-full flex justify-between items-center border-t border-t-[#e5e7eb] mt-3 '>
            <input placeholder='Write Something....' className='px-4 w-[90%] outline-none' onChange={(e)=>setChatMessage(e.target.value)} value={chatMessage}/>
            <div className='bg-[#1d4ed8] p-3 hover:bg-[#1e2230] transition-all duration-200 cursor-pointer flex justify-center items-center mr-10 rounded-full'  onClick={(e)=>{
                createChat()
                getChats()
                setChatMessage("")
              }}>
              <Send className=' text-white cursor-pointer' size={20}/>
            </div>
          </div>
        </div>
      </div>
      
    </div>
   
  )
}

export default Chat