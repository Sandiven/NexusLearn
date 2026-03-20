import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import useAuthStore         from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import DashboardNavbar      from '@components/layout/DashboardNavbar'
import Sidebar              from '@components/layout/Sidebar'
import api                  from '@services/api'

import DoorCard      from './DoorCard'
import FinalDoor     from './FinalDoor'
import QuestionPanel from './QuestionPanel'
import ResultScreen  from './ResultScreen'
import {
  DOOR_CONFIG,
  DOOR_REWARDS,
  getQuestionForDoor,
  getFinalQuestion,
} from './gameData'

// ── Game stages ───────────────────────────────────────────
const STAGE = {
  INTRO:         'intro',
  SELECTING:     'selecting',
  DOOR_OPENING:  'doorOpening',
  QUESTION:      'question',
  BETWEEN:       'between',       // brief transition after correct answer
  FINAL_DOOR:    'finalDoor',
  FINAL_OPENING: 'finalOpening',
  FINAL_QUESTION:'finalQuestion',
  WIN:           'win',
  LOSE:          'lose',
}

// Fresh game state — extracted so restart is clean
function freshState() {
  return {
    stage:           STAGE.INTRO,
    selectedDoor:    null,   // 'fire' | 'water' | 'stone'
    currentQuestion: null,
    finalQuestion:   null,
    rewardGranted:   false,
    xpAwarded:       0,
    coinsAwarded:    0,
  }
}

