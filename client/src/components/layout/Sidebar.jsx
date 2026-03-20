import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@features/auth/useAuth'

const NAV_ITEMS = [
  {
    label: 'Home',
    to: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Store',
    to: '/store',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: 'Friends',
    to: '/friends',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Fight',
    to: '/fight',
    accent: '#FF4060',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" />
        <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" />
        <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" />
        <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" />
        <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
        <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" />
        <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" />
      </svg>
    ),
  },
  {
    label: 'Achievements',
    to: '/achievements',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
  },
  {
    label: 'Leaderboard',
    to: '/leaderboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    label: 'Progress',
    to: '/progress',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
      </svg>
    ),
  },
  {
    label: 'Plan',
    to: '/plan',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: 'Problems',
    to: '/problems',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'DoorQuest',
    to: '/game',
    accent: '#C06AFF',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="2" width="8" height="20" rx="1.5" />
        <rect x="13" y="2" width="8" height="20" rx="1.5" />
        <circle cx="10" cy="12" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
]

function NavItem({ item, collapsed }) {
  const accent = item.accent || '#00F5FF'

  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      style={{ textDecoration: 'none' }}
    >
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: isActive ? 0 : 2 }}
          transition={{ duration: 0.18 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: collapsed ? '10px 0' : '10px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '10px',
            position: 'relative',
            cursor: 'pointer',
            background: isActive ? `${accent}10` : 'transparent',
            border: isActive ? `1px solid ${accent}25` : '1px solid transparent',
            color: isActive ? accent : 'rgba(255,255,255,0.45)',
            transition: 'background 0.2s, color 0.2s, border-color 0.2s',
            marginBottom: '2px',
          }}
          onMouseEnter={e => {
            if (!isActive) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
            }
          }}
          onMouseLeave={e => {
            if (!isActive) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
            }
          }}
        >
          {/* Active left bar */}
          {isActive && (
            <motion.div
              layoutId="activeBar"
              style={{
                position: 'absolute',
                left: 0, top: '20%', bottom: '20%',
                width: '3px',
                borderRadius: '2px',
                background: accent,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
          )}

          {/* Icon */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {item.icon}
            {item.badge && (
              <div style={{
                position: 'absolute', top: '-5px', right: '-6px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#FF4060', color: '#fff',
                fontFamily: '"Syne", sans-serif', fontWeight: 800,
                fontSize: '0.6rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.badge}
              </div>
            )}
          </div>

          {/* Label */}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: '100%',
        background: 'rgba(12,12,18,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        overflowX: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Collapse toggle */}
      <motion.button
        whileHover={{ background: 'rgba(255,255,255,0.06)' }}
        onClick={onToggle}
        style={{
          alignSelf: collapsed ? 'center' : 'flex-end',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)', padding: '6px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', marginBottom: '16px',
          transition: 'background 0.2s',
        }}
      >
        <motion.svg
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </motion.svg>
      </motion.button>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

      {/* Logout */}
      <motion.button
        whileHover={{ background: 'rgba(255,80,80,0.07)' }}
        onClick={logout}
        style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', padding: '10px 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: '10px', background: 'none', border: 'none',
          cursor: 'pointer', color: 'rgba(255,80,80,0.6)',
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem',
          width: '100%', transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#FF5050'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,80,80,0.6)'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              Log Out
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.aside>
  )
}
