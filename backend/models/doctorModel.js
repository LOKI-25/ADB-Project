import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    city : { type: String, required: true },
    state: { type: String, required: true },
    zip : { type: String, required: true },
    phone : { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: false },
    fees: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    role : { type: String, default: 'doctor' },
    createdById : { type: String, required: true },
    timeSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'timeSlot', required: true },

}, { minimize: false })

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;