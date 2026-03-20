import { useState } from 'react'
import { motion } from 'framer-motion'

const blockVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: i * 0.08 } }),
}

// ── Memory diagram block ─────────────────────────────────
function DiagramBlock({ block, accentColor }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: '8px' }}>
        {block.cells.map((cell, i) => (
          <div key={i} style={{ flexShrink: 0, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
              style={{
                width: '72px', height: '44px',
                background: `${accentColor}0F`,
                border: `1px solid ${accentColor}35`,
                borderRight: i < block.cells.length - 1 ? 'none' : `1px solid ${accentColor}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem',
                fontWeight: 600, color: accentColor,
              }}
            >
              {cell}
            </motion.div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
              [{i}]
            </div>
            {block.addresses && (
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
                {block.addresses[i]}
              </div>
            )}
          </div>
        ))}
      </div>
      {block.caption && (
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '10px', fontStyle: 'italic' }}>
          {block.caption}
        </p>
      )}
    </div>
  )
}

// ── Code block ───────────────────────────────────────────
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#FF5F57', '#FFBD2E', '#28CA41'].map(c => (
            <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.6 }} />
          ))}
        </div>
        <button onClick={handleCopy} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem',
          color: copied ? '#00FF88' : 'rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', gap: '5px',
          transition: 'color 0.2s',
        }}>
          {copied ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Copied</>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy</>
          )}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: '18px',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.85rem', lineHeight: 1.7,
        color: 'rgba(255,255,255,0.88)',
        overflowX: 'auto', tabSize: 2,
      }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ── Callout block ────────────────────────────────────────
function CalloutBlock({ text, variant }) {
  const styles = {
    warning: { bg: 'rgba(255,184,0,0.07)', border: 'rgba(255,184,0,0.25)', color: '#FFB800', icon: '⚠' },
    info:    { bg: 'rgba(0,245,255,0.06)', border: 'rgba(0,245,255,0.2)',  color: '#00F5FF', icon: 'ℹ' },
    tip:     { bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.2)',  color: '#00FF88', icon: '→' },
  }
  const s = styles[variant] || styles.info

  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px',
      padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: '0.9rem', color: s.color, flexShrink: 0, marginTop: '1px' }}>{s.icon}</span>
      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  )
}

/**
 * LectureSection
 * @param {array}   blocks        — content blocks (fallback text content)
 * @param {string}  lectureVideo  — path to mp4 file (e.g. '/lectures/level-1.mp4'), optional
 * @param {string}  accentColor
 * @param {function} onComplete
 * @param {number}  upToBlock     — optional gating for mid-quiz mode
 */
export default function LectureSection({ blocks, lectureVideo, accentColor, onComplete, upToBlock }) {
  const visibleBlocks = upToBlock !== undefined ? blocks.slice(0, upToBlock + 1) : blocks
  const allVisible = visibleBlocks.length === blocks.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Video player — shown when lectureVideo is provided ── */}
      {lectureVideo && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${accentColor}25`,
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: `1px solid ${accentColor}15`,
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: `${accentColor}15`, border: `1px solid ${accentColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accentColor, flexShrink: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
              Lecture Video
            </span>
            <span style={{
              marginLeft: 'auto',
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.2)',
            }}>
              📁 <code style={{ color: `${accentColor}80` }}>{lectureVideo}</code>
            </span>
          </div>
          {/* Native video element — src is easy to swap */}
          <video
            controls
            style={{ width: '100%', display: 'block', maxHeight: '420px', background: '#000' }}
            src={lectureVideo}
          >
            Your browser does not support the video tag.
          </video>
        </motion.div>
      )}

      {/* ── Content blocks (fallback text or supplemental notes) ── */}
      {visibleBlocks.map((block, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={blockVariants}
          initial="hidden"
          animate="show"
        >
          {block.heading && (
            <h2 style={{
              fontFamily: '"Syne", sans-serif', fontWeight: 700,
              fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: '#fff',
              letterSpacing: '-0.02em', marginBottom: '14px',
            }}>
              {block.heading}
            </h2>
          )}

          {block.type === 'intro' && (
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75 }}>
              {block.body}
            </p>
          )}

          {block.type === 'text' && (
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
              {block.body}
            </p>
          )}

          {block.type === 'diagram' && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '20px',
            }}>
              <DiagramBlock block={block} accentColor={accentColor} />
            </div>
          )}

          {block.type === 'code' && <CodeBlock code={block.code} />}

          {block.type === 'callout' && <CalloutBlock text={block.text} variant={block.variant} />}
        </motion.div>
      ))}

      {/* ── Continue button — only when all blocks visible ── */}
      {allVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: `0 8px 28px ${accentColor}40` }}
            whileTap={{ scale: 0.97 }}
            onClick={onComplete}
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #0080FF)`,
              color: '#000', border: 'none', borderRadius: '12px',
              padding: '13px 32px',
              fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            Continue to Notes
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
