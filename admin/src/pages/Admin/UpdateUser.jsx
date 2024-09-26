import { useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const UpdateUser = () => {
  const location = useLocation()
  const { userData } = location.state || {} // Extract the passed user data from state
  const [profileData, setProfileData] = useState(userData)
  const { backendUrl } = useContext(AppContext)
  const [atoken] = useState(localStorage.getItem('aToken') || '')
  const navigate = useNavigate()

  const updateProfile = async () => {
    try {
      const updateData = {
        userId: profileData._id,
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        dob: profileData.dob,
        gender: profileData.gender
      }

      const { data } = await axios.post(`${backendUrl}/api/admin/update-user-profile`, updateData, { headers: { atoken } })
      if (data.success) {
        toast.success(data.message)
        navigate('/users-list')
        // Optionally update profileData here if needed
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    }
  }

  const deleteUser = async () => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/delete-user/${userData._id}`, { headers: { atoken } })
      if (data.success) {
        toast.success('User deleted successfully')
        navigate('/admin/users')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to delete user')
      console.error(error)
    }
  }

  return profileData && (
    <div className='flex flex-col gap-4 m-5'>
      <div>
        <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="" />
      </div>

      <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
        <input type='text' className='w-full border outline-primary p-2' placeholder='Name' value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
        <div className='mt-3'>
          <p className='text-sm font-medium text-[#262626]'>Phone:</p>
          <input type='text' className='w-full border outline-primary p-2' value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
        </div>

        <div className='mt-3'>
          <div className='mt-3'>
  <p className='text-sm font-medium text-[#262626]'>Address:</p>
  
  {/* Line 1 Input */}
  <input
    type='text'
    className='w-full border outline-primary p-2'
    placeholder='Line 1'
    value={profileData.address.line1}
    onChange={(e) => 
      setProfileData(prevProfileData => ({
        ...prevProfileData,
        address: {
          ...prevProfileData.address,
          line1: e.target.value
        }
      }))
    }
  />

  {/* Line 2 Input */}
  <input
    type='text'
    className='w-full border outline-primary p-2 mt-2'
    placeholder='Line 2'
    value={profileData.address.line2}
    onChange={(e) => 
      setProfileData(prevProfileData => ({
        ...prevProfileData,
        address: {
          ...prevProfileData.address,
          line2: e.target.value
        }
      }))
    }
  />
</div>

          </div>

        <div className='flex gap-4 mt-5'>
          <button onClick={updateProfile} className='px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all'>Save</button>
          <button onClick={deleteUser} className='px-4 py-1 border border-red-500 text-sm rounded-full hover:bg-red-500 hover:text-white transition-all'>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default UpdateUser
