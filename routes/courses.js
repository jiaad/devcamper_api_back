const express = require('express');

const {getCourses, getCourse, updateCourse, deleteCourse, createCourse} = require('./../controllers/courses');

const Course = require('./../models/Course')
const advancedResults = require('./../middleware/advancedResults')
const router = express.Router({mergeParams: true});
const allCoursesAdvRes = advancedResults(Course, {path: 'bootcamp', select: 'name description'})

const {protect, authorize} = require('./../middleware/auth')

router
    .route('/')
    .get(allCoursesAdvRes,getCourses)
    .post(protect, authorize('publisher', 'admin'),createCourse)

router
    .route('/:id')
    .get(getCourse)
    .put(protect,authorize('publisher', 'admin'),updateCourse)
    .delete(protect, authorize('publisher', 'admin'),deleteCourse)
module.exports = router 