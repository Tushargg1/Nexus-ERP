import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last updated: June 2, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you create an account, update your profile, or use our services. This may include your name, email address, phone number, business details, and payment information.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services. This includes processing transactions, sending administrative messages, providing customer support, and personalizing your experience.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>4. Sharing of Information</h2>
            <p>We do not sell your personal information. We may share information with third-party vendors and service providers who perform services on our behalf, such as payment processing and hosting.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>5. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@nexuserp.com.</p>
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

