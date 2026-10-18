const userModel = require('../models/userModel');
const { hashPassword, comparePassword, generateToken, validateHaUIEmail } = require('../utils/auth');

function buildUserResponse(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

async function register(req, res) {
  try {
    const { full_name, email, password, phone_number, role } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (typeof full_name !== 'string' || !full_name.trim() || !normalizedEmail || typeof password !== 'string') {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' });
    }

    if (!validateHaUIEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Email phải thuộc miền @haui.edu.vn.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    if (await userModel.findByEmail(normalizedEmail)) {
      return res.status(409).json({ message: 'Email đã tồn tại trong hệ thống.' });
    }

    const validRole = ['STUDENT', 'LECTURER'].includes(role) ? role : 'STUDENT';
    const passwordHash = hashPassword(password);

    const newUser = await userModel.create({
      full_name: full_name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      phone_number: phone_number || '',
      avatar_url: 'https://via.placeholder.com/150',
      role: validRole,
    });
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Đăng ký thành công.',
      token,
      user: buildUserResponse(newUser),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email đã tồn tại trong hệ thống.' });
    }
    return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký tài khoản.', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = await userModel.findByEmail(email);

    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Đăng nhập thành công.',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi hệ thống khi đăng nhập.', error: error.message });
  }
}

async function profile(req, res) {
  try {
    const user = await userModel.findById(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    return res.status(200).json({ user: buildUserResponse(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng.', error: error.message });
  }
}

module.exports = { register, login, profile };
