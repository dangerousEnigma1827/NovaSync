import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserRoundPen, LogOut, Banknote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from "framer-motion"
import Popup from './Popup'

const NAV_LINKS = [
  { to: '/',         icon: LayoutDashboard, label: 'Home'     },
  { to: '/groups',   icon: Users,           label: 'Groups'   },
  { to: '/expenses', icon: Banknote,        label: 'Expenses' },
  { to: '/profile',  icon: UserRoundPen,    label: 'Profile'  },
]

function LeftBar() {
  const navigate = useNavigate()
  const [popup, setPopup] = useState(false)

  return (
    <>
      {/* Logout confirmation popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Popup
              title="Are you sure you want to logout?"
              desc="You will need to log in again to access your dashboard."
              setPopup={setPopup}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 w-60 h-screen bg-[#1e2230] flex-col justify-between py-8 px-4 z-30">

        {/* Top: logo + nav */}
        <div className="flex flex-col gap-8">
          {/* Logo */}
            <div className='flex items-center gap-1'>
                <img src="/icon.png" alt="NovaSync" className="h-7 w-7 shrink-0" />
                <Link to="/" className="flex items-center px-2">
                    <span className="text-2xl font-bold text-white">Nova</span>
                    <span className="text-2xl font-bold text-[#1d4ed8]">Sync</span>
                </Link>
            </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1d4ed8] text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom: logout */}
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer w-full text-left"
          onClick={() => setPopup(true)}
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </>
  )
}

export default LeftBar