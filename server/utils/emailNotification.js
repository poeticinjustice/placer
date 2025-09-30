import nodemailer from 'nodemailer'

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  })
}

// Send new user signup notification
export const sendSignupNotification = async (user) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: '🎉 New User Signup - Placer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New User Signup</h2>
          <p>A new user has signed up for Placer!</p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role || 'user'}</p>
            <p><strong>Signup Date:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from your Placer application.
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Signup notification sent successfully')
  } catch (error) {
    console.error('❌ Error sending signup notification:', error)
    // Don't throw error - we don't want signup to fail if email fails
  }
}
