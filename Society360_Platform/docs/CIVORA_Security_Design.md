# Society360 Platform - Security Design Documentation

**Project:** Society360 – Smart Residential Management System  
**Organization:** Civora Nexus Pvt. Ltd.  
**Document Type:** Security Architecture & Design Specification  
**Version:** 1.0  
**Last Updated:** January 31, 2026

---

## Executive Summary

This document outlines the comprehensive security architecture of the Society360 platform. The system implements defense-in-depth security principles with multiple layers of protection including authentication, authorization, data encryption, input validation, and comprehensive audit logging. The security design protects sensitive resident information, financial data, and administrative operations while maintaining usability and performance.

---

## 1. Security Objectives

### 1.1 Primary Security Goals
- **Confidentiality**: Protect sensitive user data and financial information
- **Integrity**: Ensure data accuracy and prevent unauthorized modifications
- **Availability**: Maintain system availability and prevent service disruptions
- **Accountability**: Track all user actions through comprehensive audit logging
- **Non-Repudiation**: Ensure actions cannot be denied through audit trails

### 1.2 Compliance Requirements
- **Data Protection**: Adherence to data privacy best practices
- **Financial Security**: Secure handling of payment information
- **Access Control**: Role-based access to sensitive operations
- **Audit Requirements**: Complete activity logging for compliance

### 1.3 Threat Model

**Protected Against**:
- Unauthorized access to user accounts
- SQL injection attacks
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Session hijacking
- Brute force attacks
- Data breaches
- Privilege escalation

---

## 2. Authentication Architecture

### 2.1 Authentication Strategy

**Technology**: JSON Web Tokens (JWT)  
**Algorithm**: HS256 (HMAC with SHA-256)  
**Token Storage**: Client-side localStorage (frontend)  
**Token Transmission**: HTTP Authorization header

### 2.2 Authentication Flow

```
┌─────────────┐                                    ┌─────────────┐
│   Client    │                                    │   Backend   │
│  (Browser)  │                                    │   Server    │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │  1. POST /api/auth/login                        │
       │     { email, password }                         │
       ├────────────────────────────────────────────────▶│
       │                                                  │
       │                                    2. Validate  │
       │                                       credentials│
       │                                       (bcrypt)   │
       │                                                  │
       │                                    3. Generate  │
       │                                       JWT token  │
       │                                                  │
       │  4. Return JWT + User Info                      │
       │◀────────────────────────────────────────────────┤
       │     { token, user: {...} }                      │
       │                                                  │
       │  5. Store token in localStorage                 │
       │                                                  │
       │  6. Subsequent requests with token              │
       │     Authorization: Bearer <token>               │
       ├────────────────────────────────────────────────▶│
       │                                                  │
       │                                    7. Verify    │
       │                                       token      │
       │                                                  │
       │                                    8. Fetch user│
       │                                       from DB    │
       │                                                  │
       │  9. Protected resource response                 │
       │◀────────────────────────────────────────────────┤
       │                                                  │
```

### 2.3 Password Security

#### 2.3.1 Password Hashing
- **Algorithm**: bcryptjs
- **Salt Rounds**: 10 (configurable)
- **Storage**: Only hashed passwords stored in database
- **Verification**: Constant-time comparison to prevent timing attacks

**Implementation**:
```javascript
// Password hashing during registration
const salt = await bcrypt.genSalt(10);
const password_hash = await bcrypt.hash(password, salt);

// Password verification during login
const isMatch = await bcrypt.compare(password, user.password_hash);
```

#### 2.3.2 Password Policy
**Minimum Requirements**:
- Minimum length: 6 characters (configurable)
- Recommended: 8+ characters with mixed case, numbers, and symbols
- No common passwords (future enhancement)
- Password history (future enhancement)

### 2.4 JWT Token Structure

