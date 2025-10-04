import { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDateTime } from '../../utils/dateFormatter'
import { useConfirm } from '../../components/UI/ConfirmDialogProvider'
import { useToast } from '../../components/UI/ToastContainer'
import {
  fetchAllUsers,
  approveUser,
  rejectUser,
  toggleAdminStatus
} from '../../store/slices/adminSlice'
import './UserManagement.css'

const UserManagement = () => {
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const toast = useToast()

  const { user: currentUser } = useSelector((state) => state.auth)
  const { allUsers, isLoadingUsers, usersError } = useSelector((state) => state.admin)

  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'approved', 'pending'
  const [processingUserId, setProcessingUserId] = useState(null)

  useEffect(() => {
    dispatch(fetchAllUsers())
  }, [dispatch])

  const filterUsers = useCallback(() => {
    let filtered = [...allUsers]

    // Apply status filter
    if (filterStatus === 'approved') {
      filtered = filtered.filter(user => user.isApproved)
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(user => !user.isApproved)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.location?.toLowerCase().includes(query)
      )
    }

    setFilteredUsers(filtered)
  }, [allUsers, searchQuery, filterStatus])

  useEffect(() => {
    filterUsers()
  }, [filterUsers])

  const handleApprove = async (userId) => {
    const confirmed = await confirm('Approve this user?')
    if (!confirmed) return

    try {
      setProcessingUserId(userId)
      await dispatch(approveUser(userId)).unwrap()
      toast.success('User approved successfully')
    } catch (err) {
      toast.error(err || 'Failed to approve user')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleDelete = async (userId, userName) => {
    const confirmed = await confirm(
      `Permanently DELETE user "${userName}"?`,
      'This action cannot be undone and will delete all their places.'
    )
    if (!confirmed) return

    try {
      setProcessingUserId(userId)
      await dispatch(rejectUser(userId)).unwrap()
      toast.success('User deleted successfully')
    } catch (err) {
      toast.error(err || 'Failed to delete user')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleToggleAdmin = async (userId, userName, currentRole) => {
    const action = currentRole === 'admin' ? 'Remove admin privileges from' : 'Make'
    const confirmed = await confirm(`${action} "${userName}"?`)
    if (!confirmed) return

    try {
      setProcessingUserId(userId)
      await dispatch(toggleAdminStatus(userId)).unwrap()
      toast.success(currentRole === 'admin' ? 'Admin privileges removed' : 'User promoted to admin')
    } catch (err) {
      toast.error(err || 'Failed to update user role')
    } finally {
      setProcessingUserId(null)
    }
  }

  if (isLoadingUsers) {
    return <LoadingSpinner />
  }

  const stats = {
    total: allUsers.length,
    approved: allUsers.filter(u => u.isApproved).length,
    pending: allUsers.filter(u => !u.isApproved).length
  }

  return (
    <div className="user-management">
      <div className="container">
        <div className="um-header">
          <div>
            <h1>User Management</h1>
            <p className="subtitle">Manage user accounts and permissions</p>
          </div>
          <Link to="/admin" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {usersError && (
          <div className="error-message">
            <ExclamationTriangleIcon className="icon" />
            {usersError}
          </div>
        )}

        {/* Stats */}
        <div className="um-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        {/* Filters */}
        <div className="um-filters">
          <div className="search-bar">
            <MagnifyingGlassIcon className="icon" />
            <input
              type="text"
              placeholder="Search users by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({stats.total})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              Approved ({stats.approved})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({stats.pending})
            </button>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <UserIcon className="empty-icon" />
            <h3>No users found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="th-user">User</div>
              <div className="th-email">Email</div>
              <div className="th-status">Status</div>
              <div className="th-places">Places</div>
              <div className="th-joined">Joined</div>
              <div className="th-actions">Actions</div>
            </div>

            <div className="table-body">
              {filteredUsers.map((user) => (
                <div key={user._id} className={`user-row ${user.role === 'admin' ? 'admin-row' : ''}`}>
                  <div className="td-user">
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
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                        {user.role === 'admin' && (
                          <ShieldCheckIcon className="admin-badge" title="Administrator" />
                        )}
                      </div>
                      {user.location && (
                        <div className="user-location">
                          <MapPinIcon className="icon" />
                          {user.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="td-email">
                    <EnvelopeIcon className="icon" />
                    {user.email}
                  </div>

                  <div className="td-status">
                    {user.isApproved ? (
                      <span className="status-badge approved">
                        <CheckCircleIcon className="icon" />
                        Approved
                      </span>
                    ) : (
                      <span className="status-badge pending">
                        <ExclamationTriangleIcon className="icon" />
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="td-places">
                    {user.placesCount || 0}
                  </div>

                  <div className="td-joined">
                    <CalendarDaysIcon className="icon" />
                    {formatDateTime(user.createdAt)}
                  </div>

                  <div className="td-actions">
                    {user._id !== currentUser?._id && (
                      <>
                        {user.role !== 'admin' && !user.isApproved && (
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="action-btn approve"
                            disabled={processingUserId === user._id}
                            title="Approve user"
                          >
                            {processingUserId === user._id ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              <CheckCircleIcon className="icon" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleAdmin(user._id, `${user.firstName} ${user.lastName}`, user.role)}
                          className={`action-btn ${user.role === 'admin' ? 'remove-admin' : 'make-admin'}`}
                          disabled={processingUserId === user._id}
                          title={user.role === 'admin' ? 'Remove admin privileges' : 'Make admin'}
                        >
                          {processingUserId === user._id ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            <ShieldCheckIcon className="icon" />
                          )}
                        </button>

                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
                            className="action-btn delete"
                            disabled={processingUserId === user._id}
                            title="Delete user"
                          >
                            {processingUserId === user._id ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              <XCircleIcon className="icon" />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
