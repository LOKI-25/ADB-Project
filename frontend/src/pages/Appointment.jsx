import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'
import BookAppointmentModal from '../components/BookAppointmentModal'

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const {patientData} = useContext(AppContext)
    console.log("Intial Patent Data",patientData);

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = await doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }
   
    const getAvailableSolts = async () => {
        setDocSlots([]); // Reset slots
    
        if (!docInfo || !docInfo.timeSlotId || !docInfo.timeSlotId.availableDays) return;
    
        console.log("in slots func", docInfo);
    
        const today = new Date();
        const availableDays = docInfo.timeSlotId.availableDays; // From doctor's profile
        console.log("Available days", availableDays);
    
        // Calculate the date of the upcoming Sunday
        const currentDayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const daysUntilSunday = 7 - currentDayOfWeek;
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + daysUntilSunday);
    
        for (let i = 0; i <= daysUntilSunday; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
    
            const dayOfWeek = currentDate.toLocaleString('en-US', { weekday: 'long' });
            console.log("Day of week", dayOfWeek);
    
            // Check if the doctor is available on this day
            const dayAvailability = availableDays.find((d) => d.day === dayOfWeek);
            if (!dayAvailability) continue;
    
            const { startTime, endTime } = dayAvailability;
    
            // Convert start and end times to Date objects
            const startDateTime = new Date(currentDate);
            const [startHour, startMinute] = startTime.split(':').map(Number);
            startDateTime.setHours(startHour, startMinute, 0, 0);
    
            const endDateTime = new Date(currentDate);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            endDateTime.setHours(endHour, endMinute, 0, 0);
    
            let timeSlots = [];
            let currentTime = new Date(startDateTime);
    
            while (currentTime < endDateTime) {
                if (currentTime > today) { // Ensure slot is in the future
                    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
                    const day = currentDate.getDate();
                    const month = currentDate.getMonth();
                    const year = currentDate.getFullYear();
    
                    const slotDate = `${day}_${month}_${year}`;
                    const slotTime = formattedTime;
    
                    const isSlotAvailable =
                        !docInfo.slots_booked[slotDate] ||
                        !docInfo.slots_booked[slotDate].includes(slotTime);
    
                    if (isSlotAvailable) {
                        timeSlots.push({
                            datetime: new Date(currentTime),
                            time: formattedTime,
                        });
                    }
                }
    
                // Increment time by 30 minutes
                currentTime.setMinutes(currentTime.getMinutes() + 30);
            }

            // remove lunch time i.e 12 pm to 1 pm if present
            timeSlots = timeSlots.filter((slot) => {
                const slotHour = slot.datetime.getHours();
                return slotHour !== 12;
            });
            
    
            if (timeSlots.length > 0) {
                setDocSlots((prev) => [...prev, timeSlots]);
            }
        }
    };
    
    
    
    
    
    const bookAppointment = async (bookingDetails) => {
        console.log("boking appointment called")

        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        if (!slotTime) {
            toast.warning('Select a slot to book appointment')
            return
        }
        var payment = null 
        if(patientData.insuranceId!=bookingDetails.insuranceId || patientData.cardDetails!=bookingDetails.cardDetails){
                const { data } = await axios.post(
                    backendUrl + "/api/user/create-payment",
                    { insuranceId: bookingDetails.insuranceId 
                         , cardDetails: bookingDetails.cardDetails,
                         providerName: bookingDetails.providerName},
                    { headers: { token } }
                  );
                  if (data.success) {
                  payment = data
                  console.log(payment)
                  toast.success("Payment details updated successfully");
                  }
                    else{
                        toast.error("Failed to update payment details")
                    }
        }

        const date = docSlots[slotIndex][0].datetime

        const reason = bookingDetails.reason
        const paymentMethod = bookingDetails.paymentMethod


        let day = date.getDate()
        let month = date.getMonth()
        console.log("month",month)
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year 
        const userId = patientData._id
        

        try {

            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, payment, slotTime,reason,paymentMethod }, { headers: { token } })
           console.log("booking appointmenrt",data)
            if (data.success) {
                console.log("booking appointmenrt success")
                toast.success(data.message)
                getDoctosData()

                navigate('/my-appointments')
            } else {
                toast.error(data.message)
            }
            setIsModalOpen(false);


        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }
    

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo();
            setIsModalOpen(false);
        }
    }, [doctors, docId]);
    
    useEffect(() => {
        // Only proceed if docInfo is truthy and has required data
        if (docInfo && Object.keys(docInfo).length > 0) {
            console.log("Fetching available slots for:", docInfo.firstname);
            getAvailableSolts();
        } else {
            console.log("Waiting for docInfo...");
        }
    }, [docInfo]);
    

    

    return docInfo ? (
        <div>

            {/* ---------- Doctor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    {/* ----- Doc Info : firstname, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.firstname} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
            </div>

            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <p >Booking slots</p>
                
                    {docSlots.length >0 && <>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots.map((item, index) => (
                        <>
                        { item[0] &&
                        <div onClick={() => setSlotIndex(index)} key={index} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}>
                            <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                            <p>{item[0] && item[0].datetime.getDate()}</p>
                        </div>}</>
                    ))}
                </div>

                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots[slotIndex].map((item, index) => (
                        <p onClick={() => setSlotTime(item.time)} key={index} className={`text-sm font-light  flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}>{item.time.toLowerCase()}</p>
                    ))}
                </div>

                <button onClick={()=>setIsModalOpen(true)} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>Book an appointment</button>
                </>}
                
                {docSlots.length <1 &&<button className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>All appointments are booked</button>}


            </div>
            {isModalOpen && (
                <BookAppointmentModal
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={bookAppointment}
                    patientData={patientData}
                />
            )}

            {/* Listing Releated Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

export default Appointment