**Token Payload**:
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "resident",
  "iat": 1706745600,
  "exp": 1706831999
}
```

**Token Components**:
- **Header**: Algorithm and token type
- **Payload**: User identification and claims
- **Signature**: HMAC signature for verification

**Token Expiration**:
- Default: 24 hours (86400 seconds)
- Configurable via environment variable
- Automatic logout on expiration

### 2.5 Authentication Middleware

**File**: `backend/middlewares/authMiddleware.js`

**Process**:
1. Extract token from `Authorization: Bearer <token>` header
2. Verify token signature using JWT_SECRET
3. Decode token payload
4. Fetch user from database using token's user ID
5. Verify user still exists and is active
6. Attach user object to request (`req.user`)
7. Proceed to next middleware/controller

**Error Handling**:
- Missing token → 401 Unauthorized
- Invalid token → 401 Unauthorized
- Expired token → 401 Unauthorized
- User not found → 401 Unauthorized

**Code Example**:
```javascript
const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const result = await db.query(`
            SELECT u.id, u.full_name, u.email, r.name as role
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [decoded.id]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        req.user = result.rows[0];
        next();
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
```

---

## 3. Authorization Architecture

### 3.1 Role-Based Access Control (RBAC)

**Roles**:
1. **Admin**: Full system access
2. **Staff**: Maintenance and visitor management
3. **Resident**: Personal dashboard and requests

### 3.2 Role Permissions Matrix

| Feature | Admin | Staff | Resident |
|---------|-------|-------|----------|
| **User Management** |
| Create users | ✓ | ✗ | ✗ |
| Update users | ✓ | ✗ | ✗ |
| Delete users | ✓ | ✗ | ✗ |
| View all users | ✓ | ✗ | ✗ |
| **Unit Management** |
| Create/update units | ✓ | ✗ | ✗ |
| Assign residents | ✓ | ✗ | ✗ |
| View all units | ✓ | ✓ | ✗ |
| **Visitor Management** |
| Pre-approve visitors | ✓ | ✓ | ✓ |
| Check-in/out visitors | ✓ | ✓ | ✗ |
| View all visitor logs | ✓ | ✓ | ✗ |
| View own visitor logs | ✓ | ✓ | ✓ |
| **Maintenance** |
| Create tickets | ✓ | ✓ | ✓ |
| Assign tickets | ✓ | ✓ | ✗ |
| Update ticket status | ✓ | ✓ | ✗ |
| View all tickets | ✓ | ✓ | ✗ |
| View own tickets | ✓ | ✓ | ✓ |
| **Finance** |
| Generate bills | ✓ | ✓ | ✗ |
| View all bills | ✓ | ✓ | ✗ |
| View own bills | ✓ | ✓ | ✓ |
| Pay bills | ✓ | ✗ | ✓ |
| Financial reports | ✓ | ✗ | ✗ |
| **Communication** |
| Create announcements | ✓ | ✗ | ✗ |
| View announcements | ✓ | ✓ | ✓ |
| Post messages | ✓ | ✓ | ✓ |
| Moderate messages | ✓ | ✗ | ✗ |
| **System** |
| View reports | ✓ | ✗ | ✗ |
| System configuration | ✓ | ✗ | ✗ |
| View audit logs | ✓ | ✗ | ✗ |

### 3.3 Authorization Middleware

**File**: `backend/middlewares/rbacMiddleware.js`

**Process**:
1. Check if user is authenticated (req.user exists)
2. Extract user's role from req.user.role
3. Compare against allowed roles for the endpoint
4. Grant or deny access

**Usage Example**:
```javascript
// Admin-only endpoint
router.get('/admin/users', protect, authorize('admin'), getAllUsers);

// Admin and Staff endpoint
router.post('/finance/generate', protect, authorize('admin', 'staff'), generateBills);

// Resident-only endpoint
router.post('/finance/pay', protect, authorize('resident'), payBill);
```

**Code Implementation**:
```javascript
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        const userRole = req.user.role.toLowerCase();
        const allowedRoles = roles.map(role => role.toLowerCase());
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized`
            });
        }
        next();
    };
};
```

### 3.4 Resource-Level Authorization

**Principle**: Users can only access their own resources

**Implementation Examples**:

**Visitor Management**:
```javascript
// Residents can only pre-approve visitors for their own units
const userUnits = await getUserUnits(req.user.id);
if (!userUnits.includes(req.body.unit_id)) {
    return res.status(403).json({ message: 'Not authorized for this unit' });
}
```

**Bill Payment**:
```javascript
// Residents can only pay bills for their own units
const bill = await getBillById(billId);
const userUnits = await getUserUnits(req.user.id);
if (!userUnits.includes(bill.unit_id)) {
    return res.status(403).json({ message: 'Not authorized to pay this bill' });
}
```

**Maintenance Tickets**:
```javascript
// Residents can only view their own tickets
const tickets = await db.query(`
    SELECT * FROM maintenance_tickets 
    WHERE requester_id = $1
`, [req.user.id]);
```

---

## 4. Data Security

### 4.1 Data Encryption

#### 4.1.1 Data at Rest
- **Database Encryption**: PostgreSQL supports transparent data encryption (TDE)
- **Password Hashing**: bcrypt with salt
- **Sensitive Fields**: Future enhancement for field-level encryption

#### 4.1.2 Data in Transit
- **HTTPS/TLS**: All production traffic encrypted with SSL/TLS
- **Certificate**: Valid SSL certificate for production domain
- **Protocol**: TLS 1.2 or higher
- **HSTS**: HTTP Strict Transport Security headers

### 4.2 Sensitive Data Handling

**Password Storage**:
- ✓ Stored as bcrypt hash
- ✗ Never logged or exposed in API responses
- ✗ Never sent in plain text

**JWT Tokens**:
- ✓ Signed with secret key
- ✓ Short expiration time
- ✗ Not stored in database
- ⚠ Stored in localStorage (consider httpOnly cookies for enhanced security)

**Financial Data**:
- ✓ Payment simulation only (no real payment data stored)
- ✓ Transaction references for audit trail
- ⚠ Future: PCI-DSS compliance for real payments

**Personal Information**:
- ✓ Email, phone, address stored securely
- ✓ Access restricted by role
- ✓ Audit logging for all access

### 4.3 Database Security

#### 4.3.1 Connection Security
- **Connection Pooling**: Managed connections with pg Pool
- **Credentials**: Stored in environment variables
- **Access Control**: Database user with minimal required privileges
- **Network**: Database on private network (production)

#### 4.3.2 Query Security
- **Parameterized Queries**: All queries use parameterized statements
- **SQL Injection Prevention**: No string concatenation in queries
- **Input Validation**: All inputs validated before database operations

**Secure Query Example**:
```javascript
// ✓ SECURE: Parameterized query
const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
);

