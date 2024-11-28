import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const UsersList = () => {
  
  const { atoken, users, getallUsers } = useContext(AdminContext) // Assuming `getAllUsers` gets the list of users from backend
  const [searchTerm, setSearchTerm] = useState('') // For managing search term
  const [filteredUsers, setFilteredUsers] = useState([]) // For displaying filtered users

  const navigate = useNavigate()

  useEffect(() => {
    if (atoken) {
      getallUsers()
    }
  }, [atoken])

  useEffect(() => {
    console.log(users)
    setFilteredUsers(users) // Initialize with all users
  }, [users])

  // Filter users based on search term (by id, name, email, or phone)
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.id?.toString().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) 
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users) // If no search term, show all users
    }
  }, [searchTerm, users])

  const handleViewUser = (user) => {
    navigate(`/update-user/${user._id}`, { state: { patientData: user } })
  }

  return (
    <div className='w-full max-w-6xl m-5'>

      {/* Search Box */}
      <div className='mb-3 flex justify-between'>
        <p className='text-lg font-medium'>Users List</p>
        <input 
          type='text' 
          placeholder='Search by ID, Name, Email, or Phone' 
          className='border rounded px-3 py-1 outline-none' 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_1.5fr_1fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>ID</p>
          <p>Name</p>
          <p>Email</p>
          <p>Phone</p>
          <p>Action</p>
        </div>

        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div 
              className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_1.5fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' 
              key={index}
            >
              <p className='max-sm:hidden'>{index + 1}</p>
              <p>{user._id}</p>
              <div className='flex items-center gap-2'>
                <img src={user.image} className='w-8 rounded-full' alt="" />
                <p>{user.name}</p>
              </div>
              <p>{user.email}</p>
              <p>{user.phone}</p>
              <button onClick={() => handleViewUser(user)} className='text-blue-500 underline hover:text-blue-700 flex'>Edit</button>
            </div>
          ))
        ) : (
          <p className='p-4 text-gray-500'>No users found</p>
        )}
      </div>

    </div>
  )
}

export default UsersList
