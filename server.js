const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/reports', express.static(reportsDir));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false
}));

const isDev = process.env.NODE_ENV !== 'production';
const devCsp = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";
const prodCsp = "default-src 'self'; connect-src 'self' http://localhost:3000 ws://localhost:3000; style-src 'self' 'unsafe-inline'; script-src 'self';";
const cspHeader = isDev ? devCsp : prodCsp;

app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
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

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'KARAKOL2025%',
  database: 'SHOPDB'
});

function generateReport(filename, cashier, items) {
  const filePath = path.join(__dirname, 'reports', filename);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(20).text('Отчёт по завозу', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Работник склада: ${cashier}`);
  doc.text(`Дата: ${new Date().toLocaleString()}`);
  doc.moveDown(2);
  const tableTop = doc.y;
  doc.fontSize(12).text('Товар', 40, tableTop);
  doc.text('Кол-во', 240, tableTop);
  doc.text('Цена', 320, tableTop);
  doc.text('Сумма', 400, tableTop);
  let y = tableTop + 20;
  let total = 0;
  items.forEach(item => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const sum = qty * price;
    total += sum;
    doc.text(item.name, 40, y, { width: 180 });
    doc.text(qty.toString(), 240, y);
    doc.text(price.toFixed(2), 320, y);
    doc.text(sum.toFixed(2), 400, y);
    y += 20;
  });
  doc.moveDown(2);
  doc.fontSize(14).text(`Итого: ${total.toFixed(2)} сом`, { align: 'right' });
  doc.moveDown(3);
  doc.fontSize(10).text('Система учёта v1.0 © 2025', { align: 'center' });
  doc.end();
  return `/reports/${filename}`;
}

module.exports = generateReport;

app.get('/cashier', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'cashier') {
    return res.redirect('/login.html'); // защита: неавторизованных и не кассиров отправляем на логин
  }
  res.sendFile(path.join(__dirname, 'public', 'cashier.html'));
});




app.post('/login', async (req, res) => {
  const { email, username, password } = req.body;
  const loginField = email || username;

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [loginField, loginField]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Неверный логин или пароль' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: 'Неверный логин или пароль' });
    }

    req.session.user = { id: user.id, username: user.username, role: user.role };

    res.json({ success: true, user: { role: user.role } });
  } catch (err) {
    console.error('Ошибка входа:', err);
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
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.json({ success: false, message: 'Все поля обязательны' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.json({ success: false, message: 'Email уже зарегистрирован' });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hash, role]
    );

    res.json({ success: true, message: '✅ Пользователь зарегистрирован' });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.json({ success: false, message: 'Ошибка при регистрации' });
  }
});


app.get('/admin/home.html', requireRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'home.html'));
});
app.get('/cashier.html', requireRole(['cashier']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cashier.html'));
});
app.get('/products.html', requireRole(['worker', 'admin']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'products.html'));
});
app.get('/admin_reports.html', requireRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin_reports.html'));
});

app.get('/inventory/items', requireRole(['admin','worker','cashier']), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, quantity, price, sku FROM products ORDER BY name ASC'
    );
    res.json({ success: true, items: rows });
  } catch {
    res.status(500).json({ success: false });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, email, role FROM users');

    res.json(rows);
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


// Получить список товаров на складе
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, qty, price FROM inventory');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении склада' });
  }
});



// 🔹 Получить уведомления
app.get('/notifications', requireRole(['admin']), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT n.id, n.type, n.message, n.created_at, u.username AS author
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC
       LIMIT 50`
    );
    res.json({ success: true, notifications: rows });
  } catch {
    res.status(500).json({ success: false });
  }
});

