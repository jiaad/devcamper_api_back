const path      = require('path')
const express   = require('express')
const dotenv    = require('dotenv')
const logger    = require('./middleware/logger')
const morgan    = require('morgan')
const color     = require('colors')
const fileupload = require('express-fileupload')
const cors = require("cors");
const errorHandler    = require('./middleware/error')

//LOAD ENV VARS
// IMPORTANT: toujours mettre le ENV au dessus des import qui ont des ENV
// On peut ramener en haut mais faut
dotenv.config({ path: './config/config.env' });


// DB connection : declared : ./config/db
const connectDB = require('./config/db');
connectDB();


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
// Body Parser
app.use(express.json());

//app.use(logger)
// Dev loggin middleware
if(process.env.NODE_ENV == 'development'){
  app.use(morgan('dev'));
}

// ROUTES FILES
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')

// File uploading
app.use(fileupload())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// MOUNT ROUTERS
app.use('/api/v1/bootcamps/', bootcamps);
app.use('/api/v1/courses', courses);

// ERROR HANLDER : MUST BE AFTER MOUNT ROUTERS
app.use(errorHandler);

// SERVER INITIALIZATION
const server = app.listen(PORT,
  console.log(`server running in :${process.env.NODE_ENV} || on port : ${PORT}`.yellow.bold));


// Handle Unhandle promise rejection

process.on('unhandledRejection', (err, promise) => {
  console.log(`ERROR: ${err.message}`.red);
})
