import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    availableDays: [
        {
            day: { type: String, required: true }, 
            startTime: { type: String, required: true }, 
            endTime: { type: String, required: true }, 
        },
    ],
    startTime : { type: String, required: false },
    endTime : { type: String, required: false },
})

const timeSlotModel = mongoose.model.timeSlot || mongoose.model("timeSlot", Schema);
export default timeSlotModel;