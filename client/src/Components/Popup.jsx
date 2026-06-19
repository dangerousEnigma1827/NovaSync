import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";



function Popup({title, desc, setPopup}) {

    let navigate = useNavigate()
    

  return (
    <div className='h-screen w-screen bg-black/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-100'>
        <div className=' shadow-2xl h-65 w-100 flex flex-col bg-[#eef3ff] rounded-xl border-[#1d4ed8]/20 border-2'>
            <div className='flex flex-col items-center w-full py-5'>
                {/* <p className='text-white text-[20px] my-1'>{title}</p> */}
                <p className='text-[#1e4ed8] text-2xl px-4 font-bold text-center'>{title}</p>
                <p className='text-gray-600 text-[14px] mt-1'>{desc}</p>
                {/* <p className='text-gray-600 text-center'>Enter the following information</p> */}
            </div>

            <div className='flex flex-col justify-center items-center gap-5 mt-2'>
                <button className='bg-blue-700 text-white rounded px-4 py-1 cursor-pointer w-[60%] hover:opacity-80' onClick={(e)=>{
                    localStorage.removeItem('token')
                    navigate('/login')
                    toast("Logged Out Successfully",{
                        
                        style: {
                        background: '#1d4ed8',
                        color: '#fff',
                        },
                        
                    });
                }}>Logout</button>
                <button className='bg-transparent border border-gray-600 w-[60%] text-gray-600 rounded px-4 py-1 cursor-pointer hover:border-black hover:text-black' onClick={(e)=>{
                    setPopup(false)
                }}>Cancel</button>
            </div>
            <div>

            </div>
        </div>
    </div>
  )
}

export default Popup