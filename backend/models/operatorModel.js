import mongoose from "mongoose";

const operatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: false },
    address: { type: Object, required: false },
    role: { type: String, default: 'operator' }
})

const operatorModel = mongoose.models.operator || mongoose.model("operator", operatorSchema);
export default operatorModel;