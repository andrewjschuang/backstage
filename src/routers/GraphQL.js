const { Router } = require('express');
const expressGraphQL = require('express-graphql');
const { schemaLogin, schemaPermission } = require('../graphql/auth/Schema');
const rootSchema = require('../graphql/Schema');

const router = Router();

/**
 * Create endpoint for login,
 * This end point not need a jwt token,  that is config in kong
 */
router.use('/graphql/auth/', expressGraphQL({
  schema: schemaLogin,
  graphiql: true, // graphql interface
}));

/**
 * Create endpoint for permissions
 */
router.use('/graphql/permissions', expressGraphQL({
  schema: schemaPermission,
  graphiql: true, // graphql interface
}));

/**
 * Create endpoint for  geral
 */
router.use('/graphql/', expressGraphQL({
  schema: rootSchema,
  graphiql: true, // graphql interface
}));


module.exports = router;
