const express = require('express');
const router = express.Router();
const { getBootcamps, getBootcamp,
       createBootcamp, updateBootcamp,
       deleteBootcamp,
       getBootcampsInRadius } = require('../controllers/bootcamps')

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
