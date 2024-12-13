import { useContext, useEffect } from 'react';
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import UpdateDoctorProfile from './pages/Doctor/UpdateDoctorProfile';
import UsersList from './pages/Admin/UsersList';
import OperatorsList from './pages/Admin/OperatorsList';
import UpdateUser from './pages/Admin/UpdateUser';
import AddOperator from './pages/Admin/AddOperator';
import AppointmentDetails from './pages/Doctor/AppointmentDetail';
import SetPassword from './pages/Doctor/SetPassword'; // Import SetPassword component

const App = () => {
  const { dToken, profileData } = useContext(DoctorContext);
  const { atoken } = useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to set password if it's the doctor's first login
    if (dToken  && profileData?.available === false) {
      navigate('/set-password');
    }
  }, [dToken, profileData, navigate]);

  return dToken || atoken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/add-operator' element={<AddOperator />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/users-list' element={<UsersList />} />
          <Route path='/operators-list' element={<OperatorsList />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/doctor-profile/:docId' element={<UpdateDoctorProfile />} />
          <Route path='/update-user/:userId' element={<UpdateUser />} />
          <Route path='/appointment/:id' element={<AppointmentDetails />} />
          <Route path='/set-password' element={<SetPassword />} /> {/* New route */}
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  );
};

export default App;
