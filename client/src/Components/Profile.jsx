import { Pencil, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'

function Profile() {
  let [usernameDisplay, setUsername] = useState("")
  let [emailDisplay, setEmail] = useState("")

  let token = localStorage.getItem('token')

  useEffect(()=>{
    async function getUserInfo(){

      try{
        let userInfo = await fetch('http://localhost:3000/users/me', {
          method:"GET",
          headers : {
            "Authorization":`Bearer ${token}`
          }
        })

        let data = await userInfo.json()
       
        setUsername(data.username)
        setEmail(data.email)
      }catch(err){
        console.log("error in retrieving user info", err)
      }
    }

    getUserInfo()
  },[])



  return (
    <div>
      <div className='ml-60 flex flex-col justify-center items-center h-screen profile'>
      
        <div className='bg-white px-10 py-10 rounded'>
          <p className='text-2xl font-bold mb-10 w-[30vw] text-center py-2 text-[#1d4ed8]'>Profile</p>
        
          <div className='flex justify-center items-center gap-2'>

            <div className='flex flex-col justify-start items-start'>
              <p className='text-5xl font-bold'>{usernameDisplay}</p>
              <p className='text-[#1d4ed8]/80'>{emailDisplay}</p>
              <button className='text-white rounded px-4 py-2 cursor-pointer bg-[#1d4ed8] my-5 text-sm flex justify-center items-center gap-2 '>Edit Profile <Pencil size={15}/></button>
            </div>

            <User size={170} className='color-white'/>
           
          </div>
        </div>

      </div>
    </div>
  )
}

export default Profile