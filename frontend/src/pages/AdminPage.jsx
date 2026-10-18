import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'

const API_BASE = 'http://localhost:8081'

function AdminPage({ user }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    axios.get(`${API_BASE}/api/campaigns`, { signal: controller.signal })
      .then((response) => {
        setCampaigns(response.data?.data || [])
        setError('')
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.data?.message || 'Không thể tải danh sách chiến dịch.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const handleStatusChange = async (campaignId, status) => {
    setError('')
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API_BASE}/api/campaigns/${campaignId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCampaigns((current) => current.map((campaign) =>
        campaign.campaign_id === campaignId ? { ...campaign, status } : campaign
      ))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái.')
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="detail-page">
        <div className="error-box">Bạn cần đăng nhập với tài khoản Admin để truy cập trang này.</div>
        <Link to="/" className="back-link">← Về trang chủ</Link>
      </div>
    )
  }

  return (
    <main className="detail-page">
      <h1 className="admin-title">Quản trị chiến dịch</h1>
      {error && <div className="error-box" role="alert">{error}</div>}
      {loading ? (
        <div className="loading-box" role="status">Đang tải danh sách quản trị...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Tiêu đề</th><th>Trạng thái</th><th>Mục tiêu</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.campaign_id}>
                  <td>{campaign.title}</td>
                  <td>{campaign.status}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(campaign.target_amount || 0))}</td>
                  <td className="admin-actions">
                    <button type="button" className="approve-btn" onClick={() => handleStatusChange(campaign.campaign_id, 'ACTIVE')}>Duyệt</button>
                    <button type="button" className="reject-btn" onClick={() => handleStatusChange(campaign.campaign_id, 'CLOSED')}>Từ chối</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

AdminPage.propTypes = {
  user: PropTypes.shape({ role: PropTypes.string }),
}

export default AdminPage
