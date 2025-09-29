import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import User from '../models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const makeUserAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.log('❌ User not found with email:', email)
      process.exit(1)
    }

    user.role = 'admin'
    user.isApproved = true
    await user.save()

    console.log('✅ User successfully made admin!')
    console.log('User details:')
    console.log('  Name:', user.firstName, user.lastName)
    console.log('  Email:', user.email)
    console.log('  Role:', user.role)
    console.log('  Approved:', user.isApproved)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

const email = process.argv[2]

if (!email) {
  console.log('Usage: node makeAdmin.js <email>')
  console.log('Example: node makeAdmin.js user@example.com')
  process.exit(1)
}

makeUserAdmin(email)