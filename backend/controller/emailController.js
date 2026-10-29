const sendEmail = require("../service/emailService")
const {
  successResponse,
  errorResponse,
} = require("../middleware/responseHandle");

const sendEmailController = async (req, res) => {
    try {
        const {to, subject, message}= req.body
        const sendMail  = await sendEmail(to, subject, message)
        return successResponse(res, 200, "message sent successfully", sendMail);
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

module.exports={sendEmailController}
 