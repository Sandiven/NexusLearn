import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '40px 24px',
        background: 'rgba(15,15,20,0.8)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '-0.01em',
          }}
        >
          NEXUS<span style={{ color: '#00F5FF' }}>LEARN</span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Privacy', to: '/privacy' },
            { label: 'Terms', to: '/terms' },
            { label: 'Contact', to: '/contact' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.35)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          © {new Date().getFullYear()} Nexus Learn
        </div>
      </div>
    </footer>
  )
}
