const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('✅ Подключение к PostgreSQL успешно'))
  .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err));

module.exports = pool;
