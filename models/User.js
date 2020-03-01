const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email address']
      },
      role: {
          type: String,
          enum: ['user', 'publisher'],
          default: 'user'
      },
      password: {
          type: String,
          required: [true, 'Please add a password'],
          select: false,
          minlength: [6, "minimum 6 required for password"]
      },
      resetPasswordToken: String,
      resetPasswordExpire: Date,
      createdAt: {
          type: Date,
          default: Date.now
      }
})

// Encrypt Password using BCRYPT

UserSchema.pre('save', async function(next){
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hashSync(this.password, salt); 
});

// Sign JWT and RETURN
// Two type of    METHODS && STATICS
// STATICS = called in  the model itself
// METHODS = what we initialize from the model || Get from the model
UserSchema.methods.signedJwtToken = function () {
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    })
}
// Match User entered Password to hashed password 
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
module.exports = mongoose.model('User', UserSchema);