# Admin Backend API Documentation

## Overview

The Admin Backend provides comprehensive administrative capabilities for the Society360 platform, including user management, unit management, reports, system configuration, and audit logs.

## Authentication & Authorization

All admin endpoints require:
1. **Authentication**: Valid JWT token in Authorization header
2. **Authorization**: User must have `admin` role

```bash
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### User Management

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10&role=admin&status=active&search=john
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (admin, staff, resident)
- `status` (optional): Filter by status (active, inactive, banned)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+91-1234567890",
      "status": "active",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Get User by ID
```http
GET /api/admin/users/:id
```

#### Create User
```http
POST /api/admin/users
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone_number": "+91-1234567890",
  "role": "resident",
  "status": "active"
}
```

#### Update User
```http
PUT /api/admin/users/:id
Content-Type: application/json

{
  "full_name": "John Updated",
  "email": "john.new@example.com",
  "phone_number": "+91-9876543210"
}
```

#### Update User Status
```http
PATCH /api/admin/users/:id/status
Content-Type: application/json

{
  "status": "inactive"
}
```

**Valid statuses:** `active`, `inactive`, `banned`

#### Update User Role
```http
PATCH /api/admin/users/:id/role
Content-Type: application/json

{
  "role": "staff"
}
```

**Valid roles:** `admin`, `staff`, `resident`

#### Delete User (Soft Delete)
```http
DELETE /api/admin/users/:id
```

#### Get User Statistics
```http
GET /api/admin/users/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "active_users": 140,
    "inactive_users": 8,
    "banned_users": 2,
    "admin_count": 5,
    "staff_count": 10,
    "resident_count": 135
  }
}
```

#### Get All Roles
```http
GET /api/admin/roles
```

---

### Unit Management

#### Get All Units
```http
GET /api/admin/units?page=1&limit=10&block_id=uuid&status=occupied&type=2BHK
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `block_id`: Filter by block
- `status`: Filter by status (occupied, vacant, under_maintenance)
- `type`: Filter by type (1BHK, 2BHK, 3BHK, etc.)

#### Get Unit by ID (with Residents)
```http
GET /api/admin/units/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "block_id": "uuid",
    "unit_number": "101",
    "floor_number": 1,
    "type": "2BHK",
    "status": "occupied",
    "residents": [
      {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "resident_type": "owner",
        "is_primary_contact": true
      }
    ]
  }
}
```

#### Create Unit
```http
POST /api/admin/units
Content-Type: application/json

{
  "block_id": "uuid",
  "unit_number": "101",
  "floor_number": 1,
  "type": "2BHK",
  "status": "vacant"
}
```

#### Update Unit
```http
PUT /api/admin/units/:id
Content-Type: application/json

{
  "unit_number": "102",
  "floor_number": 1,
  "type": "3BHK",
  "status": "occupied"
}
```

#### Delete Unit
```http
DELETE /api/admin/units/:id
```

#### Assign Resident to Unit
```http
POST /api/admin/units/:id/residents
Content-Type: application/json

{
  "user_id": "uuid",
  "resident_type": "owner",
  "is_primary_contact": true,
  "move_in_date": "2024-01-01"
}
```

**Valid resident_type:** `owner`, `tenant`, `family_member`

#### Remove Resident from Unit
```http
DELETE /api/admin/units/:id/residents/:userId
```

---

### Block Management

#### Get All Blocks
```http
GET /api/admin/blocks
```

#### Create Block
```http
POST /api/admin/blocks
Content-Type: application/json

{
  "name": "Tower A",
  "description": "Main residential tower"
}
```

#### Update Block
```http
PUT /api/admin/blocks/:id
Content-Type: application/json

{
  "name": "Tower A Updated",
  "description": "Updated description"
}
```

#### Delete Block
```http
DELETE /api/admin/blocks/:id
```

---

### Reports & Analytics

#### Dashboard Statistics
```http
GET /api/admin/reports/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 140
    },
    "units": {
      "total": 100,
      "occupied": 85,
      "vacant": 15
    },
    "maintenance": {
      "total": 50,
      "open": 10,
      "in_progress": 15
    },
    "finance": {
      "unpaid_amount": 50000,
      "overdue_amount": 10000,
      "pending_bills": 20
    },
    "visitors": {
      "today_visitors": 25
    }
  }
}
```

#### User Report
```http
GET /api/admin/reports/users?start_date=2024-01-01&end_date=2024-12-31
```

#### Unit Report
```http
GET /api/admin/reports/units
```

#### Finance Report
```http
GET /api/admin/reports/finance?start_date=2024-01-01&end_date=2024-12-31
```

#### Maintenance Report
```http
GET /api/admin/reports/maintenance?start_date=2024-01-01&end_date=2024-12-31
```

#### Visitor Report
```http
GET /api/admin/reports/visitors?start_date=2024-01-01&end_date=2024-12-31
```

---

### System Configuration

#### Get All Configurations
```http
GET /api/admin/config
```

#### Get Configurations by Category
```http
GET /api/admin/config/:category
```

**Valid categories:** `billing`, `security`, `notifications`, `general`, `maintenance`

