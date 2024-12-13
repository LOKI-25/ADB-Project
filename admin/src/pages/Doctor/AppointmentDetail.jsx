import React, { useState, useContext,useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AppointmentDetails = () => {
  const { id } = useParams(); // Get the appointment ID from the URL
  const { appointments,dToken } = useContext(DoctorContext);
  const { slotDateFormat, calculateAge,backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  // Find the appointment based on ID
  const appointment = appointments.find((item) => item._id === id);
  const formatNote = (note) => {
    if (!note) return [];
    return note.split('\n').map((line) => line.trim()).filter(Boolean); // Split by line, trim extra spaces, and remove empty lines
  };

  const formattedNote = formatNote(appointment.note);
  

  const [pharmacyStore, setPharmacyStore] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [medicines, setMedicines] = useState([]);

  const [newMedicine, setNewMedicine] = useState('');

  const addMedicine = () => {
    if (newMedicine) {
      setMedicines([...medicines, newMedicine]);
      setNewMedicine('');
    }
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const getPrescription = async (prescriptionId) => {
    try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/get-prescription/${prescriptionId}`, { headers: { dToken } });
        console.log("Prescription data",data)
        if (data.success) {
            const { pharmacyStore, startDate, endDate, medicines } = data.prescription;
            setPharmacyStore(pharmacyStore);
            setStartDate(startDate);
            setEndDate(endDate);
            setMedicines(medicines);
        }
    } catch (error) {
      console.log(error);
        toast.error('Failed to get prescription');
    }
    };

    useEffect(() => {
      console.log("In use effect",appointment)
        if (appointment?.prescriptionId) {
            getPrescription(appointment?.prescriptionId);
        }

    }, [appointment]);




  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!pharmacyStore || !startDate || !endDate || medicines.length === 0) {
      return toast.error('All fields are required.');
    }

    const updatedData = {
      pharmacyStore,
      startDate,
      endDate,
      medicines,
    };

    try {
        // Call the API to update the appointment

        const { data } = await axios.post(`${backendUrl}/api/doctor/update-prescription`, { appointmentId: id, updatedData }, { headers: { dToken } });
        if (data.success) {
      toast.success('Appointment updated successfully');
      navigate('/doctor-appointments'); // Navigate back to the appointment list
    } 
}
    catch (error) {
      console.log(error);
      toast.error('Failed to update appointment');
    }

  };

  if (!appointment) {
    return <p>Appointment not found.</p>;
  }

  return (
    <div className="p-5">
      <h2 className="text-xl font-medium mb-4">Appointment Details</h2>

      <div className="bg-white p-4 rounded shadow mb-4">
        <p><strong>Patient Name:</strong> {appointment.patientData.firstname}</p>
        <p><strong>Age:</strong> {calculateAge(appointment.patientData.dob)}</p>
        <p><strong>Date & Time:</strong> {slotDateFormat(appointment.slotDate)}, {appointment.slotTime}</p>
        <p><strong>Fees:</strong> {appointment.amount}</p>
      <h3 className="text-lg font-medium mb-2">Operator Note:</h3>
      <ul className="list-disc pl-5">
        {formattedNote.map((line, index) => (
          <li className='' key={index}>{line}</li>
        ))}
      </ul>
      </div>

      <form onSubmit={onSubmitHandler} className="bg-white p-4 rounded shadow">
        <div className="mb-3">
          <label className="block font-medium">Pharmacy Store</label>
          <input
            type="text"
            value={pharmacyStore}
            onChange={(e) => setPharmacyStore(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>

        <div className="flex gap-4 mb-3">
          <div className="flex-1">
            <label className="block font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block font-medium">Medicines</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMedicine}
              onChange={(e) => setNewMedicine(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
              placeholder="Enter medicine name"
            />
            <button type="button" onClick={addMedicine} className="bg-primary text-white px-4 py-2 rounded">Add</button>
          </div>
          <ul className="mt-2">
            {medicines.map((med, index) => (
              <li key={index} className="flex justify-between items-center border-b py-1">
                <span>{med}</span>
                <button type="button" onClick={() => removeMedicine(index)} className="text-red-500">Remove</button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="bg-primary text-white px-6 py-2 rounded">
          Save Details
        </button>
      </form>
    </div>
  );
};

export default AppointmentDetails;
