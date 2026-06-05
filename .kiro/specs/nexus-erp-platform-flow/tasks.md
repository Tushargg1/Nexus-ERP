# Implementation Plan

## Overview

This plan implements the fix for the broken Nexus ERP platform onboarding flow using the bug condition methodology. The tasks are ordered: (1) exploration test to confirm the bug, (2) preservation test to capture baseline behavior, (3) backend infrastructure, (4) frontend changes, (5) verification, and (6) checkpoint.

## Tasks

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Platform Onboarding Flow Broken
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists across the onboarding pipeline
  - **Scoped PBT Approach**: Scope the property to concrete failing cases for each onboarding interaction type
  - Test that navigating to `/` renders HomePage without requiring authentication (from Bug Condition: input.type == NAVIGATION AND input.path == '/')
  - Test that navigating to `/register` renders RegisterPage as a public route (from Bug Condition: input.path == '/register')
  - Test that navigating to `/terms` and `/privacy` render their respective pages publicly (from Bug Condition: input.path IN ['/terms', '/privacy'])
  - Test that submitting the registration form makes a real POST request to `/api/v1/client-registrations` (from Bug Condition: input.type == FORM_SUBMIT AND input.target == 'registration_form')
  - Test that navigating to `/download` renders a DownloadPage component (from Bug Condition: input.path == '/download')
  - Test that login with an approved non-owner/non-manager email (e.g., "john@acme.com") verifies license via backend API call (from Bug Condition: input.type == LOGIN AND input.requiresLicenseVerification == true)
  - Test that POST `/api/v1/client-registrations` returns a successful response (from Bug Condition: input.type == API_CALL AND input.endpoint matches '/api/v1/client-registrations/**')
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bug exists: routes redirect/404, no API calls made, mock data shown, license verification uses pattern matching)
  - Document counterexamples found: public routes redirect to dashboard, registration uses setTimeout mock, no backend endpoint exists, license check only matches "owner@"/"manager@" prefixes
  - Mark task complete when tests are written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing ERP Module Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: authenticated user navigating to `/dashboard` loads dashboard with stats on unfixed code
  - Observe: internal approval workflow (expenses, raw materials) processes correctly via Zustand store on unfixed code
  - Observe: login with valid credentials issues JWT token and redirects to dashboard on unfixed code
  - Observe: unauthenticated access to `/dashboard`, `/suppliers`, `/customers` redirects to `/login` on unfixed code
  - Observe: existing backend CRUD endpoints (`/api/v1/customers`, `/api/v1/suppliers`, `/api/v1/purchases`, `/api/v1/sales`) respond correctly on unfixed code
  - Observe: DEMO_MODE=true triggers mock data fallback for empty API responses on unfixed code
  - Write property-based test: for all authenticated user interactions with existing ERP modules (dashboard, suppliers, customers, purchases, sales, production, reports, employees, attendance, salaries, expenses, notifications, settings), the system responds identically to the current behavior
  - Write property-based test: for all internal approval actions (submit expense, approve material change, reassign), the Zustand store processes them identically
  - Write property-based test: for all protected routes, unauthenticated access continues to redirect to `/login`
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix for Platform Onboarding Flow - Backend Infrastructure

  - [ ] 3.1 Create ClientRegistration entity
    - Create `backend/src/main/java/com/garment/erp/entity/ClientRegistration.java`
    - Define JPA entity with fields: `id` (Long, auto-generated), `name` (String), `businessName` (String), `email` (String, unique), `phone` (String), `status` (enum: PENDING, APPROVED, REJECTED), `createdAt` (LocalDateTime), `updatedAt` (LocalDateTime), `approvedAt` (LocalDateTime nullable)
    - Add proper JPA annotations (@Entity, @Table, @Id, @GeneratedValue, @Column, @Enumerated)
    - Add @PrePersist and @PreUpdate lifecycle callbacks for timestamps
    - _Bug_Condition: isBugCondition(input) where input.type == API_CALL AND input.endpoint matches '/api/v1/client-registrations/**'_
    - _Expected_Behavior: Registration data persists to database with proper schema_
    - _Preservation: No changes to existing entities (Customer, Employee, RawMaterial, etc.)_
    - _Requirements: 2.4, 2.5, 2.6, 2.8_

  - [ ] 3.2 Create ClientRegistrationRepository
    - Create `backend/src/main/java/com/garment/erp/repository/ClientRegistrationRepository.java`
    - Extend JpaRepository<ClientRegistration, Long>
    - Add query methods: `findByStatus(Status status)`, `findByEmail(String email)`, `existsByEmail(String email)`
    - _Bug_Condition: isBugCondition(input) where backend has no persistence layer for registrations_
    - _Expected_Behavior: Repository provides CRUD operations and custom queries for client registrations_
    - _Preservation: No changes to existing repositories_
    - _Requirements: 2.4, 2.5, 2.7_

  - [ ] 3.3 Create ClientRegistrationService
    - Create `backend/src/main/java/com/garment/erp/service/ClientRegistrationService.java`
    - Implement `submitRegistration(data)` - validates and saves new registration with PENDING status
    - Implement `getPendingRegistrations()` - returns all registrations with PENDING status
    - Implement `approveRegistration(id)` - sets status to APPROVED and records approvedAt timestamp
    - Implement `rejectRegistration(id)` - sets status to REJECTED
    - Implement `verifyLicense(email)` - returns true if a registration with that email has APPROVED status
    - Add proper error handling (duplicate email, not found, etc.)
    - _Bug_Condition: isBugCondition(input) where no business logic exists for registration lifecycle_
    - _Expected_Behavior: Service orchestrates the complete registration state machine (PENDING → APPROVED/REJECTED) and license verification_
    - _Preservation: No changes to existing services_
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 3.4 Create ClientRegistrationController
    - Create `backend/src/main/java/com/garment/erp/controller/ClientRegistrationController.java`
    - Expose `POST /api/v1/client-registrations` - submit registration (public)
    - Expose `GET /api/v1/client-registrations/pending` - list pending registrations (admin, authenticated)
    - Expose `POST /api/v1/client-registrations/{id}/approve` - approve registration (admin, authenticated)
    - Expose `POST /api/v1/client-registrations/{id}/reject` - reject registration (admin, authenticated)
    - Expose `GET /api/v1/client-registrations/verify-license?email=...` - check approval status (public)
    - Return appropriate HTTP status codes and response bodies
    - _Bug_Condition: isBugCondition(input) where input.type == API_CALL AND input.endpoint IN ['/api/v1/client-registrations/**', '/api/v1/license/verify']_
    - _Expected_Behavior: REST endpoints accept requests and return proper responses for the entire onboarding lifecycle_
    - _Preservation: No changes to existing controllers (AuthController, ApprovalController, etc.)_
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 3.5 Update SecurityConfig to permit public registration endpoints
    - Modify `backend/src/main/java/com/garment/erp/config/SecurityConfig.java`
    - Add `/api/v1/client-registrations` (POST) to permitAll() list
    - Add `/api/v1/client-registrations/verify-license` (GET) to permitAll() list
    - Keep `/api/v1/client-registrations/pending`, `/api/v1/client-registrations/{id}/approve`, `/api/v1/client-registrations/{id}/reject` as authenticated endpoints
    - _Bug_Condition: isBugCondition(input) where public endpoints are blocked by security filter_
    - _Expected_Behavior: Unauthenticated clients can submit registrations and verify license status; admin endpoints remain protected_
    - _Preservation: All existing permitAll() and authenticated() configurations remain unchanged; CORS config unchanged; JWT filter unchanged_
    - _Requirements: 2.4, 2.7, 2.8, 3.3, 3.4_

