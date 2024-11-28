
import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema({
    cardDetails: { type: Object,  default: null },
    insuranceId: { type: String, default: null },
})

const paymentModel = mongoose.models.payment || mongoose.model("payment", paymentSchema);

export default paymentModel;



