import PropTypes from 'prop-types'
import { Link, Navigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm.jsx'
import './AuthPage.css'

function RegisterPage({ user, onAuthenticated }) {
  if (user) return <Navigate to="/" replace />

  return (
    <main className="auth-page">
      <section className="auth-story">
        <span className="auth-eyebrow">Bắt đầu hành trình sẻ chia</span>
        <h1>Cùng cộng đồng HaUI tạo nên những thay đổi ý nghĩa.</h1>
        <p>Tạo tài khoản để ủng hộ chiến dịch, theo dõi tiến độ và lưu lại những đóng góp của bạn.</p>
        <div className="auth-story-note">
          <span aria-hidden="true">+</span>
          <p>Tài khoản mới chỉ đăng ký với vai trò sinh viên hoặc giảng viên.</p>
        </div>
      </section>
      <section className="auth-panel" aria-labelledby="register-title">
        <Link className="auth-home-link" to="/">← HaUI Care</Link>
        <h2 id="register-title">Tạo tài khoản</h2>
        <p className="auth-panel-description">Tham gia mạng lưới sẻ chia trong cộng đồng HaUI.</p>
        <AuthForm mode="register" onAuthenticated={onAuthenticated} />
        <p className="auth-privacy-note">Sử dụng email có đuôi @haui.edu.vn để đăng ký.</p>
      </section>
    </main>
  )
}

RegisterPage.propTypes = {
  user: PropTypes.shape({ user_id: PropTypes.number }),
  onAuthenticated: PropTypes.func.isRequired,
}

export default RegisterPage
