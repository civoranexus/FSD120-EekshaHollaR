# Authentication Setup Guide

This guide explains how to set up and use the authentication system for the Society360 platform.

## 🏗️ Architecture Overview

The authentication system consists of:

### Frontend (Next.js + TypeScript)
- **Login Page**: `/app/login/page.tsx`
- **Register Page**: `/app/register/page.tsx`
- **Auth API**: `/lib/api/auth.ts` - Handles all authentication API calls
- **Auth Store**: `/lib/store/authStore.ts` - Zustand store for auth state management
- **Protected Routes**: `/components/auth/ProtectedRoute.tsx` - Route guards

### Backend (Node.js + Express + PostgreSQL)
- **Auth Routes**: `/routes/authRoutes.js`
- **Auth Controller**: `/controllers/authController.js`
- **User Model**: `/models/userModel.js`
- **Auth Middleware**: `/middlewares/authMiddleware.js`
- **Security Utils**: `/utils/security.js` - Password hashing, JWT generation

## 🚀 Quick Start

### 1. Database Setup

First, ensure PostgreSQL is running and create the database:

```bash
# Create database
createdb society360

# Or using psql
psql -U postgres
CREATE DATABASE society360;
\q
```

### 2. Reset and Seed Database

Run the reset script to create tables and seed test data:

```bash
cd backend
node database/reset_database.js
```

This will:
- Drop all existing tables
- Create fresh schema from `schema.sql`
- Seed test data from `seed.sql`

### 3. Start Backend Server

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### 4. Start Frontend Server

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔐 Demo Credentials

After seeding the database, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@society360.com | admin123 |
| **Staff** | staff@society360.com | staff123 |
| **Resident** | resident@society360.com | resident123 |

## 📋 Features

### Login Page (`/login`)
- Email and password validation
- Server-side error handling
- Role-based dashboard redirection
- Demo credentials display
- Link to registration page

### Register Page (`/register`)
- First name, last name, email validation
- Optional phone number
- Password strength requirements:
  - Minimum 6 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Password confirmation
- Automatic login after registration
- Link back to login page

### Authentication Flow

1. **Login/Register** → User submits credentials
2. **Backend Validation** → Validates input and checks database
3. **JWT Generation** → Creates JWT token with user ID and role
4. **Response** → Returns token + user data
5. **Frontend Storage** → Stores token in localStorage
6. **State Management** → Updates Zustand auth store
7. **Redirect** → Navigates to role-specific dashboard

### Role-Based Access

After login, users are redirected based on their role:

- **Admin** → `/dashboard/admin`
- **Staff** → `/dashboard/staff`
- **Resident** → `/dashboard/resident`

## 🔧 API Endpoints

### POST `/api/auth/register`

Register a new user.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone_number": "+1234567890" // optional
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "resident",
    "phone_number": "+1234567890",
    "created_at": "2026-02-01T16:00:00.000Z"
  },
  "message": "Registration successful"
}
```

### POST `/api/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "admin@society360.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "full_name": "Super Admin",
    "email": "admin@society360.com",
    "role": "admin",
    "phone_number": "9999999999",
    "created_at": "2026-02-01T16:00:00.000Z"
  },
  "message": "Login successful"
}
```

### GET `/api/auth/me`

Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "full_name": "Super Admin",
    "email": "admin@society360.com",
    "role": "admin",
    "phone_number": "9999999999",
    "units": [...]
  }
}
```

## 🛡️ Security Features

### Backend
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token generation with expiry
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **HPP**: HTTP Parameter Pollution prevention
- **Audit Logging**: All auth actions logged

### Frontend
- **Token Storage**: localStorage (consider httpOnly cookies for production)
- **Auto Logout**: On 401 responses
- **Token Validation**: JWT expiry check
- **Protected Routes**: Route guards for authenticated pages
- **CSRF Protection**: Built into Next.js

## 🔄 State Management

The app uses Zustand for auth state:

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
  initialize: () => void;
}
```

## 🧪 Testing

### Manual Testing

1. **Register New User**
   - Go to `/register`
   - Fill in the form
   - Submit and verify redirect to dashboard

2. **Login Existing User**
   - Go to `/login`
   - Use demo credentials
   - Verify role-based redirect

3. **Protected Routes**
   - Try accessing `/dashboard/admin` without login
   - Should redirect to `/login`

4. **Logout**
   - Click logout in dashboard
   - Verify redirect to login
   - Verify token cleared

## 🐛 Troubleshooting

### "User not found" or "Invalid credentials"
- Ensure database is seeded: `node database/reset_database.js`
- Check password hashes match in seed.sql

### "Cannot connect to database"
- Verify PostgreSQL is running
- Check `.env` credentials match your PostgreSQL setup
- Ensure database exists: `createdb society360`

### "CORS error"
- Check backend `FRONTEND_URL` in `.env`
- Verify frontend is running on correct port (3000)

### "Token expired"
- JWT tokens expire after 30 days (configurable in `.env`)
- Login again to get new token

### Frontend build errors
- Run `npm install` in frontend directory
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run dev`

## 📝 Environment Variables

### Backend `.env`
```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=society360
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Production Deployment

For production:

1. **Use httpOnly cookies** instead of localStorage for tokens
2. **Enable HTTPS** for all connections
3. **Rotate JWT secrets** regularly
4. **Implement refresh tokens** for better security
5. **Add 2FA** for admin accounts
6. **Use environment-specific** `.env` files
7. **Enable rate limiting** more aggressively
8. **Add email verification** for new registrations
9. **Implement password reset** functionality
10. **Use secure session management**

## 📚 Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
