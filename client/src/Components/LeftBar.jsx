import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserRoundPen, LogOut, Banknote  } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Popup from './Popup';
import { motion } from "framer-motion"

function LeftBar() {

    let navigate = useNavigate()
    let [popup, setPopup] = useState(false)

  return (
    <div>

        {popup && <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}>
            <Popup title={"Are you sure you want to logout?"} desc={"You will need to login again to access your dashboard."} setPopup={setPopup}/>
        </motion.div>}
            
    <div className='hidden md:fixed  w-60 h-screen top-0 left-0 bg-[#1E2230] md:flex flex-col justify-between items-center'>

        

        {/* novasync ka logo aur links */}
        <div className='mt-10'>
            {/* logo of novasync */}
           <Link to={'/'}>
                <div className='flex flex-row mb-15 justify-center items-center cursor-pointer'>
                <img src="/icon.png" alt="" className='h-7 w-7 mr-2'/>
                <p className='text-3xl font-bold text-white'>Nova</p>
                <p className='text-3xl font-bold text-[#1d4ed8]'>Sync</p>
                </div>
           </Link>

            {/* links */}
            <div className='flex flex-col justify-center items-start gap-2'>
                <NavLink to={'/'} className={({isActive}) => 
                    `text-white text-lg w-45 flex flex-row  items-center gap-2 ${isActive ? "bg-[#1d4ed8] px-4 py-1 rounded-md" : "bg-[#1e2230] px-4 py-1 rounded-md text-white/50"}`
                }><LayoutDashboard size={20}/>  Home</NavLink>
                <NavLink to={'/groups'} className={({isActive}) => 
                    `text-white text-lg w-45 flex flex-row  items-center gap-2 ${isActive ? "bg-[#1d4ed8] px-4 py-1 rounded-md" : "bg-[#1e2230] px-4 py-1 rounded-md text-white/50"}`
                }><Users size={20} className=''/>  Groups</NavLink>
                <NavLink to={'/expenses'} className={({isActive}) => 
                    `text-white text-lg w-45 flex flex-row  items-center gap-2 ${isActive ? "bg-[#1d4ed8] px-4 py-1 rounded-md" : "bg-[#1e2230] px-4 py-1 rounded-md text-white/50"}`
                }><Banknote size={20}/>  Expenses</NavLink>
                <NavLink to={'/profile'} className={({isActive}) => 
                    `text-white text-lg w-45 flex flex-row  items-center gap-2 ${isActive ? "bg-[#1d4ed8] px-4 py-1 rounded-md" : "bg-[#1e2230] px-4 py-1 rounded-md text-white/50"}`
                }><UserRoundPen size={20}/>  Profile</NavLink>
                
            </div>
        </div>

        {/* logout option */}
        <div className='flex justify-center items-center'>
            <div className='flex flex-row justify-start items-center mb-10 w-45 text-white gap-2 cursor-pointer px-4' onClick={()=>{
                setPopup(true)
                
            }}>
                <LogOut size={20}/>
                <p>Logout</p>
            </div>
        </div>
    </div>
    </div>
  )
}

export default LeftBar