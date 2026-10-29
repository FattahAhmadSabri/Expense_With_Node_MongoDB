const {getPaymentStatus} = require("../service/paymentStoreService");
const {
  successResponse,
  errorResponse,
} = require("../middleware/responseHandle");


const getPaymentController= async(req,res)=>{
    try {
        const {orderId}= req.params
        const response = await getPaymentStatus(orderId)
        return successResponse(res, 200, "order added successfully", response);
    } catch (error) {
        return errorResponse(res, 500, error.message); 
    }
}

module.exports ={getPaymentController}