# Society360 Platform - Database Schema Documentation

**Project:** Society360 – Smart Residential Management System  
**Organization:** Civora Nexus Pvt. Ltd.  
**Document Type:** Database Schema Specification  
**Version:** 1.0  
**Last Updated:** January 31, 2026

---

## Executive Summary

This document provides a comprehensive explanation of the Society360 database schema. The database is built on PostgreSQL 14+ and follows relational database design principles with strong normalization, referential integrity, and security best practices. The schema supports multi-tenant residential management with role-based access control, audit logging, and flexible configuration.

---

## 1. Database Overview

### 1.1 Database Technology
- **RDBMS**: PostgreSQL 14+
- **Extension**: uuid-ossp (for UUID generation)
- **Character Set**: UTF-8
- **Timezone**: UTC with timezone support

### 1.2 Design Principles
- **Normalization**: Third Normal Form (3NF) compliance
- **Referential Integrity**: Foreign key constraints throughout
- **Data Integrity**: CHECK constraints for enum-like values
- **Audit Trail**: Comprehensive logging of all critical operations
- **Soft Deletes**: Preservation of historical data
- **Scalability**: UUID primary keys for distributed systems

### 1.3 Schema Statistics
- **Total Tables**: 12 core tables
- **Total Indexes**: 15+ indexes for query optimization
- **Total Triggers**: 2 automatic update triggers
- **Total Constraints**: 20+ CHECK and FOREIGN KEY constraints

---

## 2. Entity-Relationship Diagram

```
┌──────────────┐
│    roles     │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────┴───────┐         ┌──────────────┐
│    users     │────────▶│  audit_logs  │
└──────┬───────┘ N    1  └──────────────┘
       │
       │ 1
       │
       │ N
┌──────┴───────────┐
│   user_units     │
└──────┬───────────┘
       │ N
       │
       │ 1
┌──────┴───────┐         ┌──────────────┐
│    units     │────────▶│    blocks    │
└──────┬───────┘ N    1  └──────────────┘
       │
       ├──────────────────┬──────────────────┬──────────────────┐
       │ 1                │ 1                │ 1                │
       │                  │                  │                  │
       │ N                │ N                │ N                │
┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴────────────┐  ┌──────────────┐
│visitor_logs  │  │    bills     │  │maintenance_tickets│  │announcements │
└──────────────┘  └──────┬───────┘  └───────────────────┘  └──────────────┘
                         │ 1
                         │
                         │ N
                  ┌──────┴───────┐
                  │   payments   │
                  └──────────────┘

┌──────────────────┐
│  system_config   │
└──────────────────┘
```

---

## 3. Table Specifications

### 3.1 Roles Table

**Purpose**: Defines system roles for role-based access control.

```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing role identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Role name (admin, staff, resident) |
| description | TEXT | - | Role description |

**Predefined Roles**:
- `admin`: Full system access, user management, reports
- `staff`: Maintenance and visitor management
- `resident`: Personal dashboard, bill payments, requests

**Relationships**:
- One-to-Many with `users` table

---

### 3.2 Users Table

**Purpose**: Stores all user accounts with authentication credentials and profile information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role_id INTEGER REFERENCES roles(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email (unique) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| phone_number | VARCHAR(20) | - | Contact number |
| role_id | INTEGER | FOREIGN KEY | Reference to roles table |
| status | VARCHAR(20) | CHECK constraint | active, inactive, or banned |
| profile_picture_url | TEXT | - | URL to profile image |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |
| deleted_at | TIMESTAMP | - | Soft delete timestamp |

**Indexes**:
- `idx_users_email`: Fast email lookup for authentication
- `idx_users_role`: Role-based queries

**Security Features**:
- Password stored as bcrypt hash (never plain text)
- Soft delete preserves audit trail
- Status field for account suspension

**Relationships**:
- Many-to-One with `roles`
- One-to-Many with `user_units`
- One-to-Many with `audit_logs`
- One-to-Many with `maintenance_tickets`
- One-to-Many with `visitor_logs`

---

### 3.3 Blocks Table

**Purpose**: Represents building blocks or towers within the residential complex.

```sql
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique block identifier |
| name | VARCHAR(50) | NOT NULL | Block/tower name (e.g., "Tower A") |
| description | TEXT | - | Additional block information |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Example Data**:
- Tower A, Tower B, Tower C
- Block 1, Block 2
- North Wing, South Wing

**Relationships**:
- One-to-Many with `units`

---

### 3.4 Units Table

**Purpose**: Represents individual apartments/flats within blocks.

```sql
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
    unit_number VARCHAR(20) NOT NULL,
    floor_number INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'under_maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(block_id, unit_number)
);

CREATE INDEX idx_units_block ON units(block_id);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique unit identifier |
| block_id | UUID | FOREIGN KEY | Reference to blocks table |
| unit_number | VARCHAR(20) | NOT NULL | Unit number (e.g., "101", "10A") |
| floor_number | INTEGER | NOT NULL | Floor level |
| type | VARCHAR(20) | NOT NULL | Unit type (1BHK, 2BHK, 3BHK, etc.) |
| status | VARCHAR(20) | CHECK constraint | occupied, vacant, under_maintenance |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Unique Constraint**:
- `(block_id, unit_number)`: Prevents duplicate unit numbers within a block

**Indexes**:
- `idx_units_block`: Fast block-based queries

**Relationships**:
- Many-to-One with `blocks`
- One-to-Many with `user_units`
- One-to-Many with `visitor_logs`
- One-to-Many with `maintenance_tickets`
- One-to-Many with `bills`

---

### 3.5 User_Units Table

**Purpose**: Links users (residents) to their units with residency details.

```sql
CREATE TABLE user_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    resident_type VARCHAR(20) NOT NULL CHECK (resident_type IN ('owner', 'tenant', 'family_member')),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    move_in_date DATE,
    move_out_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'moved_out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_units_user ON user_units(user_id);
CREATE INDEX idx_user_units_unit ON user_units(unit_id);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique mapping identifier |
| user_id | UUID | FOREIGN KEY | Reference to users table |
| unit_id | UUID | FOREIGN KEY | Reference to units table |
| resident_type | VARCHAR(20) | CHECK constraint | owner, tenant, family_member |
| is_primary_contact | BOOLEAN | DEFAULT FALSE | Primary contact for unit |
| move_in_date | DATE | - | Residency start date |
| move_out_date | DATE | - | Residency end date |
| status | VARCHAR(20) | CHECK constraint | active or moved_out |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Business Rules**:
- One unit can have multiple residents (owner + family members)
- One user can be associated with multiple units
- Only one primary contact per unit recommended
- Move-out date triggers status change to 'moved_out'

**Indexes**:
- `idx_user_units_user`: User-based queries
- `idx_user_units_unit`: Unit-based queries

**Relationships**:
- Many-to-One with `users`
- Many-to-One with `units`

---

### 3.6 Visitor_Logs Table

**Purpose**: Records all visitor entries and exits with approval tracking.

