import mongoose from 'mongoose'

const { Schema } = mongoose

mongoose.Promise = global.Promise

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
},{timestamps:true})

PostSchema.index({ name: 'text' })

module.exports =
  mongoose.models.Post || mongoose.model('Post', PostSchema)