import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'
import React from 'react'
import HomePage from './Pages/HomePage';
import MainLayout from './layouts/MainLayout';
import JobsPage from './Pages/JobsPage'
import NotFoundPage from './Comonent/NotFoundPage'
import JobPage,{jobLoader} from './Pages/JobPage';
import AddJobPage from './Pages/AddJobPage';
import EditJobPage from './Pages/EditJobPage';

const App = () => {
  
const addJob = async (newJob) => {
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json'
    },
    body: JSON.stringify(newJob)
  })
  return;
}

const deleteJob = async (id) => {
  const res = await fetch(`/api/jobs/${id}`, {
    method: 'DELETE',
  })
  return;
}

const updateJob = async (job) => {
  const res = await fetch(`/api/jobs/${job.id}`, {
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
  <Route path='/' element={<MainLayout />}>
    <Route index element={<HomePage />}/>
    <Route path='/Jobs' element={<JobsPage />}/>
    <Route path='/add-Job' element={<AddJobPage addJobSubmit={addJob}/>}/>
    <Route path='/edit-Job/:id' element={<EditJobPage  updatedJobSubmit={updateJob}/>} loader={jobLoader}/>
    <Route path='/Jobs/:id' element={<JobPage  deleteJob={deleteJob}/>} loader={jobLoader}/>
    <Route path='*' element={<NotFoundPage />}/>
  </Route>
  )
);

  return <RouterProvider router={router}/>;
}

export default App