import { gql } from 'apollo-server-micro'

const typeDefs = gql`
  # Products
  type Post {
    _id: ID
    title: String
    body: String
    draft: Boolean
    userId:String
    createdAt: String
    updatedAt: String
  }

  input PostInput {
    title: String
    body: String
    draft: Boolean
    userId: String
  }

  type Query {
    getPosts: [Post]
    getPost(id: ID!): Post
  }

  type Mutation {
    #Posts
    newPost(input: PostInput): Post
    updatePost(id: ID!, input: PostInput): Post
    deletePost(id: ID!): String
  }
`

module.exports = typeDefs