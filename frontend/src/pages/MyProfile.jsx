import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(true);

  const [image, setImage] = useState(false);

  const {
    token,
    backendUrl,
    patientData,
    setpatientData,
    loadUserProfileData,
  } = useContext(AppContext);

  // Function to update user profile data using API
  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();

      if (
        !patientData.name ||
        !patientData.phone ||
        !patientData.address.line1 ||
        !patientData.gender ||
        !patientData.dob ||
        patientData.dob == "Not Selected"
      ) {
        return toast.error("All fields are required");
      }

      formData.append("name", patientData.name);
      formData.append("phone", patientData.phone);
      formData.append("address", JSON.stringify(patientData.address));
      formData.append("gender", patientData.gender);
      formData.append("dob", patientData.dob);
      formData.append("cardDetails", JSON.stringify(patientData.cardDetails));
      formData.append("insuranceId", patientData.insuranceId);

      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (patientData) {
      // check if all fields are there or not

      if (
        patientData.image &&
        patientData.name &&
        patientData.gender &&
        patientData.address.line1 &&
        patientData.dob &&
        patientData.name &&
        patientData.email
      ) {
        setIsEdit(false);
      }
    }
  }, []);

  return patientData ? (
    <div className="max-w-lg flex flex-col gap-2 text-sm pt-5">
      {isEdit ? (
        <label htmlFor="image">
          <div className="inline-block relative cursor-pointer">
            <img
              className="w-36 rounded opacity-75"
              src={image ? URL.createObjectURL(image) : patientData.image}
              alt=""
            />
            <img
              className="w-10 absolute bottom-12 right-12"
              src={image ? "" : assets.upload_icon}
              alt=""
            />
          </div>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
          />
        </label>
      ) : (
        <img className="w-36 rounded" src={patientData.image} alt="" />
      )}

      {isEdit ? (
        <input
          className="bg-gray-50 text-3xl font-medium max-w-60"
          type="text"
          onChange={(e) =>
            setpatientData((prev) => ({ ...prev, name: e.target.value }))
          }
          value={patientData.name}
        />
      ) : (
        <p className="font-medium text-3xl text-[#262626] mt-4">
          {patientData.name}
        </p>
      )}

      <hr className="bg-[#ADADAD] h-[1px] border-none" />

      <div>
        <p className="text-gray-600 underline mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]">
          <p className="font-medium">Email id:</p>
          <p className="text-blue-500">{patientData.email}</p>
          <p className="font-medium">Phone:</p>

          {isEdit ? (
            <input
              className="bg-gray-50 max-w-52"
              type="number"
              required
              onChange={(e) =>
                setpatientData((prev) => ({ ...prev, phone: e.target.value }))
              }
              value={patientData.phone}
            />
          ) : (
            <p className="text-blue-500">{patientData.phone}</p>
          )}

          <p className="font-medium">Address:</p>

          {isEdit ? (
            <p>
              <input
                className="bg-gray-50"
                type="text"
                required
                onChange={(e) =>
                  setpatientData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
                value={patientData.address.line1}
              />
              <br />
              <input
                className="bg-gray-50"
                type="text"
                onChange={(e) =>
                  setpatientData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
                value={patientData.address.line2}
              />
            </p>
          ) : (
            <p className="text-gray-500">
              {patientData.address.line1} <br /> {patientData.address.line2}
            </p>
          )}
        </div>
      </div>
      <div>
        <p className="text-[#797979] underline mt-3">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600">
          <p className="font-medium">Gender:</p>

          {isEdit ? (
            <select
              className="max-w-20 bg-gray-50"
              onChange={(e) =>
                setpatientData((prev) => ({ ...prev, gender: e.target.value }))
              }
              required
              value={patientData.gender}
            >
              <option value="Not Selected">Do not want to be specified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-500">{patientData.gender}</p>
          )}

          <p className="font-medium">Birthday:</p>

          {isEdit ? (
            <input
              className="max-w-28 bg-gray-50"
              type="date"
              required
              onChange={(e) =>
                setpatientData((prev) => ({ ...prev, dob: e.target.value }))
              }
              value={patientData.dob}
            />
          ) : (
            <p className="text-gray-500">{patientData.dob}</p>
          )}

          <p className="font-medium">Card Details</p>

          {isEdit ? (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Card Number
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  required
                  onChange={(e) =>
                    setpatientData((prev) => ({
                      ...prev,
                      cardDetails: {
                        ...prev.cardDetails,
                        number: e.target.value,
                      },
                    }))
                  }
                  value={patientData.cardDetails?.number || ""}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Expiry Date (MM/YYYY)
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  required
                  onChange={(e) =>
                    setpatientData((prev) => ({
                      ...prev,
                      cardDetails: {
                        ...prev.cardDetails,
                        expiryDate: e.target.value,
                      },
                    }))
                  }
                  value={patientData.cardDetails?.expiryDate || ""}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Insurance ID
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  required
                  onChange={(e) =>
                    setpatientData((prev) => ({
                      ...prev,
                      insuranceId: e.target.value,
                    }))
                  }
                  value={patientData.insuranceId || ""}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700 font-medium mb-2">Card Number:</p>
              <p className="text-gray-500 mb-4">
                {patientData.cardDetails?.number || "N/A"}
              </p>

              <p className="text-gray-700 font-medium mb-2">Expiry Date:</p>
              <p className="text-gray-500 mb-4">
                {patientData.cardDetails?.expiryDate || "N/A"}
              </p>

              <p className="text-gray-700 font-medium mb-2">Insurance ID:</p>
              <p className="text-gray-500">
                {patientData.insuranceId || "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>
      {isEdit && (
        <div className="mt-10">
          <button
            onClick={updateUserProfileData}
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
          >
            Save information
          </button>
          <p className="text-sm text-gray-600 mt-4">
            <span className="text-red-600 font-bold">*Note:</span> After
            submitting, the user cannot modify any of the above data. Only the
            operator of the hospital can modify it.
          </p>
        </div>
      )}
    </div>
  ) : null;
};

export default MyProfile;
