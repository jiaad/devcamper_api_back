const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('./../utils/geocoder')
const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  slug: String,

  description: {
    type: String,
    minlength: [50, 'Please enter more than 50 characters'],
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [500, "Description cannot contain more than 500 charcaters"],
    uppercase: true,
  },

  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please use a valid URL with HTTP or HTTPS']
  },

  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },

  email: {
    type: String,
    match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email address']
  },

  address: {
    type: String,
    required: [true, 'Please add an address']
  },

  location: {
    // GeoJSON Point
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      // required: true
    },
    coordinates: {
      type: [Number],
      //required: true,
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String

  },

  careers: {
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },

  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot be more than 10']
  },

  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },

  housing: {
    type: Boolean,
    default: false
  },

  jobAssistance: {
    type: Boolean,
    default: false
  },

  acceptGi: {
    type: Boolean,
    default: false
  },
  user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

},
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
}
);

// Create Bootcamp slug form the name

BootcampSchema.pre('save', function (next) {
  console.log('Slugify ran : ', this.name.split(' ').join('-'))
  this.slug = slugify(this.name, { lower: true })//this.name.split(' ').join('-')
  next()
})

BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address)
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }

  // console.log(loc)
  // DO NOT SAVE ADDRESS IN DB
  this.address = undefined
  next();
})


// Cascade delete courses xhen a bootcamp is deleted

BootcampSchema.pre('remove', async function(next){
  await this.model('Course').deleteMany({bootcamp: this._id})
  console.log("courses being removed from bootcamp : ", this._id);
  
  next()
})



// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField:'bootcamp',
  justOne: false
})


module.exports = mongoose.model('Bootcamp', BootcampSchema);
