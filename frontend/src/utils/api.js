import axios from 'axios'

const API_BASE = '/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    username,
    password
  })
  localStorage.setItem('token', response.data.token)
  return response.data
}

export const register = async (username, email, password, isAdmin = false) => {
  const response = await axios.post(`${API_BASE}/auth/register`, {
    username,
    email,
    password,
    is_admin: isAdmin
  })
  localStorage.setItem('token', response.data.token)
  return response.data
}

export const logout = async () => {
  try {
    await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: getAuthHeader()
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
  localStorage.removeItem('token')
}

export const validateSession = async () => {
  const response = await axios.get(`${API_BASE}/auth/me`, {
    headers: getAuthHeader()
  })
  return response.data
}

export const createSummary = async (formData) => {
  const response = await axios.post(`${API_BASE}/summarize`, formData, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const getUserSummaries = async () => {
  const response = await axios.get(`${API_BASE}/summaries`, {
    headers: getAuthHeader()
  })
  return response.data.summaries
}

export const downloadSummary = async (summaryId, format) => {
  const response = await axios.get(
    `${API_BASE}/download/${summaryId}?format=${format}`,
    {
      headers: getAuthHeader(),
      responseType: 'blob'
    }
  )

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `summary_${summaryId}.${format}`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const getAllUsers = async () => {
  const response = await axios.get(`${API_BASE}/admin/users`, {
    headers: getAuthHeader()
  })
  return response.data.users
}

export const getAllSummaries = async () => {
  const response = await axios.get(`${API_BASE}/admin/summaries`, {
    headers: getAuthHeader()
  })
  return response.data.summaries
}

export const getUserSummariesAdmin = async (userId) => {
  const response = await axios.get(`${API_BASE}/admin/users/${userId}/summaries`, {
    headers: getAuthHeader()
  })
  return response.data.summaries
}
