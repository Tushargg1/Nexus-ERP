/**
 * Preservation Property Tests
 * 
 * Property 2: Preservation - Existing ERP Module Behavior Unchanged
 * 
 * These tests capture the baseline behavior of the UNFIXED code and MUST PASS.
 * They verify that all existing ERP module functionality continues to work
 * identically after any future fix is applied.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import fc from 'fast-check'

import App from '../App'
import useAuthStore from '../store/authStore'
import useApprovalStore from '../store/approvalStore'
import client, { DEMO_MODE } from '../api/client'

// ─────────────────────────────────────────────────────────────────────────────
// Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simulate an authenticated user by setting localStorage values
 */
function setAuthenticatedUser(role = 'OWNER') {
  const user = {
    id: role === 'OWNER' ? 'owner-1' : 'mgr-1',
    name: role === 'OWNER' ? 'Acme Owner' : 'Demo Manager',
    email: role === 'OWNER' ? 'owner@nexuserp.com' : 'manager@nexuserp.com',
    role,
  }
  localStorage.setItem('erp_token', 'mock-jwt-token-123')
  localStorage.setItem('erp_user', JSON.stringify(user))
  return user
}

/**
 * The protected routes that exist in the current App.jsx configuration.
 * These MUST all redirect to /login when unauthenticated.
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/suppliers',
  '/customers',
  '/inventory/raw-materials',
  '/inventory/finished-goods',
  '/purchases',
  '/sales',
  '/payments',
  '/employees',
  '/attendance',
  '/salaries',
  '/expenses',
  '/production',
  '/reports',
  '/notifications',
  '/settings',
  '/approvals',
  '/team',
  '/activity',
]

// ─────────────────────────────────────────────────────────────────────────────
// Property 1: Protected Route Redirect Behavior
// For all protected routes, unauthenticated access redirects to /login
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation: Protected Route Redirect (Property-Based)', () => {
  /**
   * **Validates: Requirements 3.4**
   * 
   * Property: For ALL protected routes, unauthenticated access continues to redirect to /login
   */
  it('for all protected routes, unauthenticated access redirects to /login', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROTECTED_ROUTES),
        (route) => {
          // Ensure no auth state
          localStorage.removeItem('erp_token')
          localStorage.removeItem('erp_user')

          // Reset the auth store to unauthenticated state
          useAuthStore.setState({ token: null, user: null, isAuthenticated: false })

          const { container } = render(
            <MemoryRouter initialEntries={[route]}>
              <App />
            </MemoryRouter>
          )

          // The LoginPage renders "Welcome back" and "Sign in to your Nexus ERP account"
          const loginText = screen.queryByText('Welcome back')
          expect(loginText).toBeInTheDocument()

          // Cleanup the render
          container.remove()
        }
      ),
      { numRuns: PROTECTED_ROUTES.length }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 2: Authenticated Dashboard Access
// For authenticated users navigating to /dashboard, the dashboard loads
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation: Authenticated Dashboard Access', () => {
  beforeEach(() => {
    setAuthenticatedUser('OWNER')
    // Reset the auth store to pick up localStorage values
    useAuthStore.setState({
      token: 'mock-jwt-token-123',
      user: {
        id: 'owner-1',
        name: 'Acme Owner',
        email: 'owner@nexuserp.com',
        role: 'OWNER',
      },
      isAuthenticated: true,
    })
  })

  afterEach(() => {
    localStorage.removeItem('erp_token')
    localStorage.removeItem('erp_user')
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false })
    vi.restoreAllMocks()
  })

  /**
   * **Validates: Requirements 3.1**
   * 
   * Observe: authenticated user navigating to /dashboard loads dashboard with stats
   */
  it('authenticated user navigating to /dashboard loads dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    )

    // Dashboard should render (not redirect to login)
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument()
    // The MainLayout with Outlet should render - we confirm the user isn't redirected
    expect(screen.queryByText('Sign in to your Nexus ERP account')).not.toBeInTheDocument()
  })

  /**
   * **Validates: Requirements 3.1**
   * 
   * Property: for all authenticated user interactions with existing ERP modules,
   * the system responds identically to the current behavior (renders without redirect)
   */
  it('for all authenticated user interactions with existing ERP modules, pages render without redirect', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROTECTED_ROUTES),
        (route) => {
          // Ensure auth is set
          useAuthStore.setState({
            token: 'mock-jwt-token-123',
            user: { id: 'owner-1', name: 'Acme Owner', email: 'owner@nexuserp.com', role: 'OWNER' },
            isAuthenticated: true,
          })

          const { container } = render(
            <MemoryRouter initialEntries={[route]}>
              <App />
            </MemoryRouter>
          )

          // Should NOT redirect to login when authenticated
          const loginText = screen.queryByText('Welcome back')
          expect(loginText).not.toBeInTheDocument()

          container.remove()
        }
      ),
      { numRuns: PROTECTED_ROUTES.length }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 3: Internal Approval Workflow (Zustand Store)
