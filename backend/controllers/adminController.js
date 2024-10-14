import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import operatorModel from "../models/operatorModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body
        console.log(password)

        var operator  = await operatorModel.findOne({email,password})


        if (operator  || (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) ) {
            if (!operator) {
                operator = operatorModel.create({ email, password,"role":"admin","name":"admin"})
            }
            const token = jwt.sign({"email":email,'password':password,'role':operator.role}, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // check for all data to add doctor
        const all_docs = await doctorModel.find({email:email})
        
        if (all_docs.length > 0) {
            return res.json({ success: false, message: "Doctor already exists" })
        }


        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Password should have atleast 8 characters" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        // const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: password,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all users list for admin panel
const allUsers = async (req, res) => {
    try {

        const users = await userModel.find({}).select('-password')
        res.json({ success: true, users })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all operators list for admin panel
const allOperators = async (req, res) => {
    try {

        const operators = await operatorModel.find({}).select('-password')
        res.json({ success: true, operators })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.params
        const profileData = await doctorModel.findById(docId).select('-password')
        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateDoctorProfile = async (req, res) => {
    try {


        const { docId, fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateUserProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: (address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from the URL parameters
        const deletedUser = await userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
    }
};


const updateOperatorProfile = async (req, res) => {
    try {
        const {operatorId, name, role} = req.body
        await operatorModel.findByIdAndUpdate(operatorId, {name,role})

        res.json({success:true, message: 'Profile Updated'})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
        
const addOperator = async (req, res) => {

    try {

        const { name, email, password, address } = req.body

        ops = operatorModel.find({email:email})
        if (ops.length > 0) {
            return res.json({ success: false, message: "Operator already exists" })
        }
       

        // checking for all data to add doctor
        if (!name || !email || !password || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        // const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        // const hashedPassword = await bcrypt.hash(password, salt)
        

        const operatorData = {
            name,
            email,
            password: password,
            address: JSON.parse(address),
            role: 'operator',
            date: Date.now()
        }

        const newop = new operatorModel(operatorData)
        await newop.save()
        res.json({ success: true, message: 'Operator Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    allUsers,
    allOperators,
    adminDashboard, 
    doctorProfile,
    updateDoctorProfile,
    updateUserProfile,
    updateOperatorProfile,
    deleteUser,
    addOperator
}