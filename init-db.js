const pool = require('./db')
module.exports = async function initDatabase(pool) {
  try {
    // Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'cashier'
      )
    `);

    // Clients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        segment TEXT,
        bonus INTEGER DEFAULT 0,
        purchases INTEGER DEFAULT 0
      )
    `);

    // Products
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        quantity INTEGER DEFAULT 0,
        price NUMERIC(10,2) DEFAULT 0.00
      )
    `);

    // Inventory
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        quantity INTEGER DEFAULT 0,
        price NUMERIC(10,2) DEFAULT 0.00
      )
    `);

    // Inventory reports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.inventory_reports (
        id SERIAL PRIMARY KEY,
        worker VARCHAR(50),
        date DATE DEFAULT CURRENT_DATE,
        total_value NUMERIC(10,2)
      )
    `);

    // Cashier reports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.cashier_reports (
        id SERIAL PRIMARY KEY,
        cashier_name VARCHAR(50),
        total NUMERIC(10,2),
        filename TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sales reports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.sales_reports (
        id SERIAL PRIMARY KEY,
        cashier VARCHAR(50),
        date DATE DEFAULT CURRENT_DATE,
        total NUMERIC(10,2)
      )
    `);

    // Sales
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES public.products(id),
        qty INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50),
        message TEXT,
        user_id INTEGER REFERENCES public.users(id),
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.reports (
        id SERIAL PRIMARY KEY,
        cashier VARCHAR(50),
        total NUMERIC(10,2),
        file TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.sessions (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_sessions_expire ON public.sessions (expire)
    `);

    console.log('✅ Все таблицы проверены/созданы');
  } catch (err) {
    console.error('❌ Ошибка при создании таблиц:', err);
  }
};
