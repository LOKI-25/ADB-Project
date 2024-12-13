import React from 'react'
import { useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const navigate = useNavigate();



  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-6xl m-5 '>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.map((item, index) => (
          <div  key={index}
          onClick={() => navigate(`/appointment/${item._id}`)}
          className='cursor-pointer  flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'>
            <p className='max-sm:hidden'>{index+1}</p>
            <div className='flex items-center gap-2'>
              <img src={item.patientData.image} className='w-8 rounded-full' alt="" /> <p>{item.patientData.firstname}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.paymentMethod?'Online':'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.patientData.dob)? calculateAge(item.patientData.dob) : 0 }</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>
            {item.isCompleted === false && <button className="text-green-500 text-xs font-medium">Checked-in</button>}
            {item.isCompleted === true && <button className="text-green-500 text-xs font-medium">Completed</button>}
            {item.cancelled === true ? <button className="text-red-500 text-xs font-medium">Cancelled</button> : item.isCompleted=== null ? <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" /> : null}
            
          </div>
        ))}
      </div>

    </div>
  )
}

export default DoctorAppointments