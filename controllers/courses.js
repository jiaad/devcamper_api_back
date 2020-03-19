const Course = require('./../models/Course')
const asyncHandler = require('./../middleware/async')
const ErrorResponse = require('./../utils/errorResponse')
const Bootcamp = require('./../models/Bootcamp')

// @desc    Get courses
// @route   Get /api/v1/courses
// @route   Get /api/v1/bootcamp/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next)=>{

    if (req.params.bootcampId) {
        const courses = await Course.find({bootcamp: req.params.bootcampId})
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    }else{
        res.status(200).json(res.advancedResults)
    }

    // const courses = await returnQuery
    // console.log("mmmmmmmmm : :: : : :", courses.length)
    // res.status(200).json({success: true, count: courses.length,name: 'jiad', data: courses})
})


// @desc    Add a new course
// @route   Get /api/v1/courses
// @route   Get /api/v1/bootcamp/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next)=>{
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(
            new ErrorResponse("No bootcamp with id of " + req.params.bootcampId , 404)
        )
    }
    
    if (bootcamp.user.toString() !== req.body.user && req.user.role !== 'admin' ) {
        return next(
                new ErrorResponse(`User not authorized to create Course for this Bootcamp`)
            )
    }

    const course = await Course.create(req.body)
    res.status(200).json({success: true, data: course})
})


// @desc    Get single course
// @route   Get /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next)=>{
 
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })
    if (!course) {
        return next(new ErrorResponse("Course doen't exist", 404))
    }
    res.status(200).json({success: true, name: 'jiad', data: course})
})


// @desc    Update single course
// @route   Get /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next)=>{
    let course = await Course.findById(req.params.id)
    if (!course) {
        return next(new ErrorResponse("Course doesn't exist", 404));
    }

    // Make sure user is course owner
    console.log('ccccc: ' + course._id)
    if (course.user.toString() !== req.user.id && req.user.id !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this course`
            )
        )
    }

     course = await Course.findByIdAndUpdate(req.params.id,req.body, {
        runValidators: true,
        new: true
    })
    res.status(200).json({success: true,name: 'jiad', data: course})
})

// @desc    Delete single course
// @route   Get /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next)=>{
    const course = await Course.findById(req.params.id)
    if (!course) {
        return next(new ErrorResponse("Course doesn't exist", 404));
    }

    console.log('ccccc: ' + course._id)
    if (course.user.toString() !== req.user.id && req.user.id !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this course`
            )
        )
    }

    await course.remove()
    res.status(200).json({success: true,name: 'jiad', data: {}})
})