# Authentication Testing Guide

## ✅ Setup Complete

Your Society360 authentication system is now fully configured and ready to test!

### What We've Implemented

#### 🎨 Frontend
1. **Enhanced Login Page** (`/app/login/page.tsx`)
   - Beautiful gradient background
   - Email and password validation
   - Server error handling
   - Demo credentials display
   - Link to registration page
   - Role-based dashboard redirection

2. **New Registration Page** (`/app/register/page.tsx`)
   - First name and last name fields
   - Email validation
   - Optional phone number
   - Password strength requirements
   - Password confirmation
   - Visual password requirements guide
   - Automatic login after registration
   - Link back to login page

3. **Fixed Auth API** (`/lib/api/auth.ts`)
   - Added missing `LoginCredentials` interface
   - Proper TypeScript types
   - JWT token management
   - localStorage integration

#### 🔧 Backend
1. **Updated Auth Controller** (`/controllers/authController.js`)
   - Standardized response format with `success` flag
   - Consistent error handling
   - Proper user object structure
   - Audit logging for all auth actions

2. **Database Setup**
   - Reset script (`/database/reset_database.js`)
   - Updated seed data with demo users
   - Proper password hashing
   - User-unit relationships

#### 📚 Documentation
1. **Authentication Guide** (`/docs/AUTHENTICATION.md`)
   - Complete setup instructions
   - API documentation
   - Security features
   - Troubleshooting guide

2. **Setup Script** (`setup.ps1`)
   - Automated setup process
   - Dependency installation
   - Database reset

---

## 🧪 Manual Testing Steps

### Test 1: Login with Admin Credentials

1. **Open your browser** and navigate to: `http://localhost:3000/login`

2. **Enter admin credentials:**
   - Email: `admin@society360.com`
   - Password: `admin123`

3. **Click "Sign In"**

4. **Expected Result:**
   - Success toast notification
   - Redirect to `/dashboard/admin`
   - User data stored in localStorage
   - Auth state updated in Zustand store

### Test 2: Login with Staff Credentials

1. **Navigate to:** `http://localhost:3000/login`

2. **Enter staff credentials:**
   - Email: `staff@society360.com`
   - Password: `staff123`

3. **Click "Sign In"**

4. **Expected Result:**
   - Success toast notification
   - Redirect to `/dashboard/staff`

### Test 3: Login with Resident Credentials

1. **Navigate to:** `http://localhost:3000/login`

2. **Enter resident credentials:**
   - Email: `resident@society360.com`
   - Password: `resident123`

3. **Click "Sign In"**

4. **Expected Result:**
   - Success toast notification
   - Redirect to `/dashboard/resident`

### Test 4: Invalid Login Attempt

1. **Navigate to:** `http://localhost:3000/login`

2. **Enter invalid credentials:**
   - Email: `wrong@example.com`
   - Password: `wrongpassword`

3. **Click "Sign In"**

4. **Expected Result:**
   - Error alert displayed
   - Error toast notification
   - "Invalid email or password" message
   - User stays on login page

### Test 5: Register New User

1. **Navigate to:** `http://localhost:3000/login`

2. **Click "Register here" link**

3. **Fill in the registration form:**
   - First Name: `Test`
   - Last Name: `User`
   - Email: `testuser@example.com`
   - Phone: `+1234567890` (optional)
   - Password: `Test123`
   - Confirm Password: `Test123`

4. **Click "Create Account"**

5. **Expected Result:**
   - Success toast notification
   - Automatic login
   - Redirect to `/dashboard/resident` (default role)
   - User data stored in database

### Test 6: Registration Validation

1. **Navigate to:** `http://localhost:3000/register`

2. **Try submitting with weak password:**
   - Password: `test` (too short, no uppercase, no number)

3. **Expected Result:**
   - Validation errors displayed
   - Form not submitted
   - Error messages for each requirement

4. **Try mismatched passwords:**
   - Password: `Test123`
   - Confirm Password: `Test456`

5. **Expected Result:**
   - "Passwords do not match" error
   - Form not submitted

### Test 7: Protected Routes

1. **Open a new incognito/private window**

2. **Navigate directly to:** `http://localhost:3000/dashboard/admin`

3. **Expected Result:**
   - Redirect to `/login`
   - Not able to access dashboard without authentication

### Test 8: Logout Functionality

1. **Login with any credentials**

2. **Navigate to dashboard**

3. **Click logout button** (in dashboard header)

4. **Expected Result:**
   - Token removed from localStorage
   - Auth state cleared
   - Redirect to `/login`

---

## 🔍 API Testing with Postman/Thunder Client

### Test Login API

**Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@society360.com",
  "password": "admin123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "full_name": "Super Admin",
    "email": "admin@society360.com",
    "role": "admin",
    "phone_number": "9999999999",
    "created_at": "2026-02-01T..."
  },
  "message": "Login successful"
}
```

### Test Register API

**Request:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "first_name": "New",
  "last_name": "User",
  "email": "newuser@example.com",
  "password": "NewUser123",
  "phone_number": "+1234567890"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "full_name": "New User",
    "email": "newuser@example.com",
    "role": "resident",
    "phone_number": "+1234567890",
    "created_at": "2026-02-01T..."
  },
  "message": "Registration successful"
}
```

### Test Get Current User API

**Request:**
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "full_name": "Super Admin",
    "email": "admin@society360.com",
    "role": "admin",
    "phone_number": "9999999999",
    "units": []
  }
}
```

---

## 🎯 What to Look For

### ✅ Success Indicators

- [ ] Login page loads with beautiful UI
- [ ] Register page loads with all fields
- [ ] Demo credentials are visible on login page
- [ ] Form validation works (email format, password length)
- [ ] Login with valid credentials succeeds
- [ ] Users are redirected to correct dashboard based on role
- [ ] JWT token is stored in localStorage
- [ ] Registration creates new user in database
- [ ] New users can login immediately after registration
- [ ] Error messages are clear and helpful
- [ ] Protected routes redirect to login when not authenticated
- [ ] Logout clears token and redirects to login

### ❌ Issues to Watch For

- [ ] CORS errors (check backend CORS configuration)
- [ ] 404 errors (ensure backend is running on port 5000)
- [ ] Database connection errors (check PostgreSQL is running)
- [ ] Token not being saved (check browser localStorage)
- [ ] Redirect loops (check auth state management)
- [ ] Password validation too strict/lenient
- [ ] UI elements not displaying correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:** 
- Ensure backend is running: `cd backend && npm start`
- Check backend is on port 5000
- Verify `.env.local` has correct API URL

### Issue: "Invalid credentials" with correct password
**Solution:**
- Reset database: `node backend/database/reset_database.js`
- Verify password hashes in database match seed data

### Issue: "CORS error"
**Solution:**
- Check backend `.env` has `FRONTEND_URL=http://localhost:3000`
- Restart backend server after changing .env

### Issue: "Page not found" on /register
**Solution:**
- Ensure frontend is running: `cd frontend && npm run dev`
- Clear Next.js cache: `rm -rf frontend/.next`

### Issue: Token expires immediately
**Solution:**
- Check `JWT_EXPIRE` in backend `.env`
- Default is 30d, ensure it's set correctly

---

## 📊 Database Verification

You can verify the database setup using psql:

```sql
-- Connect to database
psql -U postgres -d society360

-- Check users table
SELECT id, full_name, email, role_id FROM users;

-- Check roles table
SELECT * FROM roles;

-- Check user-unit relationships
SELECT u.full_name, un.unit_number, uu.resident_type
FROM users u
JOIN user_units uu ON u.id = uu.user_id
JOIN units un ON uu.unit_id = un.id;
```

---

## 🚀 Next Steps

After verifying authentication works:

1. **Test all three user roles** (Admin, Staff, Resident)
2. **Verify dashboard access** for each role
3. **Test logout functionality**
4. **Create additional test users** via registration
5. **Test password validation** thoroughly
6. **Check browser console** for any errors
7. **Verify network requests** in browser DevTools
8. **Test on different browsers** (Chrome, Firefox, Edge)

---

## 📝 Testing Checklist

### Frontend Tests
- [ ] Login page renders correctly
- [ ] Register page renders correctly
- [ ] Form validation works
- [ ] Error messages display properly
- [ ] Success toasts appear
- [ ] Navigation links work
- [ ] Responsive design on mobile

### Backend Tests
- [ ] Login API returns correct response
- [ ] Register API creates user
- [ ] Get Me API requires authentication
- [ ] Invalid credentials return 401
- [ ] Duplicate email returns error
- [ ] Audit logs are created

### Integration Tests
- [ ] End-to-end login flow
- [ ] End-to-end registration flow
- [ ] Role-based redirects work
- [ ] Token persistence across page reloads
- [ ] Logout clears session

### Security Tests
- [ ] Passwords are hashed in database
- [ ] JWT tokens expire correctly
- [ ] Protected routes require authentication
- [ ] CORS is properly configured
- [ ] Rate limiting works

---

## 🎉 Success!

If all tests pass, your authentication system is fully functional and ready for production use (with additional security hardening for production environments).

**Servers Running:**
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

**Test URLs:**
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Admin Dashboard: http://localhost:3000/dashboard/admin
- Staff Dashboard: http://localhost:3000/dashboard/staff
- Resident Dashboard: http://localhost:3000/dashboard/resident
