import { ApolloServer } from 'apollo-server-micro'
import typeDefs from '../../apollo/schema'
import resolvers from '../../apollo/resolvers'
import connectDb from '../../db/config/mongodb'

connectDb()

export const config = {
  api: {
    bodyParser: false,
  },
}

const apolloServer = new ApolloServer({ typeDefs, resolvers })

const startServer = apolloServer.start()

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader(
      'Access-Control-Allow-Origin',
      'https://studio.apollographql.com'
    )
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )
    if (req.method === 'OPTIONS') {
      res.end()
      return false
    }
  
    await startServer
    await apolloServer.createHandler({
      path: '/api/graphql',
    })(req, res)
  }