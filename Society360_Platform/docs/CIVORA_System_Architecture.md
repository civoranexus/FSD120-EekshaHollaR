# Society360 Platform - System Architecture Documentation

**Project:** Society360 – Smart Residential Management System  
**Organization:** Civora Nexus Pvt. Ltd.  
**Document Type:** System Architecture Specification  
**Version:** 1.0  
**Last Updated:** January 31, 2026

---

## Executive Summary

Society360 is a comprehensive residential management platform built on a modern three-tier architecture. The system leverages Next.js for the frontend, Node.js/Express for the backend, and PostgreSQL for data persistence. This architecture ensures scalability, security, and maintainability while supporting real-world residential management workflows.

---

## 1. Architectural Overview

### 1.1 Architecture Pattern
Society360 implements a **Three-Tier Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│              (Next.js 14 + React 18 + Tailwind CSS)         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Admin      │  │    Staff     │  │   Resident   │     │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS (REST API)
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                (Node.js + Express.js)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Authentication & RBAC                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Visitor │ │Maintenance│ │ Finance  │ │  Admin   │     │
│  │  Module  │ │  Module   │ │  Module  │ │  Module  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                              │
│  ┌──────────┐ ┌──────────┐                                 │
│  │  Comms   │ │  Audit   │                                 │
│  │  Module  │ │  Module  │                                 │
│  └──────────┘ └──────────┘                                 │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│                    (PostgreSQL 14+)                          │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Users   │ │  Units   │ │ Visitors │ │  Bills   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │Maintenance│ │  Audit   │ │  Config  │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Modularity**: Business logic organized into independent modules
- **Scalability**: Stateless backend enables horizontal scaling
- **Security-First**: Authentication and authorization at every layer
- **Maintainability**: Clean code structure with comprehensive documentation

---

## 2. Presentation Layer

### 2.1 Technology Stack
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks & Context API
- **HTTP Client**: Axios with JWT interceptors
- **Routing**: Next.js App Router

### 2.2 Key Components

#### 2.2.1 Role-Based Dashboards
- **Admin Dashboard**: User management, reports, system configuration
- **Staff Dashboard**: Maintenance assignment, visitor management
- **Resident Dashboard**: Bill payments, maintenance requests, visitor pre-approval

#### 2.2.2 Core Features
- **Authentication UI**: Login, registration, password recovery
- **Protected Routes**: Role-based access control at component level
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Updates**: Polling-based notification system

### 2.3 Frontend Architecture

```
frontend/
├── app/                      # Next.js App Router
│   ├── dashboard/
│   │   ├── admin/           # Admin-specific pages
│   │   ├── staff/           # Staff-specific pages
│   │   └── resident/        # Resident-specific pages
│   ├── auth/                # Authentication pages
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   ├── auth/               # Auth-related components
│   ├── common/             # Shared UI components
│   └── dashboard/          # Dashboard components
├── lib/                    # Utilities and helpers
│   ├── api/               # API service layer
│   └── utils/             # Helper functions
└── public/                # Static assets
```

### 2.4 API Integration
- **Base URL Configuration**: Environment-based API endpoints
- **JWT Token Management**: Automatic token injection and refresh
- **Error Handling**: Centralized error handling with user-friendly messages
- **Request/Response Interceptors**: Logging and authentication

---

## 3. Application Layer

### 3.1 Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database Client**: node-postgres (pg)
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors

### 3.2 Backend Architecture

```
backend/
├── app.js                  # Express app configuration
├── server.js              # Server entry point
├── config/
│   └── db.js              # Database connection pool
├── middlewares/
│   ├── authMiddleware.js  # JWT authentication
│   └── rbacMiddleware.js  # Role-based access control
├── routes/                # API route definitions
│   ├── authRoutes.js
│   ├── visitorRoutes.js
│   ├── maintenanceRoutes.js
│   ├── financeRoutes.js
│   ├── communicationRoutes.js
│   └── adminRoutes.js
├── controllers/           # Business logic
│   ├── authController.js
│   ├── visitorController.js
│   ├── maintenanceController.js
│   ├── financeController.js
│   ├── adminController.js
│   └── [other controllers]
├── models/               # Data access layer
│   ├── userModel.js
│   ├── visitorModel.js
│   ├── maintenanceModel.js
│   └── [other models]
├── utils/               # Utility functions
│   └── auditLogger.js
└── tests/              # Test suites
    ├── api/
    └── unit/
```

### 3.3 Core Modules

