import React from 'react'
import { Navigate } from 'react-router-dom'

function ProtectedRoutes({children}) {

    let token = localStorage.getItem('token')

    if(!token){
      return <Navigate to={'/login'}/>
    }

    return children

  return (
    <div>
    </div>
  )
}

export default ProtectedRoutes