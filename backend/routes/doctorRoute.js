import express from 'express';
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList,updatePrescription, changeAvailablity,getPrescription, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile,createPrescription
,createTimeSlot,updateTimeSlot
 } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)

doctorRouter.get("/list", doctorList)
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.get("/profile", authDoctor, doctorProfile)
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)
doctorRouter.post("/create-prescription", authDoctor, createPrescription)
doctorRouter.post("/update-prescription", authDoctor, updatePrescription)
doctorRouter.post("/create-time-slot", authDoctor, createTimeSlot)
doctorRouter.post("/update-time-slot", authDoctor, updateTimeSlot)
doctorRouter.get("/get-prescription/:prescriptionId", authDoctor, getPrescription)

export default doctorRouter;