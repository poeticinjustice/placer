# Placer - MERN Stack App

A MERN stack application for discovering and sharing places with photos, maps, and location-based features.

## Tech Stack

- **Frontend**: React 19, Redux Toolkit, Vite
- **Backend**: Node.js, Express, MongoDB
- **File Storage**: Cloudinary
- **Maps**: Leaflet/OpenStreetMap
- **Rich Text Editor**: Tiptap WYSIWYG
- **Styling**: iOS-style CSS with CSS Variables
- **Architecture**: MVC pattern with routes/controllers separation

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
- ✅ Comments system with anonymous posting
- ✅ Image lightbox for photo galleries
- ✅ Like/unlike functionality
- ✅ Email notifications for new user signups
- ✅ Distance-based filtering with geolocation
- ✅ Tag-based filtering and autocomplete
- ✅ Featured places (admin only)
- ✅ Dark mode support with theme toggle

### Phase 3 (Completed)
- ✅ XSS protection with DOMPurify
- ✅ Centralized API client with interceptors
- ✅ Routes/Controllers architecture refactor
- ✅ File upload validation (type and size)
- ✅ Active filter chips with removal
- ✅ Accessibility improvements (ARIA labels, keyboard navigation)
- ✅ Clean codebase (zero ESLint errors)
- ✅ Link dialog in rich text editor (no window.prompt)
- ✅ Password change functionality

### Phase 4 (Future)
- 🔲 Unit and integration tests
- 🔲 Real-time features (WebSockets)
- 🔲 Push notifications
- 🔲 Social features (following users)
- 🔲 Place recommendations

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

### Linting

Check for code quality issues:
```bash
npm run lint
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
- Upload profile pictures with Cloudinary integration (5MB max, validated)
- Display account approval status
- View personal places collection with pagination (20 per page)
- View comments history across all places
- Tabs for places and comments on profile page
- Click on places to view details
- Responsive design with iOS-style interface

### Admin Features
- View and manage all users (including admins)
- Approve/reject user accounts
- Promote users to admin or remove admin privileges
- Manage all places with filtering and search
- Feature/unfeature places
- Access to comprehensive admin dashboard
- Delete users (non-admin only)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out
- `PUT /api/auth/change-password` - Change password

### Places
- `GET /api/places` - Get all places (with pagination, search, filters)
- `GET /api/places/tags` - Get all unique tags with counts
- `GET /api/places/:id` - Get place by ID
- `POST /api/places` - Create place (requires approval)
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place
- `POST /api/places/:id/like` - Like/unlike place
- `POST /api/places/:id/comments` - Add comment
- `DELETE /api/places/:id/comments/:commentId` - Delete comment
- `PATCH /api/places/:id/featured` - Toggle featured status (admin only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/places` - Get user's places
- `GET /api/users/comments` - Get user's comments
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
│   │   │   ├── Comments/
│   │   │   ├── Editor/     # Tiptap WYSIWYG editor
│   │   │   ├── Form/
│   │   │   ├── Gallery/
│   │   │   ├── Map/        # Leaflet map components
│   │   │   ├── Search/
│   │   │   └── UI/         # Toast, Modal, ConfirmDialog
│   │   ├── pages/          # Page components
│   │   │   ├── Admin/
│   │   │   ├── Dashboard/
│   │   │   ├── PlaceDetails/
│   │   │   └── Profile/
│   │   ├── store/          # Redux store and slices
│   │   │   └── slices/     # auth, places, admin, user, ui
│   │   ├── services/       # API client, geolocation
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Helper functions
│   └── ...
├── server/                 # Express backend
│   ├── config/             # Database config
│   ├── controllers/        # Business logic (MVC)
│   │   ├── authController.js
│   │   ├── placesController.js
│   │   └── usersController.js
│   ├── middleware/         # Express middleware (auth, upload)
│   ├── models/             # Mongoose models (User, Place)
│   ├── routes/             # API routes (thin layer)
│   ├── utils/              # Email notifications
│   └── index.js            # Server entry point
├── .env                    # Environment variables
└── package.json            # Root package.json
```

## Code Quality

- **ESLint**: Zero linting errors across entire codebase
- **Architecture**: Clean separation of routes → controllers → models
- **Security**: XSS protection, JWT auth, input validation, file upload validation
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Centralized API client with caching, optimized re-renders
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Security Features

- JWT authentication with 30-day expiration
- Password hashing with bcrypt (12 rounds)
- Input validation with express-validator
- XSS protection with DOMPurify on all HTML content
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet for security headers
- MongoDB injection protection
- File upload validation (type and size limits)
- Centralized API client with automatic token injection

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

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run linting: `npm run lint`
5. Test locally
6. Submit pull request

## License

MIT License
