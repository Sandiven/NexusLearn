import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import useAuthStore from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'
import ContestTimer from '../components/ContestTimer'
import ContestQuestion from '../components/ContestQuestion'
import ContestResultModal from '../components/ContestResultModal'

import { getContestById, formatTime, MOCK_CONTESTS } from '@/data/contestData'

// ── Contest phases ────────────────────────────────────────
const PHASE = { LIST: 'list', LOBBY: 'lobby', ACTIVE: 'active', DONE: 'done' }

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

// ── Contest card for the list view ───────────────────────
function ContestCard({ contest, onStart }) {
  const now      = new Date()
  const start    = new Date(contest.startTime)
  const end      = new Date(contest.endTime)
  const isActive = now >= start && now <= end
  const isUpcoming = now < start

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${contest.accentColor}18`, borderColor: `${contest.accentColor}30` }}
      transition={{ duration: 0.22 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px', padding: '24px',
        position: 'relative', overflow: 'hidden',
        cursor: isActive ? 'pointer' : 'default',
      }}
    >
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${contest.accentColor}55, transparent)` }} />

      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: isActive ? 'rgba(0,255,136,0.1)' : isUpcoming ? `${contest.accentColor}10` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isActive ? 'rgba(0,255,136,0.3)' : isUpcoming ? `${contest.accentColor}30` : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '8px', padding: '3px 10px',
        }}>
          {isActive && (
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00FF88' }} />
          )}
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 600, color: isActive ? '#00FF88' : isUpcoming ? contest.accentColor : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isActive ? 'Live' : isUpcoming ? 'Upcoming' : 'Ended'}
          </span>
        </div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          {contest.questions?.length || 0}Q · {formatTime(contest.timeLimit)}
        </div>
      </div>

      <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.015em', marginBottom: '8px' }}>
        {contest.title}
      </h3>
      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, marginBottom: '18px' }}>
        {contest.description}
      </p>

      {/* Rewards preview */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
        {[
          { v: `+${contest.xpReward} XP`, c: '#00F5FF' },
          { v: `+${contest.coinReward} Coins`, c: '#FFB800' },
        ].map(r => (
          <div key={r.v} style={{ background: `${r.c}10`, border: `1px solid ${r.c}20`, borderRadius: '8px', padding: '4px 10px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: r.c }}>
            {r.v}
          </div>
        ))}
      </div>

      {/* CTA */}
      {isActive && (
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: `0 6px 24px ${contest.accentColor}35` }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onStart(contest)}
          style={{
            width: '100%', padding: '12px',
            background: `linear-gradient(135deg, ${contest.accentColor}, #0080FF)`,
            border: 'none', borderRadius: '12px', cursor: 'pointer',
            fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          Enter Contest
        </motion.button>
      )}
      {isUpcoming && (
        <div style={{ textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', padding: '10px 0' }}>
          Starts in {Math.round((start - now) / 60000)} minutes
        </div>
      )}
    </motion.div>
  )
}

// ── Lobby (instructions screen) ───────────────────────────
function ContestLobby({ contest, onBegin, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '560px', margin: '0 auto', padding: '24px' }}
    >
      <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${contest.accentColor}25`, borderRadius: '20px', padding: '36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px', background: `linear-gradient(90deg, transparent, ${contest.accentColor}, transparent)` }} />

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: 600, color: contest.accentColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Contest Briefing
          </div>
          <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.7rem', color: '#fff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {contest.title}
          </h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
            {contest.description}
          </p>
        </div>

        {/* Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {[
            { icon: '❓', label: `${contest.questions.length} questions` },
            { icon: '⏱', label: `${formatTime(contest.timeLimit)} total time` },
            { icon: '📊', label: 'Score = accuracy × speed' },
            { icon: '🏆', label: `Up to +${contest.xpReward} XP + +${contest.coinReward} Coins` },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '11px 14px' }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: `0 8px 32px ${contest.accentColor}40` }}
            whileTap={{ scale: 0.97 }}
            onClick={onBegin}
            style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, ${contest.accentColor}, #0080FF)`, border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            Start Contest
          </motion.button>
          <button onClick={onCancel} style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)' }}>
            Back
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main ContestPage ──────────────────────────────────────
export default function ContestPage() {
  const { isAuthenticated } = useAuthStore()
  const addXPLocal    = useGamificationStore(s => s.addXPLocal)
  const addCoinsLocal = useGamificationStore(s => s.addCoinsLocal)
  const navigate      = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [phase,            setPhase]            = useState(PHASE.LIST)
  const [activeContest,    setActiveContest]     = useState(null)
  const [currentQIdx,      setCurrentQIdx]       = useState(0)
  const [answers,          setAnswers]           = useState([])
  const [startMs,          setStartMs]           = useState(null)
  const [remaining,        setRemaining]         = useState(0)
  const [result,           setResult]            = useState(null)
  const timerRef = useRef(null)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const handleStartContest = (contest) => {
    setActiveContest(contest)
    setPhase(PHASE.LOBBY)
  }

  const handleBegin = () => {
    setCurrentQIdx(0)
    setAnswers([])
    setStartMs(Date.now())
    setRemaining(activeContest.timeLimit)
    setPhase(PHASE.ACTIVE)

    // Countdown tick
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleAnswer = useCallback((selectedIndex, isCorrect) => {
    const timeTaken = activeContest
      ? activeContest.timeLimit - remaining
      : 0

    const newAnswers = [...answers, { questionIndex: currentQIdx, selectedIndex, timeTaken }]
    setAnswers(newAnswers)

    const nextIdx = currentQIdx + 1
    if (nextIdx >= activeContest.questions.length) {
      clearInterval(timerRef.current)
      handleSubmit(false, newAnswers)
    } else {
      setCurrentQIdx(nextIdx)
    }
  }, [answers, currentQIdx, remaining, activeContest])

  const handleSubmit = useCallback((timedOut = false, finalAnswers = answers) => {
    if (!activeContest) return
    clearInterval(timerRef.current)

    const completionTime = activeContest.timeLimit - remaining
    const questions = activeContest.questions

    let correct = 0
    finalAnswers.forEach(ans => {
      if (questions[ans.questionIndex]?.correctIndex === ans.selectedIndex) correct++
    })

    const total    = questions.length
    const score    = correct * 100 + Math.max(0, Math.round((1 - completionTime / (activeContest.timeLimit * 1.5)) * correct * 30))
    const accuracy = total > 0 ? correct / total : 0
    const xpAwarded    = Math.round(accuracy >= 1 ? activeContest.xpReward : activeContest.participationXP + (activeContest.xpReward - activeContest.participationXP) * accuracy)
    const coinsAwarded = Math.round(accuracy >= 1 ? activeContest.coinReward : activeContest.coinReward * accuracy * 0.5)

    // Optimistic local update
    addXPLocal(xpAwarded)
    addCoinsLocal(coinsAwarded)

    setResult({ score, correct, total, rank: Math.ceil(Math.random() * 8) + 1, completionTime, xpAwarded, coinsAwarded })
    setPhase(PHASE.DONE)
  }, [answers, remaining, activeContest, addXPLocal, addCoinsLocal])

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Ambient bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,184,0,0.05) 0%, transparent 60%)' }} />

      <DashboardNavbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main style={{ flex: 1, overflowY: 'auto', padding: phase === PHASE.ACTIVE ? '0' : '28px' }}>
          <AnimatePresence mode="wait">

            {/* ── LIST ── */}
            {phase === PHASE.LIST && (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: '28px' }}>
                  <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#fff', letterSpacing: '-0.025em', marginBottom: '6px' }}>
                    Contests
                  </h1>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
                    Compete in timed challenges. Earn XP and climb the leaderboard.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {MOCK_CONTESTS.map(contest => (
                    <ContestCard key={contest._id} contest={contest} onStart={handleStartContest} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── LOBBY ── */}
            {phase === PHASE.LOBBY && activeContest && (
              <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ContestLobby
                  contest={activeContest}
                  onBegin={handleBegin}
                  onCancel={() => setPhase(PHASE.LIST)}
                />
              </motion.div>
            )}

            {/* ── ACTIVE ── */}
            {phase === PHASE.ACTIVE && activeContest && (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

                {/* Top bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 28px',
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  gap: '16px', flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                      Active Contest
                    </div>
                    <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>
                      {activeContest.title}
                    </h2>
                  </div>

                  <ContestTimer
                    totalSeconds={activeContest.timeLimit}
                    remaining={remaining}
                    isRunning={phase === PHASE.ACTIVE}
                    onExpire={() => handleSubmit(true)}
                    compact
                  />

                  {/* Score progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                      {currentQIdx + 1} / {activeContest.questions.length}
                    </span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {activeContest.questions.map((_, i) => (
                        <motion.div key={i} animate={{ background: i < currentQIdx ? '#00FF88' : i === currentQIdx ? activeContest.accentColor : 'rgba(255,255,255,0.12)' }}
                          style={{ width: '6px', height: '6px', borderRadius: '50%' }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Question area */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px' }}>
                  <div style={{ width: '100%', maxWidth: '660px' }}>
                    <AnimatePresence mode="wait">
                      <ContestQuestion
                        key={currentQIdx}
                        question={activeContest.questions[currentQIdx]}
                        questionIndex={currentQIdx}
                        totalQuestions={activeContest.questions.length}
                        onAnswer={handleAnswer}
                        accentColor={activeContest.accentColor}
                        autoAdvanceMs={900}
                      />
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Result modal */}
      {phase === PHASE.DONE && result && (
        <ContestResultModal
          result={result}
          contest={activeContest}
          onClose={() => { setPhase(PHASE.LIST); setResult(null); setActiveContest(null) }}
          onViewLeaderboard={() => {}}
        />
      )}

      <AvatarAssistant />
    </motion.div>
  )
}
