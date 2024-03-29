const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middleware/async');
const User = require('./../models/User');
const sendEmail = require('./../utils/sendEmails')
const crypto = require('crypto')

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

    // Get reset token
    const resetToken = user.getResetPasswordToken()
    console.log("this is reset token: ", resetToken);
    await user.save({validateBeforeSave: false})

    // Create reset url

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
    const message = `You are receiving this email becaise you (or someone else) has requested the reset of  a password, Please make a PUT request to: \n\n ${resetUrl} `
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })
        res.status(200).json({success: true, data: 'Email sent'})
    } catch (err) {
        console.log(err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave: false})
        return next(new ErrorResponse('Email could not be sent', 500))
    }
    
    res.status(200).json({
        success: true,
        user
    })
})


// @desc        Reset password
// @route       PUT /api/v1/auth/resetpassword/:resettoken
// @access      public
exports.resetPassword = asyncHandler(async (req, res, next) =>{
    // Get hashed Token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400))
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordExpire = undefined
    user.resetPasswordToken = undefined

    await user.save()
    sendTokenResponse(user, 200, res)
    res.status(200).josn({success: true, data: user})
})

// @desc Update user details
// @route PUT api/v1/auth/updatedetails
// @access Private

exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name ,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })
})

// @desc Update user details
// @route PUT api/v1/auth/updatepassword
// @access Private

exports.updatePassword = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        password: req.body.password,
    }
    const user = await User.findById(req.user.id).select('+password')
    // Check current password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect', 401))
    }
    user.password = req.body.newPassword
    await user.save()
    sendTokenResponse(user, 200, res)
})



// @desc Log user iut / clear cookie
// @route PUT api/v1/auth/logout
// @access Private

exports.logout = asyncHandler(async (req, res, next) => {
   res.cookie('token', 'none', {
       expires: new Date(Date.now() + 10 * 1000),
       httpOnly: true
   })
})