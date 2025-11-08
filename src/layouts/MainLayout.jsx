import { Outlet } from 'react-router-dom'
import Navbar from '../Comonent/Navbar'


const MainLayout = () => {
  return (
    <>
    <Navbar />
    <Outlet />
    </>
  )
}

export default MainLayout