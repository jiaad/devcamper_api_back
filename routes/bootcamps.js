const express = require('express');
const { getBootcamps, getBootcamp,
       createBootcamp, updateBootcamp,
       deleteBootcamp,
       getBootcampsInRadius } = require('../controllers/bootcamps')

const router = express.Router();

// Include other resource routers
const courseRouter = require('./courses')



// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)


// in server.js
// app.use('/api/v1/bootcamps', bootcamps);

router
       .route('/radius/:zipcode/:distance')
       .get(getBootcampsInRadius)

router
       .route('/')
       .get(getBootcamps)
       .post(createBootcamp);

router
       .route('/:id')
       .get(getBootcamp)
       .put(updateBootcamp)
       .delete(deleteBootcamp)


module.exports = router
