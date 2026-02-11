# Expense Management & Maintenance Fixes - Implementation Guide

**Date:** February 9, 2026  
**Project:** Society360 Platform  
**Version:** 2.0 - Expense Management Module

---

## Overview

This document outlines the implementation of two major improvements:

1. **Fixed Unit/Block Display** in Staff Maintenance Section
2. **New Expense Management System** for tracking:
   - Staff salaries
   - Maintenance costs
   - Utility expenses
   - Staff performance metrics

---

## Part 1: Fixed Unit/Block Display Issue

### Problem
Staff viewing maintenance tasks saw "Unit NA" and "Block -" instead of actual unit and block information.

### Solution
Updated maintenance queries to JOIN with `units` and `blocks` tables.

### Files Modified
- `backend/models/maintenanceModel.js` - Added LEFT JOIN queries to include:
  - `unit_number`
  - `floor_number`  
  - `block_name`
  - `requester_name`
  - `assigned_staff_name`

### Result
✅ Staff now sees proper unit and block information  
✅ Better context for maintenance tasks  
✅ Improved staff workflow

---

## Part 2: Expense Management System

### Database Schema

**New Table: `expenses`**
```sql
- id (UUID, Primary Key)
- expense_type (salary, maintenance, utility, other)
- category (VARCHAR) - Sub-categorization
- amount (DECIMAL) - Expense amount
- staff_id (FK to users) - Staff member involved
- maintenance_ticket_id (FK) - Link to maintenance work
- payment_status (pending, paid, cancelled)
- payment_date, payment_method, transaction_reference
- period_month, period_year - For salary tracking
- recorded_by_id (FK to users) - Admin who created
- notes (TEXT) - Additional information
```

**Updated Table: `maintenance_tickets`**
```sql
Added columns:
- estimated_cost (DECIMAL)
- actual_cost (DECIMAL)
- cost_notes (TEXT)
```

### Backend Components Created

1. **Model:** `backend/models/expenseModel.js`
   - `create()` - Record new expense
   - `getAll(filters)` - Get expenses with filtering
   - `getByStaff(staff_id)` - Staff-specific expenses
   - `getStats()` - Expense statistics
   - `getStaffPerformance()` - Performance metrics for increments
   - `updatePaymentStatus()` - Mark expenses as paid
   - `delete()` - Remove expense record

2. **Controller:** `backend/controllers/expenseController.js`
   - `createExpense` - Admin creates expense
   - `getExpenses` - View all expenses
   - `getStaffExpenses` - Staff view their own data
   - `updatePaymentStatus` - Mark salary/expense as paid
   - `getExpenseStats` - Dashboard statistics
   - `getStaffPerformance` - Performance metrics

3. **Routes:** `backend/routes/expenseRoutes.js`
   - `POST /api/expenses` - Create expense (admin only)
   - `GET /api/expenses` - List expenses  
   - `GET /api/expenses/staff/my-expenses` - Staff view own
   - `GET /api/expenses/staff/:staff_id` - Admin view staff expenses
   - `PUT /api/expenses/:id/payment` - Update payment status
   - `GET /api/expenses/reports/stats` - Statistics
   - `GET /api/expenses/performance/:staff_id` - Performance metrics
   - `DELETE /api/expenses/:id` - Delete expense

### Workflow Integration

#### Admin Workflow:
1. **Record Staff Salary:**
   ```javascript
   POST /api/expenses
   {
     "expense_type": "salary",
     "category": "monthly_salary",
     "amount": 25000,
     "staff_id": "staff-uuid",
     "period_month": 2,
     "period_year": 2026,
     "payment_status": "paid",
     "payment_date": "2026-02-09",
     "payment_method": "bank_transfer",
     "notes": "February 2026 salary"
   }
   ```

2. **Record Maintenance Cost:**
   When staff completes maintenance work:
   ```javascript
   POST /api/expenses
   {
     "expense_type": "maintenance",
     "category": "plumbing_repair",
     "amount": 2500,
     "staff_id": "staff-uuid",
     "maintenance_ticket_id": "ticket-uuid",
     "description": "Bathroom pipe leak repair at Unit 301",
     "payment_status": "paid"
   }
   ```

3. **Record Utility Expense:**
   ```javascript
   POST /api/expenses
   {
     "expense_type": "utility",
     "category": "electricity",
     "amount": 15000,
     "description": "Common area electricity bill - February 2026",
     "period_month": 2,
     "period_year": 2026
   }
   ```

#### Staff Workflow:
Staff can view their own:
- Salary payments received
- Maintenance tasks completed
- Total value of maintenance work
- Performance metrics for increment consideration

```javascript
GET /api/expenses/staff/my-expenses
```

Response includes:
```json
{
  "expenses": [...],
  "performance": {
    "tasks_completed": 25,
    "total_maintenance_value": 50000,
    "total_salary_received": 150000,
    "salary_payment_count": 6
  }
}
```

---

## Installation Steps