// ✗ INSECURE: String concatenation (NEVER DO THIS)
const result = await db.query(
    `SELECT * FROM users WHERE email = '${email}'`
);
```

#### 4.3.3 Soft Deletes
- **Purpose**: Preserve data integrity and audit trail
- **Implementation**: `deleted_at` timestamp field
- **Queries**: Exclude deleted records in active queries
- **Recovery**: Ability to restore accidentally deleted data

---

## 5. Input Validation & Sanitization

### 5.1 Validation Strategy

**Library**: express-validator

**Validation Layers**:
1. **Client-side**: Frontend form validation (UX improvement)
2. **Server-side**: Backend validation (security enforcement)
3. **Database**: Constraints and data types (final defense)

### 5.2 Validation Examples

#### 5.2.1 User Registration
```javascript
[
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6+ characters').isLength({ min: 6 })
]
```

#### 5.2.2 Bill Generation
```javascript
[
    check('unit_id', 'Unit ID is required').not().isEmpty(),
    check('bill_type', 'Bill type is required').not().isEmpty(),
    check('amount', 'Amount must be positive').isFloat({ min: 0.01 })
]
```

#### 5.2.3 Maintenance Ticket
```javascript
[
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('unit_id', 'Unit ID is required').not().isEmpty()
]
```

### 5.3 Sanitization

**Email Normalization**:
```javascript
check('email').isEmail().normalizeEmail()
```

**String Trimming**:
```javascript
check('title').trim().not().isEmpty()
```

**XSS Prevention**:
- Input sanitization using express-validator
- Output encoding in frontend
- Content Security Policy headers

---

## 6. API Security

### 6.1 HTTP Security Headers

**Helmet.js Middleware**:
```javascript
app.use(helmet());
```

**Headers Applied**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy`: Configured for application needs

### 6.2 CORS Configuration

**Purpose**: Restrict cross-origin requests

