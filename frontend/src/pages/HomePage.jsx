import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Hexagon, 
  BarChart3, 
  Users, 
  Package, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Check
} from 'lucide-react'

const FEATURES = [
  {
    icon: Package,
    title: 'Smart Inventory',
    description: 'Track raw materials and finished goods in real-time with automated low-stock alerts.'
  },
  {
    icon: Users,
    title: 'Workforce Management',
    description: 'Manage employee attendance, calculate salaries, and track daily production targets.'
  },
  {
    icon: BarChart3,
    title: 'Financial Analytics',
    description: 'Generate GST-ready invoices, track expenses, and view comprehensive profit reports.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with daily automated backups to keep your data safe.'
  }
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: scrolled ? 'rgba(13, 17, 23, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        padding: '0 5%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Hexagon size={24} color="#0d1117" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em' }}>
            Nexus ERP
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '24px' }}>
          {[
            { label: 'Features', id: 'features' },
            { label: 'How It Works', id: 'how-it-works' },
            { label: 'Pricing', id: 'pricing' },
          ].map(({ label, id }) => (
            <button
              key={label}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500,
                padding: '8px 16px', borderRadius: '8px',
                transition: 'color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none' }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500,
            padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
          onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none' }}
          >
            Login
          </Link>
          <Link to="/trial" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            Try for free
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            Request Access
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '160px 5% 100px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background Gradients */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(245,158,11,0.1) 0%, transparent 60%)',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            padding: '6px 16px',
            borderRadius: '50px',
            color: 'var(--accent-gold)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '24px',
            animation: 'fadeInDown 0.5s ease',
          }}>
            <Zap size={16} />
            <span>The #1 Business Management Software</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeInUp 0.6s ease',
          }}>
            Scale your business operations with precision.
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            animation: 'fadeInUp 0.7s ease',
          }}>
            Everything you need to manage inventory, track employee attendance, handle billing, and analyze profits—all in one unified platform.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', animation: 'fadeInUp 0.8s ease' }}>
            <Link to="/trial" className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              View Live Demo <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Request Access
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup Image Placeholder */}
        <div style={{
          marginTop: '80px',
          width: '100%',
          maxWidth: '1000px',
          height: '500px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 1s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
           {/* Mockup Header */}
           <div style={{height: '40px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px'}}>
              <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56'}} />
              <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e'}} />
              <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f'}} />
           </div>
           {/* Mockup Body */}
           <div style={{flex: 1, background: 'var(--bg-primary)', display: 'flex'}}>
              <div style={{width: '200px', borderRight: '1px solid var(--border)', padding: '20px'}}>
                 {[1,2,3,4,5].map(i => <div key={i} style={{height: '30px', background: 'var(--bg-surface)', borderRadius: '6px', marginBottom: '12px', opacity: 1 - (i*0.15)}} />)}
              </div>
              <div style={{flex: 1, padding: '30px'}}>
                 <div style={{height: '40px', width: '30%', background: 'var(--bg-surface)', borderRadius: '8px', marginBottom: '30px'}} />
                 <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
                    {[1,2,3,4].map(i => <div key={i} style={{flex: 1, height: '100px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)'}} />)}
                 </div>
                 <div style={{height: '250px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)'}} />
              </div>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 5%', background: '#090c10', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Everything you need to succeed</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Powerful tools built specifically for modern businesses.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {FEATURES.map((feature, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(245,158,11,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(245,158,11,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <feature.icon size={24} color="var(--accent-gold)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="how-it-works" style={{
        padding: '100px 5%',
        background: 'linear-gradient(135deg, #1a2035 0%, #0d1117 100%)',
        textAlign: 'center',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Ready to transform your business?</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
            Join hundreds of businesses who have optimized their operations, reduced waste, and increased profitability.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
            Request Access Now
          </Link>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="var(--success)" /> Free Demo</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="var(--success)" /> No Credit Card Required</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '100px 5%', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Choose the plan that best fits your business needs.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
            {/* Starter Plan */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 30px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Starter</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Perfect for small workshops.</p>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px' }}>
                $49<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['Up to 10 employees', 'Basic inventory tracking', 'Standard reports', 'Email support'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                    <Check size={18} color="var(--success)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
            </div>

            {/* Pro Plan */}
            <div style={{ 
              background: 'linear-gradient(180deg, rgba(245,158,11,0.1) 0%, var(--bg-surface) 100%)', 
              border: '2px solid var(--accent-gold)', 
              borderRadius: '16px', 
              padding: '48px 30px',
              position: 'relative',
              transform: 'scale(1.05)'
            }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-gold)', color: '#0d1117', padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Professional</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>For growing businesses with multiple departments.</p>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px' }}>
                $129<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['Up to 50 employees', 'Advanced inventory & routing', 'Financial analytics', 'Priority 24/7 support'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                    <Check size={18} color="var(--accent-gold)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>Start Free Trial</Link>
            </div>

            {/* Enterprise Plan */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 30px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Enterprise</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Custom solutions for large scale operations.</p>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px' }}>
                Custom
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['Unlimited employees', 'Multi-location support', 'Custom integrations', 'Dedicated account manager'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                    <Check size={18} color="var(--success)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer style={{ background: '#05070a', borderTop: '1px solid var(--border)', padding: '80px 5% 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
            {/* Brand Column */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Hexagon size={16} color="#0d1117" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em' }}>Nexus ERP</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '300px' }}>
                The complete end-to-end management system designed specifically for modern businesses.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>Features</button></li>
                <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>Pricing</button></li>
                <li><button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>How It Works</button></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms & Conditions</Link></li>
                <li><Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link></li>
                <li><Link to="/cookie" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Cookie Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About Us</Link></li>
                <li><Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</Link></li>
                <li><Link to="/careers" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Careers</Link></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              © {new Date().getFullYear()} Nexus ERP. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)', alignSelf: 'center' }} title="System Online" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

