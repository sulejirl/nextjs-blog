import mongoose from 'mongoose'

const { Schema } = mongoose

mongoose.Promise = global.Promise

const PostSchema = new Schema({
  title: {
    type: String,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  draft: {
    type: Boolean,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    trim: true,
  },
},{timestamps:true})

PostSchema.index({ title: 'text' })

module.exports =
  mongoose.models.Post || mongoose.model('Post', PostSchema)