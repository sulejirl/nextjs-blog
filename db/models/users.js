const mongoose = require('mongoose')

const { Schema } = mongoose

mongoose.Promise = global.Promise

const UserSchema = new Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  roles: {
    type: [String],
  },

},{timestamps:true})

UserSchema.index({ username: 'text' })

module.exports = mongoose.models.User || mongoose.model('User', UserSchema)