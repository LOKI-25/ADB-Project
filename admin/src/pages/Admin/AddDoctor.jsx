import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const AddDoctor = () => {
  const [formState, setFormState] = useState({
    docImg: null,
    firstname: "Alex",
    lastname: "carry",
    city: "New York",
    state: "MO",
    zip: "324543",
    phone: "1234567890",
    email: "doc4@gmail.com",
    password: "doctor123",
    confirmPassword: "doctor123",
    experience: "1 Year",
    fees: "50",
    about:
      "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    speciality: "General physician",
    degree: "MBBS",
    address1: "123 Main Street",
    address2: "USA",
    availableDays: [],
  });

  const { docImg, firstname,lastname,zip,city,state,phone, email, password, confirmPassword, experience, fees, about, speciality, degree, address1, address2, availableDays } =
    formState;

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const { backendUrl } = useContext(AppContext);
  const { atoken } = useContext(AdminContext);
  const navigate = useNavigate();

  // Handle Input Change
  const handleChange = (field, value) => {
    setFormState({ ...formState, [field]: value });
  };

  // Handle Day Selection
  const handleDaySelection = (day) => {
    const updatedDays = availableDays.some((d) => d.day === day)
      ? availableDays.filter((d) => d.day !== day)
      : [...availableDays, { day, startTime: "", endTime: "" }];
    handleChange("availableDays", updatedDays);
  };

  // Update Start and End Time for a Specific Day
  const updateDaySchedule = (day, field, value) => {
    const updatedDays = availableDays.map((d) =>
      d.day === day ? { ...d, [field]: value } : d
    );
    handleChange("availableDays", updatedDays);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (!docImg) return toast.error("Image Not Selected");
      if (password !== confirmPassword) return toast.error("Passwords do not match");
      if (availableDays.length === 0) {
        return toast.error("Please select available days with start and end times.");
      }
      
      availableDays.forEach((dayObj) => {
        if (!dayObj.day || !dayObj.startTime || !dayObj.endTime) {
          return toast.error("Please provide all details (day, start time, end time) for available days.");
        }
      });

      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("firstname", firstname);
      formData.append("lastname", lastname);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("zip", zip);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );
    availableDays.forEach((day, index) => {
      formData.append(`availableDays[${index}]`, JSON.stringify(day));
    });
      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-doctor`,
        formData,
        { headers: { atoken } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/doctor-list");
      } else {
        console.log(data)
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>
      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl">
        {/* Upload Section */}
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Doctor"
            />
          </label>
          <input
            onChange={(e) => handleChange("docImg", e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          <p>Upload doctor picture</p>
        </div>

        {/* Doctor Info */}
       
        <div className="flex flex-col lg:flex-row gap-10 text-gray-600">
          <div className="lg:flex-1">
            <InputField
              label="First Name"
              value={firstname}
              onChange={(e) => handleChange("firstname", e.target.value)}
              required
            />
            <InputField
              label="Last Name"
              value={lastname}
              onChange={(e) => handleChange("lastname", e.target.value)}
              required
            />
            <InputField label="City" value={city} onChange={(e) => handleChange("city", e.target.value)} required />
            <InputField label="State" value={state} onChange={(e) => handleChange("state", e.target.value)} required />
            <InputField label="Zip" value={zip} onChange={(e) => handleChange("zip", e.target.value)} required />
            <InputField label="Phone" value={phone} onChange={(e) => handleChange("phone", e.target.value)} required />

            <InputField
              label="Doctor Email"
              value={email}
              type="email"
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
            <InputField
              label="Set Password"
              value={password}
              type="password"
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
            <InputField
              label="Confirm Password"
              value={confirmPassword}
              type="password"
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              required
            />
            
          </div>
          <div className="lg:flex-1">
          {/* address1 */}
          <InputField
              label="Address Line 1"
              value={address1}
              onChange={(e) => handleChange("address1", e.target.value)}
              required
            />
            {/* address2 */}
            <InputField
              label="Address Line 2"
              value={address2}
              onChange={(e) => handleChange("address2", e.target.value)}
              required
            />
            <SelectField
              label="Experience"
              value={experience}
              options={[
                "1 Year",
                "2 Years",
                "3 Years",
                "4 Years",
                "5 Years",
                "10 Years",
              ]}
              onChange={(e) => handleChange("experience", e.target.value)}
            />
            <InputField
              label="Fees"
              value={fees}
              type="number"
              onChange={(e) => handleChange("fees", e.target.value)}
              required
            />
            
            <InputField
              label="Degree"
              value={degree}
              onChange={(e) => handleChange("degree", e.target.value)}
              required
            />
            
            <SelectField
              label="speciality"
              value={speciality}
              options={[
                "General physician",
                "Gynecologist",
                "Dermatologist",
                "Pediatricians",
                "Nuerologist",
                "Gastroenterologist",
              ]}
              onChange={(e) => handleChange("speciality", e.target.value)}
            />
            <div className="mt-6">
          <p>Available Days</p>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
            (day) => (
              <div key={day}>
                <label>
                  <input
                    type="checkbox"
                    checked={availableDays.some((d) => d.day === day)}
                    onChange={() => handleDaySelection(day)}
                  />
                  {day}
                </label>
                {availableDays.some((d) => d.day === day) && (
                  <div className="flex gap-2 ml-4">
                    <input
                      type="time"
                      placeholder="Start Time"
                      onChange={(e) =>
                        updateDaySchedule(day, "startTime", e.target.value)
                      }
                    />
                    <input
                      type="time"
                      placeholder="End Time"
                      onChange={(e) =>
                        updateDaySchedule(day, "endTime", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            )
          )}
        </div>
          </div>
        </div>

        {/* Available Days */}
        

        {/* About Section */}
        <TextAreaField
          label="About Doctor"
          value={about}
          onChange={(e) => handleChange("about", e.target.value)}
        />

        {/* Submit */}
        <button
          type="submit"
          className="bg-primary text-white rounded-full px-6 py-2 mt-6"
        >
          Add Doctor
        </button>
      </div>
    </form>
  );
};

// Reusable InputField Component
const InputField = ({ label, type = "text", value, onChange, required }) => (
  <div className="flex flex-col gap-2">
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="border rounded px-3 py-2"
      required={required}
    />
  </div>
);

// Reusable SelectField Component
const SelectField = ({ label, value, options, onChange }) => (
  <div className="flex flex-col gap-2">
    <label>{label}</label>
    <select value={value} onChange={onChange} className="border rounded px-2 py-2">
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// Reusable TextAreaField Component
const TextAreaField = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label>{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      className="border rounded px-3 py-2"
    ></textarea>
  </div>
);

export default AddDoctor;
