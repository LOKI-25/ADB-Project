import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    availableDays : { type: Array, required: true },
    startTime : { type: String, required: true },
    endTime : { type: String, required: true },
})

const timeSlotModel = mongoose.model.timeSlot || mongoose.model("timeSlot", Schema);
export default timeSlotModel;