# 🚀 Society360 Authentication - Quick Reference

## 📍 URLs
- **Login:** http://localhost:3000/login
- **Register:** http://localhost:3000/register
- **Backend API:** http://localhost:5000/api

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 **Admin** | admin@society360.com | admin123 |
| 👮 **Staff** | staff@society360.com | staff123 |
| 🏠 **Resident** | resident@society360.com | resident123 |

## 🎯 Quick Start

```bash
# 1. Reset Database
cd backend
node database/reset_database.js

# 2. Start Backend (Terminal 1)
npm start

# 3. Start Frontend (Terminal 2)
cd ../frontend
npm run dev

# 4. Open Browser
# Navigate to: http://localhost:3000/login
```

## 📋 API Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@society360.com",
  "password": "admin123"
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone_number": "+1234567890"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## ✅ What Works

- ✅ Login with email/password
- ✅ Register new users
- ✅ Role-based dashboard redirect
- ✅ JWT token authentication
- ✅ Password validation
- ✅ Error handling
- ✅ Logout functionality
- ✅ Protected routes

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
# Verify .env file exists in backend/
# Run: npm install
```

### Frontend won't start
```bash
# Clear Next.js cache
rm -rf .next
# Run: npm install
```

### Database errors
```bash
# Reset database
cd backend
node database/reset_database.js
```

### CORS errors
```bash
# Check backend/.env has:
FRONTEND_URL=http://localhost:3000
# Restart backend
```

## 📚 Documentation

- **Setup Guide:** `/docs/AUTHENTICATION.md`
- **Testing Guide:** `/docs/TESTING_GUIDE.md`
- **Full Summary:** `/docs/IMPLEMENTATION_SUMMARY.md`

## 🎨 Features

### Login Page
- Email/password validation
- Demo credentials display
- Link to registration
- Error messages
- Loading states

### Register Page
- First/last name fields
- Email validation
- Password strength check
- Password confirmation
- Phone number (optional)
- Auto-login after signup

## 🛡️ Security

- ✅ bcrypt password hashing
- ✅ JWT token authentication
- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Audit logging

## 📊 Database

```sql
-- View all users
SELECT full_name, email, role_id FROM users;

-- View roles
SELECT * FROM roles;

-- View user-unit relationships
SELECT u.full_name, un.unit_number
FROM users u
JOIN user_units uu ON u.id = uu.user_id
JOIN units un ON uu.unit_id = un.id;
```

## 🎯 Test Checklist

- [ ] Login with admin credentials
- [ ] Login with staff credentials
- [ ] Login with resident credentials
- [ ] Register new user
- [ ] Test password validation
- [ ] Test error messages
- [ ] Verify dashboard redirect
- [ ] Test logout
- [ ] Test protected routes

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect to backend | Check backend is running on port 5000 |
| Invalid credentials | Reset database with seed script |
| CORS error | Check FRONTEND_URL in backend/.env |
| Page not found | Ensure frontend is running on port 3000 |
| Token expired | Login again to get new token |

## 📞 Need Help?

1. Check `/docs/AUTHENTICATION.md`
2. Check `/docs/TESTING_GUIDE.md`
3. Review browser console for errors
4. Check backend terminal for logs

---

**Status:** ✅ Ready to Test
**Servers:** Backend (5000) ✅ | Frontend (3000) ✅
**Last Updated:** February 1, 2026
