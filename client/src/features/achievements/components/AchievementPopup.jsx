import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RARITY_CONFIG } from '@/data/achievementsData'

/**
 * AchievementPopup — top-right toast notification on unlock
 * @param {object}   achievement  — achievement definition
 * @param {boolean}  show
 * @param {function} onClose
 */
export default function AchievementPopup({ achievement, show, onClose }) {
  // Auto-dismiss after 5s
  useEffect(() => {
    if (!show || !achievement) return
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [show, achievement, onClose])

  if (!achievement) return null

  const rarity = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.common
  const accent = achievement.badgeColor || rarity.color

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.94 }}
          transition={{ duration: 0.4, ease: [0.34, 1.12, 0.64, 1] }}
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 400,
            width: '320px',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <div style={{
            background: 'rgba(12,12,20,0.97)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${rarity.border}`,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: `0 8px 40px ${rarity.glow}, 0 0 0 1px ${accent}15`,
            position: 'relative',
          }}>
            {/* Animated top progress bar (5s burn-down) */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              style={{
                height: '2px',
                background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
                transformOrigin: 'left',
              }}
            />

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Icon */}
                <motion.div
                  initial={{ rotate: -15, scale: 0.6 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.5, 0.64, 1] }}
                  style={{
                    width: '50px', height: '50px', borderRadius: '13px', flexShrink: 0,
                    background: `${accent}14`,
                    border: `1.5px solid ${accent}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: `0 0 18px ${accent}35`,
                  }}
                >
                  {achievement.icon}
                </motion.div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div style={{
                      fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                      fontSize: '0.68rem', color: accent,
                      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px',
                    }}>
                      Achievement Unlocked
                    </div>
                    <div style={{
                      fontFamily: '"Syne", sans-serif', fontWeight: 800,
                      fontSize: '0.98rem', color: '#fff',
                      letterSpacing: '-0.01em', marginBottom: '3px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {achievement.name}
                    </div>
                    <div style={{
                      fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.45)', lineHeight: 1.4,
                    }}>
                      {achievement.desc}
                    </div>
                  </motion.div>

                  {/* Rewards */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ display: 'flex', gap: '8px', marginTop: '10px' }}
                  >
                    {achievement.xpReward > 0 && (
                      <div style={{
                        background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)',
                        borderRadius: '7px', padding: '3px 10px',
                        fontFamily: '"Syne", sans-serif', fontWeight: 700,
                        fontSize: '0.72rem', color: '#00F5FF',
                      }}>
                        +{achievement.xpReward} XP
                      </div>
                    )}
                    {achievement.coinReward > 0 && (
                      <div style={{
                        background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)',
                        borderRadius: '7px', padding: '3px 10px',
                        fontFamily: '"Syne", sans-serif', fontWeight: 700,
                        fontSize: '0.72rem', color: '#FFB800',
                      }}>
                        +{achievement.coinReward} Coins
                      </div>
                    )}
                    <div style={{
                      background: `${rarity.color}0F`, border: `1px solid ${rarity.border}`,
                      borderRadius: '7px', padding: '3px 10px',
                      fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
                      fontSize: '0.68rem', color: rarity.color,
                    }}>
                      {rarity.label}
                    </div>
                  </motion.div>
                </div>

                {/* Close */}
                <motion.button
                  whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                  onClick={onClose}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.25)', padding: '2px', display: 'flex', flexShrink: 0,
                    transition: 'color 0.18s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
