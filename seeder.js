const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')


// Load ENV VARS
dotenv.config({path: './config/config.env'})



// Load models

const Bootcamp = require('./models/Bootcamp')


// Connect to DB

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});


// Read JSON files

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))


// import Into DB

const importData = async () => {
  try {
    await Bootcamp.create(bootcamps)
    console.log('Data Imported...'.green.inverse);
    process.exit()
  } catch (err) {
    console.log(err)
  }
}


// Delete data

const deleteData = async() => {
  try {
    await Bootcamp.deleteMany();
    console.log("Data deleted....".red.inverse)
    process.exit()
  } catch (e) {
    console.log(err);
  }
}


// ARGV TO CHOOSE

if (process.argv[2] === '-import') {
  importData()
}else if (process.argv[2] === '-delete') {
  deleteData()
}else {
  console.log("arugument not valid || type -import or -delete")
  process.exit()
}
