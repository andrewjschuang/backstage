const configGraphQL = {
  local_url: process.env.LOCAL_URL || 'https://dossi.ima.sp.gov.br',
 /* local_url: process.env.LOCAL_URL || 'http://localhost',*/
  local_port: process.env.LOCAL_PORT || '443',
  auth_internal_url: process.env.AUTH_INTERNAL_URL || 'http://auth',
  auth_internal_port: process.env.AUTH_INTERNAL_PORT || '5000',
};
const config = {
  port: process.env.PORT || 3005,
  postgres_user: process.env.POSTGRES_USER || 'postgres',
  postgres_host: process.env.POSTGRES_HOST || 'postgres',
  postgres_database: process.env.POSTGRES_DATABASE || 'dojot_devm',
  postgres_password: process.env.POSTGRES_PASSWORD || 'postgres',
  postgres_port: process.env.POSTGRES_PORT || 5432,
  base_local_url_graphql: `${configGraphQL.local_url}:${configGraphQL.local_port}`,
  base_auth_url_graphql: `${configGraphQL.auth_internal_url}:${configGraphQL.auth_internal_port}`,
};

module.exports = config;