#### 3.3.1 Authentication Module
- **User Registration**: Email-based registration with password hashing
- **User Login**: JWT token generation with role information
- **Token Validation**: Middleware for protected routes
- **Session Management**: Stateless authentication

#### 3.3.2 Visitor Management Module
- **Pre-Approval**: Residents can pre-approve visitors
- **Check-In/Check-Out**: Staff logs visitor entry and exit
- **Visitor History**: Audit trail of all visitor activities
- **Access Control**: Unit-based visitor permissions

#### 3.3.3 Maintenance Module
- **Ticket Creation**: Residents submit maintenance requests
- **Assignment**: Admin/Staff assigns tickets to staff members
- **Status Tracking**: Open → In Progress → Resolved → Closed
- **Priority Management**: Low, Medium, High, Critical

#### 3.3.4 Finance Module
- **Bill Generation**: Automated monthly bill creation
- **Payment Processing**: Simulated payment gateway integration
- **Receipt Generation**: Digital receipts for all transactions
- **Financial Reports**: Admin-level revenue and collection reports

#### 3.3.5 Communication Module
- **Announcements**: Admin broadcasts to all residents
- **Message Board**: Resident-to-resident communication
- **Notifications**: System-generated alerts
- **Moderation**: Admin controls over message board content

#### 3.3.6 Admin Module
- **User Management**: CRUD operations for all users
- **Unit Management**: Block and unit administration
- **System Configuration**: Dynamic system settings
- **Reports & Analytics**: Comprehensive dashboard statistics
- **Audit Logs**: Complete activity tracking

### 3.4 Middleware Stack

#### 3.4.1 Authentication Middleware (`protect`)
```javascript
Flow:
1. Extract JWT token from Authorization header
2. Verify token signature and expiration
3. Fetch user details from database
4. Attach user object to request
5. Proceed to next middleware/controller
```

#### 3.4.2 Authorization Middleware (`authorize`)
```javascript
Flow:
1. Check if user is authenticated
2. Verify user role against allowed roles
3. Grant or deny access based on role
```

#### 3.4.3 Validation Middleware
- **Input Validation**: express-validator for request validation
- **Sanitization**: XSS and SQL injection prevention
- **Error Responses**: Standardized validation error messages

---

## 4. Data Layer

### 4.1 Technology Stack
- **Database**: PostgreSQL 14+
- **Connection Pooling**: node-postgres (pg) Pool
- **Schema Management**: SQL migration scripts
- **Data Types**: UUID, JSONB, Timestamps with timezone

### 4.2 Database Architecture

#### 4.2.1 Core Tables
- **users**: User accounts and authentication
- **roles**: Role definitions (admin, staff, resident)
- **blocks**: Building/tower information
- **units**: Individual apartments/flats
- **user_units**: Resident-to-unit mapping
- **visitor_logs**: Visitor entry/exit records
- **maintenance_tickets**: Service requests
- **bills**: Billing information
- **payments**: Payment transactions
- **announcements**: Admin announcements
- **audit_logs**: System activity logs
- **system_config**: Dynamic configuration

#### 4.2.2 Key Features
- **UUID Primary Keys**: Enhanced security and distribution
- **Foreign Key Constraints**: Data integrity enforcement
- **Indexes**: Optimized query performance
- **Soft Deletes**: Data retention with deleted_at timestamps
- **Triggers**: Automatic updated_at timestamp updates
- **JSONB Storage**: Flexible metadata storage in audit logs

### 4.3 Data Access Patterns
- **Connection Pooling**: Efficient database connection management
- **Prepared Statements**: SQL injection prevention
- **Transaction Support**: ACID compliance for critical operations
- **Query Optimization**: Strategic indexing and query planning

---

## 5. System Integration Flow

### 5.1 User Authentication Flow
```
1. User submits credentials → Frontend
2. Frontend sends POST /api/auth/login → Backend
3. Backend validates credentials → Database
4. Database returns user record → Backend
5. Backend generates JWT token → Frontend
6. Frontend stores token in localStorage
7. Frontend redirects to role-based dashboard
```

### 5.2 Protected Resource Access Flow
```
1. User requests protected resource → Frontend
2. Frontend attaches JWT token in Authorization header
3. Backend receives request → authMiddleware
4. authMiddleware validates token → Database
5. authMiddleware attaches user to request
6. rbacMiddleware checks user role
7. Controller processes business logic → Database
8. Database returns data → Backend
9. Backend sends response → Frontend
10. Frontend updates UI
```