// ── Background glow per selected door ─────────────────────
function SceneGlow({ door }) {
  if (!door) return null
  const cfg = DOOR_CONFIG[door]
  return (
    <motion.div
      key={door}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse 60% 50% at 50% 20%, ${cfg.glowColor.replace('0.55', '0.06')} 0%, transparent 70%)`,
      }}
    />
  )
}

// ── Section heading ───────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        fontFamily: '"DM Sans", sans-serif',
        fontSize: '0.82rem',
        color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        margin: 0,
        textAlign: 'center',
      }}
    >
      {text}
    </motion.p>
  )
}

// ─────────────────────────────────────────────────────────
// Main GamePage
// ─────────────────────────────────────────────────────────
export default function GamePage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const addXPLocal    = useGamificationStore(s => s.addXPLocal)
  const addCoinsLocal = useGamificationStore(s => s.addCoinsLocal)
  const fetchProgress = useGamificationStore(s => s.fetchProgress)

  const [sidebar, setSidebar]   = useState(true)
  const [game, setGame]         = useState(freshState)
  const rewardCalledRef         = useRef(false)  // prevent double-reward on strict-mode double mount

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // ── Game actions ─────────────────────────────────────────

  const startGame = () => {
    setGame({ ...freshState(), stage: STAGE.SELECTING })
    rewardCalledRef.current = false
  }

  const selectDoor = (doorId) => {
    if (game.stage !== STAGE.SELECTING) return
    setGame(g => ({
      ...g,
      stage:           STAGE.DOOR_OPENING,
      selectedDoor:    doorId,
      currentQuestion: getQuestionForDoor(doorId),
    }))
    // Door opening animation delay before showing question
    setTimeout(() => {
      setGame(g => g.stage === STAGE.DOOR_OPENING
        ? { ...g, stage: STAGE.QUESTION }
        : g
      )
    }, 700)
  }

  const handleCorrect = () => {
    // Door answered correctly → transition to final door
    setGame(g => ({ ...g, stage: STAGE.BETWEEN }))
    setTimeout(() => {
      setGame(g => ({
        ...g,
        stage:         STAGE.FINAL_DOOR,
        finalQuestion: getFinalQuestion(),
      }))
    }, 600)
  }

  const handleWrong = () => {
    setGame(g => ({ ...g, stage: STAGE.LOSE }))
  }

  const openFinalDoor = () => {
    if (game.stage !== STAGE.FINAL_DOOR) return
    setGame(g => ({ ...g, stage: STAGE.FINAL_OPENING }))
    setTimeout(() => {
      setGame(g => g.stage === STAGE.FINAL_OPENING
        ? { ...g, stage: STAGE.FINAL_QUESTION }
        : g
      )
    }, 750)
  }

  const handleFinalCorrect = useCallback(async () => {
    if (rewardCalledRef.current) return
    rewardCalledRef.current = true

    const xp    = DOOR_REWARDS.final.xp
    const coins = DOOR_REWARDS.final.coins

    setGame(g => ({ ...g, stage: STAGE.WIN, xpAwarded: xp, coinsAwarded: coins, rewardGranted: true }))

    // Optimistic UI update — instant feedback
    addXPLocal(xp)
    addCoinsLocal(coins)

    // Persist to backend safely via existing endpoints
    try {
      await Promise.all([
        api.post('/rewards/xp',    { event: 'ATTENTION_QUIZ_CORRECT', amount: xp }),
        api.post('/rewards/coins', { event: 'ATTENTION_QUIZ_CORRECT', amount: coins }),
      ])
      // Refresh store from server to keep it accurate
      await fetchProgress()
    } catch {
      // Optimistic update already applied — silent fail is acceptable here
    }
  }, [addXPLocal, addCoinsLocal, fetchProgress])

  const handleFinalWrong = () => {
    setGame(g => ({ ...g, stage: STAGE.LOSE }))
  }

  const restart = () => {
    rewardCalledRef.current = false
    setGame({ ...freshState(), stage: STAGE.SELECTING })
  }

  const exitGame = () => navigate('/dashboard')

  // ── Derived helpers ──────────────────────────────────────
  const { stage, selectedDoor, currentQuestion, finalQuestion } = game
  const selCfg      = selectedDoor ? DOOR_CONFIG[selectedDoor] : null
  const accentColor = selCfg?.rimColor || '#00F5FF'

  // Door display state per door
  function doorState(id) {
    if (stage === STAGE.SELECTING) return 'idle'
    if (!selectedDoor)             return 'idle'
    if (id === selectedDoor) {
      if (stage === STAGE.DOOR_OPENING || stage === STAGE.QUESTION) return 'open'
      return 'focused'
    }
    return 'unfocused'
  }

  const showDoors        = [STAGE.SELECTING, STAGE.DOOR_OPENING, STAGE.QUESTION].includes(stage)
  const showQuestion     = stage === STAGE.QUESTION
  const showFinalDoor    = [STAGE.FINAL_DOOR, STAGE.FINAL_OPENING, STAGE.FINAL_QUESTION].includes(stage)
  const showFinalQ       = stage === STAGE.FINAL_QUESTION
  const finalDoorIsOpen  = stage === STAGE.FINAL_OPENING || stage === STAGE.FINAL_QUESTION
  const showResult       = stage === STAGE.WIN || stage === STAGE.LOSE

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B12', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Ambient scene glow */}
      <AnimatePresence>
        {selectedDoor && !showResult && <SceneGlow door={selectedDoor} />}
      </AnimatePresence>

      {/* Navbar — no Daily Challenge needed here, pass noop */}
      <DashboardNavbar onOpenChallenge={() => {}} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebar} onToggle={() => setSidebar(p => !p)} />

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 24px 80px' }}>

          <AnimatePresence mode="wait">

            {/* ── INTRO ─────────────────────────────────────── */}
            {stage === STAGE.INTRO && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', maxWidth: '500px', width: '100%', paddingTop: '40px' }}
              >
                {/* Logo mark */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="1.8">
                    <rect x="3" y="3" width="7" height="11" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="13" width="7" height="7" rx="1"/>
                    <rect x="3" y="17" width="7" height="4" rx="1"/>
                  </svg>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h1 style={{
                    fontFamily: '"Syne", sans-serif', fontWeight: 800,
                    fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                    color: '#fff', letterSpacing: '-0.03em', margin: '0 0 10px',
                  }}>
                    Door<span style={{ color: '#00F5FF' }}>Quest</span>
                  </h1>
                  <p style={{
                    fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0,
                  }}>
                    Choose your door. Answer the challenge. Conquer the Grand Door.
                  </p>
                </div>

                {/* How to play */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '20px 24px', width: '100%',
                }}>
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>
                    How it works
                  </div>
                  {[
                    ['Select a door', 'Fire (Hard), Water (Medium), or Stone (Easy)'],
                    ['Answer the MCQ', 'One shot — choose carefully'],
                    ['Face the Grand Door', 'One final hard challenge'],
                    ['Win rewards', `${DOOR_REWARDS.final.xp} XP + ${DOOR_REWARDS.final.coins} Coins on success`],
                  ].map(([title, desc]) => (
                    <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00F5FF', marginTop: '7px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>{title}</span>
                        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(0,245,255,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startGame}
                  style={{
                    padding: '14px 48px',
                    background: 'linear-gradient(135deg, rgba(0,245,255,0.18), rgba(0,245,255,0.08))',
                    border: '1px solid rgba(0,245,255,0.35)',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem',
                    color: '#00F5FF', letterSpacing: '0.04em',
                    boxShadow: '0 0 0 rgba(0,245,255,0)',
                    transition: 'box-shadow 0.3s',
                  }}
                >
                  Play Game
                </motion.button>
              </motion.div>
            )}

            {/* ── DOOR SELECTION + QUESTION ─────────────────── */}
            {showDoors && (
              <motion.div
                key="doors"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '56px', width: '100%', maxWidth: '900px' }}
              >
                {/* Stage label */}
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{
                    fontFamily: '"Syne", sans-serif', fontWeight: 800,
                    fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                    color: '#fff', margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                  }}>
                    {stage === STAGE.SELECTING ? 'Choose Your Door' : (selCfg?.label || 'Your Door')}
                  </h2>
                  <SectionLabel text={stage === STAGE.SELECTING ? 'Select a path to begin' : `${selCfg?.difficulty} Challenge`} />
                </div>

                {/* Door row */}
                <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center', paddingBottom: '70px' }}>
                  {Object.values(DOOR_CONFIG).map(cfg => (
                    <DoorCard
                      key={cfg.id}
                      config={cfg}
                      state={doorState(cfg.id)}
                      onClick={() => selectDoor(cfg.id)}
                    />
                  ))}
                </div>

                {/* Question panel */}
                <AnimatePresence>
                  {showQuestion && currentQuestion && (
                    <motion.div key="question" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <QuestionPanel
                        question={currentQuestion}
                        accentColor={accentColor}
                        isFinal={false}
                        onCorrect={handleCorrect}
                        onWrong={handleWrong}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── BETWEEN / TRANSITION ─────────────────────── */}
            {stage === STAGE.BETWEEN && (
              <motion.div
                key="between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(0,255,136,0.08)',
                    border: '1.5px solid rgba(0,255,136,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </motion.div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                  Door cleared — the Grand Door approaches…
                </p>
              </motion.div>
            )}

            {/* ── FINAL DOOR ────────────────────────────────── */}
            {showFinalDoor && (
              <motion.div
                key="finaldoor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '80px', width: '100%', maxWidth: '700px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{
                    fontFamily: '"Syne", sans-serif', fontWeight: 800,
                    fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                    color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em',
                  }}>
                    The Grand Door
                  </h2>
                  <SectionLabel text="One final challenge" />
                </div>

                {/* Grand door */}
                <div style={{ marginBottom: '80px' }}>
                  <FinalDoor isOpen={finalDoorIsOpen} onClick={openFinalDoor} />
                </div>

                {/* Final question */}
                <AnimatePresence>
                  {showFinalQ && finalQuestion && (
                    <motion.div key="finalq" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <QuestionPanel
                        question={finalQuestion}
                        accentColor="#C06AFF"
                        isFinal={true}
                        onCorrect={handleFinalCorrect}
                        onWrong={handleFinalWrong}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── RESULT ───────────────────────────────────── */}
            {showResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
              >
                <ResultScreen
                  outcome={stage === STAGE.WIN ? 'win' : 'lose'}
                  xpAwarded={game.xpAwarded}
                  coinsAwarded={game.coinsAwarded}
                  onRestart={restart}
                  onExit={exitGame}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
