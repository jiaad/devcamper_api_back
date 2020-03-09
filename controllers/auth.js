const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const User = require('./../models/User');


// @desc        Register
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
    const {name, email, password, role} = req.body;

    // Create user
    const user = await User.create({
        name, email, password, role
    })
    const token = user.signedJwtToken();
    res.status(200).json({success: true, token})
})


// @desc        Login User
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;
    // Validate email && password
    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400));
        // Check for User
    }
    const user = await User.findOne({email}).select('+password');
    if (!user) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }
    // Check if password matchs
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401))
    }
    // const token = user.signedJwtToken()
    sendTokenResponse(user, 200, res)
    // res.status(200).json({success: true, token})
})

// @desc        Login User
// @route       GET /api/v1/auth/me
// @access      private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)


    res.status(200).json({
        success: true,
        user
    })
})


// Get TOKEN from model, create cookie and send resoponse

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.signedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 69 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }
    res
        .status(statusCode)
        .cookie('token', token, options).json({success: true, token})
}



// @desc        Forgot password
// @route       POST /api/v1/auth/forgotpassword
// @access      public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email})

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404))
    }
    const resetToken = user.getResetPasswordToken()

    console.log("this is reset token: ", resetToken);
    await user.save({validateBeforeSave: false})
    res.status(200).json({
        success: true,
        user
    })
})

