import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    appointmentID: { type: String, required: true },
    medicines: { type: Array, required: true,default:[] },
})

const prescriptionModel = mongoose.models.prescription || mongoose.model("prescription", prescriptionSchema);
export default prescriptionModel;