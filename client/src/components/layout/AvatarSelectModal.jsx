import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '@services/api'
import useAuthStore from '@store/authStore'

const AVATARS = [
  { id: 'avatar-option-1', label: 'Avatar 1', src: '/avatars/avatar-option-1.png' },
  { id: 'avatar-option-2', label: 'Avatar 2', src: '/avatars/avatar-option-2.png' },
]

export default function AvatarSelectModal({ currentAvatar, onClose, onSaved }) {
  const setUser = useAuthStore(s => s.setUser)

  const activeId = AVATARS.find(a => a.id === currentAvatar)?.id ?? null
  const [selected, setSelected] = useState(activeId)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)

  const handleApply = async () => {
    if (!selected) return
    // If nothing changed, just close
    if (selected === activeId) { onClose(); return }
    setSaving(true)
    setError(null)
    try {
      const { data } = await api.patch('/auth/avatar', { avatar: selected })
      setUser(data.user)
      onSaved?.(selected)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save avatar. Please try again.')
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (saving) return
    onClose()
  }

  return (
    <>
      {/* Dark overlay — sits above the profile modal backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={handleCancel}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 10000,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      {/* Avatar selector card — true viewport center via transform */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{   opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001,
          width: '460px',
          maxWidth: 'calc(100vw - 40px)',
          background: 'rgba(12, 12, 20, 0.99)',
          border: '1px solid rgba(255,255,255,0.13)',
          borderRadius: '22px',
          padding: '32px 32px 28px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,245,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '28px',
        }}>
          <div>
            <div style={{
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '1.18rem', color: '#fff', letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}>
              Select Your Avatar
            </div>
            <div style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.35)', marginTop: '5px',
            }}>
              Choose one — click Apply Change to confirm
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.12, background: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCancel}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              fontSize: '1.15rem', lineHeight: 1, marginLeft: '12px',
              transition: 'background 0.15s',
            }}
          >
            ×
          </motion.button>
        </div>

        {/* ── Avatar options ── */}
        <div style={{
          display: 'flex', gap: '16px', justifyContent: 'center',
          marginBottom: '28px',
        }}>
          {AVATARS.map(av => {
            const isSelected = selected === av.id
            const isCurrent  = activeId === av.id
            return (
              <motion.div
                key={av.id}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => !saving && setSelected(av.id)}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  padding: '20px 14px 16px',
                  background: isSelected
                    ? 'rgba(0,245,255,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  border: isSelected
                    ? '2px solid rgba(0,245,255,0.6)'
                    : '2px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  cursor: saving ? 'default' : 'pointer',
                  transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
                  boxShadow: isSelected
                    ? '0 0 24px rgba(0,245,255,0.15), inset 0 0 20px rgba(0,245,255,0.04)'
                    : 'none',
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                {/* Checkmark badge when selected */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00F5FF, #00C8D4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,245,255,0.4)',
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <polyline
                        points="2,6 5,9 10,3"
                        stroke="#0a0a14" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* "Current" label */}
                {isCurrent && !isSelected && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    padding: '2px 7px', borderRadius: '6px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem',
                    fontWeight: 600, color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Active
                  </div>
                )}

                {/* Avatar image circle */}
                <div style={{
                  width: '96px', height: '96px', borderRadius: '50%',
                  overflow: 'hidden',
                  border: isSelected
                    ? '3px solid rgba(0,245,255,0.7)'
                    : '3px solid rgba(255,255,255,0.08)',
                  boxShadow: isSelected
                    ? '0 0 28px rgba(0,245,255,0.25)'
                    : '0 4px 16px rgba(0,0,0,0.4)',
                  transition: 'border-color 0.18s, box-shadow 0.18s',
                  background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)',
                  flexShrink: 0,
                }}>
                  <img
                    src={av.src}
                    alt={av.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => {
                      const el = e.target
                      el.style.display = 'none'
                      const parent = el.parentNode
                      parent.style.background = 'linear-gradient(135deg, #1a0a2e, #0a1a2e)'
                      const fallback = document.createElement('div')
                      fallback.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-weight:800;font-size:2rem;color:#00F5FF'
                      fallback.textContent = av.label[7]
                      parent.appendChild(fallback)
                    }}
                  />
                </div>

                {/* Label */}
                <div style={{
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                  fontSize: '0.85rem',
                  color: isSelected ? '#00F5FF' : 'rgba(255,255,255,0.45)',
                  transition: 'color 0.18s',
                  letterSpacing: '0.01em',
                }}>
                  {av.label}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Error message ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '16px', padding: '10px 14px',
              background: 'rgba(255,64,96,0.1)',
              border: '1px solid rgba(255,64,96,0.3)',
              borderRadius: '10px',
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#FF4060',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Cancel */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleCancel}
            disabled={saving}
            style={{
              flex: 1, padding: '13px 0',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '11px', cursor: saving ? 'default' : 'pointer',
              fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
              fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s',
            }}
          >
            Cancel
          </motion.button>

          {/* Apply Change */}
          <motion.button
            whileHover={selected && !saving ? { scale: 1.02, boxShadow: '0 0 28px rgba(0,245,255,0.28)' } : {}}
            whileTap={selected && !saving ? { scale: 0.97 } : {}}
            onClick={handleApply}
            disabled={saving || !selected}
            style={{
              flex: 2, padding: '13px 0',
              background: selected
                ? 'linear-gradient(135deg, rgba(0,245,255,0.18), rgba(139,92,246,0.2))'
                : 'rgba(255,255,255,0.04)',
              border: selected
                ? '1px solid rgba(0,245,255,0.45)'
                : '1px solid rgba(255,255,255,0.07)',
              borderRadius: '11px',
              cursor: selected && !saving ? 'pointer' : 'default',
              fontFamily: '"Syne", sans-serif', fontWeight: 700,
              fontSize: '0.9rem',
              color: selected ? '#00F5FF' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    border: '2px solid rgba(0,245,255,0.3)',
                    borderTopColor: '#00F5FF',
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Apply Change
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
