import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import operatorModel from "../models/operatorModel.js";
import adminModel from "../models/adminModel.js";
import timeSlotModel from "../models/timeSlotModel.js";
import paymentModel from "../models/paymentModel.js";


// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body
        var operator  = await operatorModel.findOne({email})
        if (operator  || (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) ) {
            if (!operator) {
                const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
                const hashedPassword = await bcrypt.hash(password, salt)
                operator =await operatorModel.create({ email, password:hashedPassword,"role":"admin","name":"admin"})
            }
            const isMatch = await bcrypt.compare(password, operator.password)
            if (!isMatch) {
                return res.json({ success: false, message: "Invalid credentials" })
            }
        
            const token = jwt.sign({"email":email,'password':password,'role':operator.role,'id':operator._id.toString()}, process.env.JWT_SECRET)


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

// checkInAppointment
const checkInAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate
        (appointmentId, { isCompleted: false })
        res.json({ success: true, message: 'Appointment Checked In' })
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

        const { firstname,lastname,zip,state,phone,city, email, password, speciality, degree, experience, about, fees, address,availableDays} = req.body
        const imageFile = req.file
        for (let i = 0; i < availableDays.length; i++) {
            availableDays[i] = JSON.parse(availableDays[i]);
        }
        



        // check for all data to add doctor
        const all_docs = await doctorModel.find({email:email})
        
        if (all_docs.length > 0) {
            return res.json({ success: false, message: "Doctor already exists" })
        }


        // checking for all data to add doctor
        if (!firstname || !lastname || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
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
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url
        const timeSlot = new timeSlotModel({
            availableDays: availableDays
        });

        await timeSlot.save();

        const doctorData = {
            firstname,
            lastname,
            city,
            state,
            zip,
            phone,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            createdById:req.headers.operator_id,
            date: Date.now(),
            timeSlotId: timeSlot._id
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
        const users = await userModel.find({}).select('-password').lean(); // Convert users to plain objects
        const enrichedUsers = await Promise.all(
            users.map(async (user) => {
                if (user.paymentId) {
                    const payment = await paymentModel.findById(user.paymentId).lean();
                    if (payment) {
                        user.cardDetails = payment.cardDetails || null;
                        user.insuranceId = payment.insuranceId || null;
                    }
                } else {
                    user.cardDetails = null;
                    user.insuranceId = null;
                }
                return user;
            })
        );

        res.json({ success: true, users: enrichedUsers });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { appointmentId,docId, note, slotDate, slotTime } = req.body;
        console.log(appointmentId,slotDate, slotTime);

        // Prepare the update object
        const updateData = {};
        
        if (note) {
            updateData.note = note;
        }
        if (slotDate && slotTime) {
            updateData.slotDate = slotDate;
            updateData.slotTime = slotTime;
            
        
        const docData = await doctorModel.findById(docId);


        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }
        console.log(slots_booked)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked: slots_booked })
    }



        // Perform the update
        const updatedAppointment = await appointmentModel.findByIdAndUpdate(appointmentId, updateData, { new: true });
        console.log(updateData);

        if (!updatedAppointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, message: 'Appointment Updated', updatedAppointment });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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

        const { docId,firstname,lastname,zip,city,state,phone, fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, { fees,firstname,city,lastname,zip,state,phone, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateUserProfile = async (req, res) => {

    try {

        const { userId, firstname,lastname,zip,state,city, phone, address, dob, gender,cardDetails,insuranceId } = req.body
        const imageFile = req.file

        if (!firstname || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }
        // create payment and health details object
        const paymentDetails = {
            cardDetails:(cardDetails),
            insuranceId
        }
        const user = await userModel.find({ _id: userId })
        if(user.paymentId == null && (paymentDetails.cardDetails != null || paymentDetails.insuranceId != null)){
            const newPayment = new paymentModel(paymentDetails)
            const payment=await newPayment.save()
            await userModel.findByIdAndUpdate(userId, { firstname,lastname,zip,city,state,phone, address: (address), dob, gender, paymentId: payment._id })
        }
        else if(user.paymentId != null){
            await paymentModel.findByIdAndUpdate(user.paymentId, { cardDetails, insuranceId })
        }
        await userModel.findByIdAndUpdate(userId, { firstname,lastname,zip,city,state,phone, address: (address), dob, gender })

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

        const { name, email, password, address,roleofop } = req.body
        

        const ops = operatorModel.find({email:email})
        if (ops.length > 0) {
            return res.json({ success: false, message: "Operator already exists" })
        }
        if (roleofop === "admin"){
            const adm = adminModel.find({email:email})
            if(adm.length>0){
            return res.json({ success: false, message: "Admin already exists" })
            }
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
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)
        

        const operatorData = {
            name,
            email,
            password: hashedPassword,
            address: JSON.parse(address),
            role: roleofop,
            date: Date.now(),
            createdById:req.headers.user_id
        }

        const newop = new operatorModel(operatorData)
        await newop.save()
        if(roleofop==="admin"){
            const adminData = {
                name,email,hashedPassword
            }
            const newadm = new adminModel(adminData)
            await newadm.save()
            console.log("ADMIN Created")
        }
        res.json({ success: true, message: 'Operator Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    updateAppointment,
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
    addOperator,
    checkInAppointment
}