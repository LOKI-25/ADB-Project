import React, { useContext,useState,useEffect } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode'


const Navbar = () => {

  const { dToken, setDToken } = useContext(DoctorContext)
  const { atoken, setAToken } = useContext(AdminContext)
  const [role, setRole] = useState('')

  useEffect(() => {
    if (atoken) {
      try {
        const token_decode = jwtDecode(atoken)
        setRole(token_decode.role)
        console.log(token_decode.role)
      } catch (err) {
        console.error("Token verification error:", err)
      }
    }
  }, [atoken])

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    atoken && setAToken('')
    atoken && localStorage.removeItem('atoken')
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{atoken ? role : 'Doctor'}</p>
      </div>
      <button onClick={() => logout()} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Logout</button>
    </div>
  )
}

export default Navbar