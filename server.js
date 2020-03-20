const path            = require('path')
const express         = require('express')
const dotenv          = require('dotenv')
const morgan          = require('morgan')
const color           = require('colors')
const fileupload      = require('express-fileupload')
const cookieParser    = require('cookie-parser')
const cors            = require("cors");
const pathfinderUI    = require('pathfinder-ui')
const mongoSanitize   = require('express-mongo-sanitize');
const helmet          = require('helmet')
const rateLimit       = require("express-rate-limit");
const hpp             = require("hpp");
const xss             = require('xss-clean')

const errorHandler    = require('./middleware/error')
const logger          = require('./middleware/logger')

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

// Cookie parser
app.use(cookieParser())


//app.use(logger)
// Dev loggin middleware
if(process.env.NODE_ENV == 'development'){
  app.use(morgan('dev'));
}

// ROUTES FILES
const auth        = require('./routes/auth')
const bootcamps   = require('./routes/bootcamps')
const courses     = require('./routes/courses')
const review      = require('./routes/reviews')
const user        = require('./routes/users')

// File uploading
app.use(fileupload())

// ******* Security *******
  // Sanitize DATA
  app.use(mongoSanitize())

  // XSS PROTECTION
  app.use(helmet())

  // Prevent XSS attacks
  app.use(xss())

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter)

  // Prevent http param polution
    app.use(hpp())
// ******* SECURITY END *******

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// MOUNT ROUTERS
app.use('/api/v1/auth', auth)
app.use('/api/v1/bootcamps/', bootcamps);
app.use('/api/v1/courses/', courses);
app.use('/api/v1/reviews/', review)
app.use('/api/v1/users/', user)
// ERROR HANLDER : MUST BE AFTER MOUNT ROUTERS
app.use(errorHandler);

// app.get('/', (req, res) => res.render('./index/index'))

app.use('/pathfinder', function(req, res, next){
	pathfinderUI(app)
	next()
}, pathfinderUI.router)

// SERVER INITIALIZATION
const server = app.listen(PORT,
  console.log(`server running in :${process.env.NODE_ENV} || on port : ${PORT}`.yellow.bold));


// Handle Unhandle promise rejection

process.on('unhandledRejection', (err, promise) => {
  console.log(`ERROR: ${err.message}`.red);
})
