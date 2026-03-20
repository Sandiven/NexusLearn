import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'
import api from '@services/api'

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const DIFFICULTY_COLOR = {
  Beginner:     '#00FF88',
  Intermediate: '#FFB800',
  Advanced:     '#FF4060',
}

// ── Setup modal for configuring a plan ───────────────────
function SetupModal({ plan, existing, onClose, onSave }) {
  const already = existing?.daysPerWeek || []
  const [days, setDays]     = useState(already.length ? already : [1,2,3,4,5])
  const [qpd,  setQpd]      = useState(existing?.questionsPerDay || 5)
  const [saving, setSaving] = useState(false)

  const toggleDay = (d) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (existing) {
        await api.patch(`/plans/${plan.id}/configure`, { daysPerWeek: days, questionsPerDay: qpd })
      } else {
        await api.post('/plans/enroll', { planId: plan.id, daysPerWeek: days, questionsPerDay: qpd })
      }
      onSave()
      onClose()
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setSaving(false)
    }
  }

  const accent = plan.accentColor || '#00F5FF'

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35, ease: [0.34, 1.1, 0.64, 1] }}
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: '460px', background: 'rgba(12,12,20,0.98)', backdropFilter: 'blur(24px)', border: `1px solid ${accent}30`, borderRadius: '20px', overflow: 'hidden' }}>

          <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
          <div style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff', marginBottom: '6px' }}>
              {existing ? 'Configure Plan' : 'Set Up Your Plan'}
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
              {plan.title}
            </p>

            {/* Day selector */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Study days
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DAY_LABELS.map((label, d) => {
                  const selected = days.includes(d)
                  return (
                    <motion.button key={d} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDay(d)}
                      style={{
                        width: '44px', height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: selected ? `${accent}15` : 'rgba(255,255,255,0.05)',
                        color: selected ? accent : 'rgba(255,255,255,0.4)',
                        fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.75rem',
                        boxShadow: selected ? `0 0 0 1px ${accent}50` : 'none',
                        transition: 'all 0.15s',
                      }}>
                      {label}
                    </motion.button>
                  )
                })}
              </div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                {days.length} day{days.length !== 1 ? 's' : ''} selected
              </div>
            </div>

            {/* Questions per day */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Questions per day
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setQpd(p => Math.max(1, p - 1))} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: accent, minWidth: '40px', textAlign: 'center' }}>{qpd}</div>
                <button onClick={() => setQpd(p => Math.min(50, p + 1))} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>per day</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button whileHover={{ scale: 1.02, boxShadow: `0 6px 24px ${accent}35` }} whileTap={{ scale: 0.97 }}
                onClick={handleSave} disabled={saving || days.length === 0}
                style={{ flex: 2, padding: '13px', background: days.length > 0 ? `linear-gradient(135deg, ${accent}, ${accent}BB)` : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', cursor: days.length > 0 ? 'pointer' : 'not-allowed', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.92rem', color: days.length > 0 ? '#000' : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {saving ? 'Saving…' : existing ? 'Save Changes' : 'Start Plan'}
              </motion.button>
              <motion.button whileHover={{ background: 'rgba(255,255,255,0.07)' }} onClick={onClose}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)' }}>
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Plan card ─────────────────────────────────────────────
function PlanCard({ cataloguePlan, userPlan, onConfigure, onProgress, index }) {
  const accent    = cataloguePlan.accentColor || '#00F5FF'
  const isEnrolled = !!userPlan && userPlan.status !== 'not_started'
  const isCompleted = userPlan?.status === 'completed'
  const progress  = userPlan ? (userPlan.questionsCompleted / userPlan.totalQuestions) : 0
  const pct       = Math.round(progress * 100)
  const diffColor = DIFFICULTY_COLOR[cataloguePlan.difficulty] || '#00F5FF'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, boxShadow: `0 14px 40px ${accent}18`, borderColor: `${accent}28`, transition: { duration: 0.22 } }}
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: `1px solid ${isEnrolled ? `${accent}25` : 'rgba(255,255,255,0.08)'}`, borderRadius: '18px', padding: '24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${accent}12`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.8rem', color: accent, flexShrink: 0 }}>
          {cataloguePlan.icon}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ background: `${diffColor}12`, border: `1px solid ${diffColor}28`, borderRadius: '8px', padding: '2px 9px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', fontWeight: 600, color: diffColor }}>
            {cataloguePlan.difficulty}
          </div>
          {isCompleted && (
            <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '8px', padding: '2px 9px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', fontWeight: 700, color: '#00FF88' }}>
              ✓ Done
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.98rem', color: '#fff', marginBottom: '5px' }}>
          {cataloguePlan.title}
        </h3>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.5, margin: 0 }}>
          {cataloguePlan.description}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '14px' }}>
        {[
          { label: 'Questions', value: cataloguePlan.totalQuestions },
          { label: 'Max Points', value: cataloguePlan.maxPoints },
          { label: 'Badge', value: cataloguePlan.badgeLabel },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress (only when enrolled) */}
      {isEnrolled && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
              {userPlan.questionsCompleted} / {userPlan.totalQuestions} questions
            </span>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.72rem', color: accent }}>{pct}%</span>
          </div>
          <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${accent}80, ${accent})`, borderRadius: '3px' }} />
          </div>
          <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: '#FF6B35' }}>🔥 {userPlan.currentStreak} day streak</span>
            {userPlan.streakBreaks > 0 && <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,80,80,0.7)' }}>⚡ {userPlan.streakBreaks} break{userPlan.streakBreaks !== 1 ? 's' : ''}</span>}
            {isCompleted && <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: '#FFB800' }}>★ {userPlan.earnedPoints} pts earned</span>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        {isCompleted ? (
          <div style={{ flex: 1, padding: '11px', textAlign: 'center', background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '11px', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#00FF88' }}>
            🏅 Badge Earned!
          </div>
        ) : isEnrolled ? (
          <motion.button whileHover={{ scale: 1.03, boxShadow: `0 6px 20px ${accent}35` }} whileTap={{ scale: 0.97 }}
            onClick={() => onProgress(cataloguePlan, userPlan)}
            style={{ flex: 1, padding: '11px', background: `linear-gradient(135deg, ${accent}, ${accent}BB)`, border: 'none', borderRadius: '11px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#000' }}>
            Log Today's Work
          </motion.button>
        ) : (
          <motion.button whileHover={{ scale: 1.03, boxShadow: `0 6px 20px ${accent}35` }} whileTap={{ scale: 0.97 }}
            onClick={() => onConfigure(cataloguePlan, null)}
            style={{ flex: 1, padding: '11px', background: `linear-gradient(135deg, ${accent}, ${accent}BB)`, border: 'none', borderRadius: '11px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            Start Plan
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ── Progress log modal ────────────────────────────────────
function ProgressModal({ plan, userPlan, onClose, onSaved }) {
  const [answered, setAnswered] = useState(userPlan?.questionsPerDay || 5)
  const [saving,   setSaving]   = useState(false)
  const [done,     setDone]     = useState(false)
  const accent = plan.accentColor || '#00F5FF'

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.post(`/plans/${plan.id}/progress`, { questionsAnswered: answered })
      setDone(true)
      setTimeout(() => { onSaved(res.data); onClose() }, 1400)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35, ease: [0.34, 1.1, 0.64, 1] }} onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: '380px', background: 'rgba(12,12,20,0.98)', backdropFilter: 'blur(24px)', border: `1px solid ${accent}30`, borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
          <div style={{ padding: '28px' }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
                <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#00FF88' }}>Progress Logged!</div>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '6px' }}>Log Today's Work</h2>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginBottom: '22px' }}>{plan.title}</p>
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Questions answered today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setAnswered(p => Math.max(1, p - 1))} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.6rem', color: accent, minWidth: '44px', textAlign: 'center' }}>{answered}</div>
                    <button onClick={() => setAnswered(p => p + 1)} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <motion.button whileHover={{ scale: 1.02, boxShadow: `0 6px 20px ${accent}35` }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                    style={{ flex: 2, padding: '12px', background: `linear-gradient(135deg, ${accent}, ${accent}BB)`, border: 'none', borderRadius: '11px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#000' }}>
                    {saving ? 'Saving…' : 'Log Progress'}
                  </motion.button>
                  <motion.button whileHover={{ background: 'rgba(255,255,255,0.07)' }} onClick={onClose}
                    style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '11px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)' }}>
                    Cancel
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main PlanPage ─────────────────────────────────────────
export default function PlanPage() {
  const { isAuthenticated } = useAuthStore()
  const fetchProgress = useGamificationStore(s => s.fetchProgress)
  const [sidebar,       setSidebar]       = useState(false)
  const [catalogue,     setCatalogue]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [setupTarget,   setSetupTarget]   = useState(null)  // { plan, userPlan }
  const [progressTarget,setProgressTarget]= useState(null)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const loadCatalogue = useCallback(() => {
    api.get('/plans/catalogue')
      .then(r => setCatalogue(r.data.data || []))
      .catch(() => setCatalogue([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadCatalogue() }, [loadCatalogue])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 65% 35% at 50% 0%, rgba(139,92,246,0.05) 0%, transparent 60%)' }} />
      <DashboardNavbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebar} onToggle={() => setSidebar(p => !p)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '100px', padding: '5px 14px', marginBottom: '14px' }}>
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', display: 'inline-block' }} />
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#8B5CF6', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Practice Plans
                </span>
              </div>
              <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '8px' }}>
                Stay consistent. Earn every badge.
              </h1>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.92rem', color: 'rgba(255,255,255,0.42)', maxWidth: '480px', lineHeight: 1.6 }}>
                Choose a structured plan, set your schedule, and track daily progress. Complete the full plan to unlock your badge — even if your streak breaks, you can still finish strong.
              </p>
            </motion.div>

            {/* Plans grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
                {[1,2,3,4,5].map(i => <div key={i} style={{ height: '280px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }} />)}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
                {catalogue.map((item, i) => (
                  <PlanCard
                    key={item.id}
                    cataloguePlan={item}
                    userPlan={item.userPlan}
                    index={i}
                    onConfigure={(plan, up) => setSetupTarget({ plan, userPlan: up })}
                    onProgress={(plan, up) => setProgressTarget({ plan, userPlan: up })}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {setupTarget && (
          <SetupModal
            plan={setupTarget.plan}
            existing={setupTarget.userPlan}
            onClose={() => setSetupTarget(null)}
            onSave={loadCatalogue}
          />
        )}
        {progressTarget && (
          <ProgressModal
            plan={progressTarget.plan}
            userPlan={progressTarget.userPlan}
            onClose={() => setProgressTarget(null)}
            onSaved={() => { setProgressTarget(null); loadCatalogue(); fetchProgress() }}
          />
        )}
      </AnimatePresence>

      <AvatarAssistant />
    </motion.div>
  )
}
