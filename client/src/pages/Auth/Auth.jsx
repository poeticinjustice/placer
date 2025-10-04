import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signup, login, clearError } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { FormInput } from '../../components/Form'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import './Auth.css'

const Auth = () => {
  useDocumentTitle('Sign In')
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())

    if (isLogin) {
      dispatch(login({
        email: formData.email,
        password: formData.password
      }))
    } else {
      dispatch(signup(formData))
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    dispatch(clearError())
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    })
  }

  return (
    <div className="auth">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="card-header text-center">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to your account' : 'Join our community'}</p>
          </div>

          <div className="card-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-row">
                  <FormInput
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your first name"
                  />
                  <FormInput
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                </div>
              )}

              <FormInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />

              <FormInput
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                minLength={6}
                helpText="Password must be at least 6 characters"
              />

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          </div>

          <div className="card-footer text-center">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="link-button"
                onClick={toggleMode}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {!isLogin && (
          <div className="signup-info">
            <div className="info-card card">
              <div className="card-body">
                <h3>Account Approval</h3>
                <p>
                  New accounts require admin approval before you can create posts.
                  You can update your profile immediately after signup, but posting
                  will be available once your account is approved.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth