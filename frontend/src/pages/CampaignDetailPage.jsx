import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'

const API_BASE = 'http://localhost:8081'

function CampaignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [donations, setDonations] = useState([])
  const [disbursements, setDisbursements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      axios.get(`${API_BASE}/api/campaigns/${id}`, { signal: controller.signal }),
      axios.get(`${API_BASE}/api/campaigns/${id}/donations`, { signal: controller.signal }),
      axios.get(`${API_BASE}/api/campaigns/${id}/disbursements`, { signal: controller.signal }),
    ])
      .then(([campaignResponse, donationResponse, disbursementResponse]) => {
        setCampaign(campaignResponse.data?.campaign || null)
        setDonations(donationResponse.data?.data || [])
        setDisbursements(disbursementResponse.data?.data || [])
        setError('')
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.data?.message || 'Không thể tải dữ liệu chiến dịch.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [id])

  useEffect(() => {
    const socket = io(API_BASE)
    socket.emit('join_campaign', id)
    socket.on('update_progress', (update) => {
      if (Number(update.campaign_id) !== Number(id)) return
      setCampaign((current) => current ? { ...current, current_amount: update.current_amount } : current)
      if (update.new_donation) {
        setDonations((current) => [
          update.new_donation,
          ...current.filter((item) => item.donation_id !== update.new_donation.donation_id),
        ])
      }
    })
    return () => socket.disconnect()
  }, [id])

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

  if (loading) return <div className="loading-box">Đang tải chi tiết chiến dịch...</div>
  if (error || !campaign) {
    return (
      <div className="detail-page">
        <div className="error-box" role="alert">{error || 'Không có dữ liệu chiến dịch.'}</div>
        <Link to="/" className="back-link">← Quay lại</Link>
      </div>
    )
  }

  const raised = Number(campaign.current_amount || 0)
  const target = Number(campaign.target_amount || 0)
  const percent = target > 0 ? Math.min((raised / target) * 100, 100) : 0

  return (
    <main className="detail-page">
      <Link to="/" className="back-link">← Quay lại danh sách</Link>
      <section className="detail-hero">
        <div className="detail-image-wrap">
          <img src={campaign.thumbnail_url || 'https://via.placeholder.com/1200x700'} alt={campaign.title} />
        </div>
        <div className="detail-summary">
          <span className="category">{campaign.category_id || 'Dự án cộng đồng'}</span>
          <h1>{campaign.title}</h1>
          <div className="detail-status-row">
            <span className="status-pill">{campaign.status}</span>
            <span>Mục tiêu: {formatCurrency(target)}</span>
          </div>
          <div className="detail-progress">
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
          <p className="campaign-description">{campaign.description}</p>
          <div className="detail-actions">
            {campaign.status === 'ACTIVE' && (
              <button type="button" className="primary" onClick={() => navigate(`/donate/${campaign.campaign_id}`)}>
                Ủng hộ chiến dịch
              </button>
            )}
            <button type="button" className="secondary" onClick={() => navigate('/')}>Về trang chủ</button>
          </div>
        </div>
      </section>

      <section className="detail-content">
        <div className="article-box">
          <h2>Nội dung chiến dịch</h2>
          <p>{campaign.content}</p>
        </div>
        <div className="info-card">
          <h2>Thông tin mục tiêu</h2>
          <ul>
            <li>Đã quyên góp: {formatCurrency(raised)}</li>
            <li>Mục tiêu: {formatCurrency(target)}</li>
            <li>Người tạo: {campaign.created_by || 'Ban quản lý'}</li>
            <li>Trạng thái: {campaign.status}</li>
          </ul>
        </div>
      </section>

      <section className="transparency-grid">
        <div className="info-card">
          <h2>Lịch sử quyên góp</h2>
          {donations.length ? (
            <ul className="transparency-list">
              {donations.map((donation) => (
                <li key={donation.donation_id}>
                  <div className="transparency-item-head">
                    <strong>{donation.is_anonymous ? 'Nhà hảo tâm ẩn danh' : donation.donor_name || 'Nhà hảo tâm'}</strong>
                    <span>{formatCurrency(donation.amount)}</span>
                  </div>
                  {donation.message && <p>{donation.message}</p>}
                  {donation.created_at && <time dateTime={donation.created_at}>{new Date(donation.created_at).toLocaleString('vi-VN')}</time>}
                </li>
              ))}
            </ul>
          ) : <p className="transparency-empty">Chưa có lượt quyên góp nào.</p>}
        </div>
        <div className="info-card">
          <h2>Minh bạch giải ngân</h2>
          {disbursements.length ? (
            <ul className="transparency-list">
              {disbursements.map((disbursement) => (
                <li key={disbursement.disbursement_id}>
                  <div className="transparency-item-head">
                    <strong>{formatCurrency(disbursement.amount)}</strong>
                    {disbursement.created_at && <time dateTime={disbursement.created_at}>{new Date(disbursement.created_at).toLocaleDateString('vi-VN')}</time>}
                  </div>
                  {disbursement.note && <p>{disbursement.note}</p>}
                  {disbursement.proof_image_url && (
                    <a href={disbursement.proof_image_url} target="_blank" rel="noreferrer">Xem chứng từ giải ngân</a>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="transparency-empty">Chưa có thông tin giải ngân.</p>}
        </div>
      </section>
    </main>
  )
}

export default CampaignDetailPage
