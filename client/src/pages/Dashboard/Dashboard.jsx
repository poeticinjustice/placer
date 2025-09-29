import { useSelector } from 'react-redux'

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.firstName}!</h1>
          {!user?.isApproved && (
            <div className="approval-notice">
              <p>Your account is pending admin approval. You can update your profile but cannot create posts yet.</p>
            </div>
          )}
        </div>

        <div className="dashboard-content">
          <p>Dashboard content coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard