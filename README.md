# Placer - MERN Stack App

A MERN stack application for discovering and sharing places with photos, maps, and location-based features.

## Tech Stack

- **Frontend**: React 19, Redux Toolkit, Vite
- **Backend**: Node.js, Express, MongoDB
- **File Storage**: Cloudinary
- **Maps**: Leaflet/OpenStreetMap
- **Styling**: iOS-style CSS with CSS Variables

## Features

### Phase 1 (Completed)
- ✅ Monorepo structure with client and server
- ✅ React 19 frontend with Redux Toolkit
- ✅ Node.js/Express backend with MongoDB
- ✅ User authentication with admin approval system
- ✅ Cloudinary integration for file uploads
- ✅ Place/post models with CRUD operations
- ✅ Mobile-first iOS-style UI components

### Phase 2 (Completed)
- ✅ Leaflet maps integration with geolocation
- ✅ User profile management with pagination
- ✅ Responsive gallery views (2 columns mobile, more on desktop)
- ✅ Search and filtering functionality
- ✅ Place creation and editing forms
- ✅ Admin dashboard for user approvals and management
- ✅ Admin user role management (promote/demote admins)
- ✅ Comments system
- ✅ Image lightbox for photo galleries
- ✅ Anonymous posting option
- ✅ Email notifications for new user signups

### Phase 3 (Future)
- 🔲 Real-time features
- 🔲 Push notifications
- 🔲 Advanced search with filters
- 🔲 Social features (following, likes, etc.)

## Getting Started

### Prerequisites
- Node.js (>=18.0.0)
- MongoDB Atlas account
- Cloudinary account

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret_key
PORT=8000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003
VITE_API_URL=http://localhost:8000
```

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install all dependencies:
```bash
npm run install:all
```

### Development

Start both client and server in development mode:
```bash
npm run dev
```

Or run them separately:

**Server** (Port 8000):
```bash
npm run server:dev
```

**Client** (Port 3000):
```bash
npm run client:dev
```

### Testing

Server health check:
```bash
curl http://localhost:8000/health
```

## User System

### Account Creation
- Users sign up with firstName (required), lastName, email (required), password (required)
- Auto-login after successful signup
- New accounts require admin approval before posting
- Users can update profiles before approval

### Profile Management
- View and edit personal profile information (name, bio, location, avatar)
- Upload profile pictures with Cloudinary integration
- Display account approval status
- View personal places collection with pagination (20 per page)
- Click on places to view details
- Responsive design with iOS-style interface

### Admin Features
- View and manage all users (including admins)
- Approve/reject user accounts
- Promote users to admin or remove admin privileges
- Manage all places with filtering and search
- Access to comprehensive admin dashboard
- Delete users (non-admin only)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out

### Places
- `GET /api/places` - Get all places (with pagination, search, filters)
- `GET /api/places/:id` - Get place by ID
- `POST /api/places` - Create place (requires approval)
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place
- `POST /api/places/:id/like` - Like/unlike place
- `POST /api/places/:id/comments` - Add comment

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/places` - Get user's places
- `GET /api/users/:id` - Get public user profile

### Admin (requires admin role)
- `GET /api/users/admin/all` - Get all users
- `GET /api/users/admin/pending` - Get pending users
- `PUT /api/users/admin/approve/:id` - Approve user
- `PUT /api/users/admin/toggle-admin/:id` - Toggle admin status
- `DELETE /api/users/admin/reject/:id` - Delete user

## Project Structure

```
placer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   └── ...
├── server/                 # Express backend
│   ├── config/             # Database config
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
├── .env                    # Environment variables
└── package.json            # Root package.json
```

## Deployment

### Heroku Setup

The app is configured for Heroku deployment:

1. Create Heroku app
2. Set environment variables in Heroku dashboard
3. Connect GitHub repository
4. Deploy from main branch

The `heroku-postbuild` script will:
- Install client dependencies
- Build React app for production
- Serve static files from Express

## Security Features

- JWT authentication with 30-day expiration
- Password hashing with bcrypt (12 rounds)
- Input validation with express-validator
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet for security headers
- MongoDB injection protection

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test locally
5. Submit pull request

## License

MIT License