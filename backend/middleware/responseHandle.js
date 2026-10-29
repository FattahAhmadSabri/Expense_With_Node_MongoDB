
const successResponse = (
    res,
    statusCode = 200,
    message = "Success",
    data = null,
    token

) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data, 
        token
    });
};

const errorResponse = (
    res,
    statusCode = 500,
    message = "Something went wrong"
) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};



const globalErrorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};



module.exports = {
    successResponse,
    errorResponse,
    globalErrorHandler
};