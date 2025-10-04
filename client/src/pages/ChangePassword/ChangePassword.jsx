import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { api } from '../../services/api'
import { handleApiError } from '../../utils/apiErrorHandler'
import { useToast } from '../../components/UI/ToastContainer'
import { FormInput } from '../../components/Form'
import './ChangePassword.css'

const ChangePassword = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    try {
      setIsLoading(true)
      await api.auth.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })

      toast.success('Password changed successfully!')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      setTimeout(() => {
        navigate('/profile')
      }, 2000)
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to change password')
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="change-password">
      <div className="container">
        <div className="change-password-card">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeftIcon className="icon" />
            Back
          </button>

          <div className="change-password-header">
            <div className="header-icon">
              <LockClosedIcon className="icon" />
            </div>
            <h1>Change Password</h1>
            <p>Update your password to keep your account secure</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="change-password-form">
            <FormInput
              label="Current Password"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              placeholder="Enter your current password"
            />

            <FormInput
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Enter your new password"
              helpText="Password must be at least 6 characters"
            />

            <FormInput
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your new password"
            />

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
