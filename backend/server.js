const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads-kinderfun');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Database connection pool with graceful fallback to in-memory store if DB is unreachable
let dbPool = null;
let useInMemory = false;

try {
  dbPool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'kinderfun_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true // Prevents MySQL DATE types from serializing into UTC ISO timestamps
  });
} catch (err) {
  console.log('MySQL Connection initialization warning:', err.message);
  useInMemory = true;
}

// In-Memory fallback storage for instant local demo without live MySQL setup requirement
const memoryStore = {
  users: [
    { id: 1, name: 'Admin Kinderfun', email: 'admin@kinderfun.com', role: 'admin', phone: '082188886358' },
    { id: 2, name: 'Staff Kasir 1', email: 'kasir1@kinderfun.com', role: 'staff', phone: '081234567890' },
    { id: 3, name: 'Staff Operator 2', email: 'staff2@kinderfun.com', role: 'staff', phone: '081298765432' }
  ],
  customers: [
    { id: 1, parent_name: 'Bunda Ani', child_name: 'Rizky', phone: '081311112222', email: 'ani@gmail.com', points_balance: 40, is_member: 1, created_at: new Date() },
    { id: 2, parent_name: 'Ayah Budi', child_name: 'Kiki', phone: '081333334444', email: 'budi@gmail.com', points_balance: 20, is_member: 0, created_at: new Date() },
    { id: 3, parent_name: 'Mama Citra', child_name: 'Nala & Al', phone: '081555556666', email: 'citra@gmail.com', points_balance: 70, is_member: 1, created_at: new Date() }
  ],
  packages: [
    { id: 1, name: '1 Jam', duration_hours: 1, is_member_package: 0, visits_count: 1, validity_months: 0, weekday_price: 30000, weekend_price: 40000, best_value: 0 },
    { id: 2, name: '2 Jam', duration_hours: 2, is_member_package: 0, visits_count: 1, validity_months: 0, weekday_price: 50000, weekend_price: 70000, best_value: 0 },
    { id: 3, name: '3 Jam', duration_hours: 3, is_member_package: 0, visits_count: 1, validity_months: 0, weekday_price: 70000, weekend_price: 90000, best_value: 1 },
    { id: 4, name: 'Member Package', duration_hours: 0, is_member_package: 1, visits_count: 10, validity_months: 3, weekday_price: 250000, weekend_price: 350000, best_value: 0 }
  ],
  transactions: [
    { id: 1, trx_code: 'TRX-20260724-001', customer_id: 1, customer_name: 'Bunda Ani (Rizky)', package_id: 3, package_name: '3 Jam', amount: 70000, is_weekend: 0, points_earned: 10, payment_method: 'qris', created_at: new Date(Date.now() - 86400000 * 2) },
    { id: 2, trx_code: 'TRX-20260724-002', customer_id: 2, customer_name: 'Ayah Budi (Kiki)', package_id: 2, package_name: '2 Jam', amount: 70000, is_weekend: 1, points_earned: 10, payment_method: 'cash', created_at: new Date(Date.now() - 86400000) },
    { id: 3, trx_code: 'TRX-20260724-003', customer_id: 3, customer_name: 'Mama Citra (Nala & Al)', package_id: 4, package_name: 'Member Package', amount: 250000, is_weekend: 0, points_earned: 10, payment_method: 'qris', created_at: new Date() }
  ],
  souvenirs: [
    { id: 1, name: 'Tote Bag Kinderfun', point_cost: 10, stock: 50, description: 'Kanvas spunbond ramah lingkungan bermotif Maskot Kinderfun', image_url: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400' },
    { id: 2, name: 'Botol Minum Fun Tumbler', point_cost: 20, stock: 30, description: 'Tumbler air minum anak BPA-Free 500ml', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400' },
    { id: 3, name: 'Topi Kinderfun Play', point_cost: 15, stock: 25, description: 'Topi anak warna-warni lucu bordir Kinderfun', image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400' },
    { id: 4, name: 'Boneka Mascot Red Ant', point_cost: 30, stock: 15, description: 'Boneka mewah plushie semut merah ikonik Kinderfun', image_url: 'https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=400' }
  ],
  redemptions: [
    { id: 1, redemption_code: 'RDM-20260724-001', customer_id: 3, customer_name: 'Mama Citra', souvenir_id: 1, souvenir_name: 'Tote Bag Kinderfun', points_spent: 10, qty: 1, created_at: new Date(Date.now() - 86400000) }
  ],
  attendance: [
    { id: 1, user_id: 2, staff_name: 'Staff Kasir 1', attendance_date: new Date().toISOString().split('T')[0], check_in_time: '08:45:00', check_out_time: '17:00:00', status: 'present', notes: 'Tepat waktu' },
    { id: 2, user_id: 3, staff_name: 'Staff Operator 2', attendance_date: new Date().toISOString().split('T')[0], check_in_time: '09:12:00', check_out_time: '17:05:00', status: 'late', notes: 'Terlambat 12 menit' }
  ],
  expenses: [
    { id: 1, title: 'Pembelian Disinfektan & Pembersih Mainan', category: 'Kebersihan', amount: 150000, expense_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], description: 'Stok pembersih bulanan tempat mainan' },
    { id: 2, title: 'Pembayaran Listrik & WiFi', category: 'Utilitas', amount: 650000, expense_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], description: 'Tagihan bulanan arena playground' }
  ]
};

// Helper pagination parser
function getPaginationParams(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;
  const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
  return { page, limit, offset, search };
}

// Check MySQL connection on startup
async function initDb() {
  if (dbPool) {
    try {
      const conn = await dbPool.getConnection();
      console.log('✅ Connected to MySQL database successfully!');
      conn.release();
    } catch (err) {
      console.log('⚠️ MySQL connection unavailable, using fallback in-memory store for instant preview:', err.message);
      useInMemory = true;
    }
  }
}
initDb();

// --- ROUTES ---

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (useInMemory) {
    const user = memoryStore.users.find(u => u.email === email);
    if (user && (password === 'admin123' || password === 'staff123')) {
      return res.json({
        success: true,
        data: { token: 'mock-jwt-token-' + user.id, user }
      });
    }
    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  }

  try {
    const [rows] = await dbPool.query('SELECT id, name, email, role, phone FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      return res.json({
        success: true,
        data: { token: 'jwt-token-' + rows[0].id, user: rows[0] }
      });
    }
    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Users / Staff Management endpoints
