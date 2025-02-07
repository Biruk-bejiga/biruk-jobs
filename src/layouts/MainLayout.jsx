import React from 'react'
import { ToastContainer} from 'react-toastify'
import { Outlet } from 'react-router-dom'
import Navbar from '../Comonent/Navbar'


const MainLayout = () => {
  return (
    <>
    <Navbar />
    {/* <ToastContainer /> */}
    <Outlet />
    </>
  )
}

export default MainLayout