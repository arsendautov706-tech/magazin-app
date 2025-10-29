const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

pool.connect()
  .then(client => {
    console.log('✅ Подключение к PostgreSQL успешно')
    return client.query('SET search_path TO public')
      .finally(() => client.release())
  })
  .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err))

pool.on('connect', client => {
  client.on('notice', msg => console.log('⚠️ notice:', msg))
})

const origQuery = pool.query.bind(pool)
pool.query = (...args) => {
  console.log("📌 Executing SQL:", args[0])
  if (args[1]) console.log("   with params:", args[1])
  return origQuery(...args)
}

module.exports = pool
