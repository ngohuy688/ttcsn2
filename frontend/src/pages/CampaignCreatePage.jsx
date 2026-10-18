import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'
import './CampaignCreatePage.css'

const API_BASE = 'http://localhost:8081'

function CampaignCreatePage({ user }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    target_amount: '',
    thumbnail_url: '',
    category_id: '1',
    start_date: '',
    end_date: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user || !['CAMPAIGN_MANAGER', 'ADMIN'].includes(user.role)) {
    return (
      <main className="detail-page">
        <div className="error-box">Bạn cần đăng nhập bằng tài khoản Quản lý chiến dịch hoặc Admin.</div>
        <Link to="/" className="back-link">← Về trang chủ</Link>
      </main>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE}/api/campaigns`,
        { ...form, target_amount: Number(form.target_amount), category_id: Number(form.category_id) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate(`/campaign/${response.data.campaign.campaign_id}`)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể gửi chiến dịch để kiểm duyệt.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="detail-page">
      <Link to="/" className="back-link">← Về trang chủ</Link>
      <form className="campaign-form" onSubmit={handleSubmit}>
        <h1>Tạo chiến dịch gây quỹ</h1>
        <p>Chiến dịch mới sẽ được gửi đi kiểm duyệt trước khi hiển thị công khai.</p>
        <label>
          Tiêu đề
          <input required maxLength="255" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <label>
          Mô tả ngắn
          <textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <label>
          Nội dung chi tiết
          <textarea required rows="6" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
        </label>
        <label>
          Mục tiêu gây quỹ (VND)
          <input required type="number" min="1" value={form.target_amount} onChange={(event) => setForm({ ...form, target_amount: event.target.value })} />
        </label>
        <label>
          Danh mục
          <select value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}>
            <option value="1">Hỗ trợ sinh viên</option>
            <option value="2">Bệnh hiểm nghèo</option>
            <option value="3">Đời sống cộng đồng</option>
          </select>
        </label>
        <label>
          Ảnh đại diện (URL)
          <input type="url" value={form.thumbnail_url} onChange={(event) => setForm({ ...form, thumbnail_url: event.target.value })} placeholder="https://..." />
        </label>
        <label>
          Ngày bắt đầu
          <input required type="datetime-local" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} />
        </label>
        <label>
          Ngày kết thúc
          <input required type="datetime-local" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} />
        </label>
        {error && <div className="error-box" role="alert">{error}</div>}
        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi kiểm duyệt'}
        </button>
      </form>
    </main>
  )
}

CampaignCreatePage.propTypes = {
  user: PropTypes.shape({ role: PropTypes.string }),
}

export default CampaignCreatePage
