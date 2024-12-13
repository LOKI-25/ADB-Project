import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "../components/PrescriptionModel" // Importing the reusable Modal component

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null); // State to hold prescription details
  const [isModalOpen, setIsModalOpen] = useState(true); // State to toggle modal

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      console.log("Appointments", data);
      setAppointments(data.appointments.reverse());
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const fetchPrescription = async (appointmentId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/get-prescription/${appointmentId}`,
        { headers: { token } }
      );

      if (data.success) {
        setSelectedPrescription(data.prescription); // Set prescription details
        setIsModalOpen(true); // Open modal
      } else {
        toast.error("Prescription not available.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch prescription.");
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 text-lg font-medium text-gray-600 border-b">My Appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b">
            <div>
              <img className="w-36 bg-[#EAEFFF]" src={item.docData.image} alt="" />
            </div>
            <div className="flex-1 text-sm text-[#5E5E5E]">
              <p className="text-[#262626] text-base font-semibold">{item.docData.firstname}</p>
              <p>{item.docData.speciality}</p>
              <p className="text-[#464646] font-medium mt-1">Address:</p>
              <p>{item.docData.address.line1}</p>
              <p>{item.docData.address.line2}</p>
              <p className="mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">Payment Method:</span> {item.paymentMethod}
              </p>
              <p className="mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">Provider Name:</span> {item.paymentMethod === "health-insurance" ? item.payment?.data?.providerName : "N/A"}
              </p>
              <p className="mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">Date & Time:</span> {slotDateFormat(item.slotDate)} |{" "}
                {item.slotTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end text-sm text-center">
              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">Completed</button>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel Appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">Appointment Cancelled</button>
              )}
              {!item.cancelled && item.prescriptionId && (
                <button
                  onClick={() => fetchPrescription(item.prescriptionId)}
                  className="sm:min-w-48 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300"
                >
                  View Prescription
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Prescription */}
      {isModalOpen && selectedPrescription && (
        <Modal selectedPrescription={selectedPrescription}  onClose={() => setIsModalOpen(false)}>
        </Modal>
      )}
    </div>
  );
};

export default MyAppointments;
