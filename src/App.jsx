import { useCallback, useMemo } from 'react'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import HomePage from './Pages/HomePage'
import MainLayout from './layouts/MainLayout'
import JobsPage from './Pages/JobsPage'
import NotFoundPage from './Comonent/NotFoundPage'
import JobPage from './Pages/JobPage'
import { jobLoader } from './Pages/jobLoader'
import AddJobPage from './Pages/AddJobPage'
import EditJobPage from './Pages/EditJobPage'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminUsers from './Pages/Admin/AdminUsers'
import AdminJobs from './Pages/Admin/AdminJobs'
import AdminProfile from './Pages/Admin/AdminProfile'
import AdminDisputes from './Pages/Admin/AdminDisputes'
import AdminReports from './Pages/Admin/AdminReports'
import EmployerLayout from './layouts/EmployerLayout'
import EmployerDashboard from './Pages/Employer/EmployerDashboard'
import EmployerJobs from './Pages/Employer/EmployerJobs'
import EmployerApplications from './Pages/Employer/EmployerApplications'
import EmployerTeam from './Pages/Employer/EmployerTeam'
import EmployerProfile from './Pages/Employer/EmployerProfile'
import EmployeeLayout from './layouts/EmployeeLayout'
import EmployeeDashboard from './Pages/Employee/EmployeeDashboard'
import EmployeeJobs from './Pages/Employee/EmployeeJobs'
import EmployeeApplications from './Pages/Employee/EmployeeApplications'
import EmployeeFavorites from './Pages/Employee/EmployeeFavorites'
import EmployeeProfile from './Pages/Employee/EmployeeProfile'
import ProtectedRoute from './Comonent/ProtectedRoute'
import LoginPage from './Pages/LoginPage'
import { useAuth } from './context/AuthContext'

const parseErrorMessage = async (response, fallbackMessage) => {
  try {
    const payload = await response.json()
    return payload?.error?.message ?? payload?.message ?? fallbackMessage
  } catch (error) {
    console.error('Failed to parse error response', error)
    return fallbackMessage
  }
}

const App = () => {
  const { authFetch } = useAuth()

  const addJob = useCallback(
    async (newJob) => {
      const response = await authFetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJob),
      })

      if (!response.ok) {
        const message = await parseErrorMessage(response, 'Failed to create job')
        throw new Error(message)
      }

      return response.json().catch(() => undefined)
    },
    [authFetch],
  )

  const deleteJob = useCallback(
    async (id) => {
      const response = await authFetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const message = await parseErrorMessage(response, 'Failed to delete job')
        throw new Error(message)
      }

      return true
    },
    [authFetch],
  )

  const updateJob = useCallback(
    async (job) => {
      const response = await authFetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(job),
      })

      if (!response.ok) {
        const message = await parseErrorMessage(response, 'Failed to update job')
        throw new Error(message)
      }

      return response.json().catch(() => undefined)
    },
    [authFetch],
  )

  const router = useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <>
            <Route path='/' element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path='/jobs' element={<JobsPage />} />
              <Route path='/add-job' element={<AddJobPage addJobSubmit={addJob} />} />
              <Route
                path='/edit-job/:id'
                element={<EditJobPage updatedJobSubmit={updateJob} />}
                loader={jobLoader}
              />
              <Route path='/jobs/:id' element={<JobPage deleteJob={deleteJob} />} loader={jobLoader} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='*' element={<NotFoundPage />} />
            </Route>
            <Route
              path='/admin'
              element={
                <ProtectedRoute redirectTo='/login' allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path='users' element={<AdminUsers />} />
              <Route path='jobs' element={<AdminJobs />} />
              <Route path='disputes' element={<AdminDisputes />} />
              <Route path='reports' element={<AdminReports />} />
              <Route path='profile' element={<AdminProfile />} />
              <Route path='*' element={<NotFoundPage />} />
            </Route>
            <Route
              path='/employer'
              element={
                <ProtectedRoute redirectTo='/login' allowedRoles={['employer']}>
                  <EmployerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<EmployerDashboard />} />
              <Route path='jobs' element={<EmployerJobs />} />
              <Route path='applications' element={<EmployerApplications />} />
              <Route path='team' element={<EmployerTeam />} />
              <Route path='profile' element={<EmployerProfile />} />
              <Route path='*' element={<NotFoundPage />} />
            </Route>
            <Route
              path='/employee'
              element={
                <ProtectedRoute redirectTo='/login' allowedRoles={['employee']}>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<EmployeeDashboard />} />
              <Route path='jobs' element={<EmployeeJobs />} />
              <Route path='applications' element={<EmployeeApplications />} />
              <Route path='favorites' element={<EmployeeFavorites />} />
              <Route path='profile' element={<EmployeeProfile />} />
              <Route path='*' element={<NotFoundPage />} />
            </Route>
          </>
        )
      ),
    [addJob, deleteJob, updateJob],
  )

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position='top-center' autoClose={3000} newestOnTop />
    </>
  )
}

export default App