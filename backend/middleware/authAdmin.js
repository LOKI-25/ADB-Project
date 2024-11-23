import jwt from "jsonwebtoken"
import adminModel from "../models/adminModel.js"

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers
        console.log(req.headers)
        if (!atoken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        const admin = await adminModel.find({email:token_decode['email'],password:token_decode["password"]})
            console.log(admin,token_decode)
        if( !admin ){
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        req.body.role = token_decode.role || "operator"
        req.headers.operator_id = token_decode.id
        req.headers.user_id = token_decode.id
        req.headers.user_email = token_decode['email']
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export default authAdmin;
