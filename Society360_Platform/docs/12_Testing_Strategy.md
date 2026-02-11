# Testing Strategy

## Introduction

This document outlines the testing strategy for the Society360 – Smart Residential Management System. The goal of testing is to ensure that the system functions correctly, securely, and reliably while meeting all functional and non-functional requirements.

---

## Testing Objectives

- Verify correct functionality of all system modules
- Ensure role-based access control is enforced
- Validate data accuracy and integrity
- Identify and fix defects early
- Ensure system stability and usability

---

## Types of Testing

### 1. Unit Testing

**Objective:**  
To test individual components and functions in isolation.

**Scope:**
- Authentication logic
- API controllers
- Database queries
- Utility functions

**Responsibility:**
- Developer

---

### 2. Integration Testing

**Objective:**  
To verify interaction between system modules.

**Scope:**
- Frontend and backend API communication
- Backend and database interaction
- Authentication with protected routes

**Responsibility:**
- Developer

---

### 3. Functional Testing

**Objective:**  
To validate system behavior against functional requirements.

**Scope:**
- User login and role-based dashboards
- Visitor pre-approval and logging
- Maintenance request lifecycle
- Billing and payment simulation
- Announcements and notifications

**Responsibility:**
- Developer / Tester

---

### 4. Security Testing

**Objective:**  
To ensure the system is protected from unauthorized access.

**Scope:**
- Authentication and authorization checks
- API access restrictions
- Input validation
- Session handling

---

### 5. Usability Testing

**Objective:**  
To ensure the system is user-friendly and intuitive.

**Scope:**
- Navigation clarity
- Form usability
- Error message clarity
- Mobile responsiveness

---

### 6. Performance Testing (Basic)

**Objective:**  
To ensure acceptable system response times.

**Scope:**
- Page load times
- API response times under normal usage

---

## Test Environment

- Frontend: Local development server (Next.js)
- Backend: Node.js with Express
- Database: PostgreSQL (local or cloud-hosted)
- Testing Tools: Postman / Thunder Client

---

## Test Data Management

- Use dummy and simulated data
- No real personal or financial data
- Reset test data between test cycles if required

---

## Defect Management

- Bugs identified during testing are logged
- Issues are tracked using GitHub Issues
- Fixes are verified through re-testing

---

## Acceptance Criteria

- All core features work as intended
- No unauthorized access is possible
- System meets functional and non-functional requirements
- Application is stable and usable

---

## Conclusion

The testing strategy ensures that Society360 is reliable, secure, and ready for deployment, meeting the quality expectations of the CivoraX Internship Program.
