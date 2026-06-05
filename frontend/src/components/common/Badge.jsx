import React from 'react'

const STATUS_MAP = {
  // Payment statuses
  PAID: { label: 'Paid', class: 'badge-success' },
  PARTIAL: { label: 'Partial', class: 'badge-info' },
  PENDING: { label: 'Pending', class: 'badge-warning' },
  UNPAID: { label: 'Unpaid', class: 'badge-warning' },
  OVERDUE: { label: 'Overdue', class: 'badge-danger' },

  // User roles
  ADMIN: { label: 'Admin', class: 'badge-purple' },
  MANAGER: { label: 'Manager', class: 'badge-info' },
  STAFF: { label: 'Staff', class: 'badge-muted' },
  ACCOUNTANT: { label: 'Accountant', class: 'badge-gold' },

  // Stock
  LOW_STOCK: { label: 'Low Stock', class: 'badge-danger' },
  IN_STOCK: { label: 'In Stock', class: 'badge-success' },
  OUT_OF_STOCK: { label: 'Out of Stock', class: 'badge-danger' },

  // Employee
  ACTIVE: { label: 'Active', class: 'badge-success' },
  INACTIVE: { label: 'Inactive', class: 'badge-muted' },
  TERMINATED: { label: 'Terminated', class: 'badge-danger' },

  // Attendance
  PRESENT: { label: 'Present', class: 'badge-success' },
  ABSENT: { label: 'Absent', class: 'badge-danger' },
  HALF_DAY: { label: 'Half Day', class: 'badge-warning' },
  LEAVE: { label: 'Leave', class: 'badge-info' },

  // Production
  RAW_MATERIAL: { label: 'Raw Material', class: 'badge-muted' },
  CUTTING: { label: 'Cutting', class: 'badge-info' },
  STITCHING: { label: 'Stitching', class: 'badge-warning' },
  FINISHING: { label: 'Finishing', class: 'badge-gold' },
  PACKING: { label: 'Packing', class: 'badge-purple' },
  COMPLETED: { label: 'Completed', class: 'badge-success' },
}

export default function Badge({ status, label, type }) {
  const key = (status || type || '').toUpperCase().replace(/\s+/g, '_')
  const config = STATUS_MAP[key] || { label: label || status || type, class: 'badge-muted' }

  return (
    <span className={`badge ${config.class}`}>
      {label || config.label}
    </span>
  )
}
