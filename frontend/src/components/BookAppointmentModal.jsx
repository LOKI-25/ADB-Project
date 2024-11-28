import React, { useState } from "react";
import { toast } from "react-toastify";

const BookAppointmentModal = ({ patientData, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [insuranceId, setInsuranceId] = useState(patientData.insuranceId || null);
    const [cardDetails, setCardDetails] = useState(
        patientData.cardDetails || { number: null, expiryDate: null }
    );

    const handleConfirm = () => {
        if (!reason || !paymentMethod) {
            toast("Please provide a reason and select a payment method.");
            return;
        }


        const bookingDetails = {
            reason,
            paymentMethod,
            insuranceId: insuranceId,
            cardDetails:  cardDetails ,
        };


        onConfirm(bookingDetails);

        // Reset state
        setReason('');
        setPaymentMethod('');
        setInsuranceId(patientData.insuranceId || '');
        setCardDetails(patientData.cardDetails || { number: '', expiryDate: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-96 p-6 rounded-lg shadow-md relative">
                <h2 className="text-lg font-bold mb-4">Book Appointment</h2>

                <label className="block text-gray-700 mb-2">Reason/Problem:</label>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    rows="3"
                    placeholder="Enter your reason or problem"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                ></textarea>

                <label className="block text-gray-700 mb-2">Payment Method:</label>
                <select
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <option value="" disabled>
                        Select Payment Method
                    </option>
                    <option value="health-insurance">Health Insurance</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                </select>

                {paymentMethod === "health-insurance" && (
                    <div>
                        <label className="block text-gray-700 mb-2">
                            {patientData.insuranceId ? "Update Insurance ID:" : "Enter Insurance ID:"}
                        </label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md mb-4"
                            placeholder="Insurance ID"
                            value={insuranceId}
                            onChange={(e) => setInsuranceId(e.target.value)}
                        />
                    </div>
                )}

                {paymentMethod === "card" && (
                    <div>
                        <label className="block text-gray-700 mb-2">
                            {patientData.cardDetails ? "Update Card Details:" : "Enter Card Details:"}
                        </label>
                        <div>
                            <label className="block text-gray-700 mb-1">Card Number:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                                placeholder="Card Number"
                                value={cardDetails.number}
                                onChange={(e) =>
                                    setCardDetails((prev) => ({
                                        ...prev,
                                        number: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Expiry Date (MM/YYYY):</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                                placeholder="MM/YYYY"
                                value={cardDetails.expiryDate}
                                onChange={(e) =>
                                    setCardDetails((prev) => ({
                                        ...prev,
                                        expiryDate: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-md mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookAppointmentModal;
