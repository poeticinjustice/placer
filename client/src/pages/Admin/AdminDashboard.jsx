import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDateTime } from '../../utils/dateFormatter'
import { API_URL } from '../../config/api'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth)
  const [searchParams, setSearchParams] = useSearchParams()
  const [pendingUsers, setPendingUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingUserId, setProcessingUserId] = useState(null)
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchPendingUsers()
  }, [pagination.page])

  const fetchPendingUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.get(
        `${API_URL}/api/users/admin/pending?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setPendingUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Error fetching pending users:', err)
      setError(err.response?.data?.message || 'Failed to fetch pending users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user?')) {
      return
    }

    try {
      setProcessingUserId(userId)
      await axios.put(
        `${API_URL}/api/users/admin/approve/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setPendingUsers(pendingUsers.filter(user => user._id !== userId))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      console.error('Error approving user:', err)
      alert(err.response?.data?.message || 'Failed to approve user')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject and DELETE this user? This action cannot be undone.')) {
      return
    }

    try {
      setProcessingUserId(userId)
      await axios.delete(
        `${API_URL}/api/users/admin/reject/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setPendingUsers(pendingUsers.filter(user => user._id !== userId))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      console.error('Error rejecting user:', err)
      alert(err.response?.data?.message || 'Failed to reject user')
    } finally {
      setProcessingUserId(null)
    }
  }

  if (isLoading && pendingUsers.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage pending user approvals</p>
        </div>

        {error && (
          <div className="error-message">
            <ExclamationTriangleIcon className="icon" />
            {error}
          </div>
        )}

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-number">{pagination.total}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </div>

        <div className="admin-actions">
          <Link to="/admin/users" className="action-card">
            <UserIcon className="icon" />
            <h3>User Management</h3>
            <p>View, approve, and manage all users</p>
          </Link>

          <Link to="/admin/places" className="action-card">
            <MapPinIcon className="icon" />
            <h3>Featured Places</h3>
            <p>Manage which places appear on the home page</p>
          </Link>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="empty-state">
            <CheckCircleIcon className="empty-icon" />
            <h3>All caught up!</h3>
            <p>No pending user approvals at the moment.</p>
          </div>
        ) : (
          <>
            <div className="users-list">
              {pendingUsers.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.firstName} />
                    ) : (
                      <div className="avatar-placeholder">
                        <UserIcon className="icon" />
                      </div>
                    )}
                  </div>

                  <div className="user-info">
                    <h3 className="user-name">
                      {user.firstName} {user.lastName}
                    </h3>

                    <div className="user-details">
                      <div className="detail-item">
                        <EnvelopeIcon className="icon" />
                        <span>{user.email}</span>
                      </div>

                      {user.location && (
                        <div className="detail-item">
                          <MapPinIcon className="icon" />
                          <span>{user.location}</span>
                        </div>
                      )}

                      <div className="detail-item">
                        <CalendarDaysIcon className="icon" />
                        <span>Joined {formatDateTime(user.createdAt)}</span>
                      </div>
                    </div>

                    {user.bio && (
                      <div className="user-bio">
                        <p>{user.bio}</p>
                      </div>
                    )}

                    <div className="user-stats">
                      <span className="stat">Places: {user.placesCount || 0}</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    <button
                      onClick={() => handleApprove(user._id)}
                      className="btn btn-approve"
                      disabled={processingUserId === user._id}
                    >
                      {processingUserId === user._id ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <>
                          <CheckCircleIcon className="icon" />
                          Approve
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(user._id)}
                      className="btn btn-reject"
                      disabled={processingUserId === user._id}
                    >
                      {processingUserId === user._id ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <>
                          <XCircleIcon className="icon" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => {
                    const newPage = pagination.page - 1
                    setPagination(prev => ({ ...prev, page: newPage }))
                    setSearchParams({ page: newPage.toString() })
                  }}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  onClick={() => {
                    const newPage = pagination.page + 1
                    setPagination(prev => ({ ...prev, page: newPage }))
                    setSearchParams({ page: newPage.toString() })
                  }}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard