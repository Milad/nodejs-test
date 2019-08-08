require('dotenv').config()

const database = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4_general_ci',
    dateStrings: true
  },
  logging: null,
  timezone: 'UTC',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    timestamps: true
  },
  seederStorage: 'sequelize',
  migrationStorageTableName: 'sequelize_meta',
  seederStorageTableName: 'sequelize_data'
}

module.exports = {
  development: database,
  test: database,
  production: database
}
