const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
  console.log('📁 Папка reports создана');
} else {
  console.log('📁 Папка reports уже существует');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false
}));


app.use('/reports', express.static(reportsDir));
app.use(express.static(path.join(__dirname, 'public')));
const csp = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'data:'", "'blob:'"],
  styleSrc: ["'self'", "'unsafe-inline'"]
};

app.use(require('helmet')({
  contentSecurityPolicy: { directives: csp }
}));

app.use(require('helmet')({
  contentSecurityPolicy: { directives: csp }
}));

console.log('🚀 Express и middleware инициализированы');


const isDev = process.env.NODE_ENV !== 'production';
const devCsp = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";
const prodCsp = "default-src 'self'; connect-src 'self' http://localhost:3000 ws://localhost:3000; style-src 'self' 'unsafe-inline'; script-src 'self';";
const cspHeader = isDev ? devCsp : prodCsp;

app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
});

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.removeHeader("Content-Security-Policy");
  res.setHeader("Content-Security-Policy", "default-src *; connect-src *; style-src * 'unsafe-inline'; script-src * 'unsafe-inline';");
  res.json({ status: "ok" });
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/worker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'worker.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('*', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', req.path);
  if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

function generateReport(filename, cashier, items) {
  const filePath = path.join(__dirname, 'reports', filename);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text('📦 Отчёт по поступлению товаров', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Дата формирования: ${new Date().toLocaleString()}`);
  doc.text(`Ответственный сотрудник: ${cashier}`);
  doc.moveDown();

  const tableTop = doc.y;
  doc.font('Helvetica-Bold');
  doc.text('Наименование', 40, tableTop);
  doc.text('Кол-во', 240, tableTop);
  doc.text('Цена', 300, tableTop);
  doc.text('Сумма', 380, tableTop);
  doc.font('Helvetica');

  let y = tableTop + 20;
  let total = 0;

  items.forEach((item, index) => {
    const name = item.name || 'Без названия';
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const sum = qty * price;
    total += sum;

    doc.text(`${index + 1}. ${name}`, 40, y, { width: 180 });
    doc.text(qty.toString(), 240, y);
    doc.text(price.toFixed(2), 300, y);
    doc.text(sum.toFixed(2), 380, y);
    y += 20;
  });

  doc.moveDown(2);
  doc.fontSize(13).font('Helvetica-Bold').text(`Итого: ${total.toFixed(2)} сом`, { align: 'right' });

  doc.moveDown(3);
  doc.fontSize(10).font('Helvetica-Oblique').text('Система учёта склада • Версия 1.0 • © 2025', { align: 'center' });

  doc.end();
  return `/reports/${filename}`;
}

app.get('/cashier', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'cashier') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'cashier.html'));
});


app.post('/login', async (req, res) => {
  try {
    console.log('📥 Login request body:', req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.warn('⚠️ Email или пароль не переданы');
      return res.status(400).json({ success: false, message: 'Email и пароль обязательны' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const rows = result.rows;
    console.log('🔍 Найденные пользователи:', rows);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Пользователь не найден' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    console.log('🔐 Пароль совпадает:', match);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Неверный пароль' });
    }

    req.session.user = { id: user.id, role: user.role };
    console.log('✅ Авторизация успешна:', req.session.user);

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});




app.get('/session', (req, res) => {
  if (!req.session?.user) return res.json({ success: false });
  res.json({ success: true, user: req.session.user });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get('/worker.html', requireRole(['worker']), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'worker.html'));
});

app.get('/admin/stats', async (req, res) => {
  try {
    const [users] = await db.query('SELECT COUNT(*) AS total FROM users');
    const [items] = await db.query('SELECT COUNT(*) AS total FROM inventory');
    const [sales] = await db.query('SELECT COUNT(*) AS total FROM sales WHERE DATE(created_at) = CURDATE()');
    const [notifications] = await db.query('SELECT COUNT(*) AS total FROM notifications');

    res.json({
      success: true,
      totalUsers: users[0].total,
      totalItems: items[0].total,
      salesToday: sales[0].total,
      notifications: notifications[0].total
    });
  } catch (err) {
    console.error('❌ Ошибка статистики:', err);
    res.status(500).json({ success: false });
  }
});

function requireRole(allowedRoles) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Нет доступа' });
    }
    next();
  };
}
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log('Регистрация:', req.body);

    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    const existing = result.rows;

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким именем или email уже существует'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
      [username, email, hashed, role || 'cashier']
    );

    res.json({ success: true, message: 'Регистрация успешна' });
  } catch (err) {
    console.error('❌ Ошибка при регистрации:', err);

    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Такой пользователь уже существует'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при регистрации'
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});


app.get('/api/inventory', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, qty, price FROM inventory');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении склада' });
  }
});

app.get('/inventory/items', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, quantity, price FROM inventory');
    res.json({ success: true, items: result.rows });
  } catch (err) {
    console.error('❌ Ошибка при получении инвентаря:', err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

app.get('/notifications', requireRole(['admin']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.id, n.type, n.message, n.created_at, u.username AS author
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC
       LIMIT 50`
    );
    res.json({ success: true, notifications: result.rows });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post('/inventory/update', requireRole(['admin','worker','cashier']), async (req, res) => {
  try {
    const { product_id, delta = 0, price } = req.body;
    if (!product_id) {
      return res.status(400).json({ success: false, message: 'product_id обязателен' });
    }

    if (typeof price === 'number') {
      await db.query(
        'UPDATE products SET quantity = quantity + $1, price = $2 WHERE id = $3',
        [delta, price, product_id]
      );
    } else {
      await db.query(
        'UPDATE products SET quantity = quantity + $1 WHERE id = $2',
        [delta, product_id]
      );
    }

    await db.query(
      'INSERT INTO notifications (message, user_id, type) VALUES ($1, $2, $3)',
      [
        `Пользователь ${req.session.user.username} обновил товар ID=${product_id} (изменение: ${delta}${price ? ', новая цена: ' + price : ''})`,
        req.session.user.id,
        'inventory'
      ]
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/inventory/report', requireRole(['worker']), async (req, res) => {
  try {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Пустой список items' });
    }
    let totalValue = 0;
    for (const item of items) {
      await db.query(
        'UPDATE products SET quantity = quantity + $1, price = $2 WHERE id = $3',
        [item.qty, item.price, item.product_id]
      );
      totalValue += item.qty * item.price;
    }
    await db.query(
      'INSERT INTO inventory_reports (worker, date, total_value) VALUES ($1, CURRENT_DATE, $2)',
      [req.session.user.username, totalValue]
    );
    res.json({ success: true, totalValue });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get('/inventory/search', async (req, res) => {
  try {
    const session = req.session.user;
    if (!session || !['admin', 'cashier'].includes(session.role)) {
      return res.status(403).json({ success: false, message: 'Нет доступа' });
    }
    const q = req.query.q || '';
    if (q.length < 1) {
      return res.json({ success: true, products: [] });
    }
    const result = await db.query(
      "SELECT id, name, price, quantity FROM products WHERE name ILIKE $1 ORDER BY name LIMIT 10",
      [`%${q}%`]
    );
    res.json({ success: true, products: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/inventory/add', async (req, res) => {
  try {
    const { name, qty, price } = req.body;

    await db.query(
      'INSERT INTO inventory (name, quantity, price) VALUES ($1, $2, $3)',
      [name, qty, price]
    );

    res.json({ success: true, message: '✅ Товар добавлен' });
  } catch (err) {
    console.error('❌ Ошибка при добавлении товара:', err);
    res.status(500).json({ success: false, message: 'Ошибка при добавлении товара' });
  }
});

app.post('/api/close-shift', async (req, res) => {
  try {
    const { cashier } = req.body;

    const result = await db.query('SELECT name, quantity, price FROM inventory');
    const items = result.rows;

    console.log('📦 Полученные items:', items);

    const filename = `supply_report_${Date.now()}.pdf`;

    let reportPath = '';
    try {
      reportPath = generateReport(filename, cashier, items);
    } catch (err) {
      console.error('❌ Ошибка внутри generateReport:', err);
      return res.status(500).json({ error: 'Ошибка генерации PDF' });
    }

    const total = items.reduce((sum, i) => {
      const qty = Number(i.quantity) || 0;
      const price = Number(i.price) || 0;
      return sum + qty * price;
    }, 0);

    await db.query('INSERT INTO reports (cashier, total, file) VALUES ($1, $2, $3)', [
      cashier,
      total,
      filename
    ]);
    res.json({ success: true, file: reportPath });
  } catch (err) {
    console.error('❌ Ошибка при формировании отчёта:', err.message, err.stack);
    res.status(500).json({ error: 'Ошибка при формировании отчёта' });
  }
});


app.post('/sales/sell', requireRole(['cashier']), async (req, res) => {
  try {
    const { product_id, qty } = req.body;
    const result = await db.query('SELECT quantity FROM products WHERE id = $1', [product_id]);
    const product = result.rows[0];
    if (!product || product.quantity < qty) {
      return res.json({ success: false, message: 'Недостаточно товара' });
    }
    await db.query('UPDATE products SET quantity = quantity - $1 WHERE id = $2', [qty, product_id]);
    res.json({ success: true, remaining: product.quantity - qty });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post('/sales/receipt', requireRole(['cashier']), async (req, res) => {
  const { items } = req.body;
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Список товаров пуст' });
    }
    const cashierId = req.session?.user?.id;
    const cashierName = req.session?.user?.username;
    if (!cashierId || !cashierName) {
      return res.status(403).json({ success: false, message: 'Нет доступа: кассир не авторизован' });
    }
    let total = 0;
    for (const item of items) {
      if (!item.id || !item.name || typeof item.qty !== 'number' || typeof item.price !== 'number') {
        return res.status(400).json({ success: false, message: 'Некорректные данные товара' });
      }
      await db.query(
        'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
        [item.qty, item.id]
      );
      total += item.qty * item.price;
    }
    const result = await db.query(
      'INSERT INTO cashier_reports (cashier_name, total, created_at) VALUES ($1, $2, NOW()) RETURNING id',
      [cashierName, total]
    );
    const reportId = result.rows[0].id;
    const filename = `report_${cashierName}_${Date.now()}.pdf`;
    const reportsDir = path.join(__dirname, 'public', 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const filepath = path.join(reportsDir, filename);
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream(filepath));
    doc.fontSize(18).text('Отчёт кассира', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Кассир: ${cashierName}`);
    doc.text(`Дата: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(12).text('Состав чека:');
    doc.moveDown(0.5);
    items.forEach(i => {
      doc.text(`${i.name} — ${i.qty} x ${i.price} = ${(i.qty * i.price).toFixed(2)}`);
    });
    doc.moveDown();
    doc.fontSize(14).text(`Итого: ${total.toFixed(2)}`, { align: 'right' });
    doc.end();

    await db.query(
      'UPDATE cashier_reports SET filename = $1 WHERE id = $2',
      [filename, reportId]
    );

    await db.query(
      'INSERT INTO notifications (type, message, user_id) VALUES ($1, $2, $3)',
      [
        'cashier_report',
        `Кассир ${cashierName} пробил чек на сумму ${total.toFixed(2)}`,
        cashierId
      ]
    );

    res.json({
      success: true,
      total,
      filename,
      fileUrl: `/reports/${filename}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

app.get('/notifications', requireRole(['admin']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.id, n.type, n.message, n.created_at, u.username AS author
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC
       LIMIT 50`
    );
    res.json({ success: true, notifications: result.rows });
  } catch {
    res.status(500).json({ success: false });
  }
});
app.post('/reports/close-shift', closeDayHandler);
app.post('/reports/close-day', closeDayHandler);

async function closeDayHandler(req, res) {
  try {
    const result = await db.query(`
      SELECT SUM(total) as total, COUNT(*) as count 
      FROM cashier_reports 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    const total = result.rows[0].total || 0;
    const count = result.rows[0].count || 0;

    const filename = `day_report_${Date.now()}.pdf`;
    const fileUrl = generateReport(filename, req.session.user.username, [], total);

    await db.query(
      'INSERT INTO notifications (message, user_id, url, type) VALUES ($1, $2, $3, $4)',
      [
        `Кассир закрыл рабочий день. Чеков: ${count}, сумма: ${total}`,
        req.session.user.id,
        fileUrl,
        'report'
      ]
    );

    res.json({ success: true, total, count, fileUrl });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
}

app.get('/reports/daily', requireRole(['cashier']), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM sales_reports WHERE cashier = $1 ORDER BY date DESC',
      [req.session.user.username]
    );
    res.json({ success: true, reports: result.rows });
  } catch {
    res.status(500).json({ success: false });
  }
});



app.get('/admin/users', requireRole(['admin']), async (req, res) => {
  const result = await db.query('SELECT id, username, email, role FROM users ORDER BY id DESC');
  res.json({ success: true, users: result.rows });
});

app.post('/admin/users/delete', requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Не передан ID пользователя' });
    }

    const result = await db.query('DELETE FROM users WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка при удалении пользователя:', err);
    res.status(500).json({ success: false, message: 'Ошибка сервера при удалении' });
  }
});

app.get('/dashboard/stats', async (req, res) => {
  try {
    const resultP = await db.query('SELECT COUNT(*) AS products FROM products');
    const resultS = await db.query('SELECT COUNT(*) AS sales FROM sales_reports');
    const resultR = await db.query('SELECT COUNT(*) AS reports FROM inventory_reports');
    res.json({
      success: true,
      products: resultP.rows[0].products,
      sales: resultS.rows[0].sales,
      reports: resultR.rows[0].reports
    });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get('/reports/sales', requireRole(['admin']), async (req, res) => {
  const result = await db.query('SELECT * FROM sales_reports ORDER BY date DESC');
  res.json(result.rows);
});

app.get('/reports/inventory', requireRole(['admin']), async (req, res) => {
  const result = await db.query('SELECT * FROM inventory_reports ORDER BY date DESC');
  res.json(result.rows);
});

app.get('/reports/list', requireRole(['admin']), async (req, res) => {
  const date = req.query.date || null;
  let sql = 'SELECT id, cashier_name AS cashier, total, filename, created_at FROM cashier_reports';
  const params = [];
  if (date) {
    sql += ' WHERE DATE(created_at) = $1';
    params.push(date);
  }
  sql += ' ORDER BY created_at DESC';
  const result = await db.query(sql, params);
  const reports = result.rows.map(r => ({
    date: r.created_at?.toISOString ? r.created_at.toISOString().slice(0, 10) : r.created_at,
    cashier: r.cashier,
    total: Number(r.total || 0),
    filename: r.filename
  }));
  res.json({ success: true, reports });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
const initDatabase = require('./init-db');
initDatabase(pool);


app.get('/init-db', async (req, res) => {
  console.log('📡 /init-db маршрут вызван');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        quantity INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL
      );
    `);

    res.send('✅ Все таблицы созданы');
  } catch (err) {
    console.error('❌ Ошибка при создании таблиц:', err);
    res.status(500).send('Ошибка');
  }
});
const db = require('./init-db');




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
