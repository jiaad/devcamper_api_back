const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('./../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('./../models/Bootcamp')


// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // res.status(200).json({ success: true, count: bootcamps.length, pagination: pagination, startIndex, endIndex, total, data: bootcamps })
  // res.status(200).json({succes: true, msg: "show all bootcamps", hello: req.hello})
  res.status(200).json(res.advancedResults);
})

// @desc      Get single bootcamps
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp) {// if it is a formated ID
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    // return res.status(400).json({succes: false})
  }
  res.status(200).json({ success: true, data: bootcamp });
  // res.status(400).json({ success: false, msg: `Bootcamp doesn't exist`})

  //  res.status(200).json({ success: true, msg: `show bootcamp ${req.params.id}` })
})

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add User to req.body
  req.body.user = req.user.id // a logged in user

  // Check for Published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

  // if th User not an admin, they can add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user with the id: ${req.user.id} has already published one bootcamp`, 400))
  }

  console.log(req.body)
  let bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp })
  // res.status(400).json({ success: false })
  //res.status(200).json({ success: true, msg: "create new bootcamp" })

})

// @desc      Update bootcamp
// @route     put /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // return res.status(400).json({success: false});
    return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`))
  }

  // Make Sure is Bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401)
    )
  }

   bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: bootcamp });
  // res.status(400).json({ success: false });
  // res.status(200).json({ success: true, msg: `update bootcamp ${req.params.id}` })
})

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // res.status(200).json({ success: true, msg: `delete bootcamp ${req.params.id}` })
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // return res.status(400).json({success: false});
    return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}$`))
  }

  // Make Sure this is the Owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    next(
      new ErrorResponse(`User ${req.params.id} isnt authorized to delete this routes`)
    )
  }

  await bootcamp.remove()
  res.status(200).json({ success: true, data: {} });
  // res.status(400).json({success: false});
})


// @desc      GET bootcamp within a radius
// @route     DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
// console.log('this is sparta :',req.que)
  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  console.log(loc)
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  console.log('bootcamps : ', bootcamps)
  console.log('lng: ', lng, ' lat: ', lat, ' distance: ', distance);

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});


// @desc      Upload Photo
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  // res.status(200).json({ success: true, msg: `delete bootcamp ${req.params.id}` })
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // return res.status(400).json({success: false});
    return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}$`))
  }


  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      ErrorResponse(`User ${req.params.id} isn't authrized to update this route`)
    )
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload a file", 400));
  }
  const file = req.files.file
  // Make sure file is a photo
  if (!file.mimetype.startsWith('image')) {
    return(next(new ErrorResponse("Please upload an image file", 400)))
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return(next(new ErrorResponse("Please upload an image less than:"+process.env.MAX_FILE_UPLOAD, 400)))
  }
  // Create custom file name
  file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err =>{
    if (err) {
      console.log(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
    res.status(200).json({
      success: true,
      data: file.name
    })
  })
})

