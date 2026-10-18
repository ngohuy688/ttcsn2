import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './SearchPage.css'

const API_BASE = 'http://localhost:8081'

function SearchPage() {
  const [campaigns, setCampaigns] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadCampaigns = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${API_BASE}/api/campaigns`, {
          params: { status: 'ACTIVE', q: submittedSearch || undefined },
          signal: controller.signal,
        })
        setCampaigns(response.data?.data || [])
        setError('')
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') {
          setError('Không thể tải chiến dịch. Vui lòng kiểm tra kết nối và thử lại.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCampaigns()
    return () => controller.abort()
  }, [submittedSearch, requestVersion])

  const handleSearch = (event) => {
    event.preventDefault()
    setSubmittedSearch(searchInput.trim())
    setRequestVersion((version) => version + 1)
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

  return (
    <main className="search-page">
      <section className="search-intro">
        <span className="search-eyebrow">HaUI Care · Chung tay sẻ chia</span>
        <h1>Tìm một chiến dịch để cùng tạo nên thay đổi</h1>
        <p>Khám phá những câu chuyện đang cần sự đồng hành của cộng đồng HaUI.</p>

        <form className="search-page-form" role="search" onSubmit={handleSearch}>
          <label htmlFor="campaign-search-input">Bạn muốn hỗ trợ điều gì?</label>
          <div className="search-page-control">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              id="campaign-search-input"
              type="search"
              value={searchInput}
              maxLength={100}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Thử tìm: học bổng, sức khỏe, cộng đồng..."
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
          <span className="search-page-hint">Tìm theo tên, mô tả hoặc nội dung chiến dịch.</span>
        </form>
      </section>

      <section className="search-results" aria-labelledby="search-results-title">
        <div className="search-results-heading">
          <div>
            <span className="search-results-kicker">Khám phá và sẻ chia</span>
            <h2 id="search-results-title">
              {submittedSearch ? `Kết quả cho “${submittedSearch}”` : 'Chiến dịch đang cần bạn'}
            </h2>
          </div>
          {!loading && !error && (
            <span className="search-result-count">{campaigns.length} chiến dịch</span>
          )}
        </div>

        {error && <div className="error-box" role="alert">{error}</div>}
        {loading ? (
          <div className="search-state" role="status">Đang tải các chiến dịch...</div>
        ) : !error && campaigns.length ? (
          <div className="search-campaign-grid">
            {campaigns.map((campaign) => {
              const raised = Number(campaign.current_amount || 0)
              const target = Number(campaign.target_amount || 0)
              const percent = target > 0 ? Math.min((raised / target) * 100, 100) : 0

              return (
                <article className="search-campaign-card" key={campaign.campaign_id}>
                  <Link
                    to={`/campaign/${campaign.campaign_id}`}
                    className="search-card-image-link"
                    aria-label={`Xem chiến dịch ${campaign.title}`}
                  >
                    <img
                      src={campaign.thumbnail_url || 'https://via.placeholder.com/1200x700'}
                      alt=""
                    />
                  </Link>
                  <div className="search-card-content">
                    <span className="search-card-category">{campaign.category_id || 'Cộng đồng'}</span>
                    <h3><Link to={`/campaign/${campaign.campaign_id}`}>{campaign.title}</Link></h3>
                    <p className="search-card-description">
                      {campaign.description || 'Mỗi sự đóng góp đều giúp chiến dịch tiến gần hơn tới mục tiêu.'}
                    </p>
                    <div className="search-card-progress">
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
                      <div className="search-card-amounts">
                        <strong>{formatCurrency(raised)}</strong>
                        <span>{percent.toFixed(0)}% · mục tiêu {formatCurrency(target)}</span>
                      </div>
                    </div>
                    <Link className="search-card-cta" to={`/donate/${campaign.campaign_id}`}>
                      Ủng hộ chiến dịch
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : !error ? (
          <div className="search-empty">
            <span className="search-empty-icon" aria-hidden="true">⌕</span>
            <h3>{submittedSearch ? 'Chưa tìm thấy chiến dịch phù hợp' : 'Chưa có chiến dịch đang hoạt động'}</h3>
            <p>
              {submittedSearch
                ? 'Thử từ khóa khác hoặc kiểm tra lại cách viết nhé.'
                : 'Các chiến dịch sẽ xuất hiện tại đây khi được đăng tải.'}
            </p>
            {submittedSearch && (
              <button
                className="search-reset"
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSubmittedSearch('')
                  setRequestVersion((version) => version + 1)
                }}
              >
                Xem tất cả chiến dịch
              </button>
            )}
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default SearchPage
