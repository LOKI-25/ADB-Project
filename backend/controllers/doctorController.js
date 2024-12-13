import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import prescriptionModel from "../models/prescriptionModel.js";
import timeSlotModel from "../models/timeSlotModel.js";

// API for doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await doctorModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token, profileData: user });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const setPassword = async (req, res) => {
  try {
    const { docId, newPassword } = req.body;
    console.log(docId, newPassword);

    // Find the doctor
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Check if the doctor is setting a password for the first time
    if (doctor.available) {
      return res.status(400).json({ success: false, message: "Password already set" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the doctor's password and set available to true
    doctor.password = hashedPassword;
    doctor.available = true;
    await doctor.save();

    res.json({ success: true, message: "Password set successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    console.log("DocId", docId);
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled" });
    }

    res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    }

    res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]).populate('timeSlotId');
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availablity Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password").populate('timeSlotId'); ;
    console.log("Doc", profileData);
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId,city,state,zip,phone,  fees, address, available,availableDays } = req.body;
    const docData = await doctorModel.findById(docId);

    if (available !== docData.available && available === false) {
      const today = new Date();
      const todayString = `${today.getDate()}_${today.getMonth()}_${today.getFullYear()}`;

      // Find and cancel all appointments for today
      const appointments = await appointmentModel.find({
        docId,
        slotDate: todayString,
        isCompleted: false,
        cancelled: false,
      });

      for (const appointment of appointments) {
        await appointmentModel.findByIdAndUpdate(appointment._id, { cancelled: true });
      }
    }


    if(availableDays && availableDays.length > 0){
    
    if(docData.timeSlotId){
      const timeSlotData = await timeSlotModel.findById(docData.timeSlotId);
      timeSlotData.availableDays = availableDays;
      await timeSlotData.save();
    }
    else{
      const newTimeSlot = new timeSlotModel({ availableDays });
      await newTimeSlot.save();
      await doctorModel.findByIdAndUpdate(docId, { timeSlotId: newTimeSlot._id });
    }
  }


    await doctorModel.findByIdAndUpdate(docId, {city, state,zip,phone , fees, address, available,availableDays });

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.paymentMethod) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse(),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const createPrescription = async (req, res) => {
  try {
    const { pharmacyStore, startDate, endDate, medicines } = req.body;
    const newPrescription = new prescriptionModel({
      pharmacyStore,
      startDate,
      endDate,
      medicines,
    });
    await newPrescription.save();
    res.json({ success: true, message: "Prescription Created" });
  } catch (error) {
    console.log(error);
  }
};

const getTimeSlots = async (req, res) => {
  try {
    const { docId } = req.body;
    const timeSlots = await timeSlotModel.find({ docId });
    res.json({ success: true, timeSlots });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const createTimeSlot = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const newTimeSlot = new timeSlotModel({ docId, slotDate, slotTime });
    await newTimeSlot.save();
    res.json({ success: true, message: "Time Slot Created" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Time Slot not Created" });
  }
};

const updateTimeSlot = async (req, res) => {
  try {
    const { timeSlotId } = req.body;
    await timeSlotModel.findByIdAndUpdate(timeSlotId, req.body);
    res.json({ success: true, message: "Time Slot Updated" });
  } catch (error) {
    console.log(error);
  }
};

const getPrescription = async (req, res) => {
    console.log("In get prescription")
  try {
    const { prescriptionId } = req.params;
    console.log("prescrid",prescriptionId);
    const prescription = await prescriptionModel.findById(prescriptionId);
    if (prescription) {
      res.json({ success: true, prescription,message: "Prescription Found" });
    } else {
      res.json({ success: false, message: "Prescription not found" });
    }
  } catch (error) {
    console.log(error);
  res.json({ success: false, message: error });

  }
};

const updatePrescription = async (req, res) => {    
    try {
        const { appointmentId, updatedData } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);
        if(appointmentData.prescriptionId){
            await prescriptionModel.findByIdAndUpdate(appointmentData.prescriptionId, updatedData);
        }
        else{
            const newPrescription = new prescriptionModel(updatedData);
            await newPrescription.save();
            await appointmentModel.findByIdAndUpdate(appointmentId, { prescriptionId: newPrescription._id, isCompleted: true });
        }
        res.json({ success: true, message: "Prescription Updated" });
    }
    catch (error) {
        console.log(error);
    res.json({ success: false, message: error.message });


    }
}


const updateAppointment = async (req, res) => {
  try {
    const { appointmentId, updatedData } = req.body;
    await appointmentModel.findByIdAndUpdate(appointmentId, updatedData);
    res.json({ success: true, message: "Appointment Updated" });
    }
    catch (error) {
        console.log(error);
    }
}


export {
  loginDoctor,
  setPassword,
  appointmentsDoctor,
  appointmentCancel,
  doctorList,
  changeAvailablity,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updatePrescription,
  updateDoctorProfile,
  createPrescription,
  createTimeSlot,
  updateTimeSlot,
  getPrescription,
};
