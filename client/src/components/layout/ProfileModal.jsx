import { useState } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '@store/authStore'
import AvatarSelectModal from './AvatarSelectModal'

function AvatarDisplay({ avatar, size = 96 }) {
  const [imgErr, setImgErr] = useState(false)
  const user = useAuthStore(s => s.user)
  const initial = user?.username?.[0]?.toUpperCase() || '?'
  const isCustom = avatar && avatar !== 'default' && !imgErr

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden',
      border: '2.5px solid rgba(0,245,255,0.4)',
      boxShadow: '0 0 28px rgba(0,245,255,0.18)',
      background: 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(139,92,246,0.12))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {isCustom ? (
        <img
          src={`/avatars/${avatar}.png`}
          alt="avatar"
          onError={() => setImgErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <span style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: `${size * 0.38}px`, color: '#00F5FF',
        }}>
          {initial}
        </span>
      )}
    </div>
  )
}

export default function ProfileModal({ onClose }) {
  const user = useAuthStore(s => s.user)
  const [showAvatarSelect, setShowAvatarSelect] = useState(false)

  return (
    <>
      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9000,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
      />

      {/* ── Profile card — true viewport center ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{   opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9001,
          width: '420px',
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          background: 'rgba(12, 12, 20, 0.99)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '22px',
          padding: '36px 36px 32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,245,255,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '32px',
        }}>
          <div style={{
            fontFamily: '"Syne", sans-serif', fontWeight: 800,
            fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.01em',
          }}>
            Profile
          </div>
          <motion.button
            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.55)',
              fontSize: '1.15rem', lineHeight: 1,
            }}
          >
            ×
          </motion.button>
        </div>

        {/* Avatar + user info */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '18px', marginBottom: '32px',
        }}>
          <AvatarDisplay avatar={user?.avatar} size={96} />

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '1.22rem', color: '#fff', marginBottom: '7px',
              letterSpacing: '-0.01em',
            }}>
              {user?.username || '—'}
            </div>
            <div style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)',
            }}>
              {user?.email || '—'}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          marginBottom: '24px',
        }} />

        {/* Change Avatar button */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(0,245,255,0.18)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAvatarSelect(true)}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, rgba(0,245,255,0.1), rgba(139,92,246,0.1))',
            border: '1px solid rgba(0,245,255,0.3)',
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontFamily: '"Syne", sans-serif', fontWeight: 700,
            fontSize: '0.9rem', color: '#00F5FF',
            transition: 'all 0.18s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Change Avatar
        </motion.button>
      </motion.div>

      {/* Avatar selector — mounted above profile modal */}
      {showAvatarSelect && (
        <AvatarSelectModal
          currentAvatar={user?.avatar}
          onClose={() => setShowAvatarSelect(false)}
          onSaved={() => setShowAvatarSelect(false)}
        />
      )}
    </>
  )
}
