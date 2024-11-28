import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    docId: { type: String, required: true },
    prescriptionId: { type: String, default: null },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    patientData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment : { type: Object, default: null },
    paymentMethod: { type: String, default: 'cash' },
    isCompleted: { type: Boolean, default: false }
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel