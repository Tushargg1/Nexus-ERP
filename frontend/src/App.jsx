import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useAdminStore from './store/adminStore'
import MainLayout from './components/layout/MainLayout'
import { IS_INSTALLED_APP } from './config/appConfig'

// Pages
import LoginPage from './pages/LoginPage'
import InstalledLoginPage from './pages/InstalledLoginPage'
import DashboardPage from './pages/DashboardPage'
import SuppliersPage from './pages/SuppliersPage'
import CustomersPage from './pages/CustomersPage'
import RawMaterialsPage from './pages/RawMaterialsPage'
import FinishedGoodsPage from './pages/FinishedGoodsPage'
import PurchasesPage from './pages/PurchasesPage'
import SalesPage from './pages/SalesPage'
import PaymentsPage from './pages/PaymentsPage'
import EmployeesPage from './pages/EmployeesPage'
import AttendancePage from './pages/AttendancePage'
import SalariesPage from './pages/SalariesPage'
import ExpensesPage from './pages/ExpensesPage'
import ProductionPage from './pages/ProductionPage'
import ReportsPage from './pages/ReportsPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ApprovalsPage from './pages/ApprovalsPage'
import TeamManagementPage from './pages/TeamManagementPage'
import ActivityLogPage from './pages/ActivityLogPage'
import AttendanceScannerPage from './pages/AttendanceScannerPage'

import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import DownloadPage from './pages/DownloadPage'
import TrialLoginPage from './pages/TrialLoginPage'

// Account Pages
import AccountLayout from './pages/account/AccountLayout'
import AccountDashboardPage from './pages/account/AccountDashboardPage'
import AccountPurchasesPage from './pages/account/AccountPurchasesPage'
import AccountSoftwarePage from './pages/account/AccountSoftwarePage'
import AccountSettingsPage from './pages/account/AccountSettingsPage'

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage'
import AdminDownloadsPage from './pages/admin/AdminDownloadsPage'
import AdminSessionsPage from './pages/admin/AdminSessionsPage'

// Protected Route wrapper (ERP software)
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }
  return children
}

// Protected Route wrapper (Admin portal)
const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

export default function App() {
  // ── Installed (downloaded) software mode ──────────────────────────────
  // Pure ERP software with a license-gated login. No website/admin/account.
  if (IS_INSTALLED_APP) {
    return <InstalledApp />
  }

  return (
    <Routes>
      {/* Public routes - accessible without authentication */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/trial" element={<TrialLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms" element={<TermsAndConditionsPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/download" element={<DownloadPage />} />

      {/* Trial software - same ERP dashboard but accessed via /trial/software */}
      <Route
        path="/trial/software/*"
        element={
          <ProtectedRoute redirectTo="/trial">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="inventory/raw-materials" element={<RawMaterialsPage />} />
        <Route path="inventory/finished-goods" element={<FinishedGoodsPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/scanner" element={<AttendanceScannerPage />} />
        <Route path="salaries" element={<SalariesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="team" element={<TeamManagementPage />} />
        <Route path="activity" element={<ActivityLogPage />} />
        <Route path="*" element={<Navigate to="/trial/software" replace />} />
      </Route>

      {/* Admin Portal routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* User Account routes (requires authentication) */}
      <Route
        path="/account/*"
        element={
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AccountDashboardPage />} />
        <Route path="purchases" element={<AccountPurchasesPage />} />
        <Route path="software" element={<AccountSoftwarePage />} />
        <Route path="settings" element={<AccountSettingsPage />} />
        <Route path="*" element={<Navigate to="/account" replace />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="registrations" element={<AdminRegistrationsPage />} />
        <Route path="downloads" element={<AdminDownloadsPage />} />
        <Route path="sessions" element={<AdminSessionsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Protected routes - ERP software (require authentication) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="inventory/raw-materials" element={<RawMaterialsPage />} />
        <Route path="inventory/finished-goods" element={<FinishedGoodsPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/scanner" element={<AttendanceScannerPage />} />
        <Route path="salaries" element={<SalariesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="team" element={<TeamManagementPage />} />
        <Route path="activity" element={<ActivityLogPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

/**
 * The downloaded ERP software app. License-gated login, then the full ERP.
 * No website, no admin portal, no account panel.
 */
function InstalledApp() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <InstalledLoginPage />
  }

  return (
    <Routes>
      <Route path="/*" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="inventory/raw-materials" element={<RawMaterialsPage />} />
        <Route path="inventory/finished-goods" element={<FinishedGoodsPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/scanner" element={<AttendanceScannerPage />} />
        <Route path="salaries" element={<SalariesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="team" element={<TeamManagementPage />} />
        <Route path="activity" element={<ActivityLogPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