```sql
CREATE TABLE visitor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    visitor_name VARCHAR(100) NOT NULL,
    visitor_phone VARCHAR(20),
    purpose VARCHAR(100),
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE,
    vehicle_number VARCHAR(20),
    entry_gate VARCHAR(50),
    approved_by_user_id UUID REFERENCES users(id),
    security_guard_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'checked_in' CHECK (status IN ('pending', 'approved', 'checked_in', 'checked_out', 'denied'))
);

CREATE INDEX idx_visitors_unit ON visitor_logs(unit_id);
CREATE INDEX idx_visitors_check_in ON visitor_logs(check_in_time);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique visitor log identifier |
| unit_id | UUID | FOREIGN KEY | Visiting unit |
| visitor_name | VARCHAR(100) | NOT NULL | Visitor's name |
| visitor_phone | VARCHAR(20) | - | Visitor's contact number |
| purpose | VARCHAR(100) | - | Visit purpose (Delivery, Guest, Service) |
| check_in_time | TIMESTAMP | DEFAULT NOW | Entry timestamp |
| check_out_time | TIMESTAMP | - | Exit timestamp |
| vehicle_number | VARCHAR(20) | - | Vehicle registration |
| entry_gate | VARCHAR(50) | - | Gate used for entry |
| approved_by_user_id | UUID | FOREIGN KEY | Resident who approved |
| security_guard_id | UUID | FOREIGN KEY | Guard who logged entry |
| status | VARCHAR(20) | CHECK constraint | Visitor status |

**Status Flow**:
1. `pending`: Visitor pre-approved by resident
2. `approved`: Approval confirmed
3. `checked_in`: Visitor entered premises
4. `checked_out`: Visitor exited premises
5. `denied`: Entry denied

**Indexes**:
- `idx_visitors_unit`: Unit-based visitor history
- `idx_visitors_check_in`: Time-based queries

**Relationships**:
- Many-to-One with `units`
- Many-to-One with `users` (approved_by)
- Many-to-One with `users` (security_guard)

---

### 3.7 Maintenance_Tickets Table

**Purpose**: Manages maintenance requests and service tickets.

```sql
CREATE TABLE maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES users(id),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'rejected')),
    assigned_to_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_unit ON maintenance_tickets(unit_id);
CREATE INDEX idx_tickets_status ON maintenance_tickets(status);
CREATE INDEX idx_tickets_assigned ON maintenance_tickets(assigned_to_id);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique ticket identifier |
| unit_id | UUID | FOREIGN KEY | Unit with maintenance issue |
| requester_id | UUID | FOREIGN KEY | User who created ticket |
| category | VARCHAR(50) | NOT NULL | Plumbing, Electrical, Cleaning, etc. |
| title | VARCHAR(100) | NOT NULL | Brief issue description |
| description | TEXT | - | Detailed issue description |
| priority | VARCHAR(10) | CHECK constraint | low, medium, high, critical |
| status | VARCHAR(20) | CHECK constraint | Ticket status |
| assigned_to_id | UUID | FOREIGN KEY | Staff member assigned |
| created_at | TIMESTAMP | DEFAULT NOW | Ticket creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |
| resolved_at | TIMESTAMP | - | Resolution timestamp |

**Status Lifecycle**:
1. `open`: New ticket created
2. `in_progress`: Staff working on issue
3. `resolved`: Issue fixed, awaiting verification
4. `closed`: Ticket completed
5. `rejected`: Invalid or duplicate ticket

**Priority Levels**:
- `critical`: Immediate attention (e.g., water leak, power outage)
- `high`: Urgent (e.g., broken elevator)
- `medium`: Standard (e.g., minor repairs)
- `low`: Non-urgent (e.g., cosmetic issues)

**Indexes**:
- `idx_tickets_unit`: Unit-based ticket history
- `idx_tickets_status`: Status-based filtering
- `idx_tickets_assigned`: Staff workload queries

**Relationships**:
- Many-to-One with `units`
- Many-to-One with `users` (requester)
- Many-to-One with `users` (assigned_to)

---

### 3.8 Bills Table

**Purpose**: Stores billing information for units.

