import React from "react";

const PrescriptionModel = ({ title, selectedPrescription, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-lg shadow-lg relative">
        {/* Modal Title */}
        <h2 className="text-lg font-bold mb-4 text-center">Prescription Details</h2>

        {/* Prescription Details */}
        {selectedPrescription ? (
          <div>
            <p className="mb-2">
              <strong>Pharmacy Store:</strong> {selectedPrescription.pharmacyStore}
            </p>
            <p className="mb-2">
              <strong>Start Date:</strong> {selectedPrescription.startDate}
            </p>
            <p className="mb-2">
              <strong>End Date:</strong> {selectedPrescription.endDate}
            </p>
            <p className="mb-2">
              <strong>Medicines:</strong>
            </p>
            <ul className="list-disc ml-5">
              {selectedPrescription.medicines.map((medicine, index) => (
                <li key={index} className="mb-1">
                  {medicine}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No prescription details available.</p>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-md transition duration-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModel;
