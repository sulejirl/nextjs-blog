const User = require('../../../db/models/users.js')
const ObjectId = require('mongodb').ObjectId

const resolvers = {
  Query: {
    // posts
    getUsers: async () => {
      try {
        const users = await User.find({})

        return users
      } catch (err) {
        console.log(err)
      }
    },
    getUser: async (_, { id }) => {
      const user = await User.findById(id)

      if (!user) {
        throw new Error('Post not found')
      }

      return user
    },
  },

  Mutation: {
    // products
    newUser: async (_, { input }) => {
      console.log(input)
      try {
        const user = new User(input)

        const result = await user.save()

        return result
      } catch (err) {
        console.log(err)
      }
    },
    updateUser: async (_, { id, input }) => {
      let user = await User.findById(id)

      if (!user) {
        throw new Error('Product not found')
      }

      user = await User.findOneAndUpdate({ _id: ObjectId(id) }, input, {
        new: true,
      })

      return user
    },
    deletePost: async (_, { id }) => {
      const user = await User.findById(id)

      if (!user) {
        throw new Error('Producto no encontrado')
      }

      await User.findOneAndDelete({ _id: id })

      return 'Producto eliminado'
    },
  },
}

module.exports = resolvers
