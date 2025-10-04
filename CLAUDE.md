# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**placer** is a MERN stack application for discovering and sharing places with photos, maps, and location-based features. It uses a monorepo structure with separate client and server workspaces.

## Architecture

### Monorepo Structure
- **Root**: npm workspaces configuration, runs both client and server concurrently
- **client/**: React 19 + Redux Toolkit + Vite frontend (port 3000)
- **server/**: Express + MongoDB backend (port 8000)

### Backend Architecture (server/)
- **Entry point**: `server/index.js` - configures Express with CORS, security middleware (helmet, rate limiting), compression, and error handling
- **Routes**: `/api/auth`, `/api/places`, `/api/users` (defined in `server/routes/`)
- **Controllers**: Business logic separated from routes (`server/controllers/`)
  - `authController.js`: Authentication operations
  - `placesController.js`: Place CRUD and interactions
  - `usersController.js`: User management and admin operations
- **Models**: Mongoose schemas in `server/models/` (User, Place)
- **Middleware**: JWT authentication (`auth.js`), Multer file uploads (`upload.js`), error handling (`errorHandler.js`)
- **Utils**: Email notification service (`emailNotification.js`)
- **Scripts**: `makeAdmin.js` and `resetPassword.js` for admin operations
- **Config**: Constants (`constants.js`) and database configuration (`database.js`)

### Frontend Architecture (client/src/)
- **State Management**: Redux Toolkit with slices in `client/src/store/slices/`
  - `authSlice.js`: User authentication state
  - `placesSlice.js`: Places data and operations
  - `userSlice.js`: User profile data
  - `uiSlice.js`: UI state (modals, loading, etc.)
  - `adminSlice.js`: Admin dashboard state
- **Routing**: React Router DOM with page-based organization in `client/src/pages/`
- **Pages Structure**:
  - `Home/`: Main places gallery
  - `PlaceDetails/`: Individual place view with comments
  - `CreatePlace/`: Form for creating new places
  - `EditPlace/`: Form for editing existing places
  - `Profile/`: User profile management with tabs (places, comments)
  - `Auth/`: Login/signup forms
  - `Admin/`: Admin dashboard with user management, pending approvals, place moderation
  - `Dashboard/`: User dashboard
  - `ChangePassword/`: Password change form
- **Components**: Organized by feature in `client/src/components/`
  - `Layout/`: Navigation, headers
  - `Form/`: Reusable form inputs (FormInput, FormTextarea, FormFileInput, FormCheckbox, TagAutocomplete)
  - `Gallery/`: Photo gallery components (ResponsiveGrid, PlaceCard)
  - `Map/`: Leaflet/OpenStreetMap integration (Map, LocationPicker)
  - `Search/`: Search and filter components (SearchBar, FilterPanel)
  - `Comments/`: Comment system (CommentSection)
  - `Editor/`: Tiptap WYSIWYG editor (TiptapEditor)
  - `UI/`: Reusable UI components (Toast, ConfirmDialog, Alert, Skeleton, Pagination, ImageLightbox, Tabs)
  - `ErrorBoundary/`: Error boundary for React error handling
- **Services**: Centralized API client (`api.js`) and geolocation service
- **Hooks**: Custom React hooks
  - `useAsyncAction.js`: Eliminates try/catch/toast patterns
  - `useDocumentTitle.js`: Dynamic page titles
  - `useDebounce.js`: Debounced values for search
- **Utils**: Helper functions
  - `htmlUtils.js`: HTML sanitization (DOMPurify)
  - `apiErrorHandler.js`: Centralized error handling
  - `imageOptimization.js`: Cloudinary optimization
  - `dateFormatter.js`: Date formatting utilities
- **Config**: API URL configuration
- **Constants**: Pagination constants

### User System
- **Account approval workflow**: New users require admin approval before posting
- **Role system**: Regular users and admins (admins can manage users and content)
- **Profile features**: Avatar upload (Cloudinary), bio, location
- **Anonymous posting**: Optional anonymous mode for place creation

### Key Integrations
- **Cloudinary**: Image uploads and storage (configured in `server/middleware/upload.js`)
- **MongoDB**: Database with Mongoose ODM (connection in `server/config/database.js`)
- **Leaflet**: Interactive maps with OpenStreetMap tiles
- **JWT**: Authentication tokens with 30-day expiration
- **Email**: Nodemailer for admin notifications on new user signups
- **Tiptap**: WYSIWYG rich text editor for descriptions and comments

## Development Commands

### Initial Setup
```bash
npm install              # Install root dependencies
npm run install:all      # Install all workspace dependencies (root, client, server)
```

### Development
```bash
npm run dev              # Run both client and server concurrently
npm run client:dev       # Run only frontend (Vite dev server on port 3000)
npm run server:dev       # Run only backend (nodemon on port 8000)
```

### Building
```bash
npm run build            # Build client for production (output: client/dist/)
```

### Production
```bash
npm start                # Run server in production mode (serves static client build)
```

### Linting
```bash
cd client && npm run lint    # Run ESLint on frontend code
```

### Server Scripts
```bash
cd server && node scripts/makeAdmin.js      # Promote user to admin (interactive)
cd server && node scripts/resetPassword.js  # Reset user password (interactive)
```

## Environment Variables

Environment variables are stored in `.env` in the root directory. **The .env file is git-ignored and must never be committed.** Use `env.template` as a reference.

Required variables:
- `MONGO_URI`: MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials
- `JWT_SECRET`: Secret key for JWT signing
- `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `NOTIFICATION_EMAIL`: Email notification configuration (optional)
- `PORT`: Server port (default 8000)
- `NODE_ENV`: development/production
- `ALLOWED_ORIGINS`: Comma-separated CORS origins
- `VITE_API_URL`: Frontend API URL

## API Structure

### Authentication (`/api/auth`)
- `POST /signup`: Create account (auto-login, requires admin approval for posting)
- `POST /login`: Sign in
- `GET /me`: Get current user
- `POST /logout`: Sign out
- `PUT /change-password`: Change password

### Places (`/api/places`)
- `GET /`: List places (pagination, search, filters)
- `GET /tags`: Get all unique tags with counts
- `GET /:id`: Get place details
- `POST /`: Create place (requires approval, supports anonymous posting)
- `PUT /:id`: Update place (owner or admin only)
- `DELETE /:id`: Delete place (owner or admin only)
- `POST /:id/like`: Like/unlike place
- `POST /:id/comments`: Add comment
- `DELETE /:id/comments/:commentId`: Delete comment (owner or admin only)
- `PATCH /:id/featured`: Toggle featured status (admin only)

### Users (`/api/users`)
- `GET /profile`: Get current user profile
- `PUT /profile`: Update profile (supports avatar upload)
- `GET /places`: Get current user's places (paginated)
- `GET /comments`: Get current user's comments (paginated)
- `GET /:id`: Get public user profile
- **Admin routes** (require admin role):
  - `GET /admin/all`: List all users
  - `GET /admin/pending`: List pending approvals
  - `PUT /admin/approve/:id`: Approve user
  - `PUT /admin/toggle-admin/:id`: Promote/demote admin
  - `DELETE /admin/reject/:id`: Delete user

## Code Architecture Patterns

### Routes ’ Controllers ’ Models (MVC)
Routes are thin layers that handle HTTP concerns (validation, auth middleware). Controllers contain business logic. Models define data schemas.

Example:
```javascript
// Route: server/routes/places.js
router.get('/', placesController.getPlaces)

// Controller: server/controllers/placesController.js
export const getPlaces = async (req, res) => {
  // Business logic here
}
```

### Centralized API Client
All frontend API calls go through `client/src/services/api.js`:
```javascript
import { api } from '../services/api'

// Instead of: axios.get('/api/places')
const response = await api.places.list(params)
```

Benefits:
- Automatic auth token injection
- Global 401 handling (auto-logout)
- Consistent error handling
- Easy to mock for testing

### Custom Hooks
Use custom hooks to reduce boilerplate:
- `useAsyncAction`: Handles async operations with loading/error states
- `useDocumentTitle`: Sets page title dynamically
- `useDebounce`: Debounces search input

### DRY Utilities
Shared utilities eliminate duplication:
- `htmlUtils.js`: Sanitize HTML with DOMPurify
- `apiErrorHandler.js`: Extract error messages
- `imageOptimization.js`: Cloudinary transformations

## Security Considerations

- All `.env*` files are git-ignored
- JWT tokens stored in localStorage (client-side)
- Passwords hashed with bcrypt (12 rounds - defined in `server/config/constants.js`)
- Rate limiting: 500 requests per 15 minutes per IP (configurable in `server/config/constants.js`)
- Input validation with express-validator
- XSS protection with DOMPurify on all HTML content
- Helmet for security headers
- CORS configured for specific origins only
- File uploads limited to images via Multer (5MB max - defined in `server/config/constants.js`)
- MongoDB injection protection via Mongoose

## Production Deployment (Heroku)

The app includes a `heroku-postbuild` script that automatically:
1. Installs client dependencies
2. Builds the React app
3. Server serves static files from `client/dist/` when `NODE_ENV=production`

Set all environment variables in Heroku dashboard before deploying.

## Code Quality

- **ESLint**: Zero linting errors across entire codebase
- **Architecture**: Clean MVC separation (routes ’ controllers ’ models)
- **Security**: XSS protection, JWT auth, input validation, file upload validation
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Centralized API client, optimized re-renders, lazy loading
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Testing**: Phase 4 (not yet implemented)

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
