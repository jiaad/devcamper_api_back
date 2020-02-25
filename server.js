const express = require('express')
const dotenv = require('dotenv')
const logger = require('./middleware/logger')
const morgan = require('morgan')

//LOAD ENV VARS
// IMPORTANT: toujours mettre le ENV au dessus des import qui ont des ENV
// On peut ramener en haut mais faut
dotenv.config({ path: './config/config.env' })


// DB connection : declared : ./config/db
const connectDB = require('./config/db')
connectDB()


const app = express()
const PORT = process.env.PORT || 5000


//app.use(logger)
// Dev loggin middleware
if(process.env.NODE_ENV == 'development'){
  app.use(morgan('dev',{
    skip: function(req, res) { return res  }
  }));
}

// ROUTES FILES
const bootcamps = require('./routes/bootcamps')


// MOUNT ROUTERS
app.use('/api/v1/bootcamps', bootcamps);



// SERVER INITIALIZATION
const server = app.listen(PORT,
  console.log(`server running in :
  ${process.env.NODE_ENV} ||
  on port : ${PORT}`))


// Handle Unhandle promise rejection

process.on('unhandledRejection', (err, promise) => {
  console.log(`ERROR: ${err.message}`);
    //
    server.close(() => process.exit(1));
})
