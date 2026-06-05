# Requirements Document

## Introduction

This feature introduces a dedicated Website Admin Portal for the Nexus ERP platform website. Currently, client registration management is buried within the ERP software's dashboard (under the Approvals tab), which conflates website administration with ERP software usage. This feature separates concerns by providing a standalone `/admin/login` page and `/admin/dashboard` for website administrators to manage client registrations, monitor download activity, and view website analytics — entirely independent of the ERP software's `/login` flow used by licensed clients.

## Glossary

- **Admin_Portal**: The dedicated website administration interface accessible at `/admin/*` routes, used exclusively for managing the Nexus ERP website operations (client registrations, downloads, analytics)
- **Website_Admin**: A user with the `WEBSITE_ADMIN` role who manages the Nexus ERP website operations through the Admin_Portal
- **ERP_Login**: The existing `/login` page used by licensed clients to access the downloadable ERP software
- **Client_Registration**: A request submitted by a prospective client at `/register` to gain access to the Nexus ERP software
- **Admin_Auth_Service**: The backend authentication service that validates Website_Admin credentials and issues JWT tokens for Admin_Portal access
- **Admin_Dashboard**: The main view of the Admin_Portal displaying summary statistics, pending registrations, and quick actions
- **Registration_Status**: The current state of a Client_Registration: PENDING, APPROVED, or REJECTED

## Requirements

### Requirement 1: Admin Authentication

**User Story:** As a Website_Admin, I want a dedicated login page at `/admin/login`, so that I can securely access the Admin_Portal without using the ERP software login flow.

#### Acceptance Criteria

1. WHEN a Website_Admin navigates to `/admin/login`, THE Admin_Portal SHALL display a login form with email and password fields
2. WHEN a Website_Admin submits valid credentials, THE Admin_Auth_Service SHALL authenticate the user, issue a JWT token, and redirect to `/admin/dashboard`
3. IF a Website_Admin submits invalid credentials, THEN THE Admin_Auth_Service SHALL return an error message indicating authentication failure without revealing whether the email or password was incorrect
4. WHILE a Website_Admin session token is expired or missing, THE Admin_Portal SHALL redirect all `/admin/*` routes (except `/admin/login`) to `/admin/login`
5. WHEN a Website_Admin clicks the logout action, THE Admin_Portal SHALL clear the session token and redirect to `/admin/login`
6. THE Admin_Auth_Service SHALL store Website_Admin credentials separately from ERP software user credentials
7. WHEN a non-admin user attempts to access `/admin/dashboard`, THE Admin_Portal SHALL redirect to `/admin/login` with an unauthorized message

### Requirement 2: Admin Dashboard Overview

**User Story:** As a Website_Admin, I want a dashboard that shows key website metrics at a glance, so that I can quickly understand the current state of client registrations and platform activity.

#### Acceptance Criteria

1. WHEN a Website_Admin accesses `/admin/dashboard`, THE Admin_Dashboard SHALL display summary cards showing: total registrations count, pending registrations count, approved registrations count, and rejected registrations count
2. WHEN a Website_Admin accesses `/admin/dashboard`, THE Admin_Dashboard SHALL display a list of the 5 most recent pending registrations with client name, business name, email, and submission date
3. WHEN a Website_Admin clicks a pending registration in the dashboard list, THE Admin_Dashboard SHALL allow inline approval or rejection of that registration
4. THE Admin_Dashboard SHALL refresh statistics when a registration status changes without requiring a full page reload

### Requirement 3: Client Registration Management

**User Story:** As a Website_Admin, I want to view, approve, and reject client registration requests from the Admin_Portal, so that I can manage client access without navigating through the ERP software.

#### Acceptance Criteria

1. WHEN a Website_Admin navigates to the registrations section, THE Admin_Portal SHALL display a paginated table of all Client_Registrations with columns: client name, business name, email, phone, status, and submission date
2. WHEN a Website_Admin applies a status filter, THE Admin_Portal SHALL display only registrations matching the selected Registration_Status
3. WHEN a Website_Admin enters a search term, THE Admin_Portal SHALL filter registrations by client name, business name, or email
4. WHEN a Website_Admin approves a registration, THE Admin_Portal SHALL update the Registration_Status to APPROVED and record the approval timestamp
5. WHEN a Website_Admin rejects a registration, THE Admin_Portal SHALL update the Registration_Status to REJECTED and record the rejection timestamp
6. IF the approval or rejection operation fails, THEN THE Admin_Portal SHALL display an error notification and retain the previous Registration_Status

### Requirement 4: Client Details View

**User Story:** As a Website_Admin, I want to view complete details of a client registration, so that I can make informed approval decisions.

#### Acceptance Criteria

1. WHEN a Website_Admin selects a registration entry, THE Admin_Portal SHALL display the full registration details: name, business name, email, phone, submission date, current status, and approval/rejection timestamp if applicable
2. WHEN a Website_Admin views an approved registration, THE Admin_Portal SHALL display the license verification status for that client

### Requirement 5: Download Management

**User Story:** As a Website_Admin, I want to manage software download access, so that I can control which clients can download the ERP software.

#### Acceptance Criteria

1. WHEN a Website_Admin navigates to the downloads section, THE Admin_Portal SHALL display a list of all clients with download access (approved registrations)
2. WHEN a Website_Admin revokes download access for a client, THE Admin_Portal SHALL update the Registration_Status to REJECTED and the client SHALL no longer pass license verification
3. THE Admin_Portal SHALL display the total count of clients with active download access

### Requirement 6: Admin Portal Navigation and Layout

**User Story:** As a Website_Admin, I want a clean, dedicated navigation layout for the Admin_Portal, so that the interface is clearly separate from the ERP software and easy to navigate.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display a sidebar navigation with links to: Dashboard, Registrations, Downloads, and Analytics sections
2. THE Admin_Portal SHALL display the logged-in Website_Admin name and a logout button in the header area
3. THE Admin_Portal SHALL use a visually distinct theme or branding indicator to differentiate it from the ERP software interface
4. WHEN a Website_Admin navigates between Admin_Portal sections, THE Admin_Portal SHALL update the view without a full page reload (single-page application behavior)

### Requirement 7: Admin Portal Route Protection

**User Story:** As a Website_Admin, I want the admin routes to be protected on both frontend and backend, so that unauthorized users cannot access admin functionality.

#### Acceptance Criteria

1. THE Admin_Auth_Service SHALL validate the JWT token and `WEBSITE_ADMIN` role on every API request to admin-only endpoints
2. IF an API request to an admin endpoint lacks a valid token or proper role, THEN THE Admin_Auth_Service SHALL return HTTP 401 or 403 status
3. THE Admin_Portal SHALL store the admin JWT token separately from the ERP software token in browser storage (using a distinct storage key)
4. WHEN both an ERP session and an Admin_Portal session exist simultaneously, THE Admin_Portal SHALL maintain independent session state without conflict
