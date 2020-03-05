const express = require('express');
const {register, login, getMe} = require('./../controllers/auth');
const Router = express.Router();
const {protect} = require('./../middleware/auth')
Router
    .route('/register')
    .post(register)

Router
    .route('/login')
    .post(login)

Router.route('/me').get(protect,getMe)

module.exports = Router