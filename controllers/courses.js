const Course = require('./../models/Course')
const asyncHandler = require('./../middleware/async')
const ErrorResponse = require('./../utils/errorResponse')


// @desc    Get courses
// @route   Get /api/v1/courses
// @route   Get /api/v1/bootcamp/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next)=>{
    let returnQuery
    if (req.params.bootcampId) {
        returnQuery = Course.find({bootcamp: req.params.bootcampId})
    }else{
        returnQuery = Course.find()
    }

    const courses = await returnQuery
    console.log("mmmmmmmmm : :: : : :", courses.length)
    res.status(200).json({success: true, count: courses.length,name: 'jiad', data: courses})
})