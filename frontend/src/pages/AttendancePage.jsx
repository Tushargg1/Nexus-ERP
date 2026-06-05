import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, CheckSquare, Clock, QrCode, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { attendanceAPI } from '../api/attendance'
import { employeesAPI } from '../api/employees'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import SearchBar from '../components/common/SearchBar'
import StatsCard from '../components/common/StatsCard'
import { format } from 'date-fns'

export default function AttendancePage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAttendance(date)
  }, [date])

  const fetchAttendance = async (targetDate) => {
    setLoading(true)
    try {
      const res = await attendanceAPI.getByDate(targetDate)
      if (res.data?.data && res.data.data.length > 0) {
        setAttendance(res.data.data)
      } else {
        const empRes = await employeesAPI.getAll()
        const emps = empRes.data?.data || empRes.data?.content || empRes.data || []
        setAttendance(emps.map(e => ({
          empId: e.id,
          empCode: e.empCode,
          name: e.name,
          role: e.role,
          status: 'PRESENT',
          inTime: '09:00',
          outTime: '18:00',
          overtimeHours: 0
        })))
      }
    } catch {
      try {
        const empRes = await employeesAPI.getAll()
        const emps = empRes.data?.data || empRes.data?.content || empRes.data || []
        setAttendance(emps.map(e => ({
          empId: e.id,
          empCode: e.empCode,
          name: e.name,
          role: e.role,
          status: 'PRESENT',
          inTime: '09:00',
          outTime: '18:00',
          overtimeHours: 0
        })))
      } catch {
        setAttendance([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = (empId, field, value) => {
    setAttendance(prev => prev.map(a => a.empId === empId ? { ...a, [field]: value } : a))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await attendanceAPI.markBulk({ date, records: attendance })
      toast.success('Attendance saved for ' + date)
    } catch (err) {
      toast.error('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const filtered = attendance.filter(a => 
    !search || [a.name, a.empCode].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  )

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length
  const absentCount = attendance.filter(a => a.status === 'ABSENT').length
  const halfDayCount = attendance.filter(a => a.status === 'HALF_DAY').length

  const cols = [
    { key: 'empCode', label: 'Emp Code', primary: true },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { 
      key: 'status', 
      label: 'Status',
      render: (_, row) => (
        <select 
          className="form-select" 
          style={{ width: '130px', padding: '4px 8px', fontSize: '0.85rem' }}
          value={row.status}
          onChange={(e) => handleUpdate(row.empId, 'status', e.target.value)}
        >
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="LEAVE">Leave</option>
        </select>
      )
    },
    { 
      key: 'inTime', 
      label: 'In Time',
      render: (_, row) => (
        <input 
          type="time" 
          className="form-input" 
          style={{ width: '110px', padding: '4px 8px' }}
          value={row.inTime || ''}
          onChange={(e) => handleUpdate(row.empId, 'inTime', e.target.value)}
          disabled={row.status === 'ABSENT' || row.status === 'LEAVE'}
        />
      )
    },
    { 
      key: 'outTime', 
      label: 'Out Time',
      render: (_, row) => (
        <input 
          type="time" 
          className="form-input" 
          style={{ width: '110px', padding: '4px 8px' }}
          value={row.outTime || ''}
          onChange={(e) => handleUpdate(row.empId, 'outTime', e.target.value)}
          disabled={row.status === 'ABSENT' || row.status === 'LEAVE'}
        />
      )
    },
    { 
      key: 'overtimeHours', 
      label: 'OT (Hrs)',
      render: (_, row) => (
        <input 
          type="number" 
          className="form-input" 
          style={{ width: '70px', padding: '4px 8px' }}
          value={row.overtimeHours || ''}
          onChange={(e) => handleUpdate(row.empId, 'overtimeHours', e.target.value)}
          min="0"
          max="12"
          disabled={row.status === 'ABSENT' || row.status === 'LEAVE'}
        />
      )
    },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader 
        title="Attendance" 
        subtitle="Manage daily employee attendance and leaves"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/attendance/scanner')}>
              <QrCode size={16} /> Scan QR
            </button>
            <button className="btn btn-primary" onClick={handleSaveAll} disabled={saving}>
              <CheckSquare size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        }
      />

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Employees" value={attendance.length} icon={Calendar} color="blue" />
        <StatsCard title="Present" value={presentCount} icon={CheckSquare} color="green" />
        <StatsCard title="Absent" value={absentCount} icon={CheckSquare} color="red" />
        <StatsCard title="Half Day" value={halfDayCount} icon={Clock} color="gold" />
      </div>

      <div className="card">
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Date:</label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search employee..." />
        </div>
        
        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          rowKey="empId"
          emptyMessage="No employees found"
          emptyIcon={<Calendar size={28} />}
        />
      </div>
    </div>
  )
}