#### Get Configuration by Key
```http
GET /api/admin/config/key/:key
```

Example: `GET /api/admin/config/key/billing.maintenance_fee`

#### Create Configuration
```http
POST /api/admin/config
Content-Type: application/json

{
  "config_key": "billing.late_fee",
  "config_value": "200",
  "category": "billing",
  "description": "Late payment fee",
  "data_type": "number"
}
```

**Valid data_type:** `string`, `number`, `boolean`, `json`

#### Update Configuration
```http
PUT /api/admin/config/:key
Content-Type: application/json

{
  "config_value": "250"
}
```

Or full update:
```json
{
  "config_value": "250",
  "category": "billing",
  "description": "Updated late payment fee",
  "data_type": "number"
}
```

#### Delete Configuration
```http
DELETE /api/admin/config/:key
```

#### Seed Default Configurations
```http
POST /api/admin/config/seed
```

This creates default configurations for billing, security, notifications, general, and maintenance categories.

---

### Audit Logs

#### Get All Audit Logs
```http
GET /api/admin/audit-logs?page=1&limit=50&user_id=uuid&action=USER_CREATED&resource_type=users&start_date=2024-01-01&end_date=2024-12-31
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `user_id`: Filter by user
- `action`: Filter by action (e.g., USER_CREATED, UNIT_UPDATED)
- `resource_type`: Filter by resource (users, units, bills, etc.)
- `start_date`, `end_date`: Date range filter

#### Get Audit Log by ID
```http
GET /api/admin/audit-logs/:id
```

#### Get Audit Logs for User
```http
GET /api/admin/audit-logs/user/:userId?limit=50
```

#### Get Audit Logs for Resource
```http
GET /api/admin/audit-logs/resource/:resourceType/:resourceId?limit=50
```

Example: `GET /api/admin/audit-logs/resource/units/uuid-here`

#### Get Audit Statistics
```http
GET /api/admin/audit-logs/stats?start_date=2024-01-01&end_date=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_logs": 1000,
      "unique_users": 50,
      "unique_actions": 25,
      "unique_resources": 10
    },
    "top_actions": [
      { "action": "USER_LOGIN", "count": 500 },
      { "action": "BILL_CREATED", "count": 200 }
    ],
    "top_users": [
      { "full_name": "Admin User", "email": "admin@example.com", "action_count": 300 }
    ]
  }
}
```

#### Search Audit Logs
```http
GET /api/admin/audit-logs/search?q=searchterm&limit=50
```

#### Get Recent Audit Logs
```http
GET /api/admin/audit-logs/recent?limit=100
```

---

## Audit Actions

The system automatically logs the following actions:

### User Actions
- `USER_LOGIN`, `USER_LOGOUT`
- `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`
- `USER_STATUS_CHANGED`, `USER_ROLE_CHANGED`

### Unit Actions
- `UNIT_CREATED`, `UNIT_UPDATED`, `UNIT_DELETED`
- `RESIDENT_ASSIGNED`, `RESIDENT_REMOVED`

### Block Actions
- `BLOCK_CREATED`, `BLOCK_UPDATED`, `BLOCK_DELETED`

### Configuration Actions
- `CONFIG_CREATED`, `CONFIG_UPDATED`, `CONFIG_DELETED`

### Other Actions
- `TICKET_CREATED`, `TICKET_UPDATED`, `TICKET_ASSIGNED`, `TICKET_RESOLVED`
- `BILL_CREATED`, `PAYMENT_RECORDED`
- `VISITOR_APPROVED`, `VISITOR_DENIED`, `VISITOR_CHECKED_IN`, `VISITOR_CHECKED_OUT`
- `ANNOUNCEMENT_CREATED`, `ANNOUNCEMENT_UPDATED`, `ANNOUNCEMENT_DELETED`
- `MESSAGE_POSTED`, `MESSAGE_DELETED`

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Schema Updates

The admin backend adds the following table to the schema:

### system_config Table
```sql
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('billing', 'security', 'notifications', 'general', 'maintenance')),
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing

Run admin tests:
```bash
npm test -- tests/admin.users.test.js
```

Run all tests:
```bash
npm test
```

---

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT token
2. **Admin-Only Access**: All endpoints protected by admin role check
3. **Audit Logging**: All admin actions are automatically logged
4. **Soft Deletes**: Users are soft-deleted (not permanently removed)
5. **Self-Protection**: Admins cannot delete their own accounts
6. **Password Hashing**: User passwords are hashed with bcrypt

---

## Usage Examples

### Example: Create User and Assign to Unit

```bash
# 1. Create user
curl -X POST http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "resident"
  }'

# 2. Assign to unit
curl -X POST http://localhost:5000/api/admin/units/UNIT_ID/residents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID_FROM_STEP_1",
    "resident_type": "owner",
    "is_primary_contact": true
  }'
```

### Example: Generate Monthly Report

```bash
# Get finance report for current month
curl -X GET "http://localhost:5000/api/admin/reports/finance?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example: Update System Configuration

```bash
# Update maintenance fee
curl -X PUT http://localhost:5000/api/admin/config/billing.maintenance_fee \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_value": "6000"
  }'
```

---

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
