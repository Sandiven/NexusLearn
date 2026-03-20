// import { motion } from 'framer-motion'
// import { RARITY_CONFIG, CATEGORY_CONFIG } from '@/data/storeData'

// function RarityBadge({ rarity }) {
//   const cfg = RARITY_CONFIG[rarity]
//   return (
//     <motion.div
//       animate={rarity === 'legendary' ? {
//         boxShadow: [`0 0 6px ${cfg.glow}`, `0 0 14px ${cfg.glow}`, `0 0 6px ${cfg.glow}`],
//       } : {}}
//       transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
//       style={{
//         display: 'inline-flex', alignItems: 'center', gap: '4px',
//         background: `${cfg.color}14`,
//         border: `1px solid ${cfg.border}`,
//         borderRadius: '7px', padding: '2px 8px',
//         flexShrink: 0,
//       }}
//     >
//       <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }} />
//       <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.65rem', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//         {cfg.label}
//       </span>
//     </motion.div>
//   )
// }

// /**
//  * StoreItemCard
//  * @param {object}   item
//  * @param {boolean}  owned         — user already owns this
//  * @param {boolean}  active        — cosmetic is currently equipped
//  * @param {boolean}  canAfford     — user has enough coins
//  * @param {function} onBuy         — (item) => void
//  * @param {function} onActivate    — (item) => void
//  * @param {number}   index         — stagger delay
//  */
// export default function StoreItemCard({ item, owned, active, canAfford, onBuy, onActivate, index = 0 }) {
//   const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common
//   const catCfg = CATEGORY_CONFIG[item.category] || { accent: item.accentColor || '#00F5FF' }
//   const accent = item.accentColor || catCfg.accent

//   const isBooster   = item.type === 'booster'
//   const isFree      = item.price === 0
//   const isOnSale    = item.originalPrice && item.originalPrice > item.price
//   const discount    = isOnSale ? Math.round((1 - item.price / item.originalPrice) * 100) : 0

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.05 }}
//       whileHover={{
//         y: -5,
//         boxShadow: `0 14px 40px ${rarity.glow}`,
//         borderColor: rarity.border,
//         transition: { duration: 0.22 },
//       }}
//       style={{
//         background: item.previewGradient || 'rgba(255,255,255,0.04)',
//         backdropFilter: 'blur(20px)',
//         WebkitBackdropFilter: 'blur(20px)',
//         border: `1px solid ${owned ? `${accent}30` : 'rgba(255,255,255,0.08)'}`,
//         borderRadius: '18px',
//         padding: '22px',
//         position: 'relative', overflow: 'hidden',
//         cursor: 'default',
//         display: 'flex', flexDirection: 'column', gap: '14px',
//       }}
//     >
//       {/* Top accent glow line */}
//       <div style={{
//         position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
//         background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
//       }} />

//       {/* Sale badge */}
//       {isOnSale && (
//         <div style={{
//           position: 'absolute', top: '14px', right: '14px',
//           background: 'rgba(255,64,96,0.15)', border: '1px solid rgba(255,64,96,0.3)',
//           borderRadius: '8px', padding: '2px 8px',
//           fontFamily: '"Syne", sans-serif', fontWeight: 800,
//           fontSize: '0.65rem', color: '#FF4060',
//         }}>
//           -{discount}%
//         </div>
//       )}

//       {/* Icon + rarity row */}
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
//         {/* Icon container */}
//         <motion.div
//           animate={item.rarity === 'legendary' ? { scale: [1, 1.05, 1] } : {}}
//           transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
//           style={{
//             width: '52px', height: '52px', borderRadius: '14px',
//             background: `${accent}14`,
//             border: `1px solid ${accent}30`,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: '1.5rem',
//             boxShadow: item.rarity === 'legendary' ? `0 0 20px ${accent}30` : 'none',
//           }}
//         >
//           {item.icon}
//         </motion.div>

//         <RarityBadge rarity={item.rarity} />
//       </div>

//       {/* Name + description */}
//       <div style={{ flex: 1 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
//           <h3 style={{
//             fontFamily: '"Syne", sans-serif', fontWeight: 700,
//             fontSize: '0.95rem', color: '#fff',
//             letterSpacing: '-0.01em', margin: 0,
//           }}>
//             {item.name}
//           </h3>
//           {owned && active && (
//             <div style={{
//               background: `${accent}15`, border: `1px solid ${accent}30`,
//               borderRadius: '6px', padding: '1px 7px',
//               fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem',
//               fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em',
//             }}>
//               Active
//             </div>
//           )}
//         </div>

//         <p style={{
//           fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem',
//           color: 'rgba(255,255,255,0.48)', lineHeight: 1.55, margin: 0,
//         }}>
//           {item.description}
//         </p>

