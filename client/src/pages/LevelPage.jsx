import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@store/authStore'

import DashboardNavbar  from '@components/layout/DashboardNavbar'
import Sidebar          from '@components/layout/Sidebar'
import QuizProgress     from '@components/level/QuizProgress'
import LectureSection   from '@components/level/LectureSection'
import NotesSection     from '@components/level/NotesSection'
import QuizCard         from '@components/level/QuizCard'
import RewardModal      from '@components/ui/RewardModal'
import AvatarAssistant  from '@components/avatar/AvatarAssistant'

import { getLevelData, PHASE, calcScore } from '@/data/quizData'
import eventBus, { EVENTS } from '@/eventBus'
import api from '@services/api'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}
const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.22 } },
}

// ── Multi-question quiz runner ─────────────────────────────────────────
function QuizRunner({ questions, onComplete, accentColor, phaseLabel }) {
  const [currentQ, setCurrentQ] = useState(0)
  // answers array — one entry per question, stored as we go
  const answersRef = useRef([])

  // Reset when questions change (retry)
  useEffect(() => {
    answersRef.current = []
    setCurrentQ(0)
  }, [questions])

  const handleAnswer = (isCorrect, selectedIndex) => {
    // Append this answer — use the ref so we never read stale closure state
    answersRef.current = [...answersRef.current, selectedIndex]
    const newAnswers = answersRef.current

    if (currentQ + 1 >= questions.length) {
      // All questions answered — compute score from the complete answers array
      const score = calcScore(newAnswers, questions)
      onComplete(score, newAnswers)
    } else {
      setCurrentQ(currentQ + 1)
    }
  }

  if (!questions || questions.length === 0) {
    return (
      <div style={{ fontFamily: '"DM Sans", sans-serif', color: 'rgba(255,255,255,0.4)', padding: '32px', textAlign: 'center' }}>
        No questions available for this section.
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentQ} variants={contentVariants} initial="initial" animate="animate" exit="exit">
        <QuizCard
          question={questions[currentQ]}
          questionNumber={currentQ + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          accentColor={accentColor}
        />
      </motion.div>
    </AnimatePresence>
  )
}

// ── Score result card ──────────────────────────────────────────────────
function ScoreCard({ score, passed, passingScore, onRetry, onNextLevel, hasNextLevel, accentColor, label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${passed ? 'rgba(0,255,136,0.3)' : 'rgba(255,100,100,0.3)'}`, borderRadius: '20px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: passed ? 'rgba(0,255,136,0.12)' : 'rgba(255,100,100,0.12)', border: `2px solid ${passed ? '#00FF88' : '#FF6B6B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.6rem', color: passed ? '#00FF88' : '#FF6B6B' }}>{score}%</span>
      </div>
      <div>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff', margin: '0 0 6px' }}>
          {passed ? `${label} Passed!` : `${label} — Try Again`}
        </h3>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          {passed ? 'Well done! You passed this level.' : `You need ${passingScore}% to pass. Keep going!`}
        </p>
      </div>
      {passed && hasNextLevel && (
        <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,245,255,0.3)' }} whileTap={{ scale: 0.97 }} onClick={onNextLevel}
          style={{ padding: '13px 36px', background: 'linear-gradient(135deg, #00F5FF, #0080FF)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Move to Next Level
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </motion.button>
      )}
      {!passed && (
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onRetry}
          style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
          Retry Test
        </motion.button>
      )}
    </motion.div>
  )
}