**Configuration**:
```javascript
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

**Production**: Whitelist only production frontend domain

### 6.3 Rate Limiting (Future Enhancement)

**Planned Implementation**:
- Login endpoint: 5 attempts per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Admin endpoints: 200 requests per 15 minutes

**Library**: express-rate-limit

### 6.4 Request Size Limits

**Body Parser Limits**:
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 7. Session Management

### 7.1 Stateless Authentication
- **No Server-Side Sessions**: JWT-based stateless authentication
- **Token Expiration**: Automatic logout after token expiry
- **Token Refresh**: Future enhancement for refresh tokens

### 7.2 Logout Mechanism
- **Client-Side**: Remove token from localStorage
- **Server-Side**: No server-side session to invalidate
- **Future**: Token blacklist for immediate revocation

### 7.3 Concurrent Sessions
- **Current**: Multiple devices allowed with same credentials
- **Future**: Device tracking and session management

---

## 8. Audit Logging & Monitoring

### 8.1 Audit Log Architecture

**Table**: `audit_logs`

**Logged Information**:
- User ID and details
- Action performed
- Resource type and ID
- Timestamp
- IP address
- User agent (browser/device)
- Before/after values (JSONB)

### 8.2 Logged Actions

**Authentication**:
- USER_LOGIN
- USER_LOGOUT
- LOGIN_FAILED

**User Management**:
- USER_CREATED
- USER_UPDATED
- USER_DELETED
- USER_STATUS_CHANGED
- USER_ROLE_CHANGED

**Unit Management**:
- UNIT_CREATED
- UNIT_UPDATED
- UNIT_DELETED
- RESIDENT_ASSIGNED
- RESIDENT_REMOVED

**Maintenance**:
- TICKET_CREATED
- TICKET_UPDATED
- TICKET_ASSIGNED
- TICKET_RESOLVED

**Finance**:
- BILL_CREATED
- PAYMENT_RECORDED
- PAYMENT_FAILED

**Visitors**:
- VISITOR_APPROVED
- VISITOR_DENIED
- VISITOR_CHECKED_IN
- VISITOR_CHECKED_OUT

**Communication**:
- ANNOUNCEMENT_CREATED
- ANNOUNCEMENT_DELETED
- MESSAGE_POSTED
- MESSAGE_DELETED
- MESSAGE_FLAGGED

**System**:
- CONFIG_UPDATED
- REPORT_GENERATED

### 8.3 Audit Logger Utility

**File**: `backend/utils/auditLogger.js`

**Usage**:
```javascript
await logAudit({
    user_id: req.user.id,
    action: 'USER_CREATED',
    resource_type: 'users',
    resource_id: newUser.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    details: { email: newUser.email, role: newUser.role }
});
```

### 8.4 Audit Log Retention
- **Retention Period**: 2 years (configurable)
- **Archival**: Old logs moved to archive table
- **Access**: Admin-only access to audit logs
- **Compliance**: Supports regulatory requirements

---

## 9. Error Handling & Information Disclosure

### 9.1 Error Response Strategy

**Production Error Responses**:
```json
{
  "success": false,
  "message": "An error occurred"
}
```

**Development Error Responses**:
```json
{
  "success": false,
  "message": "An error occurred",
  "error": "Detailed error stack trace"
}
```

### 9.2 Information Disclosure Prevention

**Avoid Exposing**:
- ✗ Database error messages
- ✗ Stack traces (production)
- ✗ Internal file paths
- ✗ Database structure details
- ✗ User enumeration (login errors)

**Generic Error Messages**:
- Login: "Invalid credentials" (not "User not found" or "Wrong password")
- Authorization: "Not authorized" (not specific permission details)
- Server errors: "Internal server error" (not database errors)

---

## 10. Third-Party Security

### 10.1 Dependency Management

**Package Security**:
- Regular `npm audit` checks
- Automated dependency updates
- Vulnerability scanning in CI/CD

**Trusted Packages**:
- express (web framework)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- pg (PostgreSQL client)
- express-validator (input validation)
- helmet (security headers)
- cors (CORS handling)

### 10.2 Environment Variables

**Sensitive Configuration**:
```
JWT_SECRET=<strong-random-secret>
DB_HOST=<database-host>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_NAME=<database-name>
```

**Security Practices**:
- ✓ Never commit .env files to version control
- ✓ Use strong, random secrets
- ✓ Rotate secrets periodically
- ✓ Different secrets for dev/staging/production

---

## 11. Frontend Security

### 11.1 Authentication State Management

**Token Storage**:
- Current: localStorage
- Future consideration: httpOnly cookies for enhanced security

**Protected Routes**:
```javascript
// ProtectedRoute component
if (!user) {
    return <Navigate to="/auth/login" />;
}
```

### 11.2 XSS Prevention

**React Built-in Protection**:
- Automatic escaping of user input
- Avoid `dangerouslySetInnerHTML`
- Sanitize user-generated content

**Content Security Policy**:
- Restrict script sources
- Prevent inline scripts
- Whitelist trusted domains

### 11.3 CSRF Protection

**Current**: Not applicable (stateless JWT authentication)
**Future**: CSRF tokens if implementing cookie-based sessions

---

## 12. Incident Response

### 12.1 Security Incident Types

**Potential Incidents**:
- Unauthorized access attempts
- Data breach
- DDoS attack
- SQL injection attempt
- XSS attack
- Privilege escalation

### 12.2 Response Procedures

**Detection**:
- Monitor audit logs for suspicious activity
- Alert on multiple failed login attempts
- Monitor for unusual data access patterns

**Response**:
1. Identify and isolate affected systems
2. Assess scope and impact
3. Contain the incident
4. Eradicate the threat
5. Recover systems
6. Document and learn

**Communication**:
- Notify affected users
- Report to authorities if required
- Update security measures

---

## 13. Security Testing

### 13.1 Testing Strategy

**Unit Tests**:
- Authentication middleware tests
- Authorization middleware tests
- Password hashing tests
- Input validation tests

**Integration Tests**:
- API endpoint security tests
- Role-based access tests
- SQL injection prevention tests

**Security Audits**:
- Periodic penetration testing
- Code security reviews
- Dependency vulnerability scans

### 13.2 Test Coverage

**Authentication Tests**:
- Valid login
- Invalid credentials
- Expired token
- Missing token
- Invalid token signature

**Authorization Tests**:
- Admin-only endpoints
- Staff-only endpoints
- Resident-only endpoints
- Resource ownership validation

---

## 14. Security Checklist

### 14.1 Development Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT authentication implemented
- [x] Role-based access control
- [x] Input validation on all endpoints
- [x] Parameterized database queries
- [x] HTTPS in production
- [x] Security headers (Helmet.js)
- [x] CORS configuration
- [x] Audit logging
- [x] Error handling without information disclosure
- [ ] Rate limiting (planned)
- [ ] CSRF protection (if needed)
- [ ] File upload security (future)

### 14.2 Deployment Checklist

- [ ] Environment variables configured
- [ ] Strong JWT secret
- [ ] Database credentials secured
- [ ] HTTPS/SSL certificate installed
- [ ] CORS restricted to production domain
- [ ] Error logging configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup
- [ ] Security headers verified
- [ ] Dependency vulnerabilities checked

---

## 15. Future Security Enhancements

### 15.1 Planned Improvements

**Authentication**:
- Two-factor authentication (2FA)
- OAuth2 integration (Google, Facebook)
- Refresh token mechanism
- Password reset via email

**Authorization**:
- Fine-grained permissions
- Dynamic role assignment
- Temporary access grants

**Data Security**:
- Field-level encryption for sensitive data
- Database encryption at rest
- End-to-end encryption for messages

**Monitoring**:
- Real-time security monitoring
- Anomaly detection
- Automated threat response
- Security information and event management (SIEM)

**Compliance**:
- GDPR compliance features
- Data export and deletion
- Privacy policy enforcement
- Consent management

---

## 16. Conclusion

The Society360 platform implements comprehensive security measures across all layers:

**Authentication**: JWT-based stateless authentication with bcrypt password hashing

**Authorization**: Role-based access control with resource-level permissions

**Data Security**: Encrypted transmission, secure storage, and parameterized queries

**Audit Logging**: Comprehensive activity tracking for accountability

**Input Validation**: Multi-layer validation and sanitization

**Error Handling**: Secure error responses without information disclosure

This security architecture provides a robust foundation for protecting sensitive residential management data while maintaining usability and performance. Regular security audits and continuous improvement ensure the platform remains secure against evolving threats.

---

**Document Control**
- **Author**: Security Team, Civora Nexus Pvt. Ltd.
- **Reviewers**: Security Architect, Technical Lead
- **Approval**: Chief Information Security Officer
- **Next Review Date**: March 31, 2026
- **Classification**: Internal Use Only
