# Society360 Database Design

## Overview
The Society360 database follows a relational model using PostgreSQL. It is designed to support multi-role access (Admin, Staff, Resident) and complex relationships between users and their living units.

## Security Features
1.  **UUID Primary Keys**: We use `uuid_generate_v4()` for all tables (except static enums/roles) to prevent ID enumeration attacks and allow for safer distributed ID generation.
2.  **Foreign Keys**: Strict referential integrity is enforced. `ON DELETE CASCADE` is utilized for parent-child relationships (e.g., Block -> Unit).
3.  **Indexes**: B-Tree indexes are applied on frequently filtered columns (`email`, `status`, `role_id`, `unit_id`).
4.  **Audit Logging**: The `audit_logs` table creates an immutable record of critical actions.
5.  **Soft Deletes**: Key tables (`users`) have a `deleted_at` column to preserve data history while removing it from active views.

## ER Diagram Explanation

### Core Entities
-   **Roles**: Static list of system roles (Admin, Staff, Resident).
-   **Users**: The central entity for authentication and profile management.
-   **Blocks**: Represents physical buildings or towers.
-   **Units**: Represents individual apartments/flats within blocks.

### Key Relationships
-   **Users <-> Roles**: Many-to-One. A user has one role.
-   **Blocks <-> Units**: One-to-Many. A block contains many units.
-   **Users <-> Units (via `user_units`)**: Many-to-Many.
    -   A user can own/rent multiple units.
    -   A unit can have multiple residents (family members).
    -   Attributes like `resident_type` (Owner/Tenant) and `is_primary_contact` are stored in the link table.

### Operational Modules
-   **Visitor Logs**: Linked to `Units` (destination) and `Users` (approving resident, security guard).
-   **Maintenance Tickets**: Linked to `Units` (location), `Users` (requester), and `Users` (assigned staff).
-   **Bills**: Linked to `Units` (liability). Payments are children of Bills.
-   **Announcements**: Linked to `Users` (author). Contains a `target_audience` filter.

## Schema Highlights
```sql
-- Example of linking residents
CREATE TABLE user_units (
    ...
    resident_type VARCHAR(20) CHECK (resident_type IN ('owner', 'tenant', 'family_member')),
    ...
);
```
This design allows a single user to be an "Owner" of one flat and a "Tenant" in another if needed.

## Future Scalability
-   **Sharding**: UUIDs make horizontal sharding easier if the user base grows massively.
-   **JSONB**: The `details` column in `audit_logs` allows flexible storage of metadata without schema migrations.
