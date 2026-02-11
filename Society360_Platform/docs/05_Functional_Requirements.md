# Functional Requirements

## Introduction

This document defines the functional requirements of the Society360 – Smart Residential Management System. These requirements describe the expected behavior of the system and the features available to each user role.

The system supports three primary user roles:
- Resident
- Management / Administrator
- Security / Facility Staff

Each role is granted access strictly based on authorization rules.

---

## 1. User Authentication & Authorization

### FR-1.1 User Registration
- The system shall allow authorized users to register with valid credentials.
- Each user shall be associated with a specific role and residential unit.

### FR-1.2 User Login
- The system shall allow users to log in using secure authentication credentials.
- Invalid login attempts shall be rejected with appropriate error messages.

### FR-1.3 Role-Based Access Control
- The system shall restrict access to features based on the user’s assigned role.
- Residents shall not access administrative or other residents’ private data.

### FR-1.4 Session Management
- The system shall securely manage user sessions.
- The system shall allow users to log out and invalidate active sessions.

---

## 2. Resident Management

### FR-2.1 Profile Management
- Residents shall be able to view and update their personal profile details.
- Unit details shall be viewable but not editable by residents.

### FR-2.2 Resident Dashboard
- The system shall provide a dashboard displaying announcements, pending dues, requests, and notifications.

---

## 3. Visitor & Gate Management

### FR-3.1 Visitor Pre-Approval
- Residents shall be able to pre-approve visitors and deliveries.
- Visitor details shall include name, purpose, date, and expected time.

### FR-3.2 Visitor Entry Logging
- Security staff shall log visitor entry at the gate.
- The system shall validate pre-approved visitors during entry.

### FR-3.3 Visitor Exit Logging
- Security staff shall record visitor exit time.
- The system shall maintain a complete entry-exit audit log.

### FR-3.4 Visitor History
- Authorized users shall be able to view visitor history based on role permissions.

---

## 4. Maintenance & Complaint Management

### FR-4.1 Maintenance Request Submission
- Residents shall be able to submit maintenance requests or grievances.
- Requests shall include category, description, and priority.

### FR-4.2 Request Assignment
- Administrators shall assign maintenance tasks to staff members.

### FR-4.3 Status Updates
- Staff shall update maintenance request status.
- Status values shall include Submitted, Assigned, In Progress, and Resolved.

### FR-4.4 Request Tracking
- Residents shall be able to track the real-time status of their requests.

---

## 5. Finance & Billing Management

### FR-5.1 Bill Generation
- The system shall generate monthly maintenance bills for each residential unit.

### FR-5.2 Payment Processing
- Residents shall be able to pay maintenance fees using a simulated payment system.

### FR-5.3 Receipt Generation
- The system shall generate digital receipts after successful payment.

### FR-5.4 Payment History
- Residents shall be able to view their own payment history.
- Administrators shall be able to view overall payment records.

---

## 6. Communication & Announcements

### FR-6.1 Announcements
- Administrators shall be able to create and publish announcements.
- Residents shall be notified of new announcements.

### FR-6.2 Notifications
- The system shall notify users of important events such as:
  - Pending payments
  - Visitor arrivals
  - Maintenance updates

---

## 7. Administration & Reporting

### FR-7.1 User Management
- Administrators shall manage users, roles, and unit assignments.

### FR-7.2 System Configuration
- Administrators shall manage system-l
