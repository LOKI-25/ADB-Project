import  { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import {jwtDecode} from 'jwt-decode'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'



const UpdateDoctorProfile = () => {

    const [profileData, setProfileData] = useState(null)
    const { docId } = useParams()
    const { backendUrl, currency } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [atoken, setAToken] = useState(localStorage.getItem('atoken') ? localStorage.getItem('atoken') : '')
    // const { atoken } = useContext(AdminContext)
  const [role, setRole] = useState('')

  useEffect(() => {
    if (atoken) {
      try {
        const token_decode = jwtDecode(atoken)
        setRole(token_decode.role)
      } catch (err) {
        console.error("Token verification error:", err)
      }
    }
  }, [atoken])

    const getProfileData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/doctor-profile/${docId}`,{headers:{atoken:atoken}})
            if (data.success) {
                setProfileData(data.profileData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const updateProfile = async () => {
        try {
            const updateData = {
                docId: docId,
                firstname: profileData.firstname,
                lastname: profileData.lastname,
                city: profileData.city,
                state: profileData.state,
                zip: profileData.zip,
                phone: profileData.phone,
                address: profileData.address,
                fees: profileData.fees,
                about: profileData.about,
                available: profileData.available

            }

            const { data } = await axios.post(`${backendUrl}/api/admin/update-doctor-profile`, updateData, { headers: { atoken } })

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getProfileData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    useEffect(() => {
        if (docId) {
            getProfileData()
        }
    }, [docId])

    return profileData && (
        <div>
            <div className='flex flex-col gap-4 m-5'>
                <div>
                    <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="" />
                </div>

                <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
                <div>
  <div className="flex items-center gap-2 text-3xl font-medium text-gray-700">{profileData.firstname} {profileData.lastname}
    {/* {isEdit ? (
      <input
        type="text"
        className="w-full outline-primary p-2 text-xl border border-gray-300 rounded"
        onChange={(e) =>
          setProfileData((prev) => ({ ...prev, firstname: e.target.value }))
        }
        value={profileData.firstname}
      />
    ) :
     (
        `${profileData.firstname} ${profileData.lastname}`
    )} */}
  </div>
</div>

                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{profileData.degree} - {profileData.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
                    </div>

                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About :</p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>
                            {
                                isEdit
                                    ? <textarea onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))} type='text' className='w-full outline-primary p-2' rows={8} value={profileData.about} />
                                    : profileData.about
                            }
                        </p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>
                        Appointment fee: <span className='text-gray-800'>{currency} {isEdit ? <input type='number' onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} value={profileData.fees} /> : profileData.fees}</span>
                    </p>

                    <div className='flex gap-2 py-2'>
                        <p>Address:</p>
                        <p className='text-sm'>
                            {isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={profileData.address.line1} /> : profileData.address.line1}
                            <br />
                            {isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={profileData.address.line2} /> : profileData.address.line2}
                        </p>
                    </div>
                    <div className='flex gap-2 py-2'>
                        <p>City:</p>
                        <p>{isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev, city:  e.target.value }))} value={profileData.city} /> : profileData.city}</p>
                    </div>
                    <div className='flex gap-2 py-2'>
                        <p>State:</p>
                        <p>{isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev,  state: e.target.value }))} value={profileData.state} /> : profileData.state}</p>
                    </div>
                    <div className='flex gap-2 py-2'>
                        <p>Zip:</p>
                        <p>{isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev,  zip: e.target.value  }))} value={profileData.zip} /> : profileData.zip}</p>
                    </div>
                    <div className='flex gap-2 py-2'>
                        <p>Phone:</p>
                        <p>{isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))} value={profileData.phone} /> : profileData.phone}</p>
                    </div>

                    {/* <div className='flex gap-1 pt-2'>
                        <input type="checkbox" onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} checked={profileData.available} />
                        <label htmlFor="">Available</label>
                    </div> */}

                    {
                        isEdit
                            ? <button onClick={updateProfile} className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>Save</button>
                            : <button onClick={() => setIsEdit(prev => !prev)} className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>Edit</button>
                    }
                </div>
            </div>
        </div>
    )
}

export default UpdateDoctorProfile
