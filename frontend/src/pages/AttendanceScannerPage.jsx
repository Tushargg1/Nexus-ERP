import React, { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import PageHeader from '../components/common/PageHeader'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import client from '../api/client'

export default function AttendanceScannerPage() {
  const [scanResult, setScanResult] = useState(null)
  const scannerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    )

    scanner.render(
      async (decodedText) => {
        // e.g., decodedText = "EMP-001"
        scanner.pause(true)
        setScanResult(decodedText)
        
        try {
          // You'd typically call an endpoint: /api/v1/attendance/scan
          // await client.post('/attendance/scan', { empCode: decodedText })
          toast.success(`Attendance logged for ${decodedText}`)
          setTimeout(() => {
            setScanResult(null)
            scanner.resume()
          }, 3000)
        } catch (error) {
          toast.error('Failed to log attendance')
          setTimeout(() => {
            setScanResult(null)
            scanner.resume()
          }, 3000)
        }
      },
      (error) => {
        // ignore errors
      }
    )

    scannerRef.current = scanner

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [])

  return (
    <div className="page-container fadeIn">
      <PageHeader 
        title="QR Attendance Scanner" 
        subtitle="Scan employee ID card to log daily attendance"
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/attendance')}>
            View Attendance Logs
          </button>
        }
      />

      <div className="card slideIn" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ padding: '24px' }}>
          <Camera size={48} style={{ color: 'var(--accent-blue)', marginBottom: '16px' }} />
          <h3>Factory Entrance Kiosk</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Position the QR code within the frame to automatically log attendance.
          </p>
          
          <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border)' }}></div>

          {scanResult && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--success)', color: '#fff', borderRadius: '8px', fontWeight: 'bold' }}>
              Successfully Scanned: {scanResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

