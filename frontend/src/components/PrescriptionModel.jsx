import React from "react";

const PrescriptionModel = ({ title, selectedPrescription, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative border border-gray-200">
        {/* Modal Title */}
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-600 border-b border-gray-200 pb-2">
          {title || "Prescription Details"}
        </h2>

        {/* Prescription Details */}
        {selectedPrescription ? (
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 font-medium">Pharmacy Store:</p>
              <p className="text-gray-800">{selectedPrescription.pharmacyStore}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Course Start Date:</p>
              <p className="text-gray-800">{selectedPrescription.startDate}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Course End Date:</p>
              <p className="text-gray-800">{selectedPrescription.endDate}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Medicines:</p>
              <ul className="list-disc ml-5 text-gray-800 space-y-1">
                {selectedPrescription.medicines.map((medicine, index) => (
                  <li key={index}>{medicine}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No prescription details available.</p>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white font-semibold hover:bg-blue-600 rounded-md transition duration-300"
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
