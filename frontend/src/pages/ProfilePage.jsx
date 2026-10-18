import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'
import './ProfilePage.css'

const API_BASE = 'http://localhost:8081'

function ProfilePage({ user, onProfileLoaded }) {
  const [profile, setProfile] = useState(user)
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
      setLoading(false)
      return () => {
        active = false
      }
    }

    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      axios.get(`${API_BASE}/api/auth/profile`, { headers }),
      axios.get(`${API_BASE}/api/donations/users/me`, { headers }),
    ])
      .then(([profileResponse, donationResponse]) => {
        if (!active) return
        const freshProfile = profileResponse.data?.user
        if (freshProfile) {
          setProfile(freshProfile)
          onProfileLoaded(freshProfile)
        }
        setDonations(donationResponse.data?.data || [])
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError.response?.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        } else {
          setError(requestError.response?.data?.message || 'Không thể tải thông tin hồ sơ.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [onProfileLoaded])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount || 0))

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-message">
          <h1>Hồ sơ cá nhân</h1>
          <p>Vui lòng đăng nhập để xem hồ sơ và lịch sử quyên góp.</p>
          <Link to="/" className="profile-back-link">Về trang chủ</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <Link to="/" className="profile-back-link">← Về trang chủ</Link>
      <header className="profile-heading">
        <div>
          <span className="profile-eyebrow">Tài khoản HaUI Care</span>
          <h1>Hồ sơ cá nhân</h1>
        </div>
      </header>

      {loading && <div className="profile-message" role="status">Đang tải hồ sơ...</div>}
      {error && <div className="profile-error" role="alert">{error}</div>}

      {!loading && !error && profile && (
        <>
          <section className="profile-card" aria-labelledby="profile-details-title">
            <img className="profile-avatar" src={profile.avatar_url || 'https://via.placeholder.com/150'} alt="" />
            <div className="profile-details">
              <h2 id="profile-details-title">{profile.full_name}</h2>
              <dl>
                <div><dt>Email</dt><dd>{profile.email}</dd></div>
                <div><dt>Số điện thoại</dt><dd>{profile.phone_number || 'Chưa cập nhật'}</dd></div>
                <div><dt>Vai trò</dt><dd>{profile.role}</dd></div>
                <div>
                  <dt>Tham gia từ</dt>
                  <dd>{profile.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : '—'}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="profile-history" aria-labelledby="donation-history-title">
            <div className="profile-section-heading">
              <div>
                <span className="profile-eyebrow">Đóng góp của bạn</span>
                <h2 id="donation-history-title">Lịch sử quyên góp</h2>
              </div>
              <span className="profile-donation-count">{donations.length} lượt</span>
            </div>

            {donations.length === 0 ? (
              <div className="profile-message">
                <p>Bạn chưa có khoản quyên góp nào được ghi nhận trong tài khoản.</p>
                <Link to="/" className="profile-back-link">Khám phá chiến dịch</Link>
              </div>
            ) : (
              <div className="profile-table-wrap">
                <table className="profile-donation-table">
                  <thead>
                    <tr>
                      <th>Chiến dịch</th>
                      <th>Số tiền</th>
                      <th>Ngày quyên góp</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation.donation_id}>
                        <td>
                          <Link to={`/campaign/${donation.campaign_id}`}>
                            {donation.campaign_title || `Chiến dịch #${donation.campaign_id}`}
                          </Link>
                        </td>
                        <td>{formatCurrency(donation.amount)}</td>
                        <td>{donation.created_at ? new Date(donation.created_at).toLocaleString('vi-VN') : '—'}</td>
                        <td><span className={`profile-donation-status status-${String(donation.status).toLowerCase()}`}>{donation.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

ProfilePage.propTypes = {
  user: PropTypes.shape({
    full_name: PropTypes.string,
  }),
  onProfileLoaded: PropTypes.func.isRequired,
}

export default ProfilePage
