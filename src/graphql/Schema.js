const { makeExecutableSchema } = require('graphql-tools');
const { merge } = require('lodash');
const devicesTypeDefs = require('./devices/TypeDefs');
const devicesResolvers = require('./devices/Resolvers');
const weatherTypeDefs = require('./rain/TypeDefs');
const weatherResolvers = require('./rain/Resolvers');

const query = [`
type Query {
   #Get a template by Id
    history(ids: [String]!, qty: Int): [Device]
    rain(id: String!, initial: String, final: String): Weather
  }
`];
// Put schema together into one array of schema strings
// and one map of resolvers, like makeExecutableSchema expects
const typeDefs = [...query, ...devicesTypeDefs, ...weatherTypeDefs];
const resolvers = merge(devicesResolvers, weatherResolvers);

const executableSchema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = executableSchema;
