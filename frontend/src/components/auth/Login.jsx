import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Lock, User, LogIn } from 'lucide-react'
import { login } from '../../utils/api'
import './Auth.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(username, password)
      onLogin(data.user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <BookOpen size={40} color="var(--primary)" />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue to Book Summarizer</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="username"
                  type="text"
                  className="input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>

          <div className="auth-divider">
            <span>Demo Credentials</span>
          </div>

          <div className="demo-credentials">
            <div className="demo-card">
              <strong>Admin:</strong>
              <span>admin / admin123</span>
            </div>
            <div className="demo-card">
              <strong>User:</strong>
              <span>Create new account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
