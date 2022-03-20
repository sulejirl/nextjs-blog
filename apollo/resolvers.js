const Post = require('../db/models/posts')
const ObjectId = require('mongodb').ObjectId

const resolvers = {
  Query: {
    // posts
    getPosts: async () => {
      try {
        const posts = await Post.find({})

        return posts
      } catch (err) {
        console.log(err)
      }
    },
    getPost: async (_, { id }) => {
      const post = await Post.findById(id)

      if (!post) {
        throw new Error('Post not found')
      }

      return post
    },
    getPostByUserId: async (_, { userId }) => {
      try {
        const posts = await Post.find({userId})

        return posts
      } catch (err) {
        console.log(err)
      }
    },
  },

  Mutation: {
    // products
    newPost: async (_, { input }) => {
      try {
        const post = new Post(input)

        const result = await post.save()

        return result
      } catch (err) {
        console.log(err)
      }
    },
    updatePost: async (_, { id, input }) => {
      let post = await Post.findById(id)

      if (!post) {
        throw new Error('Product not found')
      }

      post = await Post.findOneAndUpdate({ _id: ObjectId(id) }, input, {
        new: true,
      })

      return post
    },
    deletePost: async (_, { id }) => {
      const post = await Post.findById(id)

      if (!post) {
        throw new Error('Producto no encontrado')
      }

      await Post.findOneAndDelete({ _id: id })

      return 'Producto eliminado'
    },
  },
}

module.exports = resolvers