- [ ] 4. Fix for Platform Onboarding Flow - Frontend Infrastructure

  - [ ] 4.1 Create frontend registration API module
    - Create `frontend/src/api/registration.js`
    - Implement `submitRegistration(data)` - POST to `/api/v1/client-registrations`
    - Implement `getRegistrationStatus(email)` - GET registration status for download page
    - Implement `getPendingRegistrations()` - GET all pending registrations (admin use)
    - Implement `approveRegistration(id)` - POST approve a registration (admin use)
    - Implement `rejectRegistration(id)` - POST reject a registration (admin use)
    - Implement `verifyLicense(email)` - GET `/api/v1/client-registrations/verify-license?email=...`
    - Use the existing API client configuration from `frontend/src/api/client.js`
    - _Bug_Condition: isBugCondition(input) where no frontend API module exists for registration_
    - _Expected_Behavior: Frontend has a proper API layer for all registration operations_
    - _Preservation: No changes to existing API modules_
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 4.2 Replace setTimeout mock in RegisterPage with real API calls
    - Modify `frontend/src/pages/RegisterPage.jsx`
    - Import the new registration API module
    - Replace `setTimeout(() => { setSuccess(true) }, 1500)` with `registrationAPI.submitRegistration(formData)`
    - Handle loading state during API call
    - Handle success response (show success message, clear form)
    - Handle error response (show error message, validation errors)
    - _Bug_Condition: isBugCondition(input) where input.type == FORM_SUBMIT AND input.target == 'registration_form'_
    - _Expected_Behavior: Form submission sends data to backend and handles response properly_
    - _Preservation: Form UI layout, validation, and field structure remain unchanged_
    - _Requirements: 2.4, 2.8_

  - [ ] 4.3 Replace mock license verification in LoginPage with real backend calls
    - Modify `frontend/src/pages/LoginPage.jsx`
    - Replace `verifyLicenseWithRemoteServer` function body with actual API call to `/api/v1/client-registrations/verify-license?email=...`
    - Remove hardcoded pattern matching (`userEmail.startsWith('owner@') || userEmail.startsWith('manager@')`)
    - Handle API response (approved = allow login, pending/rejected = show appropriate message)
    - _Bug_Condition: isBugCondition(input) where input.type == LOGIN AND input.requiresLicenseVerification == true_
    - _Expected_Behavior: License verification checks actual backend approval status instead of email prefix patterns_
    - _Preservation: JWT token issuance flow unchanged; login form UI unchanged; authenticated redirect behavior unchanged_
    - _Requirements: 2.7, 2.8_

  - [ ] 4.4 Create DownloadPage component
    - Create `frontend/src/pages/DownloadPage.jsx`
    - Check client's approval status by email (from URL param or form input)
    - If approved: display download link/button for the software
    - If pending: display "Your registration is pending approval" message
    - If rejected or not found: display appropriate error message
    - Style consistently with existing pages
    - _Bug_Condition: isBugCondition(input) where input.type == NAVIGATION AND input.path == '/download'_
    - _Expected_Behavior: Approved clients can access download page and retrieve software_
    - _Preservation: No changes to existing pages_
    - _Requirements: 2.6_

  - [ ] 4.5 Add client registration section to ApprovalsPage
    - Modify `frontend/src/pages/ApprovalsPage.jsx`
    - Add a new section/tab for "Client Registrations" that fetches pending registrations from backend API
    - Display client registration requests with name, business, email, phone, status
    - Add approve/reject action buttons for each pending registration
    - Keep existing internal approval workflow (Zustand-based expenses, raw materials, finished goods) completely unchanged
    - _Bug_Condition: isBugCondition(input) where input.type == PAGE_LOAD AND input.target == 'admin_client_approvals'_
    - _Expected_Behavior: Admin sees real pending client registrations from backend alongside existing internal approvals_
    - _Preservation: Existing Zustand-based approval store and UI for internal approvals (expenses, raw materials, finished goods) remain completely unchanged_
    - _Requirements: 2.5, 2.6, 3.2_

  - [ ] 4.6 Add public routes in App.jsx
    - Modify `frontend/src/App.jsx`
    - Import DownloadPage component
    - Add `<Route path="/" element={<HomePage />} />` as a public route
    - Add `<Route path="/register" element={<RegisterPage />} />` as a public route
    - Add `<Route path="/terms" element={<TermsAndConditionsPage />} />` as a public route
    - Add `<Route path="/privacy" element={<PrivacyPolicyPage />} />` as a public route
    - Add `<Route path="/download" element={<DownloadPage />} />` as a public route
    - Remove or replace the existing `<Route path="/" element={<Navigate to="/dashboard" replace />} />`
    - Ensure public routes are defined BEFORE the protected `/*` catch-all route
    - _Bug_Condition: isBugCondition(input) where input.type == NAVIGATION AND input.path IN ['/', '/register', '/terms', '/privacy', '/download']_
    - _Expected_Behavior: Public pages render their components without requiring authentication_
    - _Preservation: All protected routes (/dashboard, /suppliers, /customers, etc.) continue to require authentication via ProtectedRoute wrapper_
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 3.4_

  - [ ] 4.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Platform Onboarding Flow Functions End-to-End
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior for the onboarding pipeline
    - When this test passes, it confirms: public pages render, registration persists to DB, admin sees real requests, download page exists, license verification uses backend
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 4.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing ERP Module Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all existing ERP module functionality (dashboard, internal approvals, JWT auth, protected routes, DEMO_MODE, backend CRUD) is unchanged after the fix

- [ ] 5. Checkpoint - Ensure all tests pass
  - Run the full test suite (both exploration and preservation tests)
  - Verify all bug condition exploration tests pass (confirming the fix works)
  - Verify all preservation property tests pass (confirming no regressions)
  - Verify backend compiles and starts successfully
  - Verify frontend builds without errors
  - Ensure all tests pass, ask the user if questions arise

## Task Dependency Graph

```json
{"waves":[["1","2"],["3.1"],["3.2"],["3.3"],["3.4"],["3.5"],["4.1","4.3","4.4"],["4.2","4.5"],["4.6"],["4.7"],["4.8"],["5"]]}
```

## Notes

- Tasks 1 and 2 (exploration and preservation tests) must be written and run BEFORE any implementation work begins
- Backend tasks (3.x) must be completed before frontend API integration tasks (4.x) that depend on them
- The frontend route changes (4.6) come last in the frontend sequence because they require the DownloadPage component (4.4) to exist
- Tasks 4.7 and 4.8 re-run existing tests from tasks 1 and 2 respectively - no new test code is written
- The existing Zustand-based internal approval workflow must NOT be modified or removed from ApprovalsPage
- DEMO_MODE behavior in existing modules must remain completely unchanged
