const Review = require('./../models/Review')
const asyncHandler = require('./../middleware/async')
const ErrorResponse = require('./../utils/errorResponse')
const Bootcamp = require('./../models/Bootcamp')

// @desc    Get review
// @route   Get /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next)=>{

    if (req.params.bootcampId) {
        const reviews = await Review.find({bootcamp: req.params.bootcampId})
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    }else{
        res.status(200).json(res.advancedResults)
    }
})


// @desc    Get single review
// @route   Get /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next)=>{
    const review = await  Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if (!review) {
        return next(new ErrorResponse('No review found with the id of ' + req.params.id, 404))
    }

    res.status(200).json({success: true, data: review})
})

// @desc    Add review
// @route   POST /api/v1/bootcamp/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next)=>{
   
   req.body.bootcamp = req.params.bootcampId
   req.body.user = req.user.id // defined on auth middleware {protect}

//    console.log('user :: === :: ', req)
   console.log('params :: === :: ', req.params)
   const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next (new ErrorResponse(`Bootcamp with id: ${req.params.bootcampId} doesn't exist`, 404))
    }
    const review = await Review.create(req.body)

    res.status(200).json({success: true, data: review})
})

// @desc    Update review
// @Routes  PUT api/v1/bootcamps/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review   = await Review.findById(req.params.id)
    if (!review) {
        return next(
          new  ErrorResponse('The review with id: ' + req.params.id + "doesn't exists", 404 )
        )
    }
    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
                new  ErrorResponse( 'Not authorized to update', 401 )
               )   
    }
     review = await Review.findByIdAndUpdate(req.params.id, req.body, {
         new: true, 
         runValidators: true
        })
        await review.save()
    res.status(200).json({success: true, data: review})
})


// @desc    Delete review
// @Routes  DELETE api/v1/bootcamps/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    let review   = await Review.findById(req.params.id)
    if (!review) {
        return next(
          new  ErrorResponse( 'The review with id: ' + req.params.id + "doesn't exists", 404 )
        )
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new  ErrorResponse( 'Not authorized to delete', 401 )
          )
    }
     await review.remove()
    res.status(200).json({success: true, data: {}})
})