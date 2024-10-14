import jwt from "jsonwebtoken"

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers
        if (!atoken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        console.log(token_decode)
        if ((token_decode['email'] != process.env.ADMIN_EMAIL || token_decode["password"]!=  process.env.ADMIN_PASSWORD) && token_decode.role == "admin") {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        req.body.role = token_decode.role || "operator"
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export default authAdmin;