### 5.3 Audit Logging Flow
```
1. User performs action → Controller
2. Controller executes business logic
3. Controller calls auditLogger utility
4. auditLogger inserts record into audit_logs table
5. Audit log includes: user_id, action, resource_type, 
   resource_id, ip_address, user_agent, details (JSONB)
```

---

## 6. Security Architecture

### 6.1 Authentication Security
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: HS256 algorithm with secret key
- **Token Expiration**: Configurable expiration time
- **Secure Headers**: Helmet.js for HTTP security headers

### 6.2 Authorization Security
- **Role-Based Access Control (RBAC)**: Three-tier role system
- **Endpoint Protection**: All sensitive routes require authentication
- **Resource Ownership**: Users can only access their own data
- **Admin Privileges**: Elevated access with audit logging

### 6.3 Data Security
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization and validation
- **CORS Configuration**: Restricted cross-origin requests
- **Environment Variables**: Sensitive configuration externalized

---

## 7. Deployment Architecture

### 7.1 Recommended Deployment
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                   (Nginx/CloudFlare)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                    ↓
┌──────────────────┐              ┌──────────────────┐
│   Frontend       │              │   Backend        │
│   (Vercel)       │              │   (AWS/Heroku)   │
│   Next.js App    │              │   Node.js API    │
└──────────────────┘              └──────────────────┘
                                           ↓
                                  ┌──────────────────┐
                                  │   Database       │
                                  │   (AWS RDS/      │
                                  │    Supabase)     │
                                  └──────────────────┘
```

### 7.2 Environment Configuration
- **Development**: Local PostgreSQL, localhost API
- **Staging**: Cloud database, staging API endpoint
- **Production**: Managed database, production API with SSL

### 7.3 Scalability Considerations
- **Horizontal Scaling**: Stateless backend supports multiple instances
- **Database Scaling**: Read replicas for reporting queries
- **Caching Layer**: Redis for session and frequently accessed data (future)
- **CDN Integration**: Static asset delivery optimization

---

## 8. Performance Optimization

### 8.1 Frontend Optimization
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: Browser caching for static assets

### 8.2 Backend Optimization
- **Connection Pooling**: Reusable database connections
- **Query Optimization**: Indexed queries and JOIN optimization
- **Response Compression**: gzip compression middleware
- **Rate Limiting**: API request throttling (future enhancement)

### 8.3 Database Optimization
- **Indexing Strategy**: Indexes on foreign keys and frequently queried columns
- **Query Planning**: EXPLAIN ANALYZE for complex queries
- **Partitioning**: Table partitioning for large datasets (future)
- **Archival Strategy**: Historical data archival for audit logs

---

## 9. Monitoring & Observability

### 9.1 Application Monitoring
- **Error Logging**: Console logging (development), structured logging (production)
- **Performance Metrics**: Response time tracking
- **Health Checks**: API endpoint health monitoring

### 9.2 Database Monitoring
- **Query Performance**: Slow query logging
- **Connection Pool Monitoring**: Active connection tracking
- **Storage Monitoring**: Database size and growth tracking

### 9.3 Audit & Compliance
- **Audit Logs**: Comprehensive activity tracking
- **User Activity**: Login/logout tracking
- **Data Changes**: Before/after snapshots in audit logs

---

## 10. Future Enhancements

### 10.1 Planned Features
- **Real-time Notifications**: WebSocket integration
- **Mobile Applications**: React Native apps for iOS/Android
- **Advanced Analytics**: Machine learning for predictive maintenance
- **Payment Gateway Integration**: Real payment processing
- **Document Management**: File upload and storage system

### 10.2 Technical Improvements
- **GraphQL API**: Alternative to REST for complex queries
- **Microservices**: Service decomposition for large-scale deployments
- **Event-Driven Architecture**: Message queue integration
- **Containerization**: Docker and Kubernetes deployment

---

## 11. Conclusion

The Society360 platform architecture is designed with modern best practices, ensuring:
- **Scalability**: Supports growth from small to large residential communities
- **Security**: Multi-layered security with authentication, authorization, and audit logging
- **Maintainability**: Clean separation of concerns and modular design
- **Performance**: Optimized for fast response times and efficient resource usage
- **Extensibility**: Easy to add new features and modules

This architecture provides a solid foundation for a production-grade residential management system aligned with Civora Nexus standards.

---

**Document Control**
- **Author**: Development Team, Civora Nexus Pvt. Ltd.
- **Reviewers**: Technical Architecture Team
- **Approval**: Project Lead
- **Next Review Date**: March 31, 2026
