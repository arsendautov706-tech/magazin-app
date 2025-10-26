const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => {
    console.log('✅ Подключение к PostgreSQL успешно');
    // 👉 фиксируем схему сразу после подключения
    pool.query('SET search_path TO public');
  })
  .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err));

module.exports = pool;

pool.on('connect', client => {
  client.on('notice', msg => console.log('⚠️ notice:', msg));
});

// 👉 логируем все SQL-запросы
const origQuery = pool.query;
pool.query = (...args) => {
  console.log("📌 Executing SQL:", args[0]);
  if (args[1]) console.log("   with params:", args[1]);
  return origQuery.apply(pool, args);
};
