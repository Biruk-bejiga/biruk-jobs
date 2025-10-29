import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'
import HomePage from './Pages/HomePage';
import MainLayout from './layouts/MainLayout';
import JobsPage from './Pages/JobsPage'
import NotFoundPage from './Comonent/NotFoundPage'
import JobPage,{jobLoader} from './Pages/JobPage';
import AddJobPage from './Pages/AddJobPage';
import EditJobPage from './Pages/EditJobPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AdminUsers from './Pages/Admin/AdminUsers';
import AdminJobs from './Pages/Admin/AdminJobs';
import AdminProfile from './Pages/Admin/AdminProfile';
import AdminDisputes from './Pages/Admin/AdminDisputes';
import AdminReports from './Pages/Admin/AdminReports';

const App = () => {
  
const addJob = async (newJob) => {
  await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json'
    },
    body: JSON.stringify(newJob)
  })
  return;
}

const deleteJob = async (id) => {
  await fetch(`/api/jobs/${id}`, {
    method: 'DELETE',
  })
  return;
}

const updateJob = async (job) => {
  await fetch(`/api/jobs/${job.id}`, {
    method: 'PUT',
    headers: {
      'content-Type': 'application/json'
    },
    body: JSON.stringify(job)
  })
  return;
}

const router = createBrowserRouter(
  createRoutesFromElements(
  <>
    <Route path='/' element={<MainLayout />}>
      <Route index element={<HomePage />}/>
      <Route path='/Jobs' element={<JobsPage />}/>
      <Route path='/add-Job' element={<AddJobPage addJobSubmit={addJob}/>}/>
      <Route path='/edit-Job/:id' element={<EditJobPage  updatedJobSubmit={updateJob}/>} loader={jobLoader}/>
      <Route path='/Jobs/:id' element={<JobPage  deleteJob={deleteJob}/>} loader={jobLoader}/>
      <Route path='*' element={<NotFoundPage />}/>
    </Route>
    <Route path='/admin' element={<AdminLayout />}>
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
);

  return <RouterProvider router={router}/>;
}

export default App