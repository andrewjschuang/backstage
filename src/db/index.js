const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  user: config.postgres_user,
  host: config.postgres_host,
  database: config.postgres_database,
  password: config.postgres_password,
  port: config.postgres_port,
});

module.exports = pool;