```sql
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    bill_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'partially_paid')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bills_unit ON bills(unit_id);
CREATE INDEX idx_bills_status ON bills(status);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique bill identifier |
| unit_id | UUID | FOREIGN KEY | Unit being billed |
| bill_type | VARCHAR(50) | NOT NULL | Maintenance, Electricity, Water, etc. |
| amount | DECIMAL(10,2) | NOT NULL | Bill amount |
| bill_date | DATE | NOT NULL | Bill generation date |
| due_date | DATE | NOT NULL | Payment due date |
| status | VARCHAR(20) | CHECK constraint | Payment status |
| description | TEXT | - | Bill details |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Bill Types**:
- `Maintenance`: Monthly maintenance charges
- `Electricity`: Electricity consumption
- `Water`: Water consumption
- `Parking`: Parking fees
- `Amenity`: Amenity usage charges

**Status Flow**:
- `unpaid`: Bill generated, payment pending
- `partially_paid`: Partial payment received
- `paid`: Full payment received
- `overdue`: Past due date, payment pending

**Indexes**:
- `idx_bills_unit`: Unit billing history
- `idx_bills_status`: Payment status queries

**Relationships**:
- Many-to-One with `units`
- One-to-Many with `payments`

---

### 3.9 Payments Table

**Purpose**: Records all payment transactions.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id),
    payer_id UUID REFERENCES users(id),
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'success'
);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique payment identifier |
| bill_id | UUID | FOREIGN KEY | Associated bill |
| payer_id | UUID | FOREIGN KEY | User who made payment |
| amount_paid | DECIMAL(10,2) | NOT NULL | Payment amount |
| payment_method | VARCHAR(50) | - | UPI, Credit Card, Bank Transfer, etc. |
| transaction_reference | VARCHAR(100) | - | Payment gateway reference |
| payment_date | TIMESTAMP | DEFAULT NOW | Payment timestamp |
| status | VARCHAR(20) | DEFAULT success | success, failed, pending |

**Payment Methods**:
- `UPI`: Unified Payments Interface
- `Credit Card`: Card payment
- `Debit Card`: Card payment
- `Bank Transfer`: NEFT/RTGS
- `Cash`: Cash payment (recorded by admin)

**Note**: Current implementation simulates payments. Real payment gateway integration planned for future.

**Relationships**:
- Many-to-One with `bills`
- Many-to-One with `users`

---

### 3.10 Announcements Table

**Purpose**: Stores official announcements from administration.

```sql
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'owners', 'tenants', 'staff')),
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique announcement identifier |
| title | VARCHAR(150) | NOT NULL | Announcement title |
| content | TEXT | NOT NULL | Announcement content |
| author_id | UUID | FOREIGN KEY | Admin who created announcement |
| target_audience | VARCHAR(20) | CHECK constraint | Audience filter |
| is_important | BOOLEAN | DEFAULT FALSE | Priority flag |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| expires_at | TIMESTAMP | - | Expiration timestamp |

**Target Audiences**:
- `all`: All residents and staff
- `owners`: Only unit owners
- `tenants`: Only tenants
- `staff`: Only staff members

**Use Cases**:
- Society events and meetings
- Maintenance schedules
- Policy updates
- Emergency notifications

**Relationships**:
- Many-to-One with `users` (author)

---

### 3.11 Audit_Logs Table

**Purpose**: Comprehensive audit trail of all system activities.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log identifier |
| user_id | UUID | FOREIGN KEY | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action performed (e.g., USER_LOGIN) |
| resource_type | VARCHAR(50) | - | Resource affected (users, units, etc.) |
| resource_id | UUID | - | Specific resource identifier |
| ip_address | VARCHAR(45) | - | User's IP address |
| user_agent | TEXT | - | Browser/client information |
| details | JSONB | - | Additional metadata (before/after values) |
| created_at | TIMESTAMP | DEFAULT NOW | Action timestamp |

**Common Actions**:
- **Authentication**: USER_LOGIN, USER_LOGOUT
- **User Management**: USER_CREATED, USER_UPDATED, USER_DELETED
- **Maintenance**: TICKET_CREATED, TICKET_ASSIGNED, TICKET_RESOLVED
- **Finance**: BILL_CREATED, PAYMENT_RECORDED
- **Visitors**: VISITOR_APPROVED, VISITOR_CHECKED_IN, VISITOR_CHECKED_OUT
- **Communication**: ANNOUNCEMENT_CREATED, MESSAGE_POSTED

**JSONB Details Example**:
```json
{
  "before": {"status": "open"},
  "after": {"status": "resolved"},
  "notes": "Issue fixed by plumber"
}
```

**Indexes**:
- `idx_audit_user`: User activity tracking
- `idx_audit_resource`: Resource change history

**Relationships**:
- Many-to-One with `users`

**Retention Policy**: Recommended 2-year retention for compliance

---

### 3.12 System_Config Table

**Purpose**: Dynamic system configuration and settings.

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

