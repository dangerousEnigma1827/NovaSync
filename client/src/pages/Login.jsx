import React, { useState } from 'react'
import axios from 'axios'
import { Mail, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const toastStyle = { style: { background: '#1d4ed8', color: '#fff' } }

  const loginFunc = async (e) => {
    e.preventDefault()

    if (email.trim() === "") return toast("Email can't be empty!", toastStyle)
    if (password.trim() === "") return toast("Password can't be empty!", toastStyle)

    try {
      const result = await axios.post('http://localhost:3000/users/login', { email, password })
      localStorage.setItem('token', result.data.token)
      navigate('/')
    } catch (err) {
      if (err.response?.data?.message) {
        toast(err.response.data.message, toastStyle)
      }
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f9fc]">

      {/* Left panel — decorative */}
      <div className="hidden md:flex w-1/2 bg-[#1e2230] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1d4ed8]/10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#1d4ed8]/8 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <img src="/icon.png" alt="" className="h-8 w-8" />
          <span className="text-2xl font-bold text-white">Nova</span>
          <span className="text-2xl font-bold text-[#1d4ed8]">Sync</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <p className="text-white text-4xl font-bold leading-snug mb-3">
            Split expenses.<br />Stay settled.
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Track shared costs with friends and groups. See exactly who owes what — no more awkward conversations.
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="text-white/20 text-xs relative z-10">NovaSync · Smart expense splitting</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        {/* Mobile logo */}
        <div className="flex items-center gap-1.5 mb-10 md:hidden">
          <img src="/icon.png" alt="" className="h-7 w-7" />
          <span className="text-2xl font-bold text-[#1e2230]">Nova</span>
          <span className="text-2xl font-bold text-[#1d4ed8]">Sync</span>
        </div>

        <div className="w-full max-w-sm">
          <p className="text-gray-400 text-sm mb-1">Welcome back</p>
          <p className="text-[#1e2230] text-3xl font-bold mb-8">Log in to your account</p>

          <form className="flex flex-col gap-4" onSubmit={loginFunc}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="flex items-center bg-white border border-[#1e2230]/15 rounded-xl px-3 py-2.5 gap-2.5 focus-within:border-[#1d4ed8] transition-colors">
                <Mail size={16} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 outline-none text-sm text-[#1e2230] placeholder:text-gray-400 bg-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600">Password</label>
              <div className="flex items-center bg-white border border-[#1e2230]/15 rounded-xl px-3 py-2.5 gap-2.5 focus-within:border-[#1d4ed8] transition-colors">
                <Lock size={16} className="text-gray-400 shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="flex-1 outline-none text-sm text-[#1e2230] placeholder:text-gray-400 bg-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1d4ed8] text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-[#1742b8] transition-colors cursor-pointer mt-2"
              onClick={loginFunc}
            >
              Log In
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            New to NovaSync?{' '}
            <span
              className="text-[#1d4ed8] font-medium cursor-pointer hover:underline"
              onClick={() => navigate('/register')}
            >
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login