app.get('/api/users', async (req, res) => {
  const { page, limit, offset, search } = getPaginationParams(req);

  if (useInMemory) {
    let filtered = memoryStore.users;
    if (search) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const data = filtered.slice(offset, offset + limit);

    return res.json({ success: true, data, pagination: { page, limit, total, totalPages } });
  }

  try {
    let sql = 'SELECT id, name, email, role, phone, created_at FROM users';
    let countSql = 'SELECT COUNT(*) as total FROM users';
    const params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR email LIKE ?';
      countSql += ' WHERE name LIKE ? OR email LIKE ?';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';

    const [countRows] = await dbPool.query(countSql, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [rows] = await dbPool.query(sql, [...params, limit, offset]);

    return res.json({ success: true, data: rows, pagination: { page, limit, total, totalPages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
  }

  if (useInMemory) {
    const existing = memoryStore.users.find(u => u.email === email);
    if (existing) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

    const newUser = {
      id: Date.now(),
      name,
      email,
      role: role || 'staff',
      phone: phone || ''
    };
    memoryStore.users.push(newUser);
    return res.status(201).json({ success: true, data: newUser, message: 'Pegawai berhasil ditambahkan' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role || 'staff', phone || '']
    );
    return res.status(201).json({ success: true, data: { id: result.insertId, name, email, role }, message: 'Pegawai berhasil ditambahkan' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, password, role, phone } = req.body;

  if (useInMemory) {
    const idx = memoryStore.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      memoryStore.users[idx] = {
        ...memoryStore.users[idx],
        name: name || memoryStore.users[idx].name,
        email: email || memoryStore.users[idx].email,
        role: role || memoryStore.users[idx].role,
        phone: phone || memoryStore.users[idx].phone
      };
      return res.json({ success: true, data: memoryStore.users[idx], message: 'Data pegawai berhasil diperbarui' });
    }
    return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan' });
  }

  try {
    if (password) {
      await dbPool.query(
        'UPDATE users SET name = ?, email = ?, password = ?, role = ?, phone = ? WHERE id = ?',
        [name, email, password, role, phone, id]
      );
    } else {
      await dbPool.query(
        'UPDATE users SET name = ?, email = ?, role = ?, phone = ? WHERE id = ?',
        [name, email, role, phone, id]
      );
    }
    return res.json({ success: true, message: 'Data pegawai berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (useInMemory) {
    memoryStore.users = memoryStore.users.filter(u => u.id !== id);
    return res.json({ success: true, message: 'Pegawai berhasil dihapus' });
  }

  try {
    await dbPool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Pegawai berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


// Customers endpoints
app.get('/api/customers', async (req, res) => {
  const { page, limit, offset, search } = getPaginationParams(req);

  if (useInMemory) {
    let filtered = memoryStore.customers;
    if (search) {
      filtered = filtered.filter(c => 
        c.parent_name.toLowerCase().includes(search) ||
        c.child_name.toLowerCase().includes(search) ||
        c.phone.includes(search)
      );
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const data = filtered.slice(offset, offset + limit);

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages }
    });
  }

  try {
    let sql = 'SELECT * FROM customers';
    let countSql = 'SELECT COUNT(*) as total FROM customers';
    const params = [];
    
    if (search) {
      sql += ' WHERE parent_name LIKE ? OR child_name LIKE ? OR phone LIKE ?';
      countSql += ' WHERE parent_name LIKE ? OR child_name LIKE ? OR phone LIKE ?';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    
    const [countRows] = await dbPool.query(countSql, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [rows] = await dbPool.query(sql, [...params, limit, offset]);

    return res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const { parent_name, child_name, phone, email, is_member } = req.body;
  if (!parent_name || !child_name || !phone) {
    return res.status(400).json({ success: false, message: 'Nama orang tua, nama anak, dan no telepon wajib diisi' });
  }

  if (useInMemory) {
    const newCust = {
      id: Date.now(),
      parent_name,
      child_name,
      phone,
      email: email || '',
      points_balance: 0,
      is_member: is_member ? 1 : 0,
      created_at: new Date()
    };
    memoryStore.customers.unshift(newCust);
    return res.status(201).json({ success: true, data: newCust, message: 'Pelanggan berhasil ditambahkan' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO customers (parent_name, child_name, phone, email, is_member) VALUES (?, ?, ?, ?, ?)',
      [parent_name, child_name, phone, email || '', is_member ? 1 : 0]
    );
    const newCust = { id: result.insertId, parent_name, child_name, phone, email, points_balance: 0, is_member };
    return res.status(201).json({ success: true, data: newCust, message: 'Pelanggan berhasil ditambahkan' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { parent_name, child_name, phone, email, points_balance, is_member } = req.body;

  if (useInMemory) {
    const idx = memoryStore.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryStore.customers[idx] = {
        ...memoryStore.customers[idx],
        parent_name: parent_name ?? memoryStore.customers[idx].parent_name,
        child_name: child_name ?? memoryStore.customers[idx].child_name,
        phone: phone ?? memoryStore.customers[idx].phone,
        email: email ?? memoryStore.customers[idx].email,
        points_balance: points_balance !== undefined ? parseInt(points_balance) : memoryStore.customers[idx].points_balance,
        is_member: is_member !== undefined ? (is_member ? 1 : 0) : memoryStore.customers[idx].is_member
      };
      return res.json({ success: true, data: memoryStore.customers[idx], message: 'Data pelanggan berhasil diperbarui' });
    }
    return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
  }

  try {
    await dbPool.query(
      'UPDATE customers SET parent_name = ?, child_name = ?, phone = ?, email = ?, points_balance = ?, is_member = ? WHERE id = ?',
      [parent_name, child_name, phone, email, points_balance, is_member ? 1 : 0, id]
    );
    return res.json({ success: true, message: 'Data pelanggan berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (useInMemory) {
    memoryStore.customers = memoryStore.customers.filter(c => c.id !== id);
    return res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
  }

  try {
    await dbPool.query('DELETE FROM customers WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Packages endpoints
app.get('/api/packages', async (req, res) => {
  if (useInMemory) {
    return res.json({ success: true, data: memoryStore.packages });
  }
  try {
    const [rows] = await dbPool.query('SELECT * FROM packages ORDER BY id ASC');
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/packages/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, duration_hours, weekday_price, weekend_price } = req.body;

  if (useInMemory) {
    const idx = memoryStore.packages.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryStore.packages[idx] = {
        ...memoryStore.packages[idx],
        name: name || memoryStore.packages[idx].name,
        duration_hours: duration_hours !== undefined ? parseInt(duration_hours) : memoryStore.packages[idx].duration_hours,
        weekday_price: weekday_price !== undefined ? parseFloat(weekday_price) : memoryStore.packages[idx].weekday_price,
        weekend_price: weekend_price !== undefined ? parseFloat(weekend_price) : memoryStore.packages[idx].weekend_price
      };
      return res.json({ success: true, data: memoryStore.packages[idx], message: 'Harga paket berhasil diperbarui' });
    }
    return res.status(404).json({ success: false, message: 'Paket tidak ditemukan' });
  }

  try {
    await dbPool.query(
      'UPDATE packages SET name = ?, duration_hours = ?, weekday_price = ?, weekend_price = ? WHERE id = ?',
      [name, duration_hours, weekday_price, weekend_price, id]
    );
    return res.json({ success: true, message: 'Harga paket berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/packages', async (req, res) => {
  const { name, duration_hours, weekday_price, weekend_price, best_value, is_member_package } = req.body;
  if (!name || weekday_price === undefined || weekend_price === undefined) {
    return res.status(400).json({ success: false, message: 'Nama paket, harga weekday, dan harga weekend wajib diisi' });
  }

  if (useInMemory) {
    const newPkg = {
      id: Date.now(),
      name,
      duration_hours: parseInt(duration_hours) || 1,
      weekday_price: parseFloat(weekday_price),
      weekend_price: parseFloat(weekend_price),
      currency: 'IDR',
      best_value: best_value ? 1 : 0,
      is_member_package: is_member_package ? 1 : 0
    };
    memoryStore.packages.push(newPkg);
    return res.status(201).json({ success: true, data: newPkg, message: 'Paket bermain berhasil ditambahkan' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO packages (name, duration_hours, weekday_price, weekend_price, best_value, is_member_package) VALUES (?, ?, ?, ?, ?, ?)',
      [name, duration_hours || 1, weekday_price, weekend_price, best_value ? 1 : 0, is_member_package ? 1 : 0]
    );
    return res.status(201).json({ success: true, data: { id: result.insertId, name }, message: 'Paket bermain berhasil ditambahkan' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (useInMemory) {
    memoryStore.packages = memoryStore.packages.filter(p => p.id !== id);
    return res.json({ success: true, message: 'Paket bermain berhasil dihapus' });
  }

  try {
    await dbPool.query('DELETE FROM packages WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Paket bermain berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});



// Transactions & POS endpoints
app.get('/api/transactions', async (req, res) => {
  const { page, limit, offset, search } = getPaginationParams(req);

  if (useInMemory) {
    let filtered = memoryStore.transactions;
    if (search) {
      filtered = filtered.filter(t => 
        t.trx_code.toLowerCase().includes(search) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(search)) ||
        t.package_name.toLowerCase().includes(search)
      );
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const data = filtered.slice(offset, offset + limit);

    return res.json({ success: true, data, pagination: { page, limit, total, totalPages } });
  }

  try {
    let sql = `
      SELECT t.*, CONCAT(c.parent_name, ' (', c.child_name, ')') as customer_name
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
    `;
    let countSql = `SELECT COUNT(*) as total FROM transactions t JOIN customers c ON t.customer_id = c.id`;
    const params = [];

    if (search) {
      sql += ' WHERE t.trx_code LIKE ? OR c.parent_name LIKE ? OR c.child_name LIKE ?';
      countSql += ' WHERE t.trx_code LIKE ? OR c.parent_name LIKE ? OR c.child_name LIKE ?';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY t.id DESC LIMIT ? OFFSET ?';

    const [countRows] = await dbPool.query(countSql, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [rows] = await dbPool.query(sql, [...params, limit, offset]);

    return res.json({ success: true, data: rows, pagination: { page, limit, total, totalPages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { customer_id, package_id, is_weekend, payment_method, points_earned = 10, notes } = req.body;
  if (!customer_id || !package_id) {
    return res.status(400).json({ success: false, message: 'Pelanggan dan paket bermain wajib dipilih' });
  }

  const trxCode = 'TRX-' + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

  if (useInMemory) {
    const cust = memoryStore.customers.find(c => c.id === parseInt(customer_id));
    const pkg = memoryStore.packages.find(p => p.id === parseInt(package_id));
    if (!cust || !pkg) return res.status(404).json({ success: false, message: 'Pelanggan atau Paket tidak ditemukan' });

    const amount = is_weekend ? parseFloat(pkg.weekend_price) : parseFloat(pkg.weekday_price);
    
    // Add points to customer
    cust.points_balance = (cust.points_balance || 0) + parseInt(points_earned);
    if (pkg.is_member_package) {
      cust.is_member = 1;
    }

    const newTrx = {
      id: Date.now(),
      trx_code: trxCode,
      customer_id: cust.id,
      customer_name: `${cust.parent_name} (${cust.child_name})`,
      package_id: pkg.id,
      package_name: pkg.name,
      amount,
      is_weekend: is_weekend ? 1 : 0,
      points_earned: parseInt(points_earned),
      payment_method: payment_method || 'qris',
      notes: notes || '',
      created_at: new Date()
    };

    memoryStore.transactions.unshift(newTrx);
    return res.status(201).json({
      success: true,
      data: newTrx,
      message: `Transaksi berhasil! Pelanggan mendapatkan ${points_earned} poin.`
    });
  }

  try {
    const [pkgRows] = await dbPool.query('SELECT * FROM packages WHERE id = ?', [package_id]);
    if (pkgRows.length === 0) return res.status(404).json({ success: false, message: 'Paket tidak ditemukan' });
    
    const pkg = pkgRows[0];
    const amount = is_weekend ? pkg.weekend_price : pkg.weekday_price;

    const [trxResult] = await dbPool.query(
      `INSERT INTO transactions (trx_code, customer_id, package_id, package_name, amount, is_weekend, points_earned, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [trxCode, customer_id, package_id, pkg.name, amount, is_weekend ? 1 : 0, points_earned, payment_method || 'qris', notes || '']
    );

    // Update Customer points & member status
    await dbPool.query(
      'UPDATE customers SET points_balance = points_balance + ?, is_member = CASE WHEN ? = 1 THEN 1 ELSE is_member END WHERE id = ?',
      [points_earned, pkg.is_member_package ? 1 : 0, customer_id]
    );

    return res.status(201).json({
      success: true,
      data: { id: trxResult.insertId, trx_code: trxCode, amount, points_earned },
      message: `Transaksi berhasil! Pelanggan mendapatkan ${points_earned} poin.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Souvenirs / Merchandise endpoints
app.get('/api/souvenirs', async (req, res) => {
  const { page, limit, offset, search } = getPaginationParams(req);

  if (useInMemory) {
    let filtered = memoryStore.souvenirs;
    if (search) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(search) || (s.description && s.description.toLowerCase().includes(search)));
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const data = filtered.slice(offset, offset + limit);

    return res.json({ success: true, data, pagination: { page, limit, total, totalPages } });
  }

  try {
    let sql = 'SELECT * FROM souvenirs';
    let countSql = 'SELECT COUNT(*) as total FROM souvenirs';
    const params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR description LIKE ?';
      countSql += ' WHERE name LIKE ? OR description LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    sql += ' ORDER BY point_cost ASC LIMIT ? OFFSET ?';

    const [countRows] = await dbPool.query(countSql, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [rows] = await dbPool.query(sql, [...params, limit, offset]);
    return res.json({ success: true, data: rows, pagination: { page, limit, total, totalPages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/souvenirs', async (req, res) => {
  const { name, point_cost, stock, description, image_url } = req.body;
  if (!name || !point_cost) {
    return res.status(400).json({ success: false, message: 'Nama souvenir dan poin penukaran wajib diisi' });
  }

  if (useInMemory) {
    const newItem = {
      id: Date.now(),
      name,
      point_cost: parseInt(point_cost),
      stock: parseInt(stock) || 0,
      description: description || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400'
    };
    memoryStore.souvenirs.push(newItem);
    return res.status(201).json({ success: true, data: newItem, message: 'Souvenir berhasil ditambahkan' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO souvenirs (name, point_cost, stock, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, point_cost, stock || 0, description || '', image_url || '']
    );
    return res.status(201).json({ success: true, data: { id: result.insertId, name, point_cost }, message: 'Souvenir berhasil ditambahkan' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/souvenirs/redeem', async (req, res) => {
  const { customer_id, souvenir_id, qty = 1, notes } = req.body;
  if (!customer_id || !souvenir_id) {
    return res.status(400).json({ success: false, message: 'Pelanggan dan Souvenir wajib dipilih' });
  }

  const redemptionCode = 'RDM-' + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

  if (useInMemory) {
    const cust = memoryStore.customers.find(c => c.id === parseInt(customer_id));
    const souv = memoryStore.souvenirs.find(s => s.id === parseInt(souvenir_id));

    if (!cust || !souv) return res.status(404).json({ success: false, message: 'Pelanggan atau Souvenir tidak ditemukan' });

    const totalCost = souv.point_cost * parseInt(qty);
    if (cust.points_balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Poin tidak mencukupi. Diperlukan ${totalCost} poin, namun saldo poin saat ini ${cust.points_balance}`
      });
    }
    if (souv.stock < qty) {
      return res.status(400).json({ success: false, message: `Stok souvenir tidak mencukupi (sisa ${souv.stock})` });
    }

    // Deduct points & reduce stock
    cust.points_balance -= totalCost;
    souv.stock -= parseInt(qty);

    const redemption = {
      id: Date.now(),
      redemption_code: redemptionCode,
      customer_id: cust.id,
      customer_name: `${cust.parent_name}`,
      souvenir_id: souv.id,
      souvenir_name: souv.name,
      points_spent: totalCost,
      qty: parseInt(qty),
      notes: notes || '',
      created_at: new Date()
    };
    memoryStore.redemptions.unshift(redemption);

    return res.json({
      success: true,
      data: redemption,
      message: `Penukaran berhasil! ${totalCost} poin ditukarkan dengan ${qty}x ${souv.name}`
    });
  }

  try {
    const [custRows] = await dbPool.query('SELECT * FROM customers WHERE id = ?', [customer_id]);
    const [souvRows] = await dbPool.query('SELECT * FROM souvenirs WHERE id = ?', [souvenir_id]);

    if (custRows.length === 0 || souvRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pelanggan atau Souvenir tidak ditemukan' });
    }

    const cust = custRows[0];
    const souv = souvRows[0];
    const totalCost = souv.point_cost * qty;

    if (cust.points_balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Poin tidak mencukupi. Membutuhkan ${totalCost} poin, saldo: ${cust.points_balance}`
      });
    }
    if (souv.stock < qty) {
      return res.status(400).json({ success: false, message: `Stok souvenir tidak mencukupi` });
    }

    // Insert redemption record
    await dbPool.query(
      'INSERT INTO point_redemptions (redemption_code, customer_id, souvenir_id, souvenir_name, points_spent, qty, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [redemptionCode, customer_id, souvenir_id, souv.name, totalCost, qty, notes || '']
    );

    // Deduct customer points and reduce stock
    await dbPool.query('UPDATE customers SET points_balance = points_balance - ? WHERE id = ?', [totalCost, customer_id]);
    await dbPool.query('UPDATE souvenirs SET stock = stock - ? WHERE id = ?', [qty, souvenir_id]);

    return res.json({
      success: true,
      message: `Penukaran berhasil! ${totalCost} poin ditukarkan dengan ${qty}x ${souv.name}`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Staff Attendance endpoints
app.get('/api/attendance', async (req, res) => {
  const { page, limit, offset, search } = getPaginationParams(req);
  const dateFilter = req.query.date || '';

  if (useInMemory) {
    let filtered = memoryStore.attendance;
    if (dateFilter) {
      filtered = filtered.filter(a => a.attendance_date === dateFilter);
    }
    if (search) {
      filtered = filtered.filter(a => a.staff_name.toLowerCase().includes(search));
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const data = filtered.slice(offset, offset + limit);

    return res.json({ success: true, data, pagination: { page, limit, total, totalPages } });
  }

  try {
    let sql = 'SELECT * FROM staff_attendance';
    let countSql = 'SELECT COUNT(*) as total FROM staff_attendance';
    const params = [];
    const conditions = [];

    if (dateFilter) {
      conditions.push('attendance_date = ?');
      params.push(dateFilter);
    }
    if (search) {
      conditions.push('staff_name LIKE ?');
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
      countSql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY attendance_date DESC, id DESC LIMIT ? OFFSET ?';

    const [countRows] = await dbPool.query(countSql, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [rows] = await dbPool.query(sql, [...params, limit, offset]);

    return res.json({ success: true, data: rows, pagination: { page, limit, total, totalPages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Manual Create Attendance
app.post('/api/attendance', async (req, res) => {
  const { user_id, staff_name, attendance_date, check_in_time, check_out_time, status, notes } = req.body;
  if (!staff_name || !attendance_date) {
    return res.status(400).json({ success: false, message: 'Nama staf dan tanggal presensi wajib diisi' });
  }

  if (useInMemory) {
    const newRecord = {
      id: Date.now(),
      user_id: parseInt(user_id) || 1,
      staff_name,
      attendance_date,
      check_in_time: check_in_time || '08:00:00',
      check_out_time: check_out_time || null,
      status: status || 'present',
      notes: notes || ''
    };
    memoryStore.attendance.unshift(newRecord);
    return res.status(201).json({ success: true, data: newRecord, message: 'Data presensi berhasil ditambahkan' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO staff_attendance (user_id, staff_name, attendance_date, check_in_time, check_out_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id || 1, staff_name, attendance_date, check_in_time || '08:00:00', check_out_time || null, status || 'present', notes || '']
    );
    return res.status(201).json({ success: true, data: { id: result.insertId, staff_name, attendance_date }, message: 'Data presensi berhasil ditambahkan' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Update Attendance
app.put('/api/attendance/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { staff_name, attendance_date, check_in_time, check_out_time, status, notes } = req.body;

  if (useInMemory) {
    const idx = memoryStore.attendance.findIndex(a => a.id === id);
    if (idx !== -1) {
      memoryStore.attendance[idx] = {
        ...memoryStore.attendance[idx],
        staff_name: staff_name || memoryStore.attendance[idx].staff_name,
        attendance_date: attendance_date || memoryStore.attendance[idx].attendance_date,
        check_in_time: check_in_time ?? memoryStore.attendance[idx].check_in_time,
        check_out_time: check_out_time ?? memoryStore.attendance[idx].check_out_time,
        status: status || memoryStore.attendance[idx].status,
        notes: notes ?? memoryStore.attendance[idx].notes
      };
      return res.json({ success: true, data: memoryStore.attendance[idx], message: 'Data presensi berhasil diperbarui' });
    }
    return res.status(404).json({ success: false, message: 'Data presensi tidak ditemukan' });
  }

  try {
    await dbPool.query(
      'UPDATE staff_attendance SET staff_name = ?, attendance_date = ?, check_in_time = ?, check_out_time = ?, status = ?, notes = ? WHERE id = ?',
      [staff_name, attendance_date, check_in_time, check_out_time, status, notes, id]
    );
    return res.json({ success: true, message: 'Data presensi berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Delete Attendance
app.delete('/api/attendance/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (useInMemory) {
    memoryStore.attendance = memoryStore.attendance.filter(a => a.id !== id);
    return res.json({ success: true, message: 'Data presensi berhasil dihapus' });
  }

  try {
    await dbPool.query('DELETE FROM staff_attendance WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Data presensi berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


app.post('/api/attendance/check-in', async (req, res) => {
  const { user_id, staff_name, notes, photo_url } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().split(' ')[0];

  if (useInMemory) {
    const existing = memoryStore.attendance.find(a => a.user_id === parseInt(user_id) && a.attendance_date === today);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Anda sudah melakukan Check-In hari ini' });
    }

    const newRecord = {
      id: Date.now(),
      user_id: parseInt(user_id) || 2,
      staff_name: staff_name || 'Staff Playground',
      attendance_date: today,
      check_in_time: nowTime,
      check_out_time: null,
      status: parseInt(nowTime.split(':')[0]) >= 9 ? 'late' : 'present',
      notes: notes || '',
      photo_url: photo_url || ''
    };

    memoryStore.attendance.unshift(newRecord);
    return res.status(201).json({ success: true, data: newRecord, message: `Check-In berhasil jam ${nowTime}` });
  }

  try {
    const [existing] = await dbPool.query(
      'SELECT id FROM staff_attendance WHERE user_id = ? AND attendance_date = ?',
      [user_id, today]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Anda sudah Check-In hari ini' });
    }

    const status = parseInt(nowTime.split(':')[0]) >= 9 ? 'late' : 'present';

    const [result] = await dbPool.query(
      'INSERT INTO staff_attendance (user_id, staff_name, attendance_date, check_in_time, status, notes, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, staff_name, today, nowTime, status, notes || '', photo_url || '']
    );

    return res.status(201).json({ success: true, data: { id: result.insertId, check_in_time: nowTime }, message: `Check-In berhasil jam ${nowTime}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/attendance/check-out', async (req, res) => {
  const { user_id } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().split(' ')[0];

  if (useInMemory) {
    const rec = memoryStore.attendance.find(a => a.user_id === parseInt(user_id) && a.attendance_date === today);
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Belum ada data Check-In hari ini' });
    }
    rec.check_out_time = nowTime;
    return res.json({ success: true, data: rec, message: `Check-Out berhasil jam ${nowTime}` });
  }

  try {
    const [rec] = await dbPool.query(
      'SELECT id FROM staff_attendance WHERE user_id = ? AND attendance_date = ?',
      [user_id, today]
    );
    if (rec.length === 0) {
      return res.status(404).json({ success: false, message: 'Belum ada data Check-In hari ini' });
    }

    await dbPool.query('UPDATE staff_attendance SET check_out_time = ? WHERE id = ?', [nowTime, rec[0].id]);
    return res.json({ success: true, message: `Check-Out berhasil jam ${nowTime}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Expenses endpoints
app.get('/api/expenses', async (req, res) => {
  const { page, limit, offset, search } = getPaginationParams(req);

  if (useInMemory) {
    let filtered = memoryStore.expenses;
    if (search) {
      filtered = filtered.filter(e => e.title.toLowerCase().includes(search) || e.category.toLowerCase().includes(search));
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const data = filtered.slice(offset, offset + limit);

    return res.json({ success: true, data, pagination: { page, limit, total, totalPages } });
  }

  try {
    let sql = 'SELECT * FROM expenses';
    let countSql = 'SELECT COUNT(*) as total FROM expenses';
    const params = [];

    if (search) {
      sql += ' WHERE title LIKE ? OR category LIKE ?';
      countSql += ' WHERE title LIKE ? OR category LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    sql += ' ORDER BY expense_date DESC LIMIT ? OFFSET ?';

    const [countRows] = await dbPool.query(countSql, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [rows] = await dbPool.query(sql, [...params, limit, offset]);

    return res.json({ success: true, data: rows, pagination: { page, limit, total, totalPages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { title, category, amount, expense_date, description } = req.body;
  if (!title || !amount) {
    return res.status(400).json({ success: false, message: 'Judul pengeluaran dan jumlah nominal wajib diisi' });
  }

  const dateVal = expense_date || new Date().toISOString().split('T')[0];

  if (useInMemory) {
    const newExp = {
      id: Date.now(),
      title,
      category: category || 'Operasional',
      amount: parseFloat(amount),
      expense_date: dateVal,
      description: description || ''
    };
    memoryStore.expenses.unshift(newExp);
    return res.status(201).json({ success: true, data: newExp, message: 'Pengeluaran berhasil dicatat' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO expenses (title, category, amount, expense_date, description) VALUES (?, ?, ?, ?, ?)',
      [title, category || 'Operasional', amount, dateVal, description || '']
    );
    return res.status(201).json({ success: true, data: { id: result.insertId, title, amount }, message: 'Pengeluaran berhasil dicatat' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (useInMemory) {
    memoryStore.expenses = memoryStore.expenses.filter(e => e.id !== id);
    return res.json({ success: true, message: 'Pengeluaran berhasil dihapus' });
  }

  try {
    await dbPool.query('DELETE FROM expenses WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Pengeluaran berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Reports Endpoints (Visitor, Attendance, Finance)
app.get('/api/reports/visitors', async (req, res) => {
  const period = req.query.period || 'daily'; // 'daily', 'weekly', 'monthly'

  if (useInMemory) {
    const totalVisitors = memoryStore.transactions.length;
    const totalPointsAwarded = memoryStore.transactions.reduce((acc, t) => acc + (t.points_earned || 0), 0);

    return res.json({
      success: true,
      data: {
        period,
        total_visitors: totalVisitors,
        total_points_awarded: totalPointsAwarded,
        recent_visitors: memoryStore.transactions.slice(0, 10)
      }
    });
  }

  try {
    let dateFilter = 'DATE(t.created_at) = CURDATE()';
    if (period === 'weekly') dateFilter = 't.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    if (period === 'monthly') dateFilter = 't.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';

    const [stats] = await dbPool.query(
      `SELECT COUNT(*) as total_visitors, SUM(points_earned) as total_points FROM transactions t WHERE ${dateFilter}`
    );

    const [recent] = await dbPool.query(
      `SELECT t.*, CONCAT(c.parent_name, ' (', c.child_name, ')') as customer_name FROM transactions t JOIN customers c ON t.customer_id = c.id WHERE ${dateFilter} ORDER BY t.id DESC LIMIT 50`
    );

    return res.json({
      success: true,
      data: {
        period,
        total_visitors: stats[0].total_visitors || 0,
        total_points_awarded: stats[0].total_points || 0,
        recent_visitors: recent
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/reports/finance', async (req, res) => {
  const period = req.query.period || 'monthly';

  if (useInMemory) {
    const totalRevenue = memoryStore.transactions.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    const totalExpenses = memoryStore.expenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    return res.json({
      success: true,
      data: {
        period,
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        transaction_count: memoryStore.transactions.length,
        expense_count: memoryStore.expenses.length
      }
    });
  }

  try {
    let dateFilterTrx = '1=1';
    let dateFilterExp = '1=1';
    if (period === 'daily') {
      dateFilterTrx = 'DATE(t.created_at) = CURDATE()';
      dateFilterExp = 'expense_date = CURDATE()';
    } else if (period === 'weekly') {
      dateFilterTrx = 't.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      dateFilterExp = 'expense_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'monthly') {
      dateFilterTrx = 't.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      dateFilterExp = 'expense_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    const [rev] = await dbPool.query(`SELECT SUM(t.amount) as total_rev, COUNT(*) as count FROM transactions t WHERE ${dateFilterTrx}`);
    const [exp] = await dbPool.query(`SELECT SUM(amount) as total_exp, COUNT(*) as count FROM expenses WHERE ${dateFilterExp}`);

    const totalRevenue = parseFloat(rev[0].total_rev || 0);
    const totalExpenses = parseFloat(exp[0].total_exp || 0);

    return res.json({
      success: true,
      data: {
        period,
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_profit: totalRevenue - totalExpenses,
        transaction_count: rev[0].count,
        expense_count: exp[0].count
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kinderfun Backend Server listening on http://localhost:${PORT}`);
});