CREATE INDEX idx_config_category ON system_config(category);
CREATE INDEX idx_config_key ON system_config(config_key);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique config identifier |
| config_key | VARCHAR(100) | UNIQUE, NOT NULL | Configuration key (e.g., billing.late_fee) |
| config_value | TEXT | NOT NULL | Configuration value |
| category | VARCHAR(50) | CHECK constraint | Configuration category |
| description | TEXT | - | Configuration description |
| data_type | VARCHAR(20) | CHECK constraint | Value data type |
| updated_by | UUID | FOREIGN KEY | Admin who last updated |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |

**Configuration Categories**:
- `billing`: Payment and billing settings
- `security`: Security and authentication settings
- `notifications`: Notification preferences
- `general`: General system settings
- `maintenance`: Maintenance workflow settings

**Example Configurations**:
```
billing.maintenance_fee = "5000"
billing.late_fee_percentage = "5"
security.session_timeout = "3600"
notifications.email_enabled = "true"
maintenance.auto_assign = "false"
```

**Data Types**:
- `string`: Text values
- `number`: Numeric values
- `boolean`: true/false values
- `json`: Complex JSON objects

**Indexes**:
- `idx_config_category`: Category-based queries
- `idx_config_key`: Fast key lookup

**Relationships**:
- Many-to-One with `users` (updated_by)

---

## 4. Database Triggers

### 4.1 Auto-Update Timestamp Trigger

**Purpose**: Automatically updates `updated_at` column on record modification.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tickets_modtime 
    BEFORE UPDATE ON maintenance_tickets 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();
