const express = require('express');
const { getReviews, getReview, addReview, updateReview, deleteReview} = require('../controllers/reviews')
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
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router;