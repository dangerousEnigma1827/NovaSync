import React, { useState } from 'react'
import axios from 'axios'
import { Lock, Mail, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast";


function Login() {

    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")

    let navigate = useNavigate()

    let loginFunc = async (e)=>{
        e.preventDefault()

        if(email.trim() == ""){
            toast("Email cant be empty!",{
                style: {
                background: '#1d4ed8',
                color: '#fff',
            },                       
            });
        
            return;
        }

        if(password.trim() == ""){
            toast("Password cant be empty!",{
                style: {
                background: '#1d4ed8',
                color: '#fff',
            },                       
            })
            return;
        }


        console.log("1")
        try{
            let result = await axios.post('http://localhost:3000/users/login', {
                "email":email,
                "password":password
            })
            navigate('/')
            
            localStorage.setItem('token', result.data.token)

        }catch(err){
            if(err.response.data.message){
                    console.log(err.response.data.message)
                    toast(err.response.data.message,{
                        style: {
                        background: '#1d4ed8',
                        color: '#fff',
                        },          
                        }
                    )
                }
        }
    }
    

  return (
    

    <div className='flex flex-row justify-center items-center overflow-hidden h-screen w-screen'>
        <div className='h-screen w-1/2 hidden md:flex'>
            <img src="/..jpg" alt="" className='object-cover h-screen w-[50vw] '/>
        </div>


        {/* right part */}
        <div className='h-screen w-[50vw] flex flex-col justify-center items-center'>

            {/* logo part */}
            <div className='bg-[#eef3ff] rounded-lg px-20 py-10 shadow-xl'>
                <div className='flex flex-row mt-2 mb-8'>
                <img src="/icon.png" alt="" className='h-12 w-12 mr-2'/>
                <p className='md:text-6xl text-5xl font-bold text-[#1e2230]'>Nova</p>
                <p className='text-5xl md:text-6xl font-bold text-[#1d4ed8]'>Sync</p>
            </div>

            <div className='flex flex-col justify-center items-center gap-1 mb-10'>
                <p className='text-gray-600 sm:text-xl text-md text-center'>Already Have An Account ?</p>
                <p className='text-[#1e4ed8] text-3xl font-bold'>Login Now!</p>
            </div>

            <div>
                <form className='flex flex-col gap-2 justify-center items-center'>

                    <div className='flex flex-col justify-center items-start gap-[0.5]'>
                        <label>Email</label>
                        <div className='flex justify-between items-center border border-gray-600 rounded px-1 py-[3.6px] w-85'>
                            <input type="text" className='px-4  w-[23vw] outline-none rounded border-gray-600' value={email} onChange={(e)=>setEmail(e.target.value)}/>
                            {/* <Mail size={25} strokeWidth={1}/> */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
</svg>

                        </div>
                    </div>
                    <div className='flex flex-col justify-center items-start gap-[0.5]'>
                        <label>Password</label>
                        <div className='flex justify-between items-center border border-gray-600 rounded px-1 py-[3.6px] w-85'>
                            <input type="password" className='px-4 w-[23vw] outline-none rounded border-gray-600' value={password} onChange={(e)=>setPassword(e.target.value)}/>
                            {/* <Lock size={25} strokeWidth={1}/> */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clip-rule="evenodd" />
</svg>

                        </div>
                    </div>

                    <button className='w-85 cursor-pointer text-white text-xl bg-blue-700 px-4 py-[3.6px] mt-5 font-semibold rounded hover:bg-blue-700/40' onClick={(e)=>loginFunc(e)}>Login</button>

                     <p className='mt-2'>New to NovaSync ? <span className='text-blue-700 underline cursor-pointer' onClick={()=>navigate('/register')}>Register</span></p>

                </form>
            </div>
            </div>

        </div>
        
    </div>


  )
}

export default Login