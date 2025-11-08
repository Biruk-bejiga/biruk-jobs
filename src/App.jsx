import { useCallback, useMemo } from 'react'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import HomePage from './Pages/HomePage'
import MainLayout from './layouts/MainLayout'
import JobsPage from './Pages/JobsPage'
import NotFoundPage from './Comonent/NotFoundPage'
import JobPage, { jobLoader } from './Pages/JobPage'
import AddJobPage from './Pages/AddJobPage'
import EditJobPage from './Pages/EditJobPage'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminUsers from './Pages/Admin/AdminUsers'
import AdminJobs from './Pages/Admin/AdminJobs'
import AdminProfile from './Pages/Admin/AdminProfile'
import AdminDisputes from './Pages/Admin/AdminDisputes'
import AdminReports from './Pages/Admin/AdminReports'
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
            <Route path='/admin' element={<ProtectedRoute redirectTo='/login'><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path='users' element={<AdminUsers />} />
              <Route path='jobs' element={<AdminJobs />} />
              <Route path='disputes' element={<AdminDisputes />} />
              <Route path='reports' element={<AdminReports />} />
              <Route path='profile' element={<AdminProfile />} />
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