//         {/* Booster effect pill */}
//         {isBooster && (
//           <div style={{
//             display: 'inline-flex', alignItems: 'center', gap: '6px',
//             marginTop: '10px',
//             background: `${accent}0E`, border: `1px solid ${accent}22`,
//             borderRadius: '8px', padding: '4px 10px',
//           }}>
//             {item.effect.xpMultiplier > 1 && (
//               <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: accent }}>
//                 {item.effect.xpMultiplier}× XP
//               </span>
//             )}
//             {item.effect.coinMultiplier > 1 && (
//               <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#00FF88' }}>
//                 {item.effect.coinMultiplier}× Coins
//               </span>
//             )}
//             {item.effect.streakShield && (
//               <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF6B35' }}>
//                 Streak Shield
//               </span>
//             )}
//             {item.effect.durationDays > 0 && (
//               <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
//                 · {item.effect.durationDays}d
//               </span>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Price + CTA */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
//         {/* Price */}
//         <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
//           {isOnSale && (
//             <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>
//               {item.originalPrice}
//             </span>
//           )}
//           <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.05rem', color: isFree ? '#00FF88' : '#FFB800' }}>
//             {isFree ? 'Free' : item.price.toLocaleString()}
//           </span>
//           {!isFree && <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>coins</span>}
//         </div>

//         {/* Action button */}
//         {owned ? (
//           item.type === 'cosmetic' || item.type === 'theme' ? (
//             <motion.button
//               whileHover={!active ? { scale: 1.04 } : {}}
//               whileTap={!active ? { scale: 0.96 } : {}}
//               onClick={() => !active && onActivate?.(item)}
//               style={{
//                 padding: '8px 16px', borderRadius: '10px', border: 'none',
//                 background: active ? `${accent}15` : `${accent}22`,
//                 color: active ? accent : accent,
//                 border: `1px solid ${accent}${active ? '30' : '40'}`,
//                 fontFamily: '"Syne", sans-serif', fontWeight: 700,
//                 fontSize: '0.78rem', cursor: active ? 'default' : 'pointer',
//               }}
//             >
//               {active ? '✓ Equipped' : 'Equip'}
//             </motion.button>
//           ) : (
//             <div style={{
//               padding: '8px 14px', borderRadius: '10px',
//               background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)',
//               fontFamily: '"Syne", sans-serif', fontWeight: 700,
//               fontSize: '0.78rem', color: '#00FF88',
//               display: 'flex', alignItems: 'center', gap: '5px',
//             }}>
//               <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
//               Owned
//             </div>
//           )
//         ) : (
//           <motion.button
//             whileHover={canAfford ? {
//               scale: 1.04,
//               boxShadow: `0 6px 22px ${accent}35`,
//             } : {}}
//             whileTap={canAfford ? { scale: 0.96 } : {}}
//             onClick={() => canAfford && onBuy?.(item)}
//             disabled={!canAfford}
//             style={{
//               padding: '8px 18px', borderRadius: '10px', border: 'none',
//               background: canAfford
//                 ? `linear-gradient(135deg, ${accent}, ${accent}CC)`
//                 : 'rgba(255,255,255,0.06)',
//               color: canAfford ? '#000' : 'rgba(255,255,255,0.25)',
//               fontFamily: '"Syne", sans-serif', fontWeight: 700,
//               fontSize: '0.78rem',
//               cursor: canAfford ? 'pointer' : 'not-allowed',
//               transition: 'all 0.2s',
//               display: 'flex', alignItems: 'center', gap: '5px',
//             }}
//           >
//             {canAfford ? (
//               <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> Buy</>
//             ) : `+${(item.price - 0).toLocaleString()} needed`}
//           </motion.button>
//         )}
//       </div>
//     </motion.div>
//   )
// }




import { motion } from 'framer-motion'
import { RARITY_CONFIG, CATEGORY_CONFIG } from '@/data/storeData'

function RarityBadge({ rarity }) {
  const cfg = RARITY_CONFIG[rarity]
  return (
    <motion.div
      animate={rarity === 'legendary' ? {
        boxShadow: [`0 0 6px ${cfg.glow}`, `0 0 14px ${cfg.glow}`, `0 0 6px ${cfg.glow}`],
      } : {}}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: `${cfg.color}14`,
        border: `1px solid ${cfg.border}`,
        borderRadius: '7px', padding: '2px 8px',
        flexShrink: 0,
      }}
    >
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }} />
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.65rem', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {cfg.label}
      </span>
    </motion.div>
  )
}

