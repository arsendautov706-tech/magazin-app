const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
module.exports = db;



async function init() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'cashier'
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        quantity INTEGER DEFAULT 0,
        price NUMERIC(10,2) DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        quantity INTEGER DEFAULT 0,
        price NUMERIC(10,2) DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS inventory_reports (
        id SERIAL PRIMARY KEY,
        worker VARCHAR(50),
        date DATE DEFAULT CURRENT_DATE,
        total_value NUMERIC(10,2)
      );

      CREATE TABLE IF NOT EXISTS cashier_reports (
        id SERIAL PRIMARY KEY,
        cashier_name VARCHAR(50),
        total NUMERIC(10,2),
        filename TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales_reports (
        id SERIAL PRIMARY KEY,
        cashier VARCHAR(50),
        date DATE DEFAULT CURRENT_DATE,
        total NUMERIC(10,2)
      );

      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        qty INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50),
        message TEXT,
        user_id INTEGER REFERENCES users(id),
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        cashier VARCHAR(50),
        total NUMERIC(10,2),
        file TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Все таблицы созданы');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при создании таблиц:', err);
    process.exit(1);
  }
}

module.exports = async function initDatabase(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS ...`);
};


init();