// 🔹 Обновить товар
app.post('/inventory/update', requireRole(['admin','worker','cashier']), async (req, res) => {
  try {
    const { product_id, delta = 0, price } = req.body;
    if (!product_id) {
      return res.status(400).json({ success: false, message: 'product_id обязателен' });
    }

    if (typeof price === 'number') {
      await db.query(
        'UPDATE products SET quantity = quantity + ?, price = ? WHERE id = ?',
        [delta, price, product_id]
      );
    } else {
      await db.query(
        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
        [delta, product_id]
      );
    }

    await db.query(
      'INSERT INTO notifications (message, user_id, type) VALUES (?, ?, ?)',
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
        'UPDATE products SET quantity = quantity + ?, price = ? WHERE id = ?',
        [item.qty, item.price, item.product_id]
      );
      totalValue += item.qty * item.price;
    }
    await db.query(
      'INSERT INTO inventory_reports (worker, date, total_value) VALUES (?, CURDATE(), ?)',
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
    const [rows] = await db.query(
      "SELECT id, name, price, quantity FROM products WHERE name LIKE ? ORDER BY name LIMIT 10",
      [`%${q}%`]
    );
    res.json({ success: true, products: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Добавление товара
app.post('/api/inventory/add', async (req, res) => {
  try {
    const { name, qty, price } = req.body;
    await db.query('INSERT INTO inventory (name, qty, price) VALUES (?, ?, ?)', [name, qty, price]);
    res.json({ success: true, message: 'Товар добавлен' });
  } catch (err) {
    console.error('Ошибка при добавлении товара:', err);
    res.status(500).json({ error: 'Ошибка при добавлении товара' });
  }
});

// Закрытие смены склада (отчёт по завозу)
app.post('/api/close-shift', async (req, res) => {
  try {
    const { cashier } = req.body;
    const [items] = await db.query('SELECT name, qty, price FROM inventory WHERE soft_deleted = 0');
    const filename = `supply_report_${Date.now()}.pdf`;
    const reportPath = generateReport(filename, cashier, items);

    await db.query('INSERT INTO reports (cashier, total, file) VALUES (?, ?, ?)', [
      cashier,
      items.reduce((sum, i) => sum + i.qty * i.price, 0),
      filename
    ]);

    res.json({ success: true, file: reportPath });
  } catch (err) {
    console.error('Ошибка при формировании отчёта:', err);
    res.status(500).json({ error: 'Ошибка при формировании отчёта' });
  }
});



app.post('/sales/sell', requireRole(['cashier']), async (req, res) => {
  try {
    const { product_id, qty } = req.body;
    const [[product]] = await db.query('SELECT quantity FROM products WHERE id = ?', [product_id]);
    if (!product || product.quantity < qty) {
      return res.json({ success: false, message: 'Недостаточно товара' });
    }
    await db.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [qty, product_id]);
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
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.qty, item.id]
      );
      total += item.qty * item.price;
    }
    const [result] = await db.query(
      'INSERT INTO cashier_reports (cashier_name, total, created_at) VALUES (?, ?, NOW())',
      [cashierName, total]
    );
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
      'UPDATE cashier_reports SET filename = ? WHERE id = ?',
      [filename, result.insertId]
    );

    await db.query(
      'INSERT INTO notifications (type, message, user_id) VALUES (?, ?, ?)',
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
    const [rows] = await db.query(
      `SELECT n.id, n.type, n.message, n.created_at, u.username AS author
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC
       LIMIT 50`
    );
    res.json({ success: true, notifications: rows });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post('/reports/close-shift', closeDayHandler);
app.post('/reports/close-day', closeDayHandler);

async function closeDayHandler(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT SUM(total) as total, COUNT(*) as count 
      FROM cashier_reports 
      WHERE DATE(created_at) = CURDATE()
    `);

    const total = rows[0].total || 0;
    const count = rows[0].count || 0;

    // имя файла и путь
    const filename = `day_report_${Date.now()}.pdf`;
    const fileUrl = generateReport(filename, req.session.user.username, [], total);

    await db.query(
      'INSERT INTO notifications (message, user_id, url, type) VALUES (?, ?, ?, ?)',
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
    const [rows] = await db.query(
      'SELECT * FROM sales_reports WHERE cashier = ? ORDER BY date DESC',
      [req.session.user.username]
    );
    res.json({ success: true, reports: rows });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get('/admin/users', requireRole(['admin']), async (req, res) => {
  const [rows] = await db.query('SELECT id, username, email, role FROM users ORDER BY id DESC');
  res.json({ success: true, users: rows });
});

app.post('/admin/users/delete', requireRole(['admin']), async (req, res) => {
  const { userId } = req.body;
  await db.query('DELETE FROM users WHERE id = ?', [userId]);
  res.json({ success: true });
});

app.get('/dashboard/stats', async (req, res) => {
  try {
    const [[p]] = await db.query('SELECT COUNT(*) AS products FROM products');
    const [[s]] = await db.query('SELECT COUNT(*) AS sales FROM sales_reports');
    const [[r]] = await db.query('SELECT COUNT(*) AS reports FROM inventory_reports');
    res.json({ success: true, products: p.products, sales: s.sales, reports: r.reports });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get('/reports/sales', requireRole(['admin']), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM sales_reports ORDER BY date DESC');
  res.json(rows);
});

app.get('/reports/inventory', requireRole(['admin']), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM inventory_reports ORDER BY date DESC');
  res.json(rows);
});

app.get('/reports/list', requireRole(['admin']), async (req, res) => {
  const date = req.query.date || null;
  let sql = 'SELECT id, cashier_name AS cashier, total, filename, created_at FROM cashier_reports';
  const params = [];
  if (date) {
    sql += ' WHERE DATE(created_at) = ?';
    params.push(date);
  }
  sql += ' ORDER BY created_at DESC';
  const [rows] = await db.query(sql, params);
  const reports = rows.map(r => ({
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
