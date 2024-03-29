const jwt               = require('jsonwebtoken')
const asyncHandler      = require('./async')
const ErrorResponse      = require('./../utils/errorResponse')
const User              = require('./../models/User')


// Protect Routes

exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if(    req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
			// Set token from bearer token
        token = req.headers.authorization.split(' ')[1];
		 }
		 // Set token from cookie
		 else if(req.cookies.token){
        token = req.cookies.token
     }

    // Make sure token exists
    if(!token){
        return next(new ErrorResponse("Not authorized to access to this route", 401))
    }

    try {
        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.user = await User.findById(decoded.id);

    next();
    } catch (error) {
        return next(new ErrorResponse("Not authorized to access to this route we eeee", 401))
    }
})


exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`user role ${req.user.role} is not authorized to access this route `, 401))
        }
        next()
    }
}