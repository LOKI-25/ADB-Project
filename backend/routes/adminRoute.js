import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, 
    adminDashboard, updateDoctorProfile,  updateUserProfile, updateOperatorProfile, 
    allUsers, allOperators, doctorProfile,deleteUser,addOperator } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.delete("/delete-user/:userId", authAdmin, deleteUser)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.post("/add-operator", authAdmin, addOperator)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.get("/all-users", authAdmin, allUsers)
adminRouter.get("/all-operators", authAdmin, allOperators)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.get("/profile/:docId", authAdmin, doctorProfile)
adminRouter.post("/update-doctor-profile", authAdmin, upload.single('image'), updateDoctorProfile)
adminRouter.post("/update-user-profile", authAdmin, upload.single('image'), updateUserProfile)
adminRouter.post("/update-operator-profile", authAdmin, updateOperatorProfile)


export default adminRouter;