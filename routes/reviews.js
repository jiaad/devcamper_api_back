const express = require('express');
const { getReviews, getReview, addReview} = require('../controllers/reviews')
const advancedResults = require('./../middleware/advancedResults')
const Bootcamp = require('./../models/Bootcamp')
const Review = require('./../models/Review')


const router = express.Router({mergeParams: true});

const { protect, authorize } = require('./../middleware/auth')

// Include other resource routers
// const courseRouter = require('./courses')

router
    .route('/')
    .get(advancedResults(Review, {path: 'bootcamp',select: 'name description'}), getReviews)
    .post(protect, authorize('admin', 'user'), addReview)

    router 
        .route('/:id').get(getReview)


module.exports = router;