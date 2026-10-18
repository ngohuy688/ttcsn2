import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppHeader from './components/AppHeader.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CampaignCreatePage from './pages/CampaignCreatePage.jsx'
import CampaignDetailPage from './pages/CampaignDetailPage.jsx'
import DonatePage from './pages/DonatePage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import './App.css'

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [status, setStatus] = useState('')

  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppHeader
          user={user}
          onUserChange={setUser}
          onStatusChange={setStatus}
        />
        <Routes>
          <Route path="/" element={<HomePage user={user} status={status} />} />
          <Route path="/login" element={<LoginPage user={user} onAuthenticated={setUser} />} />
          <Route path="/register" element={<RegisterPage user={user} onAuthenticated={setUser} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/campaign/:id" element={<CampaignDetailPage />} />
          <Route path="/campaign/new" element={<CampaignCreatePage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} onProfileLoaded={setUser} />} />
          <Route path="/donate/:id" element={<DonatePage user={user} />} />
          <Route path="/admin" element={<AdminPage user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
