import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const AddOperator = () => {

    const [name, setName] = useState('Operator')
    const [email, setEmail] = useState('op1@gmail.com')
    const [password, setPassword] = useState('operator123')
    const [confirmPassword, setConfirmPassword] = useState('operator123')
    const [address1, setAddress1] = useState('123 street')
    const [address2, setAddress2] = useState('Usa')
    const [isAdmin,setIsAdmin] = useState(false)
    const navigate = useNavigate();

    const { backendUrl } = useContext(AppContext)
    const { atoken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            const opdata = {
                name,
                email,
                password,
                address: JSON.stringify({ line1: address1, line2: address2 }),
                roleofop: isAdmin?'admin':"operator"
            }
            if (password !== confirmPassword) {
                return toast.error('Passwords do not match')
            }

            const { data } = await axios.post(backendUrl + '/api/admin/add-operator', opdata, { headers: { atoken } })
            if (data.success) {
                toast.success(data.message)
                navigate('/operators-list')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>

            <p className='mb-3 text-lg font-medium'>Add Operator</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
            

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Name</p>
                            <input onChange={e => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Operator Email</p>
                            <input onChange={e => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
                        </div>


                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Set Password</p>
                            <input onChange={e => setPassword(e.target.value)} value={password} autoComplete='new-password' className='border rounded px-3 py-2' type="password" placeholder='Password' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Confirm Password</p>
                            <input onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} className='border rounded px-3 py-2' type="password" placeholder='Confirm Password' required />
                        </div>
                        {/* <div className='flex-1 flex flex-col gap-1'>
                            <p>Is admin</p>
                            <input onChange={e => setIsAdmin(!isAdmin)} value={isAdmin} className='border rounded px-3 py-2' type="checkbox"  />
                        </div> */}

                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address</p>
                            <input onChange={e => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='Address 1' required />
                            <input onChange={e => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='Address 2' required />
                        </div>

                    </div>

                </div>

                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Add operator</button>

            </div>


        </form>
    )
}

export default AddOperator