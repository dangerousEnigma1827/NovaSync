import { useState } from 'react'
import React from 'react'
import { Router, Route, Routes } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import Register from './pages/Register'
import Login from './pages/Login'
import HomePage from './pages/HomePage'
import Dashboard from './Components/Dashboard'
import Groups from './Components/Groups';
import Profile from './Components/Profile';
import ProtectedRoutes from './Components/ProtectedRoutes';
import ViewGroup from './Components/ViewGroup';
import AddExpense from './Components/AddExpense';
import Expenses from './Components/Expenses';
import Chat from './Components/Chat';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Toaster position="top-right"/>
    <Routes>
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>

      <Route path='/' element={<ProtectedRoutes><HomePage/></ProtectedRoutes>}>
        <Route index element={<Dashboard/>} />
        <Route path='/groups' element={<Groups/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/expenses' element={<Expenses/>} />
        <Route path='/groups/:groupId' element={<ViewGroup/>} />
        <Route path='/groups/:groupId/addExpense' element={<AddExpense/>}/>
        <Route path='/:groupId/chat' element={<Chat/>}/>
      </Route>
      
    </Routes>
    </>
  )
}

export default App
