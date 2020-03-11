const express = require('express');

const { getUsers, getUser, 
        createUser, updateUser,
        deleteUser  } = require('./../controllers/users');

const User = require('./../models/User')

const advancedResults = require('./../middleware/advancedResults')
const { protect, authorize } = require('./../middleware/auth')
const router = express.Router({mergeParams: true});
var pathfinderUI = require('pathfinder-ui')

/**
 * @ Important this route has protect, authorize as default
 *   middleware
 */

router.use(protect)
router.use(authorize('admin'))

router
   .route('/').get(advancedResults(User) ,getUsers)
    .post(createUser)

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router