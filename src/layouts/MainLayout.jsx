import { Outlet } from 'react-router-dom'
import Navbar from '../Comonent/Navbar'
import { ConfirmProvider } from '../Comonent/ConfirmProvider'


const MainLayout = () => {
  return (
    <ConfirmProvider>
      <Navbar />
      <Outlet />
    </ConfirmProvider>
  )
}

export default MainLayout