export default function StoreItemCard({ item, owned, active, canAfford, onBuy, onActivate, index = 0 }) {
  const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common
  const catCfg = CATEGORY_CONFIG[item.category] || { accent: item.accentColor || '#00F5FF' }
  const accent = item.accentColor || catCfg.accent

  const isBooster   = item.type === 'booster'
  const isFree      = item.price === 0
  const isOnSale    = item.originalPrice && item.originalPrice > item.price
  const discount    = isOnSale ? Math.round((1 - item.price / item.originalPrice) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.05 }}
      whileHover={{
        y: -5,
        boxShadow: `0 14px 40px ${rarity.glow}`,
        borderColor: rarity.border,
        transition: { duration: 0.22 },
      }}
      style={{
        background: item.previewGradient || 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${owned ? `${accent}30` : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '18px',
        padding: '22px',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
      }} />

      {isOnSale && (
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(255,64,96,0.15)', border: '1px solid rgba(255,64,96,0.3)',
          borderRadius: '8px', padding: '2px 8px',
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: '0.65rem', color: '#FF4060',
        }}>
          -{discount}%
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <motion.div
          animate={item.rarity === 'legendary' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: `${accent}14`,
            border: `1px solid ${accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: item.rarity === 'legendary' ? `0 0 20px ${accent}30` : 'none',
          }}
        >
          {item.icon}
        </motion.div>

        <RarityBadge rarity={item.rarity} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <h3 style={{
            fontFamily: '"Syne", sans-serif', fontWeight: 700,
            fontSize: '0.95rem', color: '#fff',
            letterSpacing: '-0.01em', margin: 0,
          }}>
            {item.name}
          </h3>
          {owned && active && (
            <div style={{
              background: `${accent}15`, border: `1px solid ${accent}30`,
              borderRadius: '6px', padding: '1px 7px',
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem',
              fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Active
            </div>
          )}
        </div>

        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.48)', lineHeight: 1.55, margin: 0,
        }}>
          {item.description}
        </p>

        {isBooster && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '10px',
            background: `${accent}0E`, border: `1px solid ${accent}22`,
            borderRadius: '8px', padding: '4px 10px',
          }}>
            {item.effect.xpMultiplier > 1 && (
              <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: accent }}>
                {item.effect.xpMultiplier}× XP
              </span>
            )}
            {item.effect.coinMultiplier > 1 && (
              <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#00FF88' }}>
                {item.effect.coinMultiplier}× Coins
              </span>
            )}
            {item.effect.streakShield && (
              <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF6B35' }}>
                Streak Shield
              </span>
            )}
            {item.effect.durationDays > 0 && (
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                · {item.effect.durationDays}d
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          {isOnSale && (
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>
              {item.originalPrice}
            </span>
          )}
          <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.05rem', color: isFree ? '#00FF88' : '#FFB800' }}>
            {isFree ? 'Free' : item.price.toLocaleString()}
          </span>
          {!isFree && <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>coins</span>}
        </div>

        {owned ? (
          item.type === 'cosmetic' || item.type === 'theme' ? (
            <motion.button
              whileHover={!active ? { scale: 1.04 } : {}}
              whileTap={!active ? { scale: 0.96 } : {}}
              onClick={() => !active && onActivate?.(item)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: active ? `${accent}15` : `${accent}22`,
                color: accent,
                border: `1px solid ${accent}${active ? '30' : '40'}`,
                fontFamily: '"Syne", sans-serif',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: active ? 'default' : 'pointer',
              }}
            >
              {active ? '✓ Equipped' : 'Equip'}
            </motion.button>
          ) : (
            <div style={{
              padding: '8px 14px', borderRadius: '10px',
              background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)',
              fontFamily: '"Syne", sans-serif', fontWeight: 700,
              fontSize: '0.78rem', color: '#00FF88',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              Owned
            </div>
          )
        ) : (
          <motion.button
            whileHover={canAfford ? {
              scale: 1.04,
              boxShadow: `0 6px 22px ${accent}35`,
            } : {}}
            whileTap={canAfford ? { scale: 0.96 } : {}}
            onClick={() => canAfford && onBuy?.(item)}
            disabled={!canAfford}
            style={{
              padding: '8px 18px', borderRadius: '10px', border: 'none',
              background: canAfford
                ? `linear-gradient(135deg, ${accent}, ${accent}CC)`
                : 'rgba(255,255,255,0.06)',
              color: canAfford ? '#000' : 'rgba(255,255,255,0.25)',
              fontFamily: '"Syne", sans-serif', fontWeight: 700,
              fontSize: '0.78rem',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            {canAfford ? (
              <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> Buy</>
            ) : `+${(item.price - 0).toLocaleString()} needed`}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}