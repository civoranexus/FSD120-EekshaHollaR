# Society360 Platform - API Documentation

**Project:** Society360 – Smart Residential Management System  
**Organization:** Civora Nexus Pvt. Ltd.  
**Document Type:** REST API Specification  
**Version:** 1.0  
**Last Updated:** January 31, 2026

---

## 1. API Overview

### 1.1 Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.society360.com/api`

### 1.2 Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### 1.3 Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

### 1.4 Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}
```

### 1.5 HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 2. Authentication APIs

### 2.1 Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone_number": "+91-1234567890",
  "role": "resident"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "resident"
    }
  }
}
```

### 2.2 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** Same as register

### 2.3 Get Current User
**GET** `/auth/me`  
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "resident"
  }
}
```

---

## 3. Visitor Management APIs

### 3.1 Pre-Approve Visitor
**POST** `/visitors/pre-approve`  
**Auth Required:** Yes  
**Roles:** Admin, Staff, Resident

**Request Body:**
```json
{
  "visitor_name": "Jane Smith",
  "visitor_phone": "+91-9876543210",
  "unit_id": "uuid",
  "purpose": "Guest",
  "vehicle_number": "KA01AB1234"
}
```

### 3.2 Check-In Visitor
**POST** `/visitors/check-in`  
**Auth Required:** Yes  
**Roles:** Admin, Staff

**Request Body:**
```json
{
  "visitor_id": "uuid",
  "entry_gate": "Main Gate"
}
```

### 3.3 Check-Out Visitor
**POST** `/visitors/check-out`  
**Auth Required:** Yes  
**Roles:** Admin, Staff

**Request Body:**
```json
{
  "visitor_id": "uuid"
}
```

### 3.4 Get Visitor History
**GET** `/visitors/history?page=1&limit=10`  
**Auth Required:** Yes

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `unit_id` - Filter by unit
- `start_date` - Filter by date range
- `end_date` - Filter by date range

### 3.5 Get Pending Visitors
**GET** `/visitors/pending`  
**Auth Required:** Yes  
**Roles:** Admin, Staff

---

## 4. Maintenance APIs

### 4.1 Create Ticket
**POST** `/maintenance`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "Plumbing Issue",
  "description": "Leaking tap in kitchen",
  "category": "Plumbing",
  "unit_id": "uuid",
  "priority": "high"
}
```

### 4.2 Assign Ticket
**PUT** `/maintenance/:id/assign`  
**Auth Required:** Yes  
**Roles:** Admin, Staff

**Request Body:**
```json
{
  "staff_id": "uuid"
}
```

### 4.3 Update Ticket Status
**PUT** `/maintenance/:id/status`  
**Auth Required:** Yes  
**Roles:** Admin, Staff

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid Statuses:** open, in_progress, resolved, closed, rejected

### 4.4 Get Ticket History
**GET** `/maintenance?page=1&limit=10`  
**Auth Required:** Yes

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status
- `category` - Filter by category
- `priority` - Filter by priority

---

## 5. Finance APIs

### 5.1 Generate Bills
**POST** `/finance/generate`  
**Auth Required:** Yes  
**Roles:** Admin, Staff

**Request Body:**
```json
{
  "unit_id": "uuid",
  "bill_type": "Maintenance",
  "amount": 5000,
  "due_date": "2026-02-28",
  "description": "Monthly maintenance for Feb 2026"
}
```

### 5.2 Get Bills
**GET** `/finance?page=1&limit=10`  
**Auth Required:** Yes

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status (unpaid, paid, overdue)
- `unit_id` - Filter by unit

### 5.3 Pay Bill
**POST** `/finance/pay`  
**Auth Required:** Yes  
**Roles:** Resident

**Request Body:**
```json
{
  "bill_id": "uuid",
  "amount": 5000,
  "payment_method": "UPI",
  "transaction_reference": "TXN123456789"
}
```

### 5.4 Get Receipt
**GET** `/finance/receipt/:paymentId`  
**Auth Required:** Yes

### 5.5 Financial Reports
**GET** `/finance/reports?start_date=2026-01-01&end_date=2026-01-31`  
**Auth Required:** Yes  
**Roles:** Admin

---

## 6. Communication APIs

### 6.1 Create Announcement
**POST** `/communication/announcements`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "title": "Society Meeting",
  "content": "Monthly meeting on Feb 15th at 6 PM",
  "target_audience": "all",
  "is_important": true
}
```

### 6.2 Get Announcements
**GET** `/communication/announcements?page=1&limit=10`  
**Auth Required:** Yes

### 6.3 Delete Announcement
**DELETE** `/communication/announcements/:id`  
**Auth Required:** Yes  
**Roles:** Admin

### 6.4 Post Message
**POST** `/communication/messages`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "content": "Looking for a reliable plumber"
}
```

### 6.5 Get Messages
**GET** `/communication/messages?page=1&limit=20`  
**Auth Required:** Yes

### 6.6 Delete Message
**DELETE** `/communication/messages/:id`  
**Auth Required:** Yes (own messages or admin)

### 6.7 Flag Message
**PUT** `/communication/messages/:id/flag`  
**Auth Required:** Yes  
**Roles:** Admin

