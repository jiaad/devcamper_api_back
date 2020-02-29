const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('./../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('./../models/Bootcamp')


// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

  let returnQuery;

  // copy request.query
  requestQuery = { ...req.query }
  console.log('type of rew query', typeof requestQuery)
  // Field to exclude

  const removeFields = ['select', 'sort', 'page', 'limit', 'skip']

  // Loop over removeFields and delete them from reqQuery

  removeFields.forEach(param => delete requestQuery[param]);

  // Create query String
  let queryStr = JSON.stringify(requestQuery);

  // Create operators like ($gt, $gte etc..)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)// pour matcher les requete HTTP

  // Finding resources
  returnQuery = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    returnQuery = returnQuery.select(fields)
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    returnQuery = returnQuery.sort(sortBy)
  } else {
    returnQuery = returnQuery.sort('-createdAt')
  }
  // query.sort({ averageCost: 1 })

  // Pagination

  let page = parseInt(req.query.page, 10) || 1
  let limit = parseInt(req.query.limit, 10) || 25
  let startIndex = (page - 1) * limit
  let endIndex = page * limit
  const total = await Bootcamp.countDocuments();
  console.log('skip : ', total)
  returnQuery = returnQuery.skip(startIndex).limit(limit)

  // Executing Query
  let bootcamps = await returnQuery
  // console.log(req.query);
  // console.log(typeof req.query);

  // Pagination result
  let pagination = {}
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit
    }
  }

  res.status(200).json({ success: true, count: bootcamps.length, pagination: pagination, startIndex, endIndex, total, data: bootcamps })
  // res.status(200).json({succes: true, msg: "show all bootcamps", hello: req.hello})
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
  let bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    // return res.status(400).json({success: false});
    return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`))
  }
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
  bootcamp.remove()
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