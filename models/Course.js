const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);


const CourseSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        required: [true, 'Please add course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tution cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced' ]
    },
    scholarhipsAvailable: {
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
      },
      user: {
        type: mongoose.Schema.ObjectId,
        tref: 'User',
        required: true
      }
     
});

CourseSchema.statics.getAverageCost = async function(bootcampId) {
    console.log(this)
    const obj = await this.aggregate([
      {
        $match: { bootcamp: bootcampId }
      },
      {
        $group: {
          _id: '$bootcamp',
          averageCost: { $avg: '$tuition' }
        }
      }
    ]);
  console.log(obj)
  try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
          averageCost: Math.ceil(obj[0].averageCost / 10) * 10
      })
  } catch (error) {
      console.log(err);
  }
  
  };
  
  // Call getAverageCost after save
  CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp._id);
  });
  
  // Call getAverageCost before remove
  CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp);
  });

module.exports = mongoose.model('Course', CourseSchema)