### 6.8 Get Notifications
**GET** `/communication/notifications`  
**Auth Required:** Yes

### 6.9 Mark Notification Read
**PUT** `/communication/notifications/:id/read`  
**Auth Required:** Yes

---

## 7. Admin APIs

### 7.1 User Management

#### Get All Users
**GET** `/admin/users?page=1&limit=10&role=resident&status=active&search=john`  
**Auth Required:** Yes  
**Roles:** Admin

#### Get User by ID
**GET** `/admin/users/:id`  
**Auth Required:** Yes  
**Roles:** Admin

#### Create User
**POST** `/admin/users`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone_number": "+91-1234567890",
  "role": "resident",
  "status": "active"
}
```

#### Update User
**PUT** `/admin/users/:id`  
**Auth Required:** Yes  
**Roles:** Admin

#### Update User Status
**PATCH** `/admin/users/:id/status`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "status": "inactive"
}
```

#### Update User Role
**PATCH** `/admin/users/:id/role`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "role": "staff"
}
```

#### Delete User
**DELETE** `/admin/users/:id`  
**Auth Required:** Yes  
**Roles:** Admin

#### Get User Statistics
**GET** `/admin/users/stats`  
**Auth Required:** Yes  
**Roles:** Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "active_users": 140,
    "admin_count": 5,
    "staff_count": 10,
    "resident_count": 135
  }
}
```

### 7.2 Unit Management

#### Get All Units
**GET** `/admin/units?page=1&limit=10&block_id=uuid&status=occupied`  
**Auth Required:** Yes  
**Roles:** Admin

#### Create Unit
**POST** `/admin/units`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "block_id": "uuid",
  "unit_number": "101",
  "floor_number": 1,
  "type": "2BHK",
  "status": "vacant"
}
```

#### Assign Resident to Unit
**POST** `/admin/units/:id/residents`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "user_id": "uuid",
  "resident_type": "owner",
  "is_primary_contact": true,
  "move_in_date": "2026-01-01"
}
```

#### Remove Resident from Unit
**DELETE** `/admin/units/:id/residents/:userId`  
**Auth Required:** Yes  
**Roles:** Admin

### 7.3 Block Management

#### Get All Blocks
**GET** `/admin/blocks`  
**Auth Required:** Yes  
**Roles:** Admin

#### Create Block
**POST** `/admin/blocks`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "name": "Tower A",
  "description": "Main residential tower"
}
```

### 7.4 Reports

#### Dashboard Statistics
**GET** `/admin/reports/dashboard`  
**Auth Required:** Yes  
**Roles:** Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "users": { "total": 150, "active": 140 },
    "units": { "total": 100, "occupied": 85 },
    "maintenance": { "total": 50, "open": 10 },
    "finance": { "unpaid_amount": 50000 },
    "visitors": { "today_visitors": 25 }
  }
}
```

#### User Report
**GET** `/admin/reports/users?start_date=2026-01-01&end_date=2026-01-31`

#### Finance Report
**GET** `/admin/reports/finance?start_date=2026-01-01&end_date=2026-01-31`

#### Maintenance Report
**GET** `/admin/reports/maintenance?start_date=2026-01-01&end_date=2026-01-31`

#### Visitor Report
**GET** `/admin/reports/visitors?start_date=2026-01-01&end_date=2026-01-31`

### 7.5 System Configuration

#### Get All Configurations
**GET** `/admin/config`  
**Auth Required:** Yes  
**Roles:** Admin

#### Get Config by Category
**GET** `/admin/config/:category`  
**Auth Required:** Yes  
**Roles:** Admin

**Categories:** billing, security, notifications, general, maintenance

#### Create Configuration
**POST** `/admin/config`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "config_key": "billing.late_fee",
  "config_value": "200",
  "category": "billing",
  "description": "Late payment fee",
  "data_type": "number"
}
```

#### Update Configuration
**PUT** `/admin/config/:key`  
**Auth Required:** Yes  
**Roles:** Admin

### 7.6 Audit Logs

#### Get All Audit Logs
**GET** `/admin/audit-logs?page=1&limit=50&action=USER_CREATED`  
**Auth Required:** Yes  
**Roles:** Admin

#### Get Audit Logs by User
**GET** `/admin/audit-logs/user/:userId`  
**Auth Required:** Yes  
**Roles:** Admin

#### Get Audit Statistics
**GET** `/admin/audit-logs/stats?start_date=2026-01-01&end_date=2026-01-31`  
**Auth Required:** Yes  
**Roles:** Admin

---

## 8. Common Patterns

### 8.1 Pagination
Most list endpoints support pagination:
```
?page=1&limit=10
```

**Response includes:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 8.2 Date Filtering
Use ISO 8601 format:
```
?start_date=2026-01-01&end_date=2026-01-31
```

### 8.3 Search
Text search on applicable fields:
```
?search=john
```

---

## 9. Testing

### 9.1 Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Protected Endpoint:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9.2 Using Postman
1. Import API collection
2. Set environment variable for base URL
3. Set Authorization header with token

---

**Document Control**
- **Author**: API Team, Civora Nexus Pvt. Ltd.
- **Next Review Date**: March 31, 2026
