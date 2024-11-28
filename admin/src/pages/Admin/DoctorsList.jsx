import  { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const DoctorsList = () => {

  const { doctors , atoken , getAllDoctors} = useContext(AdminContext)

  const navigate = useNavigate()

  useEffect(() => {
    if (atoken) {
        getAllDoctors()
    }
}, [atoken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
    {doctors ? <h1 className='text-lg font-medium'>All Doctors</h1> : <p className='p-4 text-gray-500'>No doctors found</p>}
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {doctors.map((item, index) => (
          <div onClick={() => navigate(`/doctor-profile/${item._id}`)} className='border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={index}>
            <img className='bg-[#EAEFFF] group-hover:bg-primary transition-all duration-500' src={item.image} alt="" />
            <div className='p-4'>
              <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
              <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
              <div className='mt-2 flex items-center gap-1 text-sm'>
                <input  type="checkbox" checked={item.available} readOnly/>
                <p>Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList