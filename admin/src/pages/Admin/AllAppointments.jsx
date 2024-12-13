import React, { useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AllAppointments = () => {
  const { atoken, appointments, cancelAppointment, getAllAppointments, checkInAppointment } = useContext(AdminContext);
  const { slotDateFormat, currency, backendUrl } = useContext(AppContext);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [snote, setNote] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [bodyTemperature, setBodyTemperature] = useState('');
const [bloodPressure, setBloodPressure] = useState('');
const [weight, setWeight] = useState('');
const [height, setHeight] = useState('');


  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('_').map(Number);
    return new Date(year, month , day); // Fix: Months are 0-based in JS.
  };

  useEffect(() => {
    if (atoken) {
      getAllAppointments();
    }
  }, [atoken]);

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = appointments.filter((item) => {
        const appointmentDate = parseDate(item.slotDate).getTime();
        return (
          appointmentDate >= new Date(startDate).getTime() &&
          appointmentDate <= new Date(endDate).getTime()
        );
      });
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [startDate, endDate, appointments]);

  const handleCheckIn = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    if (selectedAppointment) {
      const combinedNote = `
      Note: ${snote || "N/A"}
      Body Temperature: ${bodyTemperature || "N/A"}
      Blood Pressure: ${bloodPressure || "N/A"}
      Weight: ${weight || "N/A"}
      Height: ${height || "N/A"}
    `;
      // Call the checkInAppointment function with the note
      checkInAppointment(selectedAppointment._id,combinedNote);
      console.log(`Checked in with note: ${combinedNote}`);
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/update-appointment`,
          {
            appointmentId: selectedAppointment._id,
            note:combinedNote,
          },
          { headers: { atoken } }
        );
        if (data.success) {
          setShowModal(false);
          setNote('');
          setSelectedAppointment(null);
          // toast.success('Checked-in successfully');
        } else {
          toast.error('Failed to check-in');
        }
        console.log(data);
      } catch (err) {
        console.log(err);
        toast.error('An error occurred while checking in');
      }
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    console.log(newSlotDate, newSlotTime);
    let dat = new Date(newSlotDate);
    let day = dat.getDate();
    let month = dat.getMonth() ;
    let year = dat.getFullYear();
    let date_new = `${day}_${month}_${year}`;
    console.log("new date",date_new); 
    
    if (selectedAppointment && newSlotDate && newSlotTime) {

      try {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/update-appointment`,
          {
            appointmentId: selectedAppointment._id,
            docId: selectedAppointment.docId,
            slotDate: date_new,
            slotTime: newSlotTime,
          },
          { headers: { atoken } }
        );
        console.log(data);
        if (data.success) {
          setRescheduleModal(false);
          setNewSlotDate('');
          setNewSlotTime('');
          setSelectedAppointment(null);
          toast.success('Appointment rescheduled successfully');
          getAllAppointments();
        } else {
          toast.error('Failed to reschedule');
        }
      } catch (err) {
        console.log(err);
        toast.error('An error occurred while rescheduling');
      }
    } else {
      toast.error('Please select a valid date and time');
    }
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      {/* Date Range Filter */}
      <div className="mb-3 flex items-center gap-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium mb-1">
            Start Date:
          </label>
          <input
            type="date"
            id="start-date"
            className="border rounded px-2 py-1 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium mb-1">
            End Date:
          </label>
          <input
            type="date"
            id="end-date"
            className="border rounded px-2 py-1 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          className="ml-2 px-3 py-1 bg-gray-200 rounded text-sm"
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
        >
          Clear Filter
        </button>
      </div>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
  {/* Table Header */}
  <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
    <p>#</p>
    <p>Patient</p>
    <p>Date & Time</p>
    <p>Doctor</p>
    <p>Fees</p>
    <p>Action</p>
  </div>

  {/* Table Rows */}
  {filteredAppointments.map((item, index) => (
    <div
      key={index}
      className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_2fr_2fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
    >
      {/* Appointment # */}
      <p className="max-sm:hidden">{index + 1}</p>

      {/* Patient */}
      <div className="flex items-center gap-2">
        <img
          src={item.patientData?.image}
          className="w-8 rounded-full"
          alt="Patient"
        />
        <p>{item.patientData.firstname}</p>
      </div>

      {/* Date & Time */}
      <p>
        {slotDateFormat(item.slotDate)}, {item.slotTime}
      </p>

      {/* Doctor */}
      <div className="flex items-center gap-2">
        <img
          src={item.docData.image}
          className="w-8 rounded-full bg-gray-200"
          alt="Doctor"
        />
        <p>{item.docData.firstname}</p>
      </div>

      {/* Fees */}
      <p>
        {currency}
        {item.amount}
      </p>

      {/* Status / Actions */}
      <div className="flex items-center gap-2">
        {item.cancelled ? (
          <p className="text-red-400 text-xs font-medium">Cancelled</p>
        ) : item.isCompleted ? (
          <p className="text-green-500 text-xs font-medium">Completed</p>
        ) : (
          <>
            {/* Reschedule Button */}
            {item.isCompleted === null && (
            <p
              className="text-orange-500 text-xs font-medium cursor-pointer"
              onClick={() => handleReschedule(item)}
            >
              Reschedule
            </p>)}

            {/* Cancel Icon */}
            { item.isCompleted === null && (
            <img
              onClick={() => cancelAppointment(item._id)}
              className="w-6 cursor-pointer"
              src={assets.cancel_icon}
              alt="Cancel"
            />)}

            {/* Check-in Button */}
            {item.isCompleted === null ? (
              <button
                className="text-blue-500 text-xs border border-blue-100 px-2 w-full font-medium cursor-pointer"
                onClick={() => handleCheckIn(item)}
              >
                Check-in
              </button>
            ) : (
              <button className="text-green-500 text-xs font-medium">Checked-in</button>
            )}
          </>
        )}
      </div>
    </div>
  ))}
