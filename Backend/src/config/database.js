const config = require('./index');

const databaseConfig = {
  development: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
    dialect: 'postgres',
    logging: config.server.env === 'development' ? console.log : false,
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: 30000,
      idle: 10000
    }
  },
  
  test: {
    host: config.database.host,
    port: config.database.port,
    database: `${config.database.name}_test`,
    username: config.database.user,
    password: config.database.password,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 10000
    }
  },
  
  production: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
    dialect: 'postgres',
    logging: false,
    ssl: config.database.ssl,
    dialectOptions: config.database.ssl ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: 30000,
      idle: 10000
    }
  }
};

module.exports = databaseConfig;