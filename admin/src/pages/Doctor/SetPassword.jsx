import React, { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import { useNavigate,useLocation } from "react-router-dom";

const SetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { dToken,setDToken, profileData } = useContext(DoctorContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { docId } = location.state || {};


  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
        console.log("DOCDATA",docId)
      const response = await axios.post(backendUrl + '/api/doctor/set-password', {
        docId:docId,
        newPassword,
      });

      if (response.data.success) {
        console.log("password set")
        toast("Password set successfully! Please log in again.");
        navigate('/login')
        dToken && setDToken('')
        dToken && localStorage.removeItem('dToken')
        

      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
        console.log(error)
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Set Your Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <button type="submit">Set Password</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SetPassword;
