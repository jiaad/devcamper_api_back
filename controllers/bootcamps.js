const Bootcamp = require('./../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('./../middleware/async')
// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let bootcamps = await Bootcamp.find();
    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps})
  // res.status(200).json({succes: true, msg: "show all bootcamps", hello: req.hello})
})

// @desc      Get single bootcamps
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler( async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp){// if it is a formated ID
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
  console.log(req.body)
    let bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp})
    // res.status(400).json({ success: false })
  //res.status(200).json({ success: true, msg: "create new bootcamp" })

})

// @desc      Update bootcamp
// @route     put /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler( async (req, res, next) => {
    let bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if(!bootcamp){
      // return res.status(400).json({success: false});
      return new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`)
    }
    res.status(200).json({ success: true, data: bootcamp });
    // res.status(400).json({ success: false });
  // res.status(200).json({ success: true, msg: `update bootcamp ${req.params.id}` })
})

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
  // res.status(200).json({ success: true, msg: `delete bootcamp ${req.params.id}` })
    let bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
      // return res.status(400).json({success: false});
      return new ErrorResponse(`Bootcamp not found with id: ${req.params.id}$` )
    }
    res.status(200).json({success: true, data: {} });
    // res.status(400).json({success: false});
})
