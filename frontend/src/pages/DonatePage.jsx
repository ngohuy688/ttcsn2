import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'

const API_BASE = 'http://localhost:8081'

function DonatePage({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [donationForm, setDonationForm] = useState({
    amount: '',
    donor_name: user?.full_name || '',
    message: '',
    transaction_code: '',
    is_anonymous: false,
    payment_method: 'BANK_TRANSFER',
  })

  useEffect(() => {
    const controller = new AbortController()
    axios.get(`${API_BASE}/api/campaigns/${id}`, { signal: controller.signal })
      .then((response) => {
        setCampaign(response.data?.campaign || null)
        setError('')
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.data?.message || 'Không tìm thấy chiến dịch hoặc backend đang lỗi.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  const handleDonationSubmit = async (event) => {
    event.preventDefault()
    if (!donationForm.amount || Number(donationForm.amount) <= 0) {
      setMessage('Vui lòng nhập số tiền quyên góp hợp lệ.')
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const payload = {
        campaign_id: Number(id),
        donor_name: donationForm.donor_name,
        amount: Number(donationForm.amount),
        message: donationForm.message,
        payment_method: donationForm.payment_method,
        transaction_code: donationForm.transaction_code || `AUTO-${Date.now()}`,
        is_anonymous: donationForm.is_anonymous,
      }
      const token = localStorage.getItem('token')
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      await axios.post(`${API_BASE}/api/donations`, payload, config)
      setMessage('Quyên góp đã được ghi nhận thành công!')
      setDonationForm({
        amount: '',
        donor_name: user?.full_name || '',
        message: '',
        transaction_code: '',
        is_anonymous: false,
        payment_method: 'BANK_TRANSFER',
      })
      setTimeout(() => navigate(`/campaign/${id}`), 1200)
    } catch (requestError) {
      setMessage(requestError.response?.data?.message || 'Quyên góp không thành công.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-box" role="status">Đang chuẩn bị form quyên góp...</div>
  if (error || !campaign) {
    return (
      <div className="detail-page">
        <div className="error-box" role="alert">{error || 'Không có dữ liệu chiến dịch.'}</div>
        <Link to="/" className="back-link">← Quay lại</Link>
      </div>
    )
  }

  return (
    <main className="detail-page">
      <Link to={`/campaign/${id}`} className="back-link">← Quay lại chiến dịch</Link>
      <section className="donate-layout">
        <div className="donate-summary">
          <img src={campaign.thumbnail_url || 'https://via.placeholder.com/1200x700'} alt={campaign.title} />
          <div>
            <span className="category">{campaign.category_id || 'Dự án cộng đồng'}</span>
            <h1>{campaign.title}</h1>
            <p>{campaign.description}</p>
          </div>
        </div>

        <form className="donation-form" onSubmit={handleDonationSubmit}>
          <h2>Form quyên góp</h2>
          <label>
            Số tiền quyên góp
            <input
              type="number"
              min="1000"
              value={donationForm.amount}
              onChange={(event) => setDonationForm({ ...donationForm, amount: event.target.value })}
              placeholder="Ví dụ: 200000"
              required
            />
          </label>
          <label>
            Họ tên
            <input
              type="text"
              value={donationForm.donor_name}
              onChange={(event) => setDonationForm({ ...donationForm, donor_name: event.target.value })}
              disabled={donationForm.is_anonymous}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={donationForm.is_anonymous}
              onChange={(event) => setDonationForm({ ...donationForm, is_anonymous: event.target.checked })}
            />
            Quyên góp ẩn danh
          </label>
          <label>
            Phương thức thanh toán
            <select
              value={donationForm.payment_method}
              onChange={(event) => setDonationForm({ ...donationForm, payment_method: event.target.value })}
            >
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="MOMO">Momo</option>
              <option value="VNPAY">VNPay</option>
            </select>
          </label>
          <label>
            Mã giao dịch / hóa đơn
            <input
              type="text"
              value={donationForm.transaction_code}
              onChange={(event) => setDonationForm({ ...donationForm, transaction_code: event.target.value })}
              placeholder="VD: BANK-001"
            />
          </label>
          <label>
            Lời nhắn
            <textarea
              rows="4"
              value={donationForm.message}
              onChange={(event) => setDonationForm({ ...donationForm, message: event.target.value })}
              placeholder="Chia sẻ lời động viên..."
            />
          </label>
          <button type="submit" className="primary donation-button" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Xác nhận quyên góp'}
          </button>
          {message && <div className="status-banner" role="status">{message}</div>}
        </form>
      </section>
    </main>
  )
}

DonatePage.propTypes = {
  user: PropTypes.shape({ full_name: PropTypes.string }),
}

export default DonatePage
