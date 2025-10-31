import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import MainLayout from './layouts/MainLayout';
import JobsPage from './Pages/JobsPage';
import NotFoundPage from './Comonent/NotFoundPage';
import JobPage from './Pages/JobPage';
import AddJobPage from './Pages/AddJobPage';
import EditJobPage from './Pages/EditJobPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="jobs" element={<JobsPage />} />
      <Route path="jobs/:id" element={<JobPage />} />
      <Route path="add-job" element={<AddJobPage />} />
      <Route path="edit-job/:id" element={<EditJobPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

const App = () => <RouterProvider router={router} />;

export default App;