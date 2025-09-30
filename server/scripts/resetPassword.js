import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import User from '../models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const resetPassword = async (email, newPassword) => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.log('❌ User not found with email:', email)
      process.exit(1)
    }

    user.password = newPassword
    await user.save()

    console.log('✅ Password successfully reset!')
    console.log('User details:')
    console.log('  Name:', user.firstName, user.lastName)
    console.log('  Email:', user.email)
    console.log('  New Password:', newPassword)
    console.log('  Role:', user.role)
    console.log('  Approved:', user.isApproved)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.log('Usage: node resetPassword.js <email> <new-password>')
  console.log('Example: node resetPassword.js user@example.com NewPass123')
  process.exit(1)
}

resetPassword(email, newPassword)