import { motion } from 'framer-motion'
import { RARITY_CONFIG, CATEGORY_CONFIG, getRelativeUnlockDate } from '@/data/achievementsData'

/**
 * AchievementCard
 * @param {object}  achievement   — achievement definition
 * @param {boolean} unlocked      — whether user has earned it
 * @param {string}  unlockedAt    — ISO date string
 * @param {number}  index         — stagger delay
 * @param {boolean} isNew         — just unlocked (special glow)
 */
export default function AchievementCard({ achievement, unlocked, unlockedAt, index = 0, isNew = false, onClick }) {
  const rarity   = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.common
  const accent   = achievement.badgeColor || rarity.color
  const catCfg   = CATEGORY_CONFIG[achievement.category] || { accent }
  const isLegend = achievement.rarity === 'legendary'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: unlocked ? 1 : 0.42, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.04 }}
      whileHover={{
        y: unlocked ? -5 : -2,
        opacity: 1,
        boxShadow: unlocked ? `0 12px 36px ${rarity.glow}` : '0 6px 18px rgba(0,0,0,0.3)',
        borderColor: unlocked ? rarity.border : 'rgba(255,255,255,0.12)',
        transition: { duration: 0.22 },
      }}
      onClick={() => onClick?.(achievement)}
      style={{
        background: unlocked
          ? `radial-gradient(ellipse 80% 60% at 50% 0%, ${accent}08, rgba(255,255,255,0.03))`
          : 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${unlocked ? rarity.border : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '18px',
        padding: '22px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: '14px',
        transition: 'opacity 0.3s',
      }}
    >
      {/* Shimmer for legendary */}
      {isLegend && unlocked && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
          style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent, ${accent}10, transparent)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top accent line */}
      {unlocked && (
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: `linear-gradient(90deg, transparent, ${accent}70, transparent)`,
        }} />
      )}

      {/* NEW badge */}
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.35)',
            borderRadius: '8px', padding: '2px 8px',
            fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.62rem',
            color: '#00FF88', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          NEW
        </motion.div>
      )}

      {/* Icon + rarity */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Badge icon */}
        <motion.div
          animate={unlocked && isLegend ? {
            boxShadow: [`0 0 16px ${accent}40`, `0 0 28px ${accent}65`, `0 0 16px ${accent}40`],
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: unlocked ? `${accent}14` : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${unlocked ? `${accent}40` : 'rgba(255,255,255,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: unlocked ? `0 0 ${isLegend ? 20 : 10}px ${accent}30` : 'none',
            position: 'relative',
            transition: 'all 0.3s',
          }}
        >
          {unlocked ? (
            achievement.icon
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </motion.div>

        {/* Rarity chip */}
        <motion.div
          animate={isLegend && unlocked ? {
            boxShadow: [`0 0 5px ${rarity.glow}`, `0 0 12px ${rarity.glow}`, `0 0 5px ${rarity.glow}`],
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: `${rarity.color}10`,
            border: `1px solid ${unlocked ? rarity.border : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px', padding: '3px 9px',
          }}
        >
          <div style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: unlocked ? rarity.color : 'rgba(255,255,255,0.2)',
          }} />
          <span style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
            fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em',
            color: unlocked ? rarity.color : 'rgba(255,255,255,0.25)',
          }}>
            {rarity.label}
          </span>
        </motion.div>
      </div>

      {/* Name + description */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 700,
          fontSize: '0.95rem', letterSpacing: '-0.01em',
          color: unlocked ? '#fff' : 'rgba(255,255,255,0.38)',
          marginBottom: '5px', margin: 0,
        }}>
          {achievement.name}
        </h3>
        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem',
          color: unlocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
          lineHeight: 1.5, margin: '5px 0 0',
        }}>
          {achievement.desc}
        </p>
      </div>

      {/* Footer: reward + unlock date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: `1px solid ${unlocked ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}` }}>
        {/* Rewards */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {achievement.xpReward > 0 && (
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.75rem', color: unlocked ? '#00F5FF' : 'rgba(255,255,255,0.2)' }}>
              +{achievement.xpReward} XP
            </span>
          )}
          {achievement.coinReward > 0 && (
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.75rem', color: unlocked ? '#FFB800' : 'rgba(255,255,255,0.2)' }}>
              +{achievement.coinReward}
            </span>
          )}
        </div>

        {/* Unlock date or locked */}
        {unlocked && unlockedAt ? (
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
            {getRelativeUnlockDate(unlockedAt)}
          </span>
        ) : !unlocked ? (
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>
            Locked
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}
