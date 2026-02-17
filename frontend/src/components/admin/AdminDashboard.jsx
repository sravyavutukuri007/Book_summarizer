import React, { useState, useEffect } from 'react'
import { LogOut, BookOpen, Users, FileText, Download, Clock, Shield } from 'lucide-react'
import { logout, getAllUsers, getAllSummaries, downloadSummary } from '../../utils/api'
import './AdminDashboard.css'

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    } else if (activeTab === 'summaries') {
      loadSummaries()
    }
  }, [activeTab])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadSummaries = async () => {
    setLoading(true)
    try {
      const data = await getAllSummaries()
      setSummaries(data)
    } catch (err) {
      setError('Failed to load summaries')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  const handleDownload = async (summaryId, format) => {
    try {
      await downloadSummary(summaryId, format)
    } catch (err) {
      setError(`Failed to download ${format.toUpperCase()} file`)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filterSummariesByUser = (userId) => {
    if (!userId) return summaries
    return summaries.filter(s => s.user_id === userId)
  }

  return (
    <div className="admin-dashboard-container">
      <nav className="admin-nav">
        <div className="nav-brand">
          <Shield size={28} color="var(--accent)" />
          <span>Admin Dashboard</span>
        </div>

        <div className="nav-user">
          <div className="user-info">
            <div className="user-avatar admin-avatar">
              {user.username[0].toUpperCase()}
            </div>
            <span>{user.username}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
              <Users size={24} color="var(--primary)" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{users.length}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
              <FileText size={24} color="var(--secondary)" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Summaries</span>
              <span className="stat-value">{summaries.length}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
              <BookOpen size={24} color="var(--accent)" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Avg per User</span>
              <span className="stat-value">
                {users.length > 0 ? (summaries.length / users.length).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Users ({users.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'summaries' ? 'active' : ''}`}
            onClick={() => setActiveTab('summaries')}
          >
            <FileText size={18} />
            All Summaries ({summaries.length})
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {activeTab === 'users' ? (
          <div className="tab-content fade-in">
            <div className="users-section">
              <div className="section-header">
                <h2>User Management</h2>
                <p className="section-description">
                  View all registered users and their activity
                </p>
              </div>

              {loading ? (
                <div className="loading-state">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} color="var(--text-tertiary)" />
                  <h3>No users yet</h3>
                  <p>Users will appear here once they register</p>
                </div>
              ) : (
                <div className="users-table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Summaries</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="user-cell">
                              <div className="mini-avatar">
                                {u.username[0].toUpperCase()}
                              </div>
                              <span>{u.username}</span>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span className="badge">{u.summary_count || 0}</span>
                          </td>
                          <td>{formatDate(u.created_at)}</td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedUser(u.id)
                                setActiveTab('summaries')
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              View Summaries
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="tab-content fade-in">
            <div className="summaries-section">
              <div className="section-header">
                <div>
                  <h2>All Summaries</h2>
                  <p className="section-description">
                    Browse and download all user summaries
                  </p>
                </div>
                {selectedUser && (
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="btn btn-outline"
                  >
                    Show All
                  </button>
                )}
              </div>

              {loading ? (
                <div className="loading-state">Loading summaries...</div>
              ) : filterSummariesByUser(selectedUser).length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} color="var(--text-tertiary)" />
                  <h3>No summaries yet</h3>
                  <p>Summaries will appear here once users create them</p>
                </div>
              ) : (
                <div className="summaries-grid">
                  {filterSummariesByUser(selectedUser).map((summary) => (
                    <div key={summary.id} className="summary-card">
                      <div className="summary-card-header">
                        <div className="user-info-mini">
                          <div className="mini-avatar">
                            {summary.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="username-mini">{summary.username}</div>
                            <div className="email-mini">{summary.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="summary-meta">
                        <span className="badge">{summary.word_count} words</span>
                        <span className="badge badge-primary">{summary.summary_type}</span>
                        <span className="summary-date">
                          <Clock size={12} />
                          {formatDate(summary.created_at)}
                        </span>
                      </div>

                      <div className="summary-card-content">
                        <p>{summary.summary_text.substring(0, 180)}...</p>
                      </div>

                      <div className="summary-card-actions">
                        <button
                          onClick={() => handleDownload(summary.summary_id, 'txt')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download size={14} />
                          TXT
                        </button>
                        <button
                          onClick={() => handleDownload(summary.summary_id, 'pdf')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
