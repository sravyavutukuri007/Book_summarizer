import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import UserDashboard from './components/user/UserDashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import { validateSession } from './utils/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = await validateSession()
        setUser(userData)
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.is_admin ? "/admin" : "/dashboard"} />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.is_admin ? "/admin" : "/dashboard"} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={user.is_admin ? "/admin" : "/dashboard"} />
            ) : (
              <Register onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user && !user.is_admin ? (
              <UserDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin"
          element={
            user && user.is_admin ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
