import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <nav style={{
        height: '70px',
        background: 'rgba(13, 17, 23, 0.95)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5%',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginRight: '24px' }}>
          <ArrowLeft size={18} />
          <span style={{ fontWeight: 500 }}>Back to Home</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Hexagon size={18} color="#0d1117" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            Nexus ERP
          </span>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Terms & Conditions</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last updated: June 2, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
            <p>By accessing and using Nexus ERP, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>2. Use of Service</h2>
            <p>You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the service. You are responsible for maintaining the confidentiality of your account credentials.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>3. Data Privacy</h2>
            <p>We take your privacy seriously. Your data is encrypted and securely stored. We will never sell your personal or business data to third parties. For more information, please read our Privacy Policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>4. Subscription and Payments</h2>
            <p>Certain features of Nexus ERP require a paid subscription. Payments are billed in advance on a recurring basis (monthly or annually). You can cancel your subscription at any time, but no refunds will be provided for partial months.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>5. Limitation of Liability</h2>
            <p>Nexus ERP is provided "as is". We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use of the service.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>6. Modifications to Service</h2>
            <p>We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.</p>
          </section>
        </div>
      </div>
      
      {/* Simple Footer */}
      <footer style={{ padding: '40px 0', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} Nexus ERP. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

