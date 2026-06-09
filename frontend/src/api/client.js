import axios from 'axios'
import { API_BASE_URL } from '../config/appConfig'

// Set to true for the SaaS Landing Page Demo (Currently False for Local Installation)
export const DEMO_MODE = false;

// API base. When hosted separately (Vercel), API_BASE_URL points at the backend
// origin; otherwise it's empty and we use the relative '/api/v1' (bundled/local).
const API_BASE = API_BASE_URL ? `${API_BASE_URL}/api/v1` : '/api/v1'

// Check if the current session is a trial/demo session
export const isTrialMode = () => {
  return localStorage.getItem('erp_token') === 'trial-token-demo'
}

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach auth token OR intercept for trial mode
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token')

    // Trial mode: use a custom adapter that returns mock data without hitting the network
    if (token === 'trial-token-demo') {
      config.adapter = () => {
        return Promise.resolve({
          data: getTrialMockData(config.url, config.method),
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
      }
      return config
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 and DEMO MODE
client.interceptors.response.use(
  (response) => {
    // If Demo Mode is ON and the backend returns an empty array, 
    // we intentionally reject so the frontend loads the rich MOCK DATA instead.
    if (DEMO_MODE && response.config.method === 'get' && !response.config.url.includes('/auth/')) {
      const data = response.data?.data || response.data?.content || response.data;
      if (Array.isArray(data) && data.length === 0) {
        return Promise.reject({ isDemoFallback: true });
      }
    }
    return response;
  },
  (error) => {
    if (DEMO_MODE && (error.response?.status === 500 || error.response?.status === 404 || error.response?.status === 400)) {
      return Promise.resolve({ data: { success: true, data: { id: Date.now() } } });
    }
    if (error.isDemoFallback) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      const token = localStorage.getItem('erp_token')
      if (token === 'trial-token-demo') {
        return Promise.reject(error)
      }
      // Don't force a redirect when the failing request is itself a login /
      // auth attempt — otherwise the page reloads and the user never sees the
      // "invalid credentials" / error message. Let the caller handle it.
      const reqUrl = error.config?.url || ''
      const isAuthRequest =
        reqUrl.includes('/auth/') ||
        reqUrl.includes('/login') ||
        reqUrl.includes('/client-registrations')
      if (!isAuthRequest) {
        localStorage.removeItem('erp_token')
        localStorage.removeItem('erp_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Trial Mock Data ────────────────────────────────────────────────────────────
function getTrialMockData(url, method) {
  // For non-GET requests (POST, PUT, DELETE), return success
  if (method !== 'get') {
    return { success: true, data: { id: Date.now(), message: 'Operation successful (Trial Mode)' } }
  }

  // Dashboard stats
  if (url.includes('/dashboard') || url.includes('/stats')) {
    return {
      totalCustomers: 24,
      totalSuppliers: 12,
      totalEmployees: 38,
      totalSales: 156,
      totalPurchases: 89,
      totalExpenses: 45,
      totalRevenue: 2450000,
      totalProfit: 890000,
      recentActivities: [
        { id: 1, type: 'sale', description: 'New sale to Rajesh Textiles', amount: 45000, date: '2026-06-01' },
        { id: 2, type: 'purchase', description: 'Raw material from Fabric World', amount: 32000, date: '2026-05-30' },
        { id: 3, type: 'expense', description: 'Electricity bill payment', amount: 8500, date: '2026-05-29' },
      ]
    }
  }

  // Customers
  if (url.includes('/customers')) {
    return [
      { id: 1, name: 'Rajesh Kumar', businessName: 'Rajesh Textiles', email: 'rajesh@textiles.com', phone: '+91 98765 43210', gstNumber: '27AABCT1234F1ZG', address: 'Mumbai, Maharashtra', balance: 125000 },
      { id: 2, name: 'Priya Sharma', businessName: 'Sharma Garments', email: 'priya@sharma.com', phone: '+91 87654 32109', gstNumber: '07AABCS5678G2ZH', address: 'Delhi, India', balance: 89000 },
      { id: 3, name: 'Amit Patel', businessName: 'Patel Fashion House', email: 'amit@patelfashion.com', phone: '+91 76543 21098', gstNumber: '24AABCP9012H3ZI', address: 'Ahmedabad, Gujarat', balance: 210000 },
      { id: 4, name: 'Sneha Reddy', businessName: 'Reddy Exports', email: 'sneha@reddyexports.com', phone: '+91 65432 10987', gstNumber: '36AABCR3456I4ZJ', address: 'Hyderabad, Telangana', balance: 67000 },
      { id: 5, name: 'Vikram Joshi', businessName: 'Joshi Collections', email: 'vikram@joshi.com', phone: '+91 54321 09876', gstNumber: '29AABCJ7890K5ZK', address: 'Bangalore, Karnataka', balance: 156000 },
    ]
  }

  // Suppliers
  if (url.includes('/suppliers')) {
    return [
      { id: 1, name: 'Fabric World Pvt Ltd', contactPerson: 'Suresh Mehta', email: 'suresh@fabricworld.com', phone: '+91 99887 76655', gstNumber: '27AABCF1111A1ZA', address: 'Surat, Gujarat', rating: 4.5 },
      { id: 2, name: 'Thread Masters', contactPerson: 'Kiran Das', email: 'kiran@threadmasters.com', phone: '+91 88776 65544', gstNumber: '19AABCT2222B2ZB', address: 'Kolkata, West Bengal', rating: 4.2 },
      { id: 3, name: 'Dye & Color Industries', contactPerson: 'Meena Joshi', email: 'meena@dyecolor.com', phone: '+91 77665 54433', gstNumber: '27AABCD3333C3ZC', address: 'Pune, Maharashtra', rating: 4.8 },
      { id: 4, name: 'Button & Zip Co.', contactPerson: 'Rahul Gupta', email: 'rahul@buttonzip.com', phone: '+91 66554 43322', gstNumber: '09AABCB4444D4ZD', address: 'Noida, UP', rating: 4.0 },
    ]
  }

  // Raw Materials
  if (url.includes('/raw-materials')) {
    return [
      { id: 1, name: 'Cotton Fabric (White)', category: 'Fabric', quantity: 500, unit: 'meters', unitPrice: 120, supplier: 'Fabric World Pvt Ltd', minStock: 100, status: 'In Stock' },
      { id: 2, name: 'Polyester Thread', category: 'Thread', quantity: 200, unit: 'spools', unitPrice: 45, supplier: 'Thread Masters', minStock: 50, status: 'In Stock' },
      { id: 3, name: 'Blue Dye (Indigo)', category: 'Dye', quantity: 30, unit: 'kg', unitPrice: 850, supplier: 'Dye & Color Industries', minStock: 10, status: 'Low Stock' },
      { id: 4, name: 'Silk Fabric (Red)', category: 'Fabric', quantity: 8, unit: 'meters', unitPrice: 450, supplier: 'Fabric World Pvt Ltd', minStock: 20, status: 'Critical' },
      { id: 5, name: 'Metal Buttons (Gold)', category: 'Accessories', quantity: 1000, unit: 'pieces', unitPrice: 5, supplier: 'Button & Zip Co.', minStock: 200, status: 'In Stock' },
    ]
  }

  // Employees
  if (url.includes('/employees')) {
    return [
      { id: 1, name: 'Ravi Singh', email: 'ravi@garment.com', phone: '+91 98765 11111', role: 'Cutting Master', department: 'Production', salary: 25000, joinDate: '2024-03-15', status: 'Active' },
      { id: 2, name: 'Anita Kumari', email: 'anita@garment.com', phone: '+91 98765 22222', role: 'Tailor', department: 'Stitching', salary: 18000, joinDate: '2024-06-01', status: 'Active' },
      { id: 3, name: 'Deepak Verma', email: 'deepak@garment.com', phone: '+91 98765 33333', role: 'Quality Check', department: 'QC', salary: 22000, joinDate: '2025-01-10', status: 'Active' },
      { id: 4, name: 'Sunita Devi', email: 'sunita@garment.com', phone: '+91 98765 44444', role: 'Packing', department: 'Dispatch', salary: 15000, joinDate: '2025-04-20', status: 'Active' },
      { id: 5, name: 'Mohan Lal', email: 'mohan@garment.com', phone: '+91 98765 55555', role: 'Machine Operator', department: 'Production', salary: 20000, joinDate: '2024-09-01', status: 'Active' },
    ]
  }

  // Sales
  if (url.includes('/sales')) {
    return [
      { id: 1, invoiceNo: 'INV-2026-001', customer: 'Rajesh Textiles', date: '2026-06-01', items: 5, total: 45000, status: 'Paid', paymentMode: 'Bank Transfer' },
      { id: 2, invoiceNo: 'INV-2026-002', customer: 'Sharma Garments', date: '2026-05-28', items: 3, total: 32000, status: 'Paid', paymentMode: 'UPI' },
      { id: 3, invoiceNo: 'INV-2026-003', customer: 'Patel Fashion House', date: '2026-05-25', items: 8, total: 78000, status: 'Pending', paymentMode: 'Credit' },
      { id: 4, invoiceNo: 'INV-2026-004', customer: 'Reddy Exports', date: '2026-05-20', items: 2, total: 18500, status: 'Paid', paymentMode: 'Cash' },
    ]
  }

  // Purchases
  if (url.includes('/purchases')) {
    return [
      { id: 1, poNumber: 'PO-2026-001', supplier: 'Fabric World Pvt Ltd', date: '2026-05-20', items: 3, total: 56000, status: 'Received', paymentStatus: 'Paid' },
      { id: 2, poNumber: 'PO-2026-002', supplier: 'Thread Masters', date: '2026-05-18', items: 2, total: 12000, status: 'Received', paymentStatus: 'Paid' },
      { id: 3, poNumber: 'PO-2026-003', supplier: 'Dye & Color Industries', date: '2026-06-02', items: 1, total: 25500, status: 'In Transit', paymentStatus: 'Pending' },
    ]
  }

  // Expenses
  if (url.includes('/expenses')) {
    return [
      { id: 1, title: 'Electricity Bill', category: 'Utilities', amount: 8500, date: '2026-05-29', status: 'Approved', approvedBy: 'Owner' },
      { id: 2, title: 'Machine Maintenance', category: 'Maintenance', amount: 12000, date: '2026-05-25', status: 'Approved', approvedBy: 'Owner' },
      { id: 3, title: 'Office Supplies', category: 'Office', amount: 3500, date: '2026-05-22', status: 'Pending', approvedBy: null },
      { id: 4, title: 'Transport & Delivery', category: 'Logistics', amount: 6200, date: '2026-05-18', status: 'Approved', approvedBy: 'Owner' },
    ]
  }

  // Payments
  if (url.includes('/payments')) {
    return [
      { id: 1, reference: 'PAY-001', type: 'Received', from: 'Rajesh Textiles', amount: 45000, date: '2026-06-01', mode: 'Bank Transfer', status: 'Completed' },
      { id: 2, reference: 'PAY-002', type: 'Sent', to: 'Fabric World Pvt Ltd', amount: 56000, date: '2026-05-20', mode: 'NEFT', status: 'Completed' },
      { id: 3, reference: 'PAY-003', type: 'Received', from: 'Sharma Garments', amount: 32000, date: '2026-05-28', mode: 'UPI', status: 'Completed' },
    ]
  }

  // Attendance
  if (url.includes('/attendance')) {
    return [
      { id: 1, employeeName: 'Ravi Singh', date: '2026-06-02', checkIn: '09:00', checkOut: '18:00', status: 'Present', hoursWorked: 9 },
      { id: 2, employeeName: 'Anita Kumari', date: '2026-06-02', checkIn: '09:15', checkOut: '18:30', status: 'Present', hoursWorked: 9.25 },
      { id: 3, employeeName: 'Deepak Verma', date: '2026-06-02', checkIn: null, checkOut: null, status: 'Absent', hoursWorked: 0 },
      { id: 4, employeeName: 'Sunita Devi', date: '2026-06-02', checkIn: '08:45', checkOut: '17:45', status: 'Present', hoursWorked: 9 },
      { id: 5, employeeName: 'Mohan Lal', date: '2026-06-02', checkIn: '09:30', checkOut: '18:00', status: 'Present', hoursWorked: 8.5 },
    ]
  }

  // Salaries
  if (url.includes('/salaries')) {
    return [
      { id: 1, employeeName: 'Ravi Singh', month: 'May 2026', basic: 25000, deductions: 2000, bonus: 3000, netPay: 26000, status: 'Paid' },
      { id: 2, employeeName: 'Anita Kumari', month: 'May 2026', basic: 18000, deductions: 1500, bonus: 1000, netPay: 17500, status: 'Paid' },
      { id: 3, employeeName: 'Deepak Verma', month: 'May 2026', basic: 22000, deductions: 1800, bonus: 2000, netPay: 22200, status: 'Pending' },
      { id: 4, employeeName: 'Sunita Devi', month: 'May 2026', basic: 15000, deductions: 1200, bonus: 500, netPay: 14300, status: 'Paid' },
      { id: 5, employeeName: 'Mohan Lal', month: 'May 2026', basic: 20000, deductions: 1600, bonus: 1500, netPay: 19900, status: 'Paid' },
    ]
  }

  // Production
  if (url.includes('/production')) {
    return [
      { id: 1, orderName: 'Blue Denim Jeans - Batch A', customer: 'Rajesh Textiles', quantity: 500, completed: 320, startDate: '2026-05-20', deadline: '2026-06-10', status: 'In Progress' },
      { id: 2, orderName: 'White Cotton Shirts', customer: 'Sharma Garments', quantity: 200, completed: 200, startDate: '2026-05-15', deadline: '2026-05-30', status: 'Completed' },
      { id: 3, orderName: 'Red Silk Sarees - Premium', customer: 'Patel Fashion House', quantity: 50, completed: 12, startDate: '2026-06-01', deadline: '2026-06-25', status: 'In Progress' },
    ]
  }

  // Notifications
  if (url.includes('/notifications')) {
    return [
      { id: 1, title: 'Low Stock Alert', message: 'Silk Fabric (Red) is below minimum stock level', type: 'warning', read: false, date: '2026-06-02' },
      { id: 2, title: 'Payment Received', message: 'Rajesh Textiles paid ₹45,000', type: 'success', read: false, date: '2026-06-01' },
      { id: 3, title: 'New Order', message: 'Patel Fashion House placed order for 300 units', type: 'info', read: true, date: '2026-05-30' },
      { id: 4, title: 'Production Complete', message: 'White Cotton Shirts batch completed', type: 'success', read: true, date: '2026-05-30' },
    ]
  }

  // Finished goods
  if (url.includes('/finished-goods') || url.includes('/finished-products')) {
    return [
      { id: 1, name: 'Blue Denim Jeans (M)', category: 'Jeans', quantity: 320, unitPrice: 650, totalValue: 208000, status: 'In Stock' },
      { id: 2, name: 'White Cotton Shirt (L)', category: 'Shirts', quantity: 200, unitPrice: 450, totalValue: 90000, status: 'In Stock' },
      { id: 3, name: 'Red Silk Saree', category: 'Sarees', quantity: 15, unitPrice: 2500, totalValue: 37500, status: 'Low Stock' },
      { id: 4, name: 'Black Formal Trousers', category: 'Trousers', quantity: 150, unitPrice: 550, totalValue: 82500, status: 'In Stock' },
    ]
  }

  // Approvals
  if (url.includes('/approvals') || url.includes('/client-registrations')) {
    return []
  }

  // Reports
  if (url.includes('/reports')) {
    return { revenue: 2450000, expenses: 1560000, profit: 890000, salesCount: 156, purchasesCount: 89 }
  }

  // Settings
  if (url.includes('/settings')) {
    return { companyName: 'Trial Garment Co.', gst: '27AABCT9999Z1ZZ', currency: 'INR', timezone: 'Asia/Kolkata' }
  }

  // Default: return empty array
  return []
}

export default client
