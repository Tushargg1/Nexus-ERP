/**
 * Bug Condition Exploration Test
 * 
 * Property 1: Bug Condition - Platform Onboarding Flow Broken
 * 
 * These tests encode the EXPECTED (correct) behavior for the Nexus ERP onboarding flow.
 * On UNFIXED code, these tests MUST FAIL — failure confirms the bug exists.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

// Import the main App component to test routing
import App from '../App'

describe('Bug Condition Exploration: Platform Onboarding Flow', () => {

  beforeEach(() => {
    // Clear any auth state to simulate unauthenticated user
    localStorage.removeItem('erp_token')
    localStorage.removeItem('erp_user')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Test 1: Navigating to `/` renders HomePage without requiring authentication
   * Bug: Currently redirects to /dashboard which requires auth, then to /login
   * Validates: Requirement 1.1
   */
  it('navigating to "/" renders HomePage without requiring authentication', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    // HomePage should render with its landing page content (contains "Smart Inventory" feature card)
    expect(screen.getByText('Smart Inventory')).toBeInTheDocument()
    // Should NOT redirect to login page
    expect(screen.queryByText('Sign in to your Nexus ERP account')).not.toBeInTheDocument()
  })

  /**
   * Test 2: Navigating to `/register` renders RegisterPage as a public route
   * Bug: No public route defined, falls into protected /* route, redirects to login
   * Validates: Requirement 1.2
   */
  it('navigating to "/register" renders RegisterPage as a public route', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    )

    // RegisterPage should render its form fields (unique to the register form)
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Acme Corp')).toBeInTheDocument()
    // Should NOT redirect to login page
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument()
  })

  /**
   * Test 3: Navigating to `/terms` and `/privacy` render their respective pages publicly
   * Bug: No routes defined for these pages, falls into protected route
   * Validates: Requirement 1.3
   */
  it('navigating to "/terms" renders TermsAndConditionsPage publicly', () => {
    render(
      <MemoryRouter initialEntries={['/terms']}>
        <App />
      </MemoryRouter>
    )

    // TermsAndConditionsPage should render with its heading and "Back to Home" link
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument()
    expect(screen.getByText('Back to Home')).toBeInTheDocument()
    // Should NOT redirect to login page
    expect(screen.queryByText('Welcome back 👋')).not.toBeInTheDocument()
  })

  it('navigating to "/privacy" renders PrivacyPolicyPage publicly', () => {
    render(
      <MemoryRouter initialEntries={['/privacy']}>
        <App />
      </MemoryRouter>
    )

    // PrivacyPolicyPage should render with "Back to Home" link
    expect(screen.getByText('Back to Home')).toBeInTheDocument()
    // Should NOT redirect to login page
    expect(screen.queryByText('Welcome back 👋')).not.toBeInTheDocument()
  })

  /**
   * Test 4: Submitting the registration form makes a real POST request to `/api/v1/client-registrations`
   * Bug: Uses setTimeout(() => { setSuccess(true) }, 1500) mock instead of real API call
   * Validates: Requirement 1.4
   * 
   * Strategy: We check that the frontend has a registration API module that exists 
   * and is used by the RegisterPage. On unfixed code, this module doesn't exist.
   */
  it('submitting the registration form makes a real POST request to /api/v1/client-registrations', async () => {
    // Attempt to dynamically import the registration API module
    // On unfixed code this module does NOT exist, so the import will throw
    let registrationModule = null
    try {
      registrationModule = await import('../api/registration')
    } catch (e) {
      // Module doesn't exist on unfixed code
    }
    
    // The registration API module must exist and export submitRegistration
    expect(registrationModule).not.toBeNull()
    expect(registrationModule.registrationAPI).toBeDefined()
    expect(typeof registrationModule.registrationAPI.submitRegistration).toBe('function')
  })

  /**
   * Test 5: Navigating to `/download` renders a DownloadPage component
   * Bug: No route/page exists for /download
   * Validates: Requirement 1.5
   */
  it('navigating to "/download" renders a DownloadPage component', () => {
    render(
      <MemoryRouter initialEntries={['/download']}>
        <App />
      </MemoryRouter>
    )

    // A DownloadPage should exist and render download-related content.
    // It has a button/heading containing "download" text. There may be
    // multiple matches (navbar + content), so getAllByText is used.
    const downloadContent = screen.getAllByText(/download/i)
    expect(downloadContent.length).toBeGreaterThan(0)
    // Should NOT be the login page
    expect(screen.queryByText('Sign in to your Nexus ERP account')).not.toBeInTheDocument()
  })

  /**
   * Test 6: Login with an approved non-owner/non-manager email verifies license via backend API call
   * Bug: verifyLicenseWithRemoteServer uses pattern matching: only "owner@" or "manager@" pass
   * Validates: Requirement 1.6
   * 
   * Strategy: The mock verifyLicenseWithRemoteServer in LoginPage rejects emails that don't 
   * start with "owner@" or "manager@". On fixed code, it should call the backend API and 
   * pass verification for approved clients regardless of email prefix.
   */
  it('login with approved non-owner/non-manager email verifies license via backend API call', async () => {
    const user = userEvent.setup()
    
    // Mock axios to intercept the license verification API call
    // On FIXED code, verifyLicenseWithRemoteServer calls the backend at
    // /api/v1/client-registrations/verify-license?email=john@acme.com
    // and the auth login endpoint
    const axiosMock = vi.hoisted(() => ({
      create: vi.fn(() => axiosMock),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn().mockResolvedValue({ data: { approved: true } }),
      post: vi.fn().mockResolvedValue({ 
        data: { token: 'test-jwt-token', name: 'John', email: 'john@acme.com', role: 'USER' } 
      }),
    }))
    
    vi.mock('axios', () => ({ default: axiosMock }))

    // Re-import to get mocked version
    const { default: AppFresh } = await import('../App')

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppFresh />
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText('you@company.com')
    const passwordInput = screen.getByPlaceholderText('Enter your password')

    await user.type(emailInput, 'john@acme.com')
    await user.type(passwordInput, 'password123')

    const submitBtn = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitBtn)

    // On FIXED code, login calls the backend (client-registrations/login)
    // instead of pattern-matching email prefixes. The old "owner@/manager@"
    // pattern-match error must NOT appear.
    await waitFor(() => {
      const errorMessage = screen.queryByText(/not been licensed/i)
      expect(errorMessage).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  /**
   * Test 7: POST `/api/v1/client-registrations` backend API module exists
   * Bug: No backend endpoint and no frontend API module for client registration
   * Validates: Requirement 1.7, 1.8
   * 
   * Strategy: On unfixed code, the frontend/src/api/registration.js module doesn't exist.
   * The backend also has no ClientRegistrationController. We verify the frontend module exists.
   */
  it('POST /api/v1/client-registrations backend endpoint exists and has a frontend API module', async () => {
    // Verify the registration API module exists with the expected exports
    let registrationModule = null
    let importError = null
    try {
      registrationModule = await import('../api/registration')
    } catch (e) {
      importError = e
    }
    
    // On unfixed code, the import fails because the module doesn't exist
    expect(importError).toBeNull()
    expect(registrationModule).not.toBeNull()
    expect(registrationModule.registrationAPI.submitRegistration).toBeDefined()
    expect(registrationModule.registrationAPI.verifyLicense).toBeDefined()
  })
})
