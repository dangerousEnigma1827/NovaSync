import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftBar from '../Components/LeftBar'

function HomePage() {
  return (
    <div>

        <LeftBar/>

        <Outlet/>

    </div>
  )
}

export default HomePage