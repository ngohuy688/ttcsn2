require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'tuthienhaui',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
};

const pool = mysql.createPool(config);

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    charset: config.charset,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.query(`ALTER DATABASE \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
}

async function initializeDatabase() {
  try {
    await ensureDatabase();

    const connection = await pool.getConnection();
    try {
      const statements = [
        `CREATE TABLE IF NOT EXISTS users (
          user_id INT PRIMARY KEY AUTO_INCREMENT,
          full_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
          email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
          password_hash VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
          phone_number VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
          avatar_url VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
          role ENUM('STUDENT','LECTURER','CAMPAIGN_MANAGER','ADMIN') NOT NULL DEFAULT 'STUDENT',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS categories (
          category_id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
          description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS campaigns (
          campaign_id BIGINT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
          slug VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
          description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          target_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          thumbnail_url VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          status ENUM('PENDING','ACTIVE','COMPLETED','CLOSED') NOT NULL DEFAULT 'PENDING',
          start_date TIMESTAMP NULL,
          end_date TIMESTAMP NULL,
          category_id INT,
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(category_id),
          FOREIGN KEY (created_by) REFERENCES users(user_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS donations (
          donation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
          campaign_id BIGINT,
          user_id INT NULL,
          donor_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          amount DECIMAL(15,2) NOT NULL,
          message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          payment_method ENUM('MOMO','VNPAY','BANK_TRANSFER') NOT NULL,
          transaction_code VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          status ENUM('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'SUCCESS',
          is_anonymous BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
          FOREIGN KEY (user_id) REFERENCES users(user_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS disbursements (
          disbursement_id BIGINT PRIMARY KEY AUTO_INCREMENT,
          campaign_id BIGINT,
          amount DECIMAL(15,2) NOT NULL,
          proof_image_url VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          note TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
          FOREIGN KEY (created_by) REFERENCES users(user_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS likes (
          like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id INT,
          campaign_id BIGINT,
          FOREIGN KEY (user_id) REFERENCES users(user_id),
          FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      ];

      for (const statement of statements) {
        await connection.query(statement);
      }

      const alterStatements = [
        'ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
        'ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
        'ALTER TABLE campaigns CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
        'ALTER TABLE donations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
        'ALTER TABLE disbursements CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
        'ALTER TABLE likes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
      ];
      for (const statement of alterStatements) {
        await connection.query(statement).catch(() => {});
      }

      const [userRows] = await connection.query('SELECT COUNT(*) AS count FROM users');
      if (Number(userRows[0].count) === 0) {
        await connection.query(
          `INSERT INTO users (full_name, email, password_hash, phone_number, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`,
          [
            'Quản trị viên', 'admin@haui.edu.vn', bcrypt.hashSync('Admin@123', 10), '0909123456', 'https://via.placeholder.com/150', 'ADMIN',
            'Nguyễn Văn Quản lý', 'manager@haui.edu.vn', bcrypt.hashSync('Manager@123', 10), '0909123457', 'https://via.placeholder.com/150', 'CAMPAIGN_MANAGER',
            'Trần Thị Học sinh', 'student@haui.edu.vn', bcrypt.hashSync('Student@123', 10), '0909123458', 'https://via.placeholder.com/150', 'STUDENT',
          ]
        );
      }

      const [categoryRows] = await connection.query('SELECT COUNT(*) AS count FROM categories');
      if (Number(categoryRows[0].count) === 0) {
        await connection.query(
          `INSERT INTO categories (name, description) VALUES (?, ?), (?, ?), (?, ?)`,
          [
            'Hỗ trợ sinh viên', 'Chiến dịch hỗ trợ sinh viên gặp khó khăn.',
            'Bệnh hiểm nghèo', 'Hỗ trợ điều trị và chăm sóc.',
            'Đời sống cộng đồng', 'Các hoạt động hỗ trợ cộng đồng.',
          ]
        );
      }

      const [campaignRows] = await connection.query('SELECT COUNT(*) AS count FROM campaigns');
      if (Number(campaignRows[0].count) === 0) {
        await connection.query(
          `INSERT INTO campaigns (title, slug, description, content, target_amount, current_amount, thumbnail_url, status, start_date, end_date, category_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'Ủng hộ sinh viên bị tai nạn',
            'ung-ho-sinh-vien-bi-tai-nan',
            'Gây quỹ hỗ trợ chi phí điều trị cho sinh viên bị tai nạn trong quá trình học tập.',
            'Chiến dịch này nhằm hỗ trợ chi phí phẫu thuật, thuốc men và sinh hoạt cho sinh viên gia đình khó khăn.',
            50000000,
            18000000,
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
            'ACTIVE',
            '2026-01-10 00:00:00',
            '2026-12-31 00:00:00',
            1,
            2,
          ]
        );

        await connection.query(
          `INSERT INTO campaigns (title, slug, description, content, target_amount, current_amount, thumbnail_url, status, start_date, end_date, category_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'Chữa bệnh cho em bé vùng cao',
            'chua-benh-cho-em-be-vung-cao',
            'Quỹ hỗ trợ thủ tục khám chữa bệnh và thuốc men cho trẻ em tại vùng cao.',
            'Bản tin này ghi nhận các chi phí chữa trị, di chuyển và chăm sóc cho các em nhỏ.',
            30000000,
            9000000,
            'https://images.unsplash.com/photo-1517486808906-6ca8b3dba9d6?auto=format&fit=crop&w=1200&q=80',
            'PENDING',
            '2026-02-10 00:00:00',
            '2026-07-20 00:00:00',
            2,
            2,
          ]
        );
      }
    } finally {
      connection.release();
    }

    return true;
  } catch (error) {
    console.warn('Database initialization warning:', error.message);
    return false;
  }
}

module.exports = {
  port: Number(process.env.PORT) || 8081,
  jwtSecret: process.env.JWT_SECRET || 'ttcsn-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN || 'haui.edu.vn',
  config,
  pool,
  ensureDatabase,
  initializeDatabase,
};
