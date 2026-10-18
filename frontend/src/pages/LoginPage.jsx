import PropTypes from 'prop-types'
import { Link, Navigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm.jsx'
import './AuthPage.css'

function LoginPage({ user, onAuthenticated }) {
  if (user) return <Navigate to="/" replace />

  return (
    <main className="auth-page">
      <section className="auth-story">
        <span className="auth-eyebrow">Cộng đồng HaUI cùng sẻ chia</span>
        <h1>Mỗi sự giúp đỡ đều có thể mở ra hy vọng.</h1>
        <p>Đăng nhập để theo dõi những chiến dịch bạn quan tâm và xem lại hành trình đóng góp của mình.</p>
        <div className="auth-story-note">
          <span aria-hidden="true">“</span>
          <p>Chung tay đúng lúc, lan tỏa điều tử tế lâu dài.</p>
        </div>
      </section>
      <section className="auth-panel" aria-labelledby="login-title">
        <Link className="auth-home-link" to="/">← HaUI Care</Link>
        <h2 id="login-title">Chào mừng trở lại</h2>
        <p className="auth-panel-description">Đăng nhập bằng email HaUI của bạn.</p>
        <AuthForm mode="login" onAuthenticated={onAuthenticated} />
        <p className="auth-privacy-note">Thông tin tài khoản của bạn được sử dụng để quản lý hoạt động trên HaUI Care.</p>
      </section>
    </main>
  )
}

LoginPage.propTypes = {
  user: PropTypes.shape({ user_id: PropTypes.number }),
  onAuthenticated: PropTypes.func.isRequired,
}

export default LoginPage
