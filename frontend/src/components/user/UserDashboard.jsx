import React, { useState, useEffect } from 'react'
import { LogOut, BookOpen, Upload, FileText, Download, Clock, List } from 'lucide-react'
import { logout, createSummary, getUserSummaries, downloadSummary } from '../../utils/api'
import './UserDashboard.css'

function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('create')
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [inputText, setInputText] = useState('')
  const [file, setFile] = useState(null)
  const [summaryType, setSummaryType] = useState('paragraph')
  const [summaryLength, setSummaryLength] = useState(75)
  const [currentSummary, setCurrentSummary] = useState(null)

  useEffect(() => {
    if (activeTab === 'history') {
      loadSummaries()
    }
  }, [activeTab])

  const loadSummaries = async () => {
    try {
      const data = await getUserSummaries()
      setSummaries(data)
    } catch (err) {
      setError('Failed to load summaries')
    }
  }

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const validTypes = ['text/plain', 'application/pdf']
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a TXT or PDF file')
        return
      }
      setFile(selectedFile)
      setInputText('')
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setCurrentSummary(null)

    if (!inputText.trim() && !file) {
      setError('Please provide text or upload a file')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('summary_type', summaryType)
      formData.append('summary_length', summaryLength)

      if (file) {
        formData.append('file', file)
      } else {
        formData.append('input_text', inputText)
      }

      const result = await createSummary(formData)
      setCurrentSummary(result)
      setInputText('')
      setFile(null)

      if (document.getElementById('fileInput')) {
        document.getElementById('fileInput').value = ''
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <BookOpen size={28} color="var(--primary)" />
          <span>Book Summarizer</span>
        </div>

        <div className="nav-user">
          <div className="user-info">
            <div className="user-avatar">{user.username[0].toUpperCase()}</div>
            <span>{user.username}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <FileText size={18} />
            Create Summary
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={18} />
            My Summaries
          </button>
        </div>

        {activeTab === 'create' ? (
          <div className="tab-content fade-in">
            <div className="create-section">
              <div className="create-form-wrapper">
                <h2>Create New Summary</h2>
                <p className="section-description">
                  Upload a document or paste text to generate an AI-powered summary
                </p>

                {error && (
                  <div className="alert alert-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="create-form">
                  <div className="form-section">
                    <label className="form-label">Input Method</label>
                    <div className="input-methods">
                      <div className="method-option">
                        <label htmlFor="fileInput" className="file-upload-btn">
                          <Upload size={20} />
                          {file ? file.name : 'Upload File (TXT/PDF)'}
                        </label>
                        <input
                          id="fileInput"
                          type="file"
                          onChange={handleFileChange}
                          accept=".txt,.pdf"
                          style={{ display: 'none' }}
                        />
                      </div>

                      <div className="method-divider">
                        <span>OR</span>
                      </div>

                      <div className="method-option">
                        <textarea
                          className="input textarea"
                          placeholder="Paste your text here..."
                          value={inputText}
                          onChange={(e) => {
                            setInputText(e.target.value)
                            if (e.target.value.trim()) {
                              setFile(null)
                              if (document.getElementById('fileInput')) {
                                document.getElementById('fileInput').value = ''
                              }
                            }
                          }}
                          rows={8}
                          disabled={!!file}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Summary Type</label>
                      <select
                        className="input select"
                        value={summaryType}
                        onChange={(e) => setSummaryType(e.target.value)}
                      >
                        <option value="paragraph">Paragraph</option>
                        <option value="bullet">Bullet Points</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Target Length (words)</label>
                      <select
                        className="input select"
                        value={summaryLength}
                        onChange={(e) => setSummaryLength(Number(e.target.value))}
                      >
                        <option value="50">50 words</option>
                        <option value="75">75 words</option>
                        <option value="100">100 words</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-large"
                    disabled={loading || (!inputText.trim() && !file)}
                  >
                    {loading ? 'Generating Summary...' : 'Generate Summary'}
                  </button>
                </form>
              </div>

              {currentSummary && (
                <div className="summary-preview fade-in">
                  <div className="summary-header">
                    <h3>Generated Summary</h3>
                    <div className="summary-meta">
                      <span className="badge">{currentSummary.word_count} words</span>
                      <span className="badge badge-primary">{currentSummary.summary_type}</span>
                    </div>
                  </div>

                  <div className="summary-content">
                    <p style={{ whiteSpace: 'pre-line' }}>{currentSummary.summary}</p>
                  </div>

                  <div className="summary-actions">
                    <button
                      onClick={() => handleDownload(currentSummary.summary_id, 'txt')}
                      className="btn btn-outline"
                    >
                      <Download size={16} />
                      Download TXT
                    </button>
                    <button
                      onClick={() => handleDownload(currentSummary.summary_id, 'pdf')}
                      className="btn btn-outline"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="tab-content fade-in">
            <div className="history-section">
              <div className="history-header">
                <h2>My Summaries</h2>
                <p className="section-description">
                  View and download your previous summaries
                </p>
              </div>

              {summaries.length === 0 ? (
                <div className="empty-state">
                  <List size={48} color="var(--text-tertiary)" />
                  <h3>No summaries yet</h3>
                  <p>Create your first summary to see it here</p>
                </div>
              ) : (
                <div className="summaries-grid">
                  {summaries.map((summary) => (
                    <div key={summary.id} className="summary-card">
                      <div className="summary-card-header">
                        <div className="summary-meta">
                          <span className="badge">{summary.word_count} words</span>
                          <span className="badge badge-primary">{summary.summary_type}</span>
                        </div>
                        <span className="summary-date">
                          <Clock size={14} />
                          {formatDate(summary.created_at)}
                        </span>
                      </div>

                      <div className="summary-card-content">
                        <p style={{ whiteSpace: 'pre-line' }}>{summary.summary_text.substring(0, 200)}...</p>
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

export default UserDashboard