```

**Applied To**:
- `users` table
- `maintenance_tickets` table
- Can be extended to other tables as needed

---

## 5. Data Integrity & Constraints

### 5.1 Foreign Key Constraints

**Cascading Deletes**:
- `units.block_id` → CASCADE (deleting block deletes units)
- `user_units.user_id` → CASCADE (deleting user removes unit associations)
- `maintenance_tickets.unit_id` → CASCADE (deleting unit removes tickets)
- `bills.unit_id` → CASCADE (deleting unit removes bills)

**Set NULL on Delete**:
- `visitor_logs.unit_id` → SET NULL (preserve visitor history)
- `audit_logs.user_id` → SET NULL (preserve audit trail)

### 5.2 CHECK Constraints

**Status Enumerations**:
- `users.status`: active, inactive, banned
- `units.status`: occupied, vacant, under_maintenance
- `user_units.status`: active, moved_out
- `visitor_logs.status`: pending, approved, checked_in, checked_out, denied
- `maintenance_tickets.status`: open, in_progress, resolved, closed, rejected
- `bills.status`: unpaid, paid, overdue, partially_paid

**Priority Levels**:
- `maintenance_tickets.priority`: low, medium, high, critical

**Resident Types**:
- `user_units.resident_type`: owner, tenant, family_member

**Target Audiences**:
- `announcements.target_audience`: all, owners, tenants, staff

**Configuration Categories**:
- `system_config.category`: billing, security, notifications, general, maintenance

**Data Types**:
- `system_config.data_type`: string, number, boolean, json

### 5.3 Unique Constraints

- `users.email`: Unique email addresses
- `roles.name`: Unique role names
- `units(block_id, unit_number)`: Unique unit numbers within blocks
- `system_config.config_key`: Unique configuration keys

---

## 6. Indexing Strategy

### 6.1 Primary Key Indexes
All tables use UUID primary keys with automatic indexing.

### 6.2 Foreign Key Indexes
- `idx_users_role`: Fast role-based user queries
- `idx_user_units_user`: User-to-unit lookups
- `idx_user_units_unit`: Unit-to-user lookups
- `idx_units_block`: Block-based unit queries
- `idx_tickets_assigned`: Staff workload queries
- `idx_audit_user`: User activity tracking

### 6.3 Query Optimization Indexes
- `idx_users_email`: Authentication queries
- `idx_visitors_check_in`: Time-based visitor reports
- `idx_tickets_status`: Status filtering
- `idx_bills_status`: Payment status queries
- `idx_audit_resource`: Resource change history
- `idx_config_category`: Category-based config retrieval
- `idx_config_key`: Fast config key lookup

### 6.4 Composite Indexes
- `idx_audit_resource(resource_type, resource_id)`: Efficient resource audit queries

---

## 7. Data Security

### 7.1 Password Security
- Passwords stored as bcrypt hashes in `users.password_hash`
- Never stored in plain text
- Salt rounds: 10 (configurable)

### 7.2 Soft Deletes
- `users.deleted_at`: Preserves user history and audit trail
- Deleted users excluded from active queries
- Enables data recovery if needed

### 7.3 Audit Trail
- All critical operations logged in `audit_logs`
- Includes user, action, resource, timestamp, and metadata
- JSONB details for before/after snapshots

### 7.4 Access Control
- Database access restricted to application layer
- No direct database access for end users
- Role-based access enforced at application level

---

## 8. Scalability Considerations

### 8.1 UUID Primary Keys
- Enables distributed database systems
- Prevents ID collision in multi-tenant scenarios
- Supports database sharding

### 8.2 Partitioning (Future)
Recommended partitioning strategies:
- `audit_logs`: Partition by created_at (monthly/yearly)
- `visitor_logs`: Partition by check_in_time (monthly)
- `bills`: Partition by bill_date (yearly)

### 8.3 Archival Strategy
- Archive old audit logs (>2 years) to separate table
- Archive resolved maintenance tickets (>1 year)
- Archive old visitor logs (>6 months)

---

## 9. Backup & Recovery

### 9.1 Backup Strategy
- **Full Backup**: Daily at 2:00 AM
- **Incremental Backup**: Every 6 hours
- **Transaction Log Backup**: Continuous
- **Retention**: 30 days

### 9.2 Critical Tables (Priority 1)
- `users`, `roles`, `units`, `blocks`, `user_units`
- `bills`, `payments`

### 9.3 Important Tables (Priority 2)
- `maintenance_tickets`, `visitor_logs`
- `announcements`, `system_config`

### 9.4 Audit Tables (Priority 3)
- `audit_logs` (can be archived)

---

## 10. Database Maintenance

### 10.1 Regular Maintenance Tasks
- **VACUUM**: Weekly to reclaim storage
- **ANALYZE**: After bulk data changes
- **REINDEX**: Monthly for optimal performance
- **Statistics Update**: Weekly

### 10.2 Monitoring
- Query performance monitoring
- Slow query logging (>1 second)
- Connection pool monitoring
- Storage growth tracking

---

## 11. Migration & Seeding

### 11.1 Schema Migration
Location: `backend/database/schema.sql`

```bash
psql -U postgres -d society360 -f backend/database/schema.sql
```

### 11.2 Seed Data
Location: `backend/database/seed.sql`

Includes:
- Default roles (admin, staff, resident)
- Sample users for testing
- Sample blocks and units
- Sample system configurations

```bash
psql -U postgres -d society360 -f backend/database/seed.sql
```

---

## 12. Future Enhancements

### 12.1 Planned Tables
- `messages`: Resident message board
- `notifications`: User notifications
- `documents`: Document management
- `amenities`: Amenity booking system
- `parking`: Parking slot management

### 12.2 Planned Features
- Full-text search indexes for announcements and messages
- Materialized views for complex reports
- Database-level encryption for sensitive fields
- Multi-tenancy support for multiple societies

---

## 13. Conclusion

The Society360 database schema provides:
- **Robust Data Model**: Comprehensive coverage of residential management needs
- **Data Integrity**: Strong constraints and referential integrity
- **Security**: Password hashing, soft deletes, and audit logging
- **Performance**: Strategic indexing for fast queries
- **Scalability**: UUID keys and partitioning-ready design
- **Maintainability**: Clear structure and documentation

This schema serves as a solid foundation for a production-grade residential management system.

---

**Document Control**
- **Author**: Database Team, Civora Nexus Pvt. Ltd.
- **Reviewers**: Technical Architecture Team
- **Approval**: Database Administrator
- **Next Review Date**: March 31, 2026
