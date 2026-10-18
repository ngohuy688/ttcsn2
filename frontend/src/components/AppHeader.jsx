import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

function AppHeader({ user, onUserChange, onStatusChange }) {
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onUserChange(null)
    onStatusChange('Đã đăng xuất.')
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand">HaUI Care</Link>
      <nav aria-label="Điều hướng chính">
        <Link to="/search">Tìm chiến dịch</Link>
        {user && <Link to="/profile">Hồ sơ</Link>}
        {user && ['CAMPAIGN_MANAGER', 'ADMIN'].includes(user.role) && (
          <Link to="/campaign/new">Tạo chiến dịch</Link>
        )}
        {user?.role === 'ADMIN' && <Link to="/admin">Quản trị</Link>}
      </nav>

      <div className="auth-box">
        {user ? (
          <div className="user-chip">
            <span>{user.full_name}</span>
            <button type="button" onClick={handleLogout}>Đăng xuất</button>
          </div>
        ) : (
          <div className="header-auth-actions">
            <Link to="/login" className="header-login-link">Đăng nhập</Link>
            <Link to="/register" className="header-register-link">Đăng kí</Link>
          </div>
        )}
      </div>
    </header>
  )
}

AppHeader.propTypes = {
  user: PropTypes.shape({ full_name: PropTypes.string, role: PropTypes.string }),
  onUserChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
}

export default AppHeader
