const express = require('express');
const router = express.Router();
const { pool } = require('../server');

router.get('/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const result = await pool.query(
      'SELECT id, name, price, quantity FROM products WHERE LOWER(name) LIKE LOWER($1)',
      [`%${q}%`]
    );
    res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error('❌ Ошибка поиска товара:', err);
    res.json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;