### Step 1: Apply Database Migration

Run the SQL migration to create the expenses table:

```bash
# Connect to PostgreSQL
psql -U postgres -d society360_db

# Run the migration
\i backend/database/add_expenses.sql
```

Or manually execute:
```bash
psql -U postgres -d society360_db -f backend/database/add_expenses.sql
```

### Step 2: Restart Backend Server

The backend has been updated with:
- ✅ Expense routes added to `app.js`
- ✅ New model, controller, and routes created
- ✅ Fixed maintenance queries

Restart the server:
```bash
cd backend
npm start
```

### Step 3: Test the APIs

**Test 1: Create Staff Salary**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expense_type": "salary",
    "category": "monthly_salary",
    "amount": 25000,
    "staff_id": "STAFF_UUID",
    "period_month": 2,
    "period_year": 2026,
    "payment_status": "paid"
  }'
```

**Test 2: View Expense Statistics**
```bash
curl http://localhost:5000/api/expenses/reports/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Test 3: Staff Views Own Expenses**
```bash
curl http://localhost:5000/api/expenses/staff/my-expenses \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"
```

---

## Features Summary

### For Admin:
✅ Record and track all expenses (salaries, maintenance, utilities)  
✅ View expense statistics by type  
✅ Track which staff worked on which maintenance  
✅ See total maintenance costs for budgeting  
✅ View staff performance metrics for increment decisions  
✅ Mark expenses as paid/pending  
✅ Filter expenses by type, status, period

### For Staff:
✅ View their salary payment history  
✅ See maintenance tasks they completed  
✅ View total value of work performed  
✅ Track performance metrics  
✅ Proper unit/block information in maintenance tasks

### For Residents:
✅ (Indirect) Transparency in where society funds are spent

---

## Performance Metrics for Staff Increments

The system tracks:
1. **Tasks Completed** - Number of maintenance tickets handled
2. **Total Maintenance Value** - Sum of all maintenance work costs
3. **Salary History** - All salary payments received
4. **Work Quality** - Can be assessed through maintenance ticket feedback

Admin can use this data to:
- Decide salary increments
- Identify high-performing staff
- Allocate bonuses
- Track improvement over time

---

## API Endpoints Reference

### Admin Endpoints:
```
POST   /api/expenses                      - Create expense
GET    /api/expenses                      - List all expenses
GET    /api/expenses/:id                  - Get expense details
GET    /api/expenses/staff/:staff_id      - Staff expenses
PUT    /api/expenses/:id/payment          - Update payment
GET    /api/expenses/reports/stats        - Statistics
GET    /api/expenses/performance/:staff_id - Performance
DELETE /api/expenses/:id                  - Delete expense
```

### Staff Endpoints:
```
GET    /api/expenses/staff/my-expenses    - Own expenses & performance
```

### Query Parameters:
```
?expense_type=salary|maintenance|utility|other
?payment_status=pending|paid|cancelled
?period_month=1-12
?period_year=2026
?staff_id=uuid
```

---

## Next Steps

### Frontend Implementation Needed:

1. **Admin Dashboard - Expenses Page:**
   - Create expense form (salary, maintenance, utility)
   - Expense list with filters
   - Payment status management
   - Statistics dashboard

2. **Admin - Staff Performance View:**
   - Performance metrics display
   - Task completion history
   - Maintenance value tracking

3. **Staff Dashboard - My Earnings:**
   - Salary payment history
   - Completed tasks list
   - Performance summary

4. **Integration:**
   - Auto-create expense when maintenance is marked "resolved"
   - Link maintenance completion to staff performance
   - Monthly salary generation workflow

---

## Files Created/Modified

### Created:
- `backend/database/add_expenses.sql`
- `backend/models/expenseModel.js`
- `backend/controllers/expenseController.js`
- `backend/routes/expenseRoutes.js`

### Modified:
- `backend/app.js` - Added expense routes
- `backend/models/maintenanceModel.js` - Fixed JOIN queries

---

## Security Notes

- ✅ Only admins can create/modify expenses
- ✅ Staff can only view their own expenses
- ✅ All actions are audit logged
- ✅ Input validation on all expense creation
- ✅ RBAC enforced on all endpoints

---

## Database Backup Reminder

Before applying migration:
```bash
pg_dump -U postgres society360_db > backup_before_expenses_$(date +%Y%m%d).sql
```

---

## Support & Troubleshooting

### Common Issues:

**Issue: Migration fails**
- Check if `update_updated_at_column()` function exists
- Verify UUID extension is enabled
- Check user permissions

**Issue: Expenses not showing**
- Verify migration ran successfully
- Check backend logs for errors
- Verify JWT token has correct role

**Issue: Staff can't see their expenses**
- Ensure staff_id matches logged-in user
- Check RBAC middleware authorization

---

**Status:** ✅ Backend Complete - Ready for Database Migration  
**Next:** Apply SQL migration → Restart backend → Build frontend UI

