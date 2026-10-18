const { pool } = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [String(email || '').toLowerCase()]
  );
  return rows[0] || null;
}

async function findById(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE user_id = ? LIMIT 1',
    [Number(userId)]
  );
  return rows[0] || null;
}

async function create({ full_name, email, password_hash, phone_number, avatar_url, role }) {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, phone_number, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?)',
    [full_name, email, password_hash, phone_number, avatar_url, role]
  );
  return findById(result.insertId);
}

module.exports = { findByEmail, findById, create };
