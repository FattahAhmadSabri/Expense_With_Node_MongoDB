
const Payment = require("../model/paymentSchema")
const User = require("../model/userSchema")
const getPaymentStatus = async(orderId)=>{
    try {
        const statusPayment = await Payment.findOne({orderId :orderId})
        return statusPayment
    } catch (error) {
       console.log(error) 
    }
}

module.exports= {getPaymentStatus}