// ── Locked section placeholder ─────────────────────────────────────────
function LockedSection({ label, reason }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      </div>
      <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{label} Locked</h3>
      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>{reason}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Main LevelPage
// ─────────────────────────────────────────────────────────────────────
export default function LevelPage() {
  const { isAuthenticated } = useAuthStore()
  const { subjectId, levelId } = useParams()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [phase,            setPhase]            = useState(PHASE.LECTURE)
  const [showReward,       setShowReward]        = useState(false)
  const [finalScore,       setFinalScore]        = useState(null)
  const [levelCompleted,   setLevelCompleted]    = useState(false)
  const [totalLevels,      setTotalLevels]       = useState(10)

  // Content state from DB
  const [lectureCompleted, setLectureCompleted]  = useState(false)
  const [notesCompleted,   setNotesCompleted]    = useState(false)
  const [testCompleted,    setTestCompleted]      = useState(false)
  const [testScore,        setTestScore]          = useState(null)
  const [testPassed,       setTestPassed]         = useState(false)
  const [showTestResult,   setShowTestResult]     = useState(false)

  const [quizKey, setQuizKey] = useState(0)  // force remount on retry

  const subjectSlug = subjectId || 'data-structures'
  const lvlNum      = parseInt(levelId) || 1
  const level       = getLevelData(lvlNum)
  const accent      = level.accentColor
  const hasCumulative = level.hasCumulative
  const TOTAL_LEVELS  = totalLevels || 10
  const hasNextLevel  = lvlNum < TOTAL_LEVELS

  // ── Load existing progress ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const progressRes = await api.get(`/levels/subject/${subjectSlug}/progress`)
        const respData = progressRes.data.data
        setTotalLevels(respData.levels?.length || 10)

        const lvlProgress = respData.levels?.find(l => l.levelNumber === lvlNum)
        if (lvlProgress?.progress) {
          const p = lvlProgress.progress
          // If level is passed, all sections are unlocked/completed
          const lc = p.lectureCompleted || p.passed || false
          const nc = p.notesCompleted   || p.passed || false
          const tc = p.testCompleted     || p.passed || false
          setLectureCompleted(lc)
          setNotesCompleted(nc)
          setTestCompleted(tc)
          if (p.contentTestScore != null) {
            setTestScore(p.contentTestScore)
            setTestPassed(p.contentTestScore >= (level.passingScore || 70))
          }
          if (p.passed) {
            setLevelCompleted(true)
            setFinalScore(p.cumulativeScore ?? p.contentTestScore ?? null)
          }
          // Always restore to LECTURE so user can freely navigate unlocked sections
          setPhase(PHASE.LECTURE)
        }
      } catch (err) {
        console.warn('Failed to load progress:', err)
      }
    }
    load()
  }, [subjectSlug, lvlNum])

  // ── Mark lecture complete ─────────────────────────────────────────────
  const handleLectureComplete = useCallback(async () => {
    setLectureCompleted(true)
    setPhase(PHASE.NOTES)
    try {
      await api.post('/levels/progress/update', { levelId: lvlNum, subjectSlug, field: 'lectureCompleted' })
    } catch (e) { console.warn('Progress save failed (lecture)') }
  }, [lvlNum, subjectSlug])

  // ── Mark notes complete ───────────────────────────────────────────────
  const handleNotesComplete = useCallback(async () => {
    setNotesCompleted(true)
    setPhase(PHASE.CONTENT_TEST)
    try {
      await api.post('/levels/progress/update', { levelId: lvlNum, subjectSlug, field: 'notesCompleted' })
    } catch (e) { console.warn('Progress save failed (notes)') }
  }, [lvlNum, subjectSlug])

  // ── Submit content test ───────────────────────────────────────────────
  // FIX: answers are passed in directly — never read from stale state
  const handleContentTestComplete = useCallback(async (score, answers) => {
    try {
      // Server-side scoring (authoritative) — send the answers we just collected
      const result = await api.post('/levels/complete', {
        levelId: lvlNum, subjectSlug, phase: 'content_test', answers,
      })
      const serverScore  = result.data.data.score
      const serverPassed = result.data.data.passed
      setTestScore(serverScore)
      setTestPassed(serverPassed)
      setTestCompleted(true)

      if (serverPassed && !hasCumulative) {
        setLevelCompleted(true)
        setFinalScore(serverScore)
        setShowReward(true)
        setPhase(PHASE.COMPLETE)
      } else if (serverPassed && hasCumulative) {
        setPhase(PHASE.CUMULATIVE)
        setShowTestResult(false)
      } else {
        setShowTestResult(true)
      }
    } catch (e) {
      // API unavailable — use local score as fallback
      console.warn('API scoring failed — using local score')
      const passed = score >= (level.passingScore || 70)
      setTestScore(score)
      setTestPassed(passed)
      setTestCompleted(true)
      setShowTestResult(true)
      if (passed && !hasCumulative) {
        setLevelCompleted(true)
        setFinalScore(score)
        setShowReward(true)
        setPhase(PHASE.COMPLETE)
      } else if (passed && hasCumulative) {
        setPhase(PHASE.CUMULATIVE)
        setShowTestResult(false)
      }
    }
  }, [lvlNum, subjectSlug, level, hasCumulative])

  // ── Submit cumulative test ────────────────────────────────────────────
  const handleCumulativeComplete = useCallback(async (score, answers) => {
    try {
      const result = await api.post('/levels/complete', {
        levelId: lvlNum, subjectSlug, phase: 'cumulative', answers,
      })
      const serverScore  = result.data.data.score
      const serverPassed = result.data.data.passed
      setFinalScore(serverScore)
      if (serverPassed) {
        setLevelCompleted(true)
        setPhase(PHASE.COMPLETE)
        setShowReward(true)
      } else {
        setTestScore(serverScore)
        setTestPassed(false)
        setShowTestResult(true)
      }
    } catch (e) {
      console.warn('API cumulative scoring failed — using local score')
      const passed = score >= (level.passingScore || 70)
      setFinalScore(score)
      if (passed) {
        setLevelCompleted(true)
        setPhase(PHASE.COMPLETE)
        setShowReward(true)
      } else {
        setTestScore(score)
        setTestPassed(false)
        setShowTestResult(true)
      }
    }
  }, [lvlNum, subjectSlug, level])

  const handleRetryTest = () => {
    setShowTestResult(false)
    setQuizKey(k => k + 1)
  }

  const handleRewardContinue = () => {
    eventBus.emit(EVENTS.LEVEL_COMPLETED, { levelId: lvlNum, subjectSlug })
    setShowReward(false)
    // If there's a next level, go there; otherwise go back to subject map
    if (hasNextLevel) {
      navigate(`/subject/${subjectSlug}/level/${lvlNum + 1}`)
    } else {
      navigate(`/subject/${subjectSlug}`)
    }
  }

  const handleMoveToNextLevel = () => {
    eventBus.emit(EVENTS.LEVEL_COMPLETED, { levelId: lvlNum, subjectSlug })
    navigate(`/subject/${subjectSlug}/level/${lvlNum + 1}`)
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const ctQuestions  = level.contentTest
  const cumQuestions = level.cumulativeQuiz

  // Current phase for the progress bar
  const progressPhase = phase === PHASE.COMPLETE ? PHASE.LECTURE : phase

  // Allow jumping to any unlocked section
  const handlePhaseSelect = (selectedPhase) => {
    setShowTestResult(false)
    setPhase(selectedPhase)
  }

  const phaseTitle = {
    [PHASE.LECTURE]:      `Level ${lvlNum}: ${level.title}`,
    [PHASE.NOTES]:        'Key Concepts',
    [PHASE.CONTENT_TEST]: 'Level Test',
    [PHASE.CUMULATIVE]:   'Final Assessment',
    [PHASE.COMPLETE]:     'Level Complete!',
  }[phase] || level.title

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${accent}06 0%, transparent 60%)` }} />

      <DashboardNavbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Phase progress bar — unlocked steps are clickable for revisiting */}
          <QuizProgress
            currentPhase={progressPhase}
            accentColor={accent}
            hasCumulative={hasCumulative}
            lectureUnlocked={true}
            notesUnlocked={lectureCompleted}
            testUnlocked={notesCompleted}
            cumulativeUnlocked={hasCumulative && testCompleted}
            onPhaseSelect={handlePhaseSelect}
          />

          {/* Content area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '760px' }}>

              {/* Phase heading */}
              <AnimatePresence mode="wait">
                <motion.div key={phase} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }} style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }} />
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{level.subject}</span>
                  </div>
                  <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>{phaseTitle}</h1>
                </motion.div>
              </AnimatePresence>

              {/* ── Phase content ── */}
              <AnimatePresence mode="wait">

                {/* LECTURE */}
                {phase === PHASE.LECTURE && (
                  <motion.div key="lecture" variants={contentVariants} initial="initial" animate="animate" exit="exit">
                    <LectureSection
                      blocks={level.lecture}
                      lectureVideo={level.lectureVideo}
                      accentColor={accent}
                      upToBlock={level.lecture.length - 1}
                      onComplete={handleLectureComplete}
                      alreadyCompleted={lectureCompleted}
                    />
                  </motion.div>
                )}

                {/* NOTES */}
                {phase === PHASE.NOTES && (
                  <motion.div key="notes" variants={contentVariants} initial="initial" animate="animate" exit="exit">
                    {lectureCompleted ? (
                      <NotesSection
                        notes={level.notes}
                        accentColor={accent}
                        onComplete={handleNotesComplete}
                        alreadyCompleted={notesCompleted}
                      />
                    ) : (
                      <LockedSection label="Notes" reason="Complete the lecture first to unlock the notes." />
                    )}
                  </motion.div>
                )}

                {/* CONTENT TEST */}
                {phase === PHASE.CONTENT_TEST && (
                  <motion.div key="content-test" variants={contentVariants} initial="initial" animate="animate" exit="exit">
                    {!lectureCompleted || !notesCompleted ? (
                      <LockedSection label="Test" reason="Complete the lecture and notes to unlock the test." />
                    ) : showTestResult ? (
                      <ScoreCard
                        score={testScore}
                        passed={testPassed}
                        passingScore={level.passingScore}
                        onRetry={handleRetryTest}
                        onNextLevel={handleMoveToNextLevel}
                        hasNextLevel={testPassed && !hasCumulative && hasNextLevel}
                        accentColor={accent}
                        label="Test"
                      />
                    ) : (
                      <>
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Test your understanding of this level</span>
                          </div>
                        </div>
                        <QuizRunner key={`ct-${quizKey}`} questions={ctQuestions} onComplete={handleContentTestComplete} accentColor={accent} phaseLabel="Content Test" />
                      </>
                    )}
                  </motion.div>
                )}

                {/* CUMULATIVE */}
                {phase === PHASE.CUMULATIVE && hasCumulative && (
                  <motion.div key="cumulative" variants={contentVariants} initial="initial" animate="animate" exit="exit">
                    {!testCompleted ? (
                      <LockedSection label="Final Assessment" reason="Complete and pass the level test first." />
                    ) : showTestResult ? (
                      <ScoreCard
                        score={finalScore}
                        passed={false}
                        passingScore={level.passingScore}
                        onRetry={handleRetryTest}
                        hasNextLevel={false}
                        accentColor="#FFB800"
                        label="Final Assessment"
                      />
                    ) : (
                      <>
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '10px', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
                            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Final Assessment — covers all topics up to this level. Score {level.passingScore}%+ to complete.</span>
                          </div>
                        </div>
                        <QuizRunner key={`cum-${quizKey}`} questions={cumQuestions} onComplete={handleCumulativeComplete} accentColor="#FFB800" phaseLabel="Final Assessment" />
                      </>
                    )}
                  </motion.div>
                )}

                {/* COMPLETE */}
                {phase === PHASE.COMPLETE && (
                  <motion.div key="complete" variants={contentVariants} initial="initial" animate="animate" exit="exit">
                    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                        style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,255,136,0.1)', border: '2px solid rgba(0,255,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      </motion.div>
                      <div>
                        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#fff', margin: '0 0 8px' }}>Level Complete!</h2>
                        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                          You've mastered <strong style={{ color: '#fff' }}>{level.title}</strong>.
                        </p>
                        {finalScore != null && (
                          <p style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#00FF88', marginTop: '8px' }}>
                            Score: {finalScore}%
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {hasNextLevel && (
                          <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,245,255,0.3)' }} whileTap={{ scale: 0.97 }} onClick={handleMoveToNextLevel}
                            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #00F5FF, #0080FF)', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Move to Next Level
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          </motion.button>
                        )}
                        {!hasNextLevel && (
                          <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(255,184,0,0.3)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate(`/subject/${subjectSlug}`)}
                            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #FFB800, #FF8C00)', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🏆 Course Complete!
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(`/subject/${subjectSlug}`)}
                          style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 600, fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)' }}>
                          Back to Subject Map
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Reward modal */}
      <RewardModal
        show={showReward}
        xp={level.xpReward}
        coins={level.coinReward}
        score={finalScore}
        passed={levelCompleted}
        levelTitle={level.title}
        onContinue={handleRewardContinue}
      />

      <AvatarAssistant />
    </motion.div>
  )
}
