import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'
import './AuthForm.css'

const API_BASE = 'http://localhost:8081'

function AuthForm({ mode, onAuthenticated }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const endpoint = isRegister ? 'register' : 'login'
      const response = await axios.post(`${API_BASE}/api/auth/${endpoint}`, form)
      const { token, user } = response.data || {}
      if (!token || !user) {
        throw new Error('Máy chủ không trả về phiên đăng nhập hợp lệ.')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      onAuthenticated(user)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
        || requestError.message
        || (isRegister ? 'Đăng ký thất bại.' : 'Đăng nhập thất bại.')
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <>
          <label>
            Họ và tên
            <input
              type="text"
              name="full_name"
              autoComplete="name"
              value={form.full_name}
              onChange={(event) => setForm({ ...form, full_name: event.target.value })}
              required
            />
          </label>
          <label>
            Bạn là
            <select
              name="role"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              <option value="STUDENT">Sinh viên</option>
              <option value="LECTURER">Giảng viên</option>
            </select>
          </label>
        </>
      )}

      <label>
        Email HaUI
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tenban@haui.edu.vn"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          name="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          minLength={isRegister ? 6 : undefined}
          placeholder={isRegister ? 'Ít nhất 6 ký tự' : ''}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
      </label>

      {error && <div className="auth-form-error" role="alert">{error}</div>}
      <button className="auth-submit" type="submit" disabled={submitting}>
        {submitting ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
      </button>
      <p className="auth-switch">
        {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
        <Link to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Đăng nhập' : 'Đăng ký'}
        </Link>
      </p>
    </form>
  )
}

AuthForm.propTypes = {
  mode: PropTypes.oneOf(['login', 'register']).isRequired,
  onAuthenticated: PropTypes.func.isRequired,
}

export default AuthForm
