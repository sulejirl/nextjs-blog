import { join } from 'path'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs,mergeResolvers } from '@graphql-tools/merge'

let typeDefs = [];
let resolvers = [];

const typeDefsArray = loadFilesSync(join(process.cwd(), 'apollo/graph/**/*.graphql'), { recursive: true })
const resolverArray = loadFilesSync(join(process.cwd(), 'apollo/graph/**/*.resolvers.*'), { recursive: true })

typeDefs = mergeTypeDefs(typeDefsArray)
resolvers = mergeResolvers(resolverArray)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
module.exports = {schema,typeDefs,resolvers} 