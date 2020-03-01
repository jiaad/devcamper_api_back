const express = require('express');
const {register} = require('./../controllers/auth');
const Router = express.Router();

Router
    .route('/register')
    .post(register)

    module.exports = Router