</div>


       

      {/* Modal for Check-in */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white flex-col rounded p-4 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add a Note for Check-in</h3>
            <textarea
              className="w-full border rounded p-2 mb-4 text-sm"
              rows="4"
              value={snote}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your note here..."
            ></textarea>
            <label>Body Temperature: </label>
<input
  type="text"
  className="border border-blue-50"
  placeholder="In F"
  value={bodyTemperature}
  onChange={(e) => setBodyTemperature(e.target.value)}
/>
<br />
<label>Blood Pressure: </label>
<input
  type="text"
  className="border border-blue-500"
  placeholder=""
  value={bloodPressure}
  onChange={(e) => setBloodPressure(e.target.value)}
/>
<br />
<label>Weight: </label>
<input
  type="text"
  className="border border-blue-50"
  placeholder="In Lb"
  value={weight}
  onChange={(e) => setWeight(e.target.value)}
/>
<br />
<label>Height: </label>
<input
  type="text"
  className="border border-blue-50"
  placeholder="In ft"
  value={height}
  onChange={(e) => setHeight(e.target.value)}
/>
<br />

            

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded text-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                onClick={handleModalSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Rescheduling */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded p-4 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Reschedule Appointment</h3>
            <label htmlFor="new-date" className="block text-sm font-medium mb-1">
              New Date:
            </label>
            <input
              type="date"
              id="new-date"
              className="border rounded px-2 py-1 text-sm mb-2"
              value={newSlotDate}
              onChange={(e) => setNewSlotDate(e.target.value)}
            />
            <label htmlFor="new-time" className="block text-sm font-medium mb-1">
              New Time:
            </label>
            <input
              type="time"
              id="new-time"
              className="border rounded px-2 py-1 text-sm mb-4"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded text-sm"
                onClick={() => setRescheduleModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                onClick={handleRescheduleSubmit}
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
