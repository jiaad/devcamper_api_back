const express = require('express');

const {getCourses, getCourse, updateCourse, deleteCourse, createCourse} = require('./../controllers/courses');

const Course = require('./../models/Course')
const advancedResults = require('./../middleware/advancedResults')
const router = express.Router({mergeParams: true});
const allCoursesAdvRes = advancedResults(Course, {path: 'bootcamp', select: 'name description'})

router
    .route('/')
    .get(allCoursesAdvRes,getCourses)
    .post(createCourse)

router
    .route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse)
module.exports = router 