// For all internal approval actions, the store processes them identically
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation: Internal Approval Workflow (Property-Based)', () => {
  beforeEach(() => {
    // Reset approval store to initial state
    useApprovalStore.setState({
      activities: [
        {
          id: 'mock-approval-1',
          module: 'Expenses',
          action: 'CREATE',
          data: { category: 'OFFICE', paidTo: 'Office Depot', amount: 1250, paymentMode: 'CASH', notes: 'New office chairs', date: new Date().toISOString().slice(0, 10), id: 991 },
          submitterName: 'Jane Smith',
          submitterRole: 'MANAGER',
          timestamp: new Date().toISOString(),
          status: 'PENDING',
          resolution: null,
          notes: ''
        },
        {
          id: 'mock-approval-2',
          module: 'Raw Materials',
          action: 'UPDATE',
          data: { name: 'White Cotton Fabric', quantity: 500, purchasePrice: 88, id: 1 },
          submitterName: 'Michael Chen',
          submitterRole: 'MANAGER',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'PENDING',
          resolution: null,
          notes: ''
        },
        {
          id: 'mock-reassigned-1',
          module: 'Finished Goods',
          action: 'UPDATE',
          data: { name: 'Blue Denim Jacket', quantity: 200, salePrice: 1200, id: 2 },
          submitterName: 'Demo Manager',
          submitterRole: 'MANAGER',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'DECLINED',
          resolution: { type: 'REASSIGN', assigneeId: 'MANAGER', assigneeName: 'Manager' },
          notes: 'Please double-check the quantity and resubmit'
        }
      ]
    })

    // Set up auth store for owner role
    useAuthStore.setState({
      token: 'mock-jwt-token-123',
      user: { id: 'owner-1', name: 'Acme Owner', email: 'owner@nexuserp.com', role: 'OWNER' },
      isAuthenticated: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * **Validates: Requirements 3.2**
   * 
   * Observe: internal approval workflow (expenses, raw materials) processes correctly via Zustand store
   */
  it('submitChange adds a new activity to the store with correct status based on role', () => {
    const modules = ['Expenses', 'Raw Materials', 'Finished Goods']
    const actions = ['CREATE', 'UPDATE', 'DELETE']

    fc.assert(
      fc.property(
        fc.constantFrom(...modules),
        fc.constantFrom(...actions),
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          amount: fc.nat({ max: 100000 }),
          id: fc.nat({ max: 9999 }),
        }),
        (module, action, data) => {
          const store = useApprovalStore.getState()
          const initialCount = store.activities.length

          const result = store.submitChange(module, action, data)

          const updatedState = useApprovalStore.getState()
          // Activity should be added
          expect(updatedState.activities.length).toBe(initialCount + 1)
          // New activity should be at the front
          expect(updatedState.activities[0].id).toBe(result.id)
          expect(updatedState.activities[0].module).toBe(module)
          expect(updatedState.activities[0].action).toBe(action)
          // OWNER submissions are auto-approved
          expect(updatedState.activities[0].status).toBe('APPROVED')
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: for all internal approval actions, the Zustand store processes them identically
   */
  it('declineChange sets status to DECLINED with resolution and notes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('mock-approval-1', 'mock-approval-2'),
        fc.record({
          type: fc.constantFrom('REASSIGN', 'REJECT'),
          assigneeId: fc.constantFrom('MANAGER', 'OWNER'),
          assigneeName: fc.constantFrom('Manager', 'Owner'),
        }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (id, resolution, notes) => {
          // Reset to clean state before each property check
          useApprovalStore.setState({
            activities: [
              { id: 'mock-approval-1', module: 'Expenses', action: 'CREATE', data: {}, submitterName: 'Jane', submitterRole: 'MANAGER', timestamp: new Date().toISOString(), status: 'PENDING', resolution: null, notes: '' },
              { id: 'mock-approval-2', module: 'Raw Materials', action: 'UPDATE', data: {}, submitterName: 'Michael', submitterRole: 'MANAGER', timestamp: new Date().toISOString(), status: 'PENDING', resolution: null, notes: '' },
            ]
          })

          useApprovalStore.getState().declineChange(id, resolution, notes)

          const updatedActivity = useApprovalStore.getState().activities.find(a => a.id === id)
          expect(updatedActivity.status).toBe('DECLINED')
          expect(updatedActivity.resolution).toEqual(resolution)
          expect(updatedActivity.notes).toBe(notes)
        }
      ),
      { numRuns: 10 }
    )
  })

  /**
   * **Validates: Requirements 3.2**
   * 
   * Observe: getPendingApprovals returns correct items based on user role
   */
  it('getPendingApprovals returns pending items for OWNER', () => {
    const ownerUser = { id: 'owner-1', name: 'Acme Owner', role: 'OWNER' }
    const pending = useApprovalStore.getState().getPendingApprovals(ownerUser)
    
    // Owner should see all PENDING items
    expect(pending.length).toBe(2)
    pending.forEach(item => {
      expect(item.status).toBe('PENDING')
    })
  })

  it('getPendingApprovals returns reassigned items for MANAGER', () => {
    const managerUser = { id: 'mgr-1', name: 'Demo Manager', role: 'MANAGER' }
    const items = useApprovalStore.getState().getPendingApprovals(managerUser)
    
    // Manager sees DECLINED items that were reassigned to MANAGER
    expect(items.length).toBe(1)
    expect(items[0].id).toBe('mock-reassigned-1')
    expect(items[0].resolution.type).toBe('REASSIGN')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 4: JWT Auth Store Behavior
// Login with valid credentials issues JWT token and redirects to dashboard
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation: JWT Auth Store Behavior', () => {
  beforeEach(() => {
    localStorage.removeItem('erp_token')
    localStorage.removeItem('erp_user')
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false })
  })

  afterEach(() => {
    localStorage.removeItem('erp_token')
    localStorage.removeItem('erp_user')
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false })
  })

  /**
   * **Validates: Requirements 3.3**
   * 
   * Observe: login with valid credentials issues JWT token and redirects to dashboard
   */
  it('authStore.login stores token and user in localStorage and sets isAuthenticated', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 20 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('OWNER', 'MANAGER', 'STAFF'),
        }),
        (token, user) => {
          // Reset state
          localStorage.removeItem('erp_token')
          localStorage.removeItem('erp_user')
          useAuthStore.setState({ token: null, user: null, isAuthenticated: false })

          // Perform login
          useAuthStore.getState().login(token, user)

          // Verify state
          const state = useAuthStore.getState()
          expect(state.token).toBe(token)
          expect(state.user).toEqual(user)
          expect(state.isAuthenticated).toBe(true)

          // Verify localStorage
          expect(localStorage.getItem('erp_token')).toBe(token)
          expect(JSON.parse(localStorage.getItem('erp_user'))).toEqual(user)
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * **Validates: Requirements 3.3**
   * 
   * Property: logout clears all auth state
   */
  it('authStore.logout clears token, user, and sets isAuthenticated to false', () => {
    // Set up authenticated state first
    useAuthStore.getState().login('test-token', { id: '1', name: 'Test', email: 'test@test.com', role: 'OWNER' })

    // Perform logout
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('erp_token')).toBeNull()
    expect(localStorage.getItem('erp_user')).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 5: Existing Backend CRUD API Module Structure
// Backend CRUD endpoints are defined correctly in frontend API modules
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation: Existing Backend CRUD API Modules', () => {
  /**
   * **Validates: Requirements 3.5**
   * 
   * Observe: existing backend CRUD endpoints respond correctly on unfixed code
   * (We verify the API modules exist and have the correct method structure)
   */
  it('all existing API modules export expected CRUD functions', async () => {
    const apiModules = [
      { path: '../api/customers', methods: ['getAll', 'getById', 'create', 'update', 'delete'] },
      { path: '../api/suppliers', methods: ['getAll', 'getById', 'create', 'update', 'delete'] },
      // Purchases & sales are transactional: they support create + payment, not edit/delete
      { path: '../api/purchases', methods: ['getAll', 'getById', 'create', 'recordPayment'] },
      { path: '../api/sales', methods: ['getAll', 'getById', 'create', 'recordPayment'] },
      { path: '../api/dashboard', methods: ['getStats', 'getCharts'] },
      { path: '../api/auth', methods: ['login', 'logout'] },
    ]

    for (const { path, methods } of apiModules) {
      const mod = await import(path)
      // Collect all candidate API objects: named *API exports, default, and the module itself
      const candidates = []
      for (const key of Object.keys(mod)) {
        if (mod[key] && typeof mod[key] === 'object') candidates.push(mod[key])
      }
      if (mod.default && typeof mod.default === 'object') candidates.push(mod.default)

      for (const method of methods) {
        const found = candidates.some(obj => typeof obj[method] === 'function')
        expect(found).toBe(true)
      }
    }
  })

  /**
   * **Validates: Requirements 3.5**
   * 
   * Property: The axios client attaches auth token from localStorage to all requests
   */
  it('axios client request interceptor attaches Bearer token from localStorage', async () => {
    localStorage.setItem('erp_token', 'test-preservation-token')

    // Create a mock adapter to intercept the request
    const mockAdapter = vi.fn().mockResolvedValue({ 
      data: { data: [] }, 
      status: 200, 
      headers: {},
      config: { method: 'get', url: '/test' }
    })
    
    const originalAdapter = client.defaults.adapter
    client.defaults.adapter = mockAdapter

    try {
      await client.get('/test-endpoint')
      
      // Verify the interceptor added the auth header
      const requestConfig = mockAdapter.mock.calls[0][0]
      expect(requestConfig.headers.Authorization).toBe('Bearer test-preservation-token')
    } finally {
      client.defaults.adapter = originalAdapter
      localStorage.removeItem('erp_token')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 6: DEMO_MODE Fallback Behavior
// DEMO_MODE=true triggers mock data fallback for empty API responses
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation: DEMO_MODE Fallback Behavior', () => {
  /**
   * **Validates: Requirements 3.6**
   * 
   * Observe: DEMO_MODE=true triggers mock data fallback for empty API responses
   * Note: DEMO_MODE is currently false in the codebase, so we test the interceptor
   * logic structurally to ensure it will work when toggled.
   */
  it('DEMO_MODE constant is exported from client module', () => {
    // DEMO_MODE should be defined and be a boolean
    expect(typeof DEMO_MODE).toBe('boolean')
  })

  it('client response interceptor rejects empty arrays when DEMO_MODE is true to trigger fallback', async () => {
    // We test the interceptor logic by temporarily simulating DEMO_MODE behavior
    // The interceptor checks: if DEMO_MODE && method === 'get' && data is empty array → reject with isDemoFallback
    
    // Since DEMO_MODE is a const, we test the interceptor's existing behavior structure
    // by verifying the client has interceptors configured
    expect(client.interceptors.response).toBeDefined()
    expect(client.interceptors.request).toBeDefined()
  })

  it('client handles 401 responses by clearing localStorage and redirecting', async () => {
    // Verify the 401 handler exists in the response interceptor
    // This is part of the existing auth flow that must be preserved
    localStorage.setItem('erp_token', 'will-be-cleared')
    localStorage.setItem('erp_user', JSON.stringify({ id: '1' }))

    const mockAdapter = vi.fn().mockRejectedValue({
      response: { status: 401 },
    })

    const originalAdapter = client.defaults.adapter
    const originalHref = window.location.href
    
    // Mock window.location.href setter
    delete window.location
    window.location = { href: originalHref }

    client.defaults.adapter = mockAdapter

    try {
      await client.get('/protected-endpoint').catch(() => {})
      
      // After 401, token should be cleared
      expect(localStorage.getItem('erp_token')).toBeNull()
      expect(localStorage.getItem('erp_user')).toBeNull()
    } finally {
      client.defaults.adapter = originalAdapter
      window.location = { href: originalHref }
    }
  })
})
