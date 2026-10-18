import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'
import './HomePage.css'

const API_BASE = 'http://localhost:8081'

function HomePage({ user, status }) {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE}/api/campaigns`, {
          params: { status: 'ACTIVE' },
          signal: controller.signal,
        })
        setCampaigns(response.data?.data || [])
        setError('')
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') {
          setError('Không thể kết nối đến backend. Hãy chắc chắn server đang chạy trên cổng 8081.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchCampaigns()
    return () => controller.abort()
  }, [refreshKey])

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="tag">Gây quỹ cộng đồng</span>
          <h1>Hỗ trợ những hoàn cảnh khó khăn bằng sự sẻ chia của cộng đồng HaUI.</h1>
          <p>
            Nền tảng quyên góp minh bạch, an toàn và nhanh chóng để hỗ trợ sinh viên, giảng viên và cộng đồng.
          </p>
          <div className="hero-actions">
            <button
              className="primary"
              type="button"
              disabled={!campaigns.length}
              onClick={() => navigate(`/donate/${campaigns[0]?.campaign_id}`)}
            >
              Quyên góp ngay
            </button>
            {user && ['CAMPAIGN_MANAGER', 'ADMIN'].includes(user.role) && (
              <button className="secondary" type="button" onClick={() => navigate('/campaign/new')}>
                Tạo chiến dịch
              </button>
            )}
          </div>
          {status && <div className="status-banner" role="status">{status}</div>}
        </div>

        <div className="hero-visual">
          <div className="stat-card">
            <strong>HaUI</strong>
            <span>Chung tay sẻ chia</span>
          </div>
        </div>
      </section>

      <section id="campaigns" className="campaigns">
        <div className="section-head">
          <h2>Chiến dịch nổi bật</h2>
          <div className="campaign-section-actions">
            <Link to="/search" className="campaign-section-search">Tìm chiến dịch</Link>
            <button type="button" className="link-button" onClick={() => setRefreshKey((current) => current + 1)}>
              Làm mới
            </button>
          </div>
        </div>

        {error && <div className="error-box" role="alert">{error}</div>}

        {loading ? (
          <div className="loading-box" role="status">Đang tải chiến dịch...</div>
        ) : (
          <div className="campaign-grid">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => {
                const raised = Number(campaign.current_amount || 0)
                const target = Number(campaign.target_amount || 0)
                const percent = target > 0 ? Math.min((raised / target) * 100, 100) : 0

                return (
                  <article className="campaign-card" key={campaign.campaign_id}>
                    <img src={campaign.thumbnail_url || 'https://via.placeholder.com/1200x700'} alt={campaign.title} />
                    <div className="card-body">
                      <span className="category">{campaign.category_id || 'Dự án cộng đồng'}</span>
                      <h3>{campaign.title}</h3>
                      <div className="progress-block">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          aria-label={`Tiến độ quyên góp cho ${campaign.title}`}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-valuenow={Math.round(percent)}
                        >
                          <span style={{ width: `${percent}%` }} />
                        </div>
                        <div className="numbers">
                          <strong>{formatCurrency(raised)}</strong>
                          <span>trên {formatCurrency(target)} · {percent.toFixed(0)}%</span>
                        </div>
                      </div>
                      <p className="campaign-card-description">
                        {campaign.description || 'Mỗi sự đóng góp đều giúp chiến dịch tiến gần hơn tới mục tiêu.'}
                      </p>
                      <div className="campaign-card-actions">
                        <Link to={`/campaign/${campaign.campaign_id}`} className="detail-link">
                          Chi tiết
                        </Link>
                        <Link to={`/donate/${campaign.campaign_id}`} className="donate-link">
                          Ủng hộ
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="empty-box">
                Chưa có chiến dịch nào được đăng tải.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

HomePage.propTypes = {
  user: PropTypes.shape({ role: PropTypes.string }),
  status: PropTypes.string,
}

export default HomePage
