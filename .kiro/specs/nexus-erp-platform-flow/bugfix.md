# Bugfix Requirements Document

## Introduction

The Nexus ERP platform is intended to function as a complete SaaS product with a public-facing site, client registration flow, admin approval workflow, software download mechanism, and license-verified login. However, the end-to-end platform flow is fundamentally broken across multiple layers: public pages have no routes defined, registration sends no data to the backend, the admin approval system uses hardcoded mock data instead of real registration requests, there is no download page for approved clients, and the login license verification is simulated with pattern-matching instead of actual server communication. These bugs collectively mean that the core business workflow (register → pay → admin approves → download → login with license) cannot function at all.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user navigates to "/" THEN the system redirects to "/dashboard" which requires authentication, making the public HomePage inaccessible without login

1.2 WHEN a user navigates to "/register" THEN the system shows a 404 or redirects to the dashboard because no route is defined for RegisterPage despite it being imported in App.jsx

1.3 WHEN a user navigates to "/terms" or "/privacy" THEN the system shows a 404 or redirects because no routes are defined for TermsAndConditionsPage or PrivacyPolicyPage despite being imported

1.4 WHEN a client fills out the registration form and clicks submit THEN the system performs a setTimeout mock and shows a success message without sending any data to the backend API

1.5 WHEN the admin visits the Approvals page THEN the system displays hardcoded mock data from the Zustand store instead of real client registration requests from the backend

1.6 WHEN the admin approves a client registration THEN the system only updates the local Zustand state and no download page or download link becomes available to the client

1.7 WHEN an approved client attempts to login THEN the system uses a mock verifyLicenseWithRemoteServer function that only approves emails starting with "owner@" or "manager@" by pattern matching, without making any actual server call

1.8 WHEN DEMO_MODE is set to false in client.js THEN the system expects real backend integration but the registration and approval flows have no corresponding backend API endpoints for client registration

### Expected Behavior (Correct)

2.1 WHEN a user navigates to "/" THEN the system SHALL display the public HomePage (landing page) without requiring authentication

2.2 WHEN a user navigates to "/register" THEN the system SHALL display the RegisterPage as a public route without requiring authentication

2.3 WHEN a user navigates to "/terms" or "/privacy" THEN the system SHALL display the TermsAndConditionsPage or PrivacyPolicyPage respectively as public routes

2.4 WHEN a client fills out the registration form and clicks submit THEN the system SHALL send the registration data (name, businessName, email, phone) to a backend API endpoint and persist it in the database

2.5 WHEN the admin visits the Approvals page THEN the system SHALL fetch real pending client registration requests from the backend API and display them for review

2.6 WHEN the admin approves a client registration THEN the system SHALL update the client status in the backend database and the client SHALL be directed to a download page where they can download the software

2.7 WHEN an approved client attempts to login THEN the system SHALL verify the client's license status against the actual backend server (checking if the admin approved their registration) before allowing authentication

2.8 WHEN DEMO_MODE is false THEN the system SHALL have fully functional backend integration for the complete registration → approval → download → login flow with no mock or simulated behavior

### Unchanged Behavior (Regression Prevention)

3.1 WHEN an authenticated user navigates to "/dashboard" THEN the system SHALL CONTINUE TO display the dashboard with all existing ERP features (inventory, employees, sales, purchases, etc.)

3.2 WHEN an authenticated admin uses the existing internal approval workflow (expenses, raw materials, etc.) THEN the system SHALL CONTINUE TO process those approvals correctly through the Zustand store and backend API

3.3 WHEN a user logs in with valid credentials and the backend authenticates them THEN the system SHALL CONTINUE TO issue a JWT token and establish the authenticated session

3.4 WHEN an unauthenticated user tries to access protected routes THEN the system SHALL CONTINUE TO redirect them to the login page

3.5 WHEN the existing ERP modules (suppliers, customers, purchases, sales, production, reports) are accessed THEN the system SHALL CONTINUE TO function with their current backend API integration

3.6 WHEN the DEMO_MODE flag is set to true THEN the system SHALL CONTINUE TO fall back to mock data for empty API responses as currently implemented
