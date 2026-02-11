# Database Design

## Introduction

This document describes the database design for the Society360 – Smart Residential Management System. The database is designed to support secure, scalable, and structured storage of residential society data while maintaining data integrity and enforcing role-based access.

The system uses a relational database model implemented using PostgreSQL with Prisma ORM.

---

## Database Design Principles

- Relational and normalized structure
- Clear separation of entities
- Strong referential integrity
- Secure handling of sensitive data
- Scalability for growing societies

---

## Core Entities Overview

The primary entities in the Society360 database include:

- Users
- Roles
- Residential Units
- Visitors
- Maintenance Requests
- Payments & Bills
- Announcements
- Notifications

---

## Entity Descriptions

### 1. User

Stores authentication and identity details of all system users.

**Attributes:**
- user_id (Primary Key)
- name
- email
- password_hash
- phone_number
- role_id (Foreign Key)
- unit_id (Foreign Key, nullable for staff/admin)
- created_at
- updated_at
- status (active/inactive)

---

### 2. Role

Defines system roles and access levels.

**Attributes:**
- role_id (Primary Key)
- role_name (Resident, Admin, Staff)
- description

---

### 3. Residential Unit

Represents apartments or houses within the society.

**Attributes:**
- unit_id (Primary Key)
- unit_number
- block_name
- floor_number
- owner_name
- occupancy_status

---

### 4. Visitor

Stores visitor entry and exit records.

**Attributes:**
- visitor_id (Primary Key)
- visitor_name
- purpose
- approved_by (Foreign Key → User)
- unit_id (Foreign Key)
- entry_time
- exit_time
- created_at

---

### 5. Maintenance Request

Manages maintenance complaints and service requests.

**Attributes:**
- request_id (Primary Key)
- title
- description
- category
- priority
- status
- created_by (Foreign Key → User)
- assigned_to (Foreign Key → User, nullable)
- created_at
- resolved_at

---

### 6. Bill

Stores monthly maintenance billing information.

**Attributes:**
- bill_id (Primary Key)
- unit_id (Foreign Key)
- billing_month
- amount
- due_date
- status (paid/unpaid)
- generated_at

---

### 7. Payment

Stores payment transaction details (simulated).

**Attributes:**
- payment_id (Primary Key)
- bill_id (Foreign Key)
- paid_by (Foreign Key → User)
- amount
- payment_date
- payment_method
- transaction_reference

---

### 8. Announcement

Stores official society announcements.

**Attributes:**
- announcement_id (Primary Key)
- title
- content
- created_by (Foreign Key → Admin)
- created_at
- is_active

---

### 9. Notification

Stores system-generated notifications.

**Attributes:**
- notification_id (Primary Key)
- user_id (Foreign Key)
- message
- type
- is_read
- created_at

---

## Entity Relationships

- One Role can be assigned to many Users
- One Residential Unit can have multiple Residents
- One User can create multiple Maintenance Requests
- One Maintenance Request can be assigned to one Staff member
- One Unit can have multiple Bills
- One Bill can have one or more Payment records
- One Admin can create multiple Announcements
- One User can receive multiple Notifications

---

## Data Security Considerations

- Passwords are stored as hashed values
- Sensitive identifiers are never exposed directly to the frontend
- Foreign key constraints enforce data consistency
- Access to tables is controlled via backend authorization logic

---

## Conclusion

The database design for Society360 ensures reliable data storage, secure access control, and efficient retrieval of information required for residential management operations. The schema supports future expansion and aligns with real-world residential workflows.
