import { ApolloServer } from 'apollo-server-micro'
import connectDb from '../../db/config/mongodb'
import {typeDefs,resolvers} from '../../apollo/schema'

connectDb()

export const config = {
  api: {
    bodyParser: false,
  },
}
console.log('API',typeDefs,resolvers)
let startServer = null;
let apolloServer = null;
if(Object.keys(resolvers).length > 0){

  apolloServer = new ApolloServer({ typeDefs, resolvers })
  startServer = apolloServer.start()
}


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
    if(startServer) {
      await startServer
      await apolloServer.createHandler({
        path: '/api/graphql',
      })(req, res)
    }
}