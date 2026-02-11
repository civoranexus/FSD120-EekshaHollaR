# System Architecture

## Introduction

This document describes the high-level system architecture of the Society360 – Smart Residential Management System. The architecture is designed to ensure scalability, security, modularity, and maintainability while supporting real-world residential management workflows.

---

## Architectural Overview

Society360 follows a **three-tier architecture** consisting of:

1. Presentation Layer (Frontend)
2. Application Layer (Backend)
3. Data Layer (Database)

Each layer is logically separated to ensure clean responsibility boundaries and secure data flow.

---

## 1. Presentation Layer (Frontend)

### Technology
- Next.js (React 18)
- Tailwind CSS

### Responsibilities
- User interface rendering
- Role-based dashboard display
- Form handling and client-side validation
- API communication with backend services
- Responsive layout for desktop and mobile devices

### Key Characteristics
- Stateless frontend
- Secure API consumption
- Clean and minimal UI aligned with Civora Nexus branding

---

## 2. Application Layer (Backend)

### Technology
- Node.js
- Express.js

### Responsibilities
- Authentication and authorization
- Role-based access enforcement
- Business logic implementation
- API endpoint management
- Input validation and error handling
- Communication with the database layer

### Backend Components
- Authentication Controller
- User Management Module
- Visitor Management Module
- Maintenance Management Module
- Billing & Finance Module
- Communication & Notification Module
- Admin & Reporting Module

---

## 3. Data Layer (Database)

### Technology
- PostgreSQL
- Prisma ORM

### Responsibilities
- Persistent storage of system data
- Enforcing data integrity and relationships
- Secure storage of sensitive information

### Stored Data Includes
- User accounts and roles
- Residential units and ownership
- Visitor logs and access records
- Maintenance requests and status updates
- Billing, payments, and receipts
- Announcements and notifications

---

## System Interaction Flow

1. User accesses the frontend application.
2. Frontend sends API requests to the backend.
3. Backend validates authentication and authorization.
4. Business logic is executed based on user role.
5. Backend interacts with the database using Prisma ORM.
6. Response is sent back to the frontend.
7. Frontend updates the user interface accordingly.

---

## Security Architecture

- JWT-based authentication for secure API access
- Role-Based Access Control (RBAC) at API level
- Input validation to prevent malicious requests
- Secure session and token handling

---

## Deployment Architecture

- Frontend deployed on Vercel
- Backend deployed on a secure cloud hosting platform
- PostgreSQL hosted on a managed database service
- Environment variables used for sensitive configuration

---

## Architectural Advantages

- Clear separation of concerns
- Scalable and modular design
- Secure data handling
- Easy maintenance and future extensibility

---

## Conclusion

The chosen system architecture ensures that Society360 is robust, scalable, secure, and aligned with modern full stack development practices, making it suitable for real-world residential management applications.
