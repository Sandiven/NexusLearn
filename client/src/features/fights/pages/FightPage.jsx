// import { useState, useCallback, useEffect, useReducer, useRef } from 'react'
// import { useNavigate, Navigate, useLocation } from 'react-router-dom'
// import { motion, AnimatePresence } from 'framer-motion'
// import useAuthStore from '@store/authStore'
// import DashboardNavbar from '@components/layout/DashboardNavbar'
// import AvatarAssistant from '@components/avatar/AvatarAssistant'
// import FightCountdown from '../components/FightCountdown'
// import FightQuestion from '../components/FightQuestion'
// import FightScoreboard from '../components/FightScoreboard'
// import FightResultModal from '../components/FightResultModal'
// import { useFightSocket } from '../hooks/useFightSocket'
// import api from '@services/api'

// // ── Phases ─────────────────────────────────────────────────
// const PHASE = {
//   LOADING:    'loading',
//   SETUP:      'setup',
//   QUEUE:      'queue',
//   CHALLENGE:  'challenge',
//   WAITING:    'waiting',
//   LOBBY:      'lobby',
//   COUNTDOWN:  'countdown',
//   ACTIVE:     'active',
//   DONE:       'done',
// }

// const SUBJECTS = [
//   { slug: 'data-structures',   name: 'Data Structures',   accent: '#00F5FF', icon: '◈' },
//   { slug: 'algorithms',        name: 'Algorithms',        accent: '#8B5CF6', icon: '⚡' },
//   { slug: 'databases',         name: 'Databases',         accent: '#0080FF', icon: '◉' },
//   { slug: 'operating-systems', name: 'Operating Systems', accent: '#FFB800', icon: '◆' },
//   { slug: 'networks',          name: 'Networks',          accent: '#00FF88', icon: '◎' },
//   { slug: 'system-design',     name: 'System Design',     accent: '#FF6B35', icon: '★' },
// ]

// // ── Reducer ────────────────────────────────────────────────
// const initState = {
//   countdown: 3, currentQuestion: 0,
//   questions: [],
//   player1: null, player2: null,
//   scores: {}, result: null, timePerQuestion: 15,
// }
// function reducer(state, action) {
//   switch (action.type) {
//     case 'SET_PLAYERS':
//       return { ...state, player1: action.p1, player2: action.p2 }
//     case 'COUNTDOWN':
//       return { ...state, countdown: action.count }
//     case 'FIGHT_STARTED':
//       return {
//         ...state,
//         questions:       action.questions,
//         timePerQuestion: action.timePerQuestion || 15,
//         currentQuestion: action.currentQuestion ?? 0,
//       }
//     case 'SET_QUESTION':
//       return { ...state, currentQuestion: action.idx }
//     case 'SCORE_UPDATE': {
//       const { userId, score } = action
//       const p1 = state.player1?.userId === userId ? { ...state.player1, score } : state.player1
//       const p2 = state.player2?.userId === userId ? { ...state.player2, score } : state.player2
//       return { ...state, player1: p1, player2: p2, scores: { ...state.scores, [userId]: score } }
//     }
//     case 'NEXT_Q':       return { ...state, currentQuestion: action.idx }
//     case 'DONE':         return { ...state, result: action.result }
//     default:             return state
//   }
// }

// // ── Countdown display component (timestamp-based) ──────────
// // Uses countdownStartedAt from server so both clients are synchronized
// function LiveCountdown({ countdownStartedAt, countdownDuration, onExpired }) {
//   const [remaining, setRemaining] = useState(countdownDuration)
//   const expiredRef = useRef(false)

//   useEffect(() => {
//     if (!countdownStartedAt) return

//     const tick = () => {
//       const elapsed = Date.now() - new Date(countdownStartedAt).getTime()
//       const rem = Math.max(0, countdownDuration - Math.floor(elapsed / 1000))
//       setRemaining(rem)
//       if (rem === 0 && !expiredRef.current) {
//         expiredRef.current = true
//         // Give 500ms for animation, then call onExpired
//         setTimeout(() => onExpired?.(), 600)
//       }
//     }

//     tick()
//     const t = setInterval(tick, 200)
//     return () => clearInterval(t)
//   }, [countdownStartedAt, countdownDuration])

//   return <FightCountdown count={remaining} />
// }

// export default function FightPage() {
//   const { isAuthenticated, user, token } = useAuthStore()
//   const navigate   = useNavigate()
//   const location   = useLocation()

//   const [phase,             setPhase]             = useState(PHASE.LOADING)
//   const [subject,           setSubject]           = useState(null)
//   const [mode,              setMode]              = useState(null)
//   const [fightId,           setFightId]           = useState(null)
//   const [countdownStartedAt, setCountdownStartedAt] = useState(null)
//   const [queueMsg,          setQueueMsg]          = useState('')
//   const [friends,           setFriends]           = useState([])
//   const [frdLoad,           setFrdLoad]           = useState(false)
//   const [challengeError,    setChallengeError]    = useState(null)
//   const [fightState,        dispatch]             = useReducer(reducer, initState)

//   const syncPollRef  = useRef(null)   // polls DB for phase changes
//   const queuePollRef = useRef(null)   // polls for queue match
//   const phaseRef     = useRef(PHASE.LOADING)

//   if (!isAuthenticated) return <Navigate to="/login" replace />

//   const me     = user?._id || user?.id || ''
//   const myName = user?.username || 'You'

//   // Keep phaseRef in sync with phase state
//   useEffect(() => { phaseRef.current = phase }, [phase])

//   // ── Apply fight data from DB to state ─────────────────
//   const applyFight = useCallback((fight) => {
//     const p1 = fight.player1
//     const p2 = fight.player2
//     const subjectSlug = fight.subjectSlug || 'data-structures'
//     const subjectObj  = SUBJECTS.find(s => s.slug === subjectSlug) || SUBJECTS[0]

//     setSubject(subjectObj)
//     setFightId(fight._id?.toString() || fight._id)

//     dispatch({
//       type: 'SET_PLAYERS',
//       p1:   { userId: (p1.user?._id || p1.user)?.toString(), username: p1.user?.username || 'Player 1', avatar: (p1.user?.username || 'P1').slice(0,2).toUpperCase(), score: p1.score || 0 },
//       p2:   { userId: (p2.user?._id || p2.user)?.toString(), username: p2.user?.username || 'Player 2', avatar: (p2.user?.username || 'P2').slice(0,2).toUpperCase(), score: p2.score || 0 },
//     })

//     if (fight.questions?.length) {
//       dispatch({
//         type: 'FIGHT_STARTED',
//         questions:       fight.questions,
//         timePerQuestion: fight.timePerQuestion || 15,
//         currentQuestion: fight.currentQuestion || 0,
//       })
//     }

//     if (fight.countdownStartedAt) {
//       setCountdownStartedAt(fight.countdownStartedAt)
//     }
//   }, [])

//   // ── Sync poll: polls DB every 1.5s during LOBBY/COUNTDOWN ─
//   // This is the primary synchronization mechanism — reliable even without sockets
//   const startSyncPoll = useCallback((fid) => {
//     clearInterval(syncPollRef.current)

//     syncPollRef.current = setInterval(async () => {
//       if ([PHASE.ACTIVE, PHASE.DONE, PHASE.SETUP, PHASE.LOADING].includes(phaseRef.current)) {
//         clearInterval(syncPollRef.current)
//         return
//       }

//       try {
//         const r = await api.get(`/fights/${fid}`)
//         const fight = r.data.data
//         if (!fight) return

//         const status = fight.status

//         if (status === 'countdown' && fight.countdownStartedAt) {
//           // Countdown is live — set timestamp and switch to countdown phase
//           setCountdownStartedAt(fight.countdownStartedAt)
//           if (phaseRef.current !== PHASE.COUNTDOWN) setPhase(PHASE.COUNTDOWN)
//         } else if (status === 'active') {
//           clearInterval(syncPollRef.current)
//           if (fight.questions?.length) {
//             dispatch({ type: 'FIGHT_STARTED', questions: fight.questions, timePerQuestion: fight.timePerQuestion || 15, currentQuestion: fight.currentQuestion || 0 })
//           }
//           setPhase(PHASE.ACTIVE)
//         } else if (status === 'finished') {
//           clearInterval(syncPollRef.current)
//           setPhase(PHASE.DONE)
//         } else if (status === 'cancelled') {
//           clearInterval(syncPollRef.current)
//           resetToSetup()
//         }
//       } catch {}
//     }, 1500)
//   }, [])

//   // ── Countdown expired handler ─────────────────────────
//   const handleCountdownExpired = useCallback(async () => {
//     if (!fightId) return
//     // Call advance endpoint — server transitions to active if countdown is done
//     try {
//       const r = await api.post(`/fights/${fightId}/advance`)
//       const fight = r.data.data
//       if (fight?.status === 'active' && fight.questions?.length) {
//         dispatch({ type: 'FIGHT_STARTED', questions: fight.questions, timePerQuestion: fight.timePerQuestion || 15, currentQuestion: 0 })
//         setPhase(PHASE.ACTIVE)
//         clearInterval(syncPollRef.current)
//       }
//     } catch {
//       // Fallback — just transition locally
//       setPhase(PHASE.ACTIVE)
//     }
//   }, [fightId])

//   // ── On mount: detect and restore any active fight ─────
//   useEffect(() => {
//     const locState = location.state

//     async function init() {
//       const acceptedFightId = locState?.acceptedFightId
//       if (acceptedFightId) {
//         window.history.replaceState({}, '', '/fight')
//         await restoreFight(acceptedFightId)
//         return
//       }

//       try {
//         const res = await api.get('/fights/active')
//         if (res.data.data) {
//           await restoreFight(res.data.data._id?.toString(), res.data.data)
//           return
//         }
//       } catch {}

//       setPhase(PHASE.SETUP)
//     }

//     init()
//   }, [])

//   // ── Restore fight from DB ─────────────────────────────
//   const restoreFight = useCallback(async (fid, fightData) => {
//     try {
//       const fight = fightData || (await api.get(`/fights/${fid}`)).data.data
//       if (!fight) { setPhase(PHASE.SETUP); return }

//       applyFight(fight)

//       const fightIdStr = fight._id?.toString() || fid
//       const isPlayer1  = (fight.player1?.user?._id || fight.player1?.user)?.toString() === me

//       switch (fight.status) {
//         case 'invited':
//           if (isPlayer1) {
//             // I'm the challenger — show waiting, poll for acceptance
//             setPhase(PHASE.WAITING)
//             startWaitingPoll(fightIdStr)
//           } else {
//             // I'm the invitee and fight is still invited — go to lobby, call ready
//             setPhase(PHASE.LOBBY)
//             callReadyAndPoll(fightIdStr)
//           }
//           break

//         case 'accepted':
//           setPhase(PHASE.LOBBY)
//           callReadyAndPoll(fightIdStr)
//           break

//         case 'countdown':
//           setPhase(PHASE.COUNTDOWN)
//           startSyncPoll(fightIdStr)
//           break

//         case 'active':
//           setPhase(PHASE.ACTIVE)
//           break

//         case 'finished':
//           setPhase(PHASE.SETUP)
//           break

//         default:
//           setPhase(PHASE.SETUP)
//       }
//     } catch {
//       setPhase(PHASE.SETUP)
//     }
//   }, [me])

//   // ── Ready-up and start sync poll ──────────────────────
//   const callReadyAndPoll = useCallback(async (fid) => {
//     try {
//       const r = await api.post(`/fights/${fid}/ready`)
//       const fight = r.data.data
//       if (fight?.countdownStartedAt) setCountdownStartedAt(fight.countdownStartedAt)
//       if (fight?.status === 'countdown') setPhase(PHASE.COUNTDOWN)
//       else if (fight?.status === 'active') { setPhase(PHASE.ACTIVE); return }
//     } catch {}
//     startSyncPoll(fid)
//   }, [startSyncPoll])

//   // ── Poll while waiting for friend to accept ───────────
//   const startWaitingPoll = useCallback((fid) => {
//     clearInterval(syncPollRef.current)
//     syncPollRef.current = setInterval(async () => {
//       try {
//         const r = await api.get(`/fights/${fid}`)
//         const status = r.data.data?.status
//         if (status === 'accepted' || status === 'countdown' || status === 'active') {
//           clearInterval(syncPollRef.current)
//           if (status === 'active') {
//             applyFight(r.data.data)
//             setPhase(PHASE.ACTIVE)
//           } else {
//             setPhase(PHASE.LOBBY)
//             callReadyAndPoll(fid)
//           }
//         } else if (status === 'cancelled' || status === 'finished') {
//           clearInterval(syncPollRef.current)
//           setPhase(PHASE.SETUP)
//           setFightId(null)
//         }
//       } catch {}
//     }, 2000)
//   }, [callReadyAndPoll])

//   useEffect(() => () => {
//     clearInterval(syncPollRef.current)
//     clearInterval(queuePollRef.current)
//   }, [])

//   // ── Load friends ──────────────────────────────────────
//   useEffect(() => {
//     if (mode !== 'friend') return
//     setFrdLoad(true)
//     api.get('/friends/list')
//       .then(r => setFriends(r.data.data || []))
//       .catch(() => setFriends([]))
//       .finally(() => setFrdLoad(false))
//   }, [mode])

//   // ── Random queue ──────────────────────────────────────
//   const startQueue = useCallback(async () => {
//     setPhase(PHASE.QUEUE)
//     setQueueMsg('Searching for opponent…')
//     try {
//       const res = await api.post('/fights/queue/join', { subjectSlug: subject.slug })
//       if (res.data.matched) {
//         const { fightId: fid, opponent } = res.data.data
//         setFightId(fid)
//         dispatch({
//           type: 'SET_PLAYERS',
//           p1: { userId: me, username: myName, avatar: myName.slice(0,2).toUpperCase(), score: 0 },
//           p2: { userId: opponent._id || 'opp', username: opponent.username, avatar: (opponent.username || '??').slice(0,2).toUpperCase(), score: 0 },
//         })
//         setPhase(PHASE.LOBBY)
//         callReadyAndPoll(fid)
//       } else {
//         setQueueMsg(`Waiting for an opponent in ${subject.name}…`)
//         queuePollRef.current = setInterval(async () => {
//           try {
//             const r = await api.post('/fights/queue/join', { subjectSlug: subject.slug })
//             if (r.data.matched) {
//               clearInterval(queuePollRef.current)
//               const { fightId: fid, opponent } = r.data.data
//               setFightId(fid)
//               dispatch({
//                 type: 'SET_PLAYERS',
//                 p1: { userId: me, username: myName, avatar: myName.slice(0,2).toUpperCase(), score: 0 },
//                 p2: { userId: opponent._id || 'opp', username: opponent.username, avatar: (opponent.username || '??').slice(0,2).toUpperCase(), score: 0 },
//               })
//               setPhase(PHASE.LOBBY)
//               callReadyAndPoll(fid)
//             }
//           } catch {}
//         }, 4000)
//       }
//     } catch {
//       setQueueMsg('Failed to join queue. Please try again.')
//     }
//   }, [subject, me, myName, callReadyAndPoll])

//   const cancelQueue = useCallback(async () => {
//     clearInterval(queuePollRef.current)
//     try { await api.post('/fights/queue/leave', { subjectSlug: subject?.slug }) } catch {}
//     setPhase(PHASE.SETUP)
//     setMode(null)
//   }, [subject])

//   // ── Challenge friend ──────────────────────────────────
//   const sendChallenge = useCallback(async (friend) => {
//     setChallengeError(null)
//     try {
//       const res = await api.post('/fights/challenge', { friendId: friend._id, subjectSlug: subject.slug })
//       const { fightId: fid } = res.data.data
//       setFightId(fid)
//       dispatch({
//         type: 'SET_PLAYERS',
//         p1: { userId: me,         username: myName,          avatar: myName.slice(0,2).toUpperCase(), score: 0 },
//         p2: { userId: friend._id, username: friend.username, avatar: (friend.username || '??').slice(0,2).toUpperCase(), score: 0 },
//       })
//       setPhase(PHASE.WAITING)
//       startWaitingPoll(fid)
//     } catch (err) {
//       setChallengeError(err.response?.data?.message || 'Challenge failed. Please try again.')
//     }
//   }, [subject, me, myName, startWaitingPoll])

//   // ── Socket events (supplement polling — handle score/question advances) ──
//   const handleSocketEvent = useCallback((event, payload) => {
//     switch (event) {
//       case 'fight:state':
//         if (payload.player1 && payload.player2) {
//           dispatch({ type: 'SET_PLAYERS', p1: payload.player1, p2: payload.player2 })
//         }
//         if (payload.questions?.length) {
//           dispatch({ type: 'FIGHT_STARTED', questions: payload.questions, timePerQuestion: payload.timePerQuestion || 15, currentQuestion: payload.currentQuestion || 0 })
//         }
//         break

//       case 'fight:countdown':
//         // Socket countdown event — show countdown phase (DB poll will set the timestamp)
//         if (phaseRef.current === PHASE.LOBBY) setPhase(PHASE.COUNTDOWN)
//         dispatch({ type: 'COUNTDOWN', count: payload.count })
//         break

//       case 'fight:started':
//         setPhase(PHASE.ACTIVE)
//         dispatch({ type: 'FIGHT_STARTED', questions: payload.questions, timePerQuestion: payload.timePerQuestion, currentQuestion: 0 })
//         clearInterval(syncPollRef.current)
//         break

//       case 'fight:resumed':
//         setPhase(PHASE.ACTIVE)
//         dispatch({ type: 'FIGHT_STARTED', questions: payload.questions, timePerQuestion: payload.timePerQuestion, currentQuestion: payload.currentQuestion || 0 })
//         clearInterval(syncPollRef.current)
//         break

//       case 'fight:score_update':
//         dispatch({ type: 'SCORE_UPDATE', userId: payload.userId, score: payload.score })
//         break

//       case 'fight:next_question':
//         dispatch({ type: 'NEXT_Q', idx: payload.questionIndex })
//         break

//       case 'fight:finished':
//         setPhase(PHASE.DONE)
//         dispatch({ type: 'DONE', result: payload })
//         clearInterval(syncPollRef.current)
//         break
//     }
//   }, [])

//   // Socket connects from LOBBY onward
//   const socketActive = !!fightId &&
//     ![PHASE.LOADING, PHASE.SETUP, PHASE.CHALLENGE, PHASE.QUEUE, PHASE.WAITING].includes(phase)

//   const { submitAnswer, reportTimeout } = useFightSocket(
//     socketActive
//       ? { fightId, token: token || localStorage.getItem('nx_token'), onEvent: handleSocketEvent }
//       : { fightId: null, token: null, onEvent: () => {} }
//   )

//   const handleAnswer = useCallback((selectedIndex, isCorrect, timeTakenMs) => {
//     submitAnswer(fightState.currentQuestion, selectedIndex, timeTakenMs, isCorrect)
//   }, [fightState.currentQuestion, submitAnswer])

//   const handleTimeout = useCallback(() => {
//     reportTimeout(fightState.currentQuestion)
//   }, [fightState.currentQuestion, reportTimeout])

//   const resetToSetup = useCallback(() => {
//     clearInterval(syncPollRef.current)
//     clearInterval(queuePollRef.current)
//     setPhase(PHASE.SETUP)
//     setFightId(null)
//     setSubject(null)
//     setMode(null)
//     setChallengeError(null)
//     setCountdownStartedAt(null)
//   }, [])

//   const { countdown, currentQuestion, questions, player1, player2, result, timePerQuestion } = fightState
//   const subjectAccent = subject?.accent || '#00F5FF'

//   // ── LOADING ───────────────────────────────────────────
//   if (phase === PHASE.LOADING) {
//     return (
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//         style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column' }}>
//         <DashboardNavbar />
//         <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
//           <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//             style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#FF4060', borderRadius: '50%' }} />
//           <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)' }}>
//             Checking for active match…
//           </span>
//         </div>
//       </motion.div>
//     )
//   }

//   // ── ACTIVE ────────────────────────────────────────────
//   if (phase === PHASE.ACTIVE) {
//     return (
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//         style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column' }}>
//         <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(255,64,96,0.07) 0%, transparent 60%)' }} />
//         <DashboardNavbar />
//         <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.2, repeat: Infinity }}
//               style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF4060' }} />
//             <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#FF4060' }}>LIVE FIGHT</span>
//           </div>
//           <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
//             {subject?.name} · {player1?.username} vs {player2?.username}
//           </span>
//         </div>
//         <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
//           <div style={{ width: '100%', maxWidth: '680px' }}>
//             <FightScoreboard player1={player1} player2={player2} currentUserId={me} questionIndex={currentQuestion} totalQuestions={questions.length} />
//             <AnimatePresence mode="wait">
//               <FightQuestion
//                 key={currentQuestion}
//                 question={questions[currentQuestion]}
//                 questionIndex={currentQuestion}
//                 totalQuestions={questions.length}
//                 timePerQuestion={timePerQuestion}
//                 onAnswer={handleAnswer}
//                 onTimeout={handleTimeout}
//               />
//             </AnimatePresence>
//           </div>
//         </div>
//         <FightResultModal show={phase === PHASE.DONE} result={result} player1={player1} player2={player2} currentUserId={me} totalQuestions={questions.length} onClose={resetToSetup} />
//         <AvatarAssistant />
//       </motion.div>
//     )
//   }

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//       style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//       <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
//       <DashboardNavbar />

//       <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
//         <div style={{ width: '100%', maxWidth: '640px' }}>
//           <AnimatePresence mode="wait">

//             {/* ── SETUP ── */}
//             {phase === PHASE.SETUP && (
//               <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
//                 <div style={{ textAlign: 'center', marginBottom: '36px' }}>
//                   <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF4060', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>⚔ Subject 1v1</div>
//                   <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>Challenge Mode</h1>
//                   <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.38)', marginTop: '10px' }}>Pick a subject, choose your opponent type, and compete.</p>
//                 </div>

//                 <div style={{ marginBottom: '28px' }}>
//                   <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Select Subject</div>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
//                     {SUBJECTS.map(s => {
//                       const sel = subject?.slug === s.slug
//                       return (
//                         <motion.button key={s.slug} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setSubject(s)}
//                           style={{ padding: '14px 16px', borderRadius: '14px', border: `1px solid ${sel ? `${s.accent}50` : 'rgba(255,255,255,0.08)'}`, background: sel ? `${s.accent}10` : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', boxShadow: sel ? `0 0 0 1px ${s.accent}35` : 'none' }}>
//                           <div style={{ fontSize: '1.2rem', marginBottom: '7px' }}>{s.icon}</div>
//                           <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: sel ? s.accent : '#fff' }}>{s.name}</div>
//                         </motion.button>
//                       )
//                     })}
//                   </div>
//                 </div>

//                 {subject && (
//                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
//                     <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Choose Opponent</div>
//                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
//                       {[
//                         { key: 'random', label: 'Random Opponent', desc: 'Match with any player queued for this subject', icon: '🎲', accent: subjectAccent },
//                         { key: 'friend', label: 'Challenge Friend', desc: 'Pick a friend and send them a 1v1 invite', icon: '👥', accent: '#8B5CF6' },
//                       ].map(m => {
//                         const sel = mode === m.key
//                         return (
//                           <motion.button key={m.key} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setMode(m.key)}
//                             style={{ padding: '18px', borderRadius: '16px', border: `1px solid ${sel ? `${m.accent}45` : 'rgba(255,255,255,0.08)'}`, background: sel ? `${m.accent}09` : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', boxShadow: sel ? `0 0 0 1px ${m.accent}30` : 'none' }}>
//                             <div style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{m.icon}</div>
//                             <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: sel ? m.accent : '#fff', marginBottom: '5px' }}>{m.label}</div>
//                             <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{m.desc}</div>
//                           </motion.button>
//                         )
//                       })}
//                     </div>
//                     {mode === 'random' && (
//                       <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//                         whileHover={{ scale: 1.02, boxShadow: `0 8px 28px ${subjectAccent}35` }} whileTap={{ scale: 0.97 }}
//                         onClick={startQueue}
//                         style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${subjectAccent}, ${subjectAccent}CC)`, border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
//                         Find Opponent in {subject.name}
//                       </motion.button>
//                     )}
//                     {mode === 'friend' && (
//                       <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//                         whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(139,92,246,0.35)' }} whileTap={{ scale: 0.97 }}
//                         onClick={() => setPhase(PHASE.CHALLENGE)}
//                         style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
//                         Choose a Friend
//                       </motion.button>
//                     )}
//                   </motion.div>
//                 )}
//               </motion.div>
//             )}

//             {/* ── QUEUE ── */}
//             {phase === PHASE.QUEUE && (
//               <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '28px', textAlign: 'center' }}>
//                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
//                   style={{ width: '64px', height: '64px', borderRadius: '50%', border: `3px solid ${subjectAccent}20`, borderTopColor: subjectAccent }} />
//                 <div>
//                   <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>{subject?.name} Queue</div>
//                   <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)' }}>{queueMsg}</div>
//                 </div>
//                 <motion.button whileHover={{ color: '#FF5050' }} onClick={cancelQueue}
//                   style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '9px 22px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
//                   Leave Queue
//                 </motion.button>
//               </motion.div>
//             )}

//             {/* ── CHALLENGE ── */}
//             {phase === PHASE.CHALLENGE && (
//               <motion.div key="challenge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
//                   <motion.button whileHover={{ background: 'rgba(255,255,255,0.06)' }} onClick={() => { setPhase(PHASE.SETUP); setChallengeError(null) }}
//                     style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
//                   </motion.button>
//                   <div>
//                     <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff', margin: 0 }}>Challenge a Friend</h2>
//                     <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)', margin: '3px 0 0' }}>{subject?.name} · 1v1 · 15 Questions</p>
//                   </div>
//                 </div>

//                 {challengeError && (
//                   <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
//                     style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(255,64,96,0.08)', border: '1px solid rgba(255,64,96,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
//                     <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#FF4060' }}>{challengeError}</span>
//                     <button onClick={() => setChallengeError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,64,96,0.6)', padding: '2px', flexShrink: 0 }}>
//                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
//                     </button>
//                   </motion.div>
//                 )}

//                 {frdLoad ? (
//                   <div style={{ padding: '40px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.3)' }}>Loading friends…</div>
//                 ) : friends.length === 0 ? (
//                   <div style={{ padding: '50px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px' }}>
//                     <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👥</div>
//                     <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>No friends yet</div>
//                     <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.84rem', color: 'rgba(255,255,255,0.3)' }}>Add friends first to challenge them.</div>
//                     <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/friends')}
//                       style={{ marginTop: '16px', padding: '10px 24px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
//                       Go to Friends
//                     </motion.button>
//                   </div>
//                 ) : (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                     {friends.map(friend => (
//                       <motion.div key={friend._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
//                         style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
//                         <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.8rem', color: '#8B5CF6', flexShrink: 0 }}>
//                           {(friend.username || '??').slice(0,2).toUpperCase()}
//                         </div>
//                         <div style={{ flex: 1 }}>
//                           <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{friend.username}</div>
//                           <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Lv.{friend.level || '—'} · {(friend.xp || 0).toLocaleString()} XP</div>
//                         </div>
//                         <motion.button whileHover={{ scale: 1.05, boxShadow: '0 4px 16px rgba(255,64,96,0.35)' }} whileTap={{ scale: 0.96 }}
//                           onClick={() => sendChallenge(friend)}
//                           style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #FF4060, #CC0033)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
//                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
//                           Challenge
//                         </motion.button>
//                       </motion.div>
//                     ))}
//                   </div>
//                 )}
//               </motion.div>
//             )}

//             {/* ── WAITING ── */}
//             {phase === PHASE.WAITING && (
//               <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px', textAlign: 'center' }}>
//                 <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
//                   style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,64,96,0.1)', border: '1.5px solid rgba(255,64,96,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '1.1rem', color: '#FF4060' }}>⚔</motion.div>
//                 <div>
//                   <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Challenge Sent!</div>
//                   <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)' }}>
//                     Waiting for <strong style={{ color: '#fff' }}>{fightState.player2?.username}</strong> to accept…
//                   </div>
//                   <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.28)', marginTop: '6px' }}>Subject: {subject?.name}</div>
//                 </div>
//                 <motion.button whileHover={{ color: '#FF5050' }} onClick={() => {
//                     clearInterval(syncPollRef.current)
//                     if (fightId) api.delete(`/fights/${fightId}/cancel`).catch(() => {})
//                     setPhase(PHASE.SETUP); setFightId(null)
//                   }}
//                   style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '9px 22px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
//                   Cancel Challenge
//                 </motion.button>
//               </motion.div>
//             )}

//             {/* ── LOBBY ── */}
//             {phase === PHASE.LOBBY && (
//               <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', gap: '32px', textAlign: 'center' }}>
//                 <div>
//                   <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF4060', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>⚔ Match Found</div>
//                   <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>Get Ready!</h1>
//                   <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.84rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>{subject?.name} · 15 Questions</div>
//                 </div>

//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '500px' }}>
//                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
//                     <motion.div animate={{ boxShadow: [`0 0 20px ${subjectAccent}30`, `0 0 40px ${subjectAccent}60`, `0 0 20px ${subjectAccent}30`] }} transition={{ duration: 2, repeat: Infinity }}
//                       style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${subjectAccent}12`, border: `2.5px solid ${subjectAccent}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: subjectAccent }}>
//                       {(fightState.player1?.avatar || fightState.player1?.username || 'P1').slice(0,2).toUpperCase()}
//                     </motion.div>
//                     <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
//                       {fightState.player1?.username || 'Player 1'}
//                       {fightState.player1?.userId?.toString() === me && <span style={{ color: '#00F5FF', fontSize: '0.6rem', marginLeft: '5px' }}>(you)</span>}
//                     </div>
//                     <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.22)', borderRadius: '20px', padding: '4px 12px' }}>
//                       <motion.div animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00FF88' }} />
//                       <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#00FF88' }}>Ready</span>
//                     </div>
//                   </div>

//                   <div style={{ flexShrink: 0, width: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
//                       style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,64,96,0.1)', border: '1.5px solid rgba(255,64,96,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '0.85rem', color: '#FF4060', boxShadow: '0 0 16px rgba(255,64,96,0.18)' }}>
//                       VS
//                     </motion.div>
//                   </div>

//                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
//                     <motion.div animate={{ boxShadow: ['0 0 20px #FF406030', '0 0 40px #FF406060', '0 0 20px #FF406030'] }} transition={{ duration: 2, repeat: Infinity }}
//                       style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,64,96,0.12)', border: '2.5px solid rgba(255,64,96,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#FF4060' }}>
//                       {(fightState.player2?.avatar || fightState.player2?.username || 'P2').slice(0,2).toUpperCase()}
//                     </motion.div>
//                     <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
//                       {fightState.player2?.username || 'Player 2'}
//                       {fightState.player2?.userId?.toString() === me && <span style={{ color: '#FF4060', fontSize: '0.6rem', marginLeft: '5px' }}>(you)</span>}
//                     </div>
//                     <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.22)', borderRadius: '20px', padding: '4px 12px' }}>
//                       <motion.div animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00FF88' }} />
//                       <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#00FF88' }}>Ready</span>
//                     </div>
//                   </div>
//                 </div>

//                 <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
//                   style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: '#00FF88', margin: 0 }}>
//                   Both players ready — waiting to start…
//                 </motion.p>
//               </motion.div>
//             )}

//           </AnimatePresence>
//         </div>
//       </div>

//       {/* Countdown overlay — timestamp-based, synchronized */}
//       <AnimatePresence>
//         {phase === PHASE.COUNTDOWN && countdownStartedAt && (
//           <LiveCountdown
//             key="live-cd"
//             countdownStartedAt={countdownStartedAt}
//             countdownDuration={3}
//             onExpired={handleCountdownExpired}
//           />
//         )}
//       </AnimatePresence>

//       {/* Result modal */}
//       <FightResultModal show={phase === PHASE.DONE} result={result} player1={fightState.player1} player2={fightState.player2} currentUserId={me} totalQuestions={questions.length} onClose={resetToSetup} />

//       <AvatarAssistant />
//     </motion.div>
//   )
// }
import { useState, useCallback, useEffect, useReducer, useRef } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@store/authStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'
import FightCountdown from '../components/FightCountdown'
import FightQuestion from '../components/FightQuestion'
import FightScoreboard from '../components/FightScoreboard'
import FightResultModal from '../components/FightResultModal'
import { useFightSocket } from '../hooks/useFightSocket'
import api from '@services/api'

// ── Phases ─────────────────────────────────────────────────
const PHASE = {
  LOADING:    'loading',
  SETUP:      'setup',
  QUEUE:      'queue',
  CHALLENGE:  'challenge',
  WAITING:    'waiting',
  LOBBY:      'lobby',
  COUNTDOWN:  'countdown',
  ACTIVE:     'active',
  DONE:       'done',
  INVITED:    'invited',   // invitee has an incoming challenge
}

const SUBJECTS = [
  { slug: 'data-structures',   name: 'Data Structures',   accent: '#00F5FF', icon: '◈' },
  { slug: 'algorithms',        name: 'Algorithms',        accent: '#8B5CF6', icon: '⚡' },
  { slug: 'databases',         name: 'Databases',         accent: '#0080FF', icon: '◉' },
  { slug: 'operating-systems', name: 'Operating Systems', accent: '#FFB800', icon: '◆' },
  { slug: 'networks',          name: 'Networks',          accent: '#00FF88', icon: '◎' },
  { slug: 'system-design',     name: 'System Design',     accent: '#FF6B35', icon: '★' },
]

// ── Reducer ────────────────────────────────────────────────
const initState = {
  countdown: 3, currentQuestion: 0,
  questions: [],
  player1: null, player2: null,
  scores: {}, result: null, timePerQuestion: 15,
}
function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYERS':
      return { ...state, player1: action.p1, player2: action.p2 }
    case 'COUNTDOWN':
      return { ...state, countdown: action.count }
    case 'FIGHT_STARTED':
      return {
        ...state,
        questions:       action.questions,
        timePerQuestion: action.timePerQuestion || 15,
        currentQuestion: action.currentQuestion ?? 0,
      }
    case 'SET_QUESTION':
      return { ...state, currentQuestion: action.idx }
    case 'SCORE_UPDATE': {
      const { userId, score } = action
      const p1 = state.player1?.userId === userId ? { ...state.player1, score } : state.player1
      const p2 = state.player2?.userId === userId ? { ...state.player2, score } : state.player2
      return { ...state, player1: p1, player2: p2, scores: { ...state.scores, [userId]: score } }
    }
    case 'NEXT_Q':       return { ...state, currentQuestion: action.idx }
    case 'DONE':         return { ...state, result: action.result }
    default:             return state
  }
}

// ── Countdown display component (timestamp-based) ──────────
// Uses countdownStartedAt from server so both clients are synchronized
function LiveCountdown({ countdownStartedAt, countdownDuration, onExpired }) {
  const [remaining, setRemaining] = useState(countdownDuration)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (!countdownStartedAt) return

    const tick = () => {
      const elapsed = Date.now() - new Date(countdownStartedAt).getTime()
      const rem = Math.max(0, countdownDuration - Math.floor(elapsed / 1000))
      setRemaining(rem)
      if (rem === 0 && !expiredRef.current) {
        expiredRef.current = true
        // Give 500ms for animation, then call onExpired
        setTimeout(() => onExpired?.(), 600)
      }
    }

    tick()
    const t = setInterval(tick, 200)
    return () => clearInterval(t)
  }, [countdownStartedAt, countdownDuration])

  return <FightCountdown count={remaining} />
}

export default function FightPage() {
  const { isAuthenticated, user, token } = useAuthStore()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [phase,             setPhase]             = useState(PHASE.LOADING)
  const [subject,           setSubject]           = useState(null)
  const [mode,              setMode]              = useState(null)
  const [fightId,           setFightId]           = useState(null)
  const [countdownStartedAt, setCountdownStartedAt] = useState(null)
  const [queueMsg,          setQueueMsg]          = useState('')
  const [friends,           setFriends]           = useState([])
  const [frdLoad,           setFrdLoad]           = useState(false)
  const [challengeError,    setChallengeError]    = useState(null)
  const [readyClicked,      setReadyClicked]      = useState(false)
  const [questionStartedAt,  setQuestionStartedAt]  = useState(null)
  const [opponentLeft,       setOpponentLeft]       = useState(false)
  const [cancelledMsg,      setCancelledMsg]      = useState(null)
  const [fightState,        dispatch]             = useReducer(reducer, initState)

  const syncPollRef  = useRef(null)   // polls DB for phase changes
  const queuePollRef = useRef(null)   // polls for queue match
  const phaseRef     = useRef(PHASE.LOADING)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const me     = user?._id || user?.id || ''
  const myName = user?.username || 'You'

  // Keep phaseRef in sync with phase state
  useEffect(() => { phaseRef.current = phase }, [phase])

  const resetToSetup = useCallback(() => {
    clearInterval(syncPollRef.current)
    clearInterval(queuePollRef.current)
    setPhase(PHASE.SETUP)
    setFightId(null)
    setSubject(null)
    setMode(null)
    setChallengeError(null)
    setCountdownStartedAt(null)
    setReadyClicked(false)
    setCancelledMsg(null)
    setQuestionStartedAt(null)
    setOpponentLeft(false)
  }, [])

  // ── Apply fight data from DB to state ─────────────────
  const applyFight = useCallback((fight) => {
    const p1 = fight.player1
    const p2 = fight.player2
    const subjectSlug = fight.subjectSlug || 'data-structures'
    const subjectObj  = SUBJECTS.find(s => s.slug === subjectSlug) || SUBJECTS[0]

    setSubject(subjectObj)
    setFightId(fight._id?.toString() || fight._id)

    dispatch({
      type: 'SET_PLAYERS',
      p1:   { userId: (p1.user?._id || p1.user)?.toString(), username: p1.user?.username || 'Player 1', avatar: (p1.user?.username || 'P1').slice(0,2).toUpperCase(), score: p1.score || 0 },
      p2:   { userId: (p2.user?._id || p2.user)?.toString(), username: p2.user?.username || 'Player 2', avatar: (p2.user?.username || 'P2').slice(0,2).toUpperCase(), score: p2.score || 0 },
    })

    if (fight.questions?.length) {
      dispatch({
        type: 'FIGHT_STARTED',
        questions:       fight.questions,
        timePerQuestion: fight.timePerQuestion || 15,
        currentQuestion: fight.currentQuestion || 0,
      })
    }

    if (fight.countdownStartedAt) {
      setCountdownStartedAt(fight.countdownStartedAt)
    }
  }, [])

  // ── Sync poll: polls DB every 1.5s during LOBBY/COUNTDOWN ─
  // This is the primary synchronization mechanism — reliable even without sockets
  const startSyncPoll = useCallback((fid) => {
    clearInterval(syncPollRef.current)

    syncPollRef.current = setInterval(async () => {
      if ([PHASE.ACTIVE, PHASE.DONE, PHASE.SETUP, PHASE.LOADING].includes(phaseRef.current)) {
        clearInterval(syncPollRef.current)
        return
      }

      try {
        const r = await api.get(`/fights/${fid}`)
        const fight = r.data.data
        if (!fight) return

        const status = fight.status

        if (status === 'countdown' && fight.countdownStartedAt) {
          // Countdown is live — set timestamp and switch to countdown phase
          setCountdownStartedAt(fight.countdownStartedAt)
          if (phaseRef.current !== PHASE.COUNTDOWN) setPhase(PHASE.COUNTDOWN)
        } else if (status === 'active') {
          clearInterval(syncPollRef.current)
          if (fight.questions?.length) {
            dispatch({ type: 'FIGHT_STARTED', questions: fight.questions, timePerQuestion: fight.timePerQuestion || 15, currentQuestion: fight.currentQuestion || 0 })
          }
          setPhase(PHASE.ACTIVE)
        } else if (status === 'finished') {
          clearInterval(syncPollRef.current)
          setPhase(PHASE.DONE)
        } else if (status === 'cancelled') {
          clearInterval(syncPollRef.current)
          resetToSetup()
        }
      } catch {}
    }, 1500)
  }, [])

  // ── Countdown expired handler ─────────────────────────
  const handleCountdownExpired = useCallback(async () => {
    if (!fightId) return
    // Call advance endpoint — server transitions to active if countdown is done
    try {
      const r = await api.post(`/fights/${fightId}/advance`)
      const fight = r.data.data
      if (fight?.status === 'active' && fight.questions?.length) {
        dispatch({ type: 'FIGHT_STARTED', questions: fight.questions, timePerQuestion: fight.timePerQuestion || 15, currentQuestion: 0 })
        setPhase(PHASE.ACTIVE)
        clearInterval(syncPollRef.current)
      }
    } catch {
      // Fallback — just transition locally
      setPhase(PHASE.ACTIVE)
    }
  }, [fightId])

  // ── On mount: detect and restore any active fight ─────
  useEffect(() => {
    const locState = location.state

    async function init() {
      const acceptedFightId = locState?.acceptedFightId
      if (acceptedFightId) {
        window.history.replaceState({}, '', '/fight')
        // fromExplicitAccept=true: user clicked Accept in notification, auto-ready is appropriate
        await restoreFight(acceptedFightId, null, true)
        return
      }

      try {
        const res = await api.get('/fights/active')
        const activeFight = res.data.data
        if (activeFight) {
          // Skip restoring 'finished' fights that slipped through
          if (activeFight.status === 'finished' || activeFight.status === 'cancelled') {
            setPhase(PHASE.SETUP)
            return
          }
          await restoreFight(activeFight._id?.toString(), activeFight)
          return
        }
      } catch {}

      setPhase(PHASE.SETUP)
    }

    init()
  }, [])

  // ── Restore fight from DB ─────────────────────────────
  const restoreFight = useCallback(async (fid, fightData, fromExplicitAccept = false) => {
    try {
      const fight = fightData || (await api.get(`/fights/${fid}`)).data.data
      if (!fight) { setPhase(PHASE.SETUP); return }

      applyFight(fight)

      const fightIdStr = fight._id?.toString() || fid
      const isPlayer1  = (fight.player1?.user?._id || fight.player1?.user)?.toString() === me

      switch (fight.status) {
        case 'invited':
          if (isPlayer1) {
            // I'm the challenger — show waiting, poll for acceptance
            setPhase(PHASE.WAITING)
            startWaitingPoll(fightIdStr)
          } else {
            // I'm the invitee — show incoming challenge with explicit accept/decline
            // Do NOT auto-start: show INVITED phase so user can choose
            setPhase(PHASE.INVITED)
          }
          break

        case 'accepted':
          // Show lobby — only auto-ready if the user explicitly accepted right now
          // (fromExplicitAccept is true when navigating here after accepting an invite)
          setPhase(PHASE.LOBBY)
          if (fromExplicitAccept) {
            callReadyAndPoll(fightIdStr)
          } else {
            // Just restore to lobby; sync poll will watch for countdown
            startSyncPoll(fightIdStr)
          }
          break

        case 'countdown':
          setPhase(PHASE.COUNTDOWN)
          startSyncPoll(fightIdStr)
          break

        case 'active':
          setPhase(PHASE.ACTIVE)
          break

        case 'finished':
          setPhase(PHASE.SETUP)
          break

        default:
          setPhase(PHASE.SETUP)
      }
    } catch {
      setPhase(PHASE.SETUP)
    }
  }, [me])

  // ── Ready-up and start sync poll ──────────────────────
  const callReadyAndPoll = useCallback(async (fid) => {
    setReadyClicked(true)
    try {
      const r = await api.post(`/fights/${fid}/ready`)
      const fight = r.data.data
      if (fight?.countdownStartedAt) setCountdownStartedAt(fight.countdownStartedAt)
      if (fight?.status === 'countdown') setPhase(PHASE.COUNTDOWN)
      else if (fight?.status === 'active') { setPhase(PHASE.ACTIVE); return }
    } catch {}
    startSyncPoll(fid)
  }, [startSyncPoll])

  // ── Poll while waiting for friend to accept ───────────
  const startWaitingPoll = useCallback((fid) => {
    clearInterval(syncPollRef.current)
    syncPollRef.current = setInterval(async () => {
      try {
        const r = await api.get(`/fights/${fid}`)
        const status = r.data.data?.status
        if (status === 'accepted' || status === 'countdown' || status === 'active') {
          clearInterval(syncPollRef.current)
          if (status === 'active') {
            applyFight(r.data.data)
            setPhase(PHASE.ACTIVE)
          } else {
            setPhase(PHASE.LOBBY)
            callReadyAndPoll(fid)
          }
        } else if (status === 'cancelled' || status === 'finished') {
          clearInterval(syncPollRef.current)
          setCancelledMsg('Your challenge was declined.')
          setPhase(PHASE.SETUP)
          setFightId(null)
        }
      } catch {}
    }, 2000)
  }, [callReadyAndPoll])

  useEffect(() => () => {
    clearInterval(syncPollRef.current)
    clearInterval(queuePollRef.current)
  }, [])

  // ── Load friends ──────────────────────────────────────
  useEffect(() => {
    if (mode !== 'friend') return
    setFrdLoad(true)
    api.get('/friends/list')
      .then(r => setFriends(r.data.data || []))
      .catch(() => setFriends([]))
      .finally(() => setFrdLoad(false))
  }, [mode])

  // ── Random queue ──────────────────────────────────────
  const startQueue = useCallback(async () => {
    setPhase(PHASE.QUEUE)
    setQueueMsg('Searching for opponent…')
    try {
      const res = await api.post('/fights/queue/join', { subjectSlug: subject.slug })
      if (res.data.matched) {
        const { fightId: fid, opponent } = res.data.data
        setFightId(fid)
        dispatch({
          type: 'SET_PLAYERS',
          p1: { userId: me, username: myName, avatar: myName.slice(0,2).toUpperCase(), score: 0 },
          p2: { userId: opponent._id || 'opp', username: opponent.username, avatar: (opponent.username || '??').slice(0,2).toUpperCase(), score: 0 },
        })
        setPhase(PHASE.LOBBY)
        callReadyAndPoll(fid)
      } else {
        setQueueMsg(`Waiting for an opponent in ${subject.name}…`)
        queuePollRef.current = setInterval(async () => {
          try {
            const r = await api.post('/fights/queue/join', { subjectSlug: subject.slug })
            if (r.data.matched) {
              clearInterval(queuePollRef.current)
              const { fightId: fid, opponent } = r.data.data
              setFightId(fid)
              dispatch({
                type: 'SET_PLAYERS',
                p1: { userId: me, username: myName, avatar: myName.slice(0,2).toUpperCase(), score: 0 },
                p2: { userId: opponent._id || 'opp', username: opponent.username, avatar: (opponent.username || '??').slice(0,2).toUpperCase(), score: 0 },
              })
              setPhase(PHASE.LOBBY)
              callReadyAndPoll(fid)
            }
          } catch {}
        }, 4000)
      }
    } catch {
      setQueueMsg('Failed to join queue. Please try again.')
    }
  }, [subject, me, myName, callReadyAndPoll])

  const cancelQueue = useCallback(async () => {
    clearInterval(queuePollRef.current)
    try { await api.post('/fights/queue/leave', { subjectSlug: subject?.slug }) } catch {}
    setPhase(PHASE.SETUP)
    setMode(null)
  }, [subject])

  // ── Accept / decline an incoming challenge (invitee) ─────
  const acceptIncomingChallenge = useCallback(async () => {
    if (!fightId) return
    try {
      await api.post('/fights/accept', { fightId })
      // User explicitly accepted — move to lobby and ready up
      setPhase(PHASE.LOBBY)
      callReadyAndPoll(fightId)
    } catch {
      // If something went wrong, reset back to setup so user can try again
      resetToSetup()
    }
  }, [fightId, callReadyAndPoll, resetToSetup])

  const declineIncomingChallenge = useCallback(async () => {
    if (!fightId) return
    try {
      await api.post(`/fights/${fightId}/decline`)
    } catch {}
    resetToSetup()
  }, [fightId, resetToSetup])

  // ── Challenge friend ──────────────────────────────────
  const sendChallenge = useCallback(async (friend) => {
    setChallengeError(null)
    try {
      const res = await api.post('/fights/challenge', { friendId: friend._id, subjectSlug: subject.slug })
      const { fightId: fid } = res.data.data
      setFightId(fid)
      dispatch({
        type: 'SET_PLAYERS',
        p1: { userId: me,         username: myName,          avatar: myName.slice(0,2).toUpperCase(), score: 0 },
        p2: { userId: friend._id, username: friend.username, avatar: (friend.username || '??').slice(0,2).toUpperCase(), score: 0 },
      })
      setPhase(PHASE.WAITING)
      startWaitingPoll(fid)
    } catch (err) {
      setChallengeError(err.response?.data?.message || 'Challenge failed. Please try again.')
    }
  }, [subject, me, myName, startWaitingPoll])

  // ── Socket events (supplement polling — handle score/question advances) ──
  const handleSocketEvent = useCallback((event, payload) => {
    switch (event) {
      case 'fight:state':
        if (payload.player1 && payload.player2) {
          dispatch({ type: 'SET_PLAYERS', p1: payload.player1, p2: payload.player2 })
        }
        if (payload.questions?.length) {
          dispatch({ type: 'FIGHT_STARTED', questions: payload.questions, timePerQuestion: payload.timePerQuestion || 15, currentQuestion: payload.currentQuestion || 0 })
        }
        break

      case 'fight:countdown':
        // Socket countdown event — show countdown phase (DB poll will set the timestamp)
        if (phaseRef.current === PHASE.LOBBY) setPhase(PHASE.COUNTDOWN)
        dispatch({ type: 'COUNTDOWN', count: payload.count })
        break

      case 'fight:started':
        setPhase(PHASE.ACTIVE)
        dispatch({ type: 'FIGHT_STARTED', questions: payload.questions, timePerQuestion: payload.timePerQuestion, currentQuestion: 0 })
        setQuestionStartedAt(payload.questionStartedAt || new Date().toISOString())
        clearInterval(syncPollRef.current)
        break

      case 'fight:resumed':
        setPhase(PHASE.ACTIVE)
        dispatch({ type: 'FIGHT_STARTED', questions: payload.questions, timePerQuestion: payload.timePerQuestion, currentQuestion: payload.currentQuestion || 0 })
        if (payload.questionStartedAt) setQuestionStartedAt(payload.questionStartedAt)
        clearInterval(syncPollRef.current)
        break

      case 'fight:score_update':
        dispatch({ type: 'SCORE_UPDATE', userId: payload.userId, score: payload.score })
        break

      case 'fight:next_question':
        dispatch({ type: 'NEXT_Q', idx: payload.questionIndex })
        setQuestionStartedAt(payload.questionStartedAt || new Date().toISOString())
        break

      case 'fight:finished':
        setPhase(PHASE.DONE)
        dispatch({ type: 'DONE', result: payload })
        clearInterval(syncPollRef.current)
        break

      case 'fight:abandoned':
        setOpponentLeft(true)
        clearInterval(syncPollRef.current)
        break

      case 'fight:player_disconnected':
        // Opponent temporarily disconnected — fight:abandoned fires after 15s if they don't return
        break
    }
  }, [])

  // Socket connects from LOBBY onward
  const socketActive = !!fightId &&
    ![PHASE.LOADING, PHASE.SETUP, PHASE.CHALLENGE, PHASE.QUEUE, PHASE.WAITING].includes(phase)

  const { submitAnswer, reportTimeout } = useFightSocket(
    socketActive
      ? { fightId, token: token || localStorage.getItem('nx_token'), onEvent: handleSocketEvent }
      : { fightId: null, token: null, onEvent: () => {} }
  )

  const handleAnswer = useCallback((selectedIndex, isCorrect, timeTakenMs) => {
    submitAnswer(fightState.currentQuestion, selectedIndex, timeTakenMs, isCorrect)
  }, [fightState.currentQuestion, submitAnswer])

  const handleTimeout = useCallback(() => {
    reportTimeout(fightState.currentQuestion)
  }, [fightState.currentQuestion, reportTimeout])

  const { countdown, currentQuestion, questions, player1, player2, result, timePerQuestion } = fightState
  const subjectAccent = subject?.accent || '#00F5FF'

  const isActivePhase = phase === PHASE.ACTIVE

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
      <DashboardNavbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 80px' }}>
          {/* LOADING PHASE */}
          {phase === PHASE.LOADING && (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#FF4060', borderRadius: '50%' }} />
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)' }}>
                Checking for active match…
              </span>
            </div>
          )}

          {/* ACTIVE PHASE */}
          {isActivePhase && (
            <>
              <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 8px 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF4060' }} />
                  <span style={{ fontFamily: '\"Syne\", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#FF4060' }}>LIVE FIGHT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontFamily: '\"DM Sans\", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                    {subject?.name} · {player1?.username} vs {player2?.username}
                  </span>
                  <motion.button
                    whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                    onClick={resetToSetup}
                    title="Leave this fight"
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
                  >
                    Leave
                  </motion.button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '680px' }}>
                  <FightScoreboard player1={player1} player2={player2} currentUserId={me} questionIndex={currentQuestion} totalQuestions={questions.length} />
                  <AnimatePresence mode="wait">
                    <FightQuestion
                      key={currentQuestion}
                      question={questions[currentQuestion]}
                      questionIndex={currentQuestion}
                      totalQuestions={questions.length}
                      timePerQuestion={timePerQuestion}
                      questionStartedAt={questionStartedAt}
                      onAnswer={handleAnswer}
                      onTimeout={handleTimeout}
                    />
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}

          {/* NON-ACTIVE MAIN PHASES */}
          {!isActivePhase && phase !== PHASE.LOADING && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '640px' }}>
                <AnimatePresence mode="wait">

            {/* ── SETUP ── */}
            {phase === PHASE.SETUP && (
              <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                {cancelledMsg && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#FFB800' }}>{cancelledMsg}</span>
                    <button onClick={() => setCancelledMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,184,0,0.5)', padding: '2px', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </motion.div>
                )}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF4060', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>⚔ Subject 1v1</div>
                  <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>Challenge Mode</h1>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.38)', marginTop: '10px' }}>Pick a subject, choose your opponent type, and compete.</p>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Select Subject</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                    {SUBJECTS.map(s => {
                      const sel = subject?.slug === s.slug
                      return (
                        <motion.button key={s.slug} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setSubject(s)}
                          style={{ padding: '14px 16px', borderRadius: '14px', border: `1px solid ${sel ? `${s.accent}50` : 'rgba(255,255,255,0.08)'}`, background: sel ? `${s.accent}10` : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', boxShadow: sel ? `0 0 0 1px ${s.accent}35` : 'none' }}>
                          <div style={{ fontSize: '1.2rem', marginBottom: '7px' }}>{s.icon}</div>
                          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: sel ? s.accent : '#fff' }}>{s.name}</div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {subject && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Choose Opponent</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                      {[
                        { key: 'random', label: 'Random Opponent', desc: 'Match with any player queued for this subject', icon: '🎲', accent: subjectAccent },
                        { key: 'friend', label: 'Challenge Friend', desc: 'Pick a friend and send them a 1v1 invite', icon: '👥', accent: '#8B5CF6' },
                      ].map(m => {
                        const sel = mode === m.key
                        return (
                          <motion.button key={m.key} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setMode(m.key)}
                            style={{ padding: '18px', borderRadius: '16px', border: `1px solid ${sel ? `${m.accent}45` : 'rgba(255,255,255,0.08)'}`, background: sel ? `${m.accent}09` : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', boxShadow: sel ? `0 0 0 1px ${m.accent}30` : 'none' }}>
                            <div style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{m.icon}</div>
                            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: sel ? m.accent : '#fff', marginBottom: '5px' }}>{m.label}</div>
                            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{m.desc}</div>
                          </motion.button>
                        )
                      })}
                    </div>
                    {mode === 'random' && (
                      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.02, boxShadow: `0 8px 28px ${subjectAccent}35` }} whileTap={{ scale: 0.97 }}
                        onClick={startQueue}
                        style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${subjectAccent}, ${subjectAccent}CC)`, border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        Find Opponent in {subject.name}
                      </motion.button>
                    )}
                    {mode === 'friend' && (
                      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(139,92,246,0.35)' }} whileTap={{ scale: 0.97 }}
                        onClick={() => setPhase(PHASE.CHALLENGE)}
                        style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        Choose a Friend
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── QUEUE ── */}
            {phase === PHASE.QUEUE && (
              <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '28px', textAlign: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', border: `3px solid ${subjectAccent}20`, borderTopColor: subjectAccent }} />
                <div>
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>{subject?.name} Queue</div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)' }}>{queueMsg}</div>
                </div>
                <motion.button whileHover={{ color: '#FF5050' }} onClick={cancelQueue}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '9px 22px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
                  Leave Queue
                </motion.button>
              </motion.div>
            )}

            {/* ── INCOMING INVITE (invitee) ── */}
            {phase === PHASE.INVITED && (
              <motion.div key="invited" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF4060', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>⚔ Incoming Challenge</div>
                  <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>
                    {(fightState.player1?.username || 'A friend')} challenged you!
                  </h1>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.86rem', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>
                    Subject: {subject?.name || 'Subject 1v1'} · 15 Questions
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Challenger</div>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,64,96,0.14)', border: '2px solid rgba(255,64,96,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#FF4060', boxShadow: '0 0 20px rgba(255,64,96,0.3)' }}>
                        {(fightState.player1?.avatar || fightState.player1?.username || '??').slice(0,2).toUpperCase()}
                      </div>
                      <div style={{ marginTop: '8px', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                        {fightState.player1?.username || 'Opponent'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>You</div>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(0,245,255,0.12)', border: '2px solid rgba(0,245,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#00F5FF', boxShadow: '0 0 20px rgba(0,245,255,0.3)' }}>
                        {(fightState.player2?.avatar || fightState.player2?.username || 'YOU').slice(0,2).toUpperCase()}
                      </div>
                      <div style={{ marginTop: '8px', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                        {myName}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '360px', marginTop: '10px' }}>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 10px 32px rgba(0,255,136,0.35)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={acceptIncomingChallenge}
                      style={{ padding: '13px 16px', width: '100%', background: 'linear-gradient(135deg, #00FF88, #00C96B)', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      Accept Challenge
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.06)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={declineIncomingChallenge}
                      style={{ padding: '12px 16px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      Decline
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── CHALLENGE ── */}
            {phase === PHASE.CHALLENGE && (
              <motion.div key="challenge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                  <motion.button whileHover={{ background: 'rgba(255,255,255,0.06)' }} onClick={() => { setPhase(PHASE.SETUP); setChallengeError(null) }}
                    style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  </motion.button>
                  <div>
                    <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff', margin: 0 }}>Challenge a Friend</h2>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)', margin: '3px 0 0' }}>{subject?.name} · 1v1 · 15 Questions</p>
                  </div>
                </div>

                {challengeError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(255,64,96,0.08)', border: '1px solid rgba(255,64,96,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#FF4060' }}>{challengeError}</span>
                    <button onClick={() => setChallengeError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,64,96,0.6)', padding: '2px', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </motion.div>
                )}

                {frdLoad ? (
                  <div style={{ padding: '40px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.3)' }}>Loading friends…</div>
                ) : friends.length === 0 ? (
                  <div style={{ padding: '50px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👥</div>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>No friends yet</div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.84rem', color: 'rgba(255,255,255,0.3)' }}>Add friends first to challenge them.</div>
                    <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/friends')}
                      style={{ marginTop: '16px', padding: '10px 24px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                      Go to Friends
                    </motion.button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {friends.map(friend => (
                      <motion.div key={friend._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.8rem', color: '#8B5CF6', flexShrink: 0 }}>
                          {(friend.username || '??').slice(0,2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{friend.username}</div>
                          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Lv.{friend.level || '—'} · {(friend.xp || 0).toLocaleString()} XP</div>
                        </div>
                        <motion.button whileHover={{ scale: 1.05, boxShadow: '0 4px 16px rgba(255,64,96,0.35)' }} whileTap={{ scale: 0.96 }}
                          onClick={() => sendChallenge(friend)}
                          style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #FF4060, #CC0033)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          Challenge
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── WAITING ── */}
            {phase === PHASE.WAITING && (
              <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px', textAlign: 'center' }}>
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,64,96,0.1)', border: '1.5px solid rgba(255,64,96,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '1.1rem', color: '#FF4060' }}>⚔</motion.div>
                <div>
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Challenge Sent!</div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)' }}>
                    Waiting for <strong style={{ color: '#fff' }}>{fightState.player2?.username}</strong> to accept…
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.28)', marginTop: '6px' }}>Subject: {subject?.name}</div>
                </div>
                <motion.button whileHover={{ color: '#FF5050' }} onClick={() => {
                    clearInterval(syncPollRef.current)
                    if (fightId) api.delete(`/fights/${fightId}/cancel`).catch(() => {})
                    setPhase(PHASE.SETUP); setFightId(null)
                  }}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '9px 22px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
                  Cancel Challenge
                </motion.button>
              </motion.div>
            )}

            {/* ── LOBBY ── */}
            {phase === PHASE.LOBBY && (
              <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', gap: '32px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF4060', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>⚔ Match Found</div>
                  <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>Get Ready!</h1>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.84rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>{subject?.name} · 15 Questions</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '500px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <motion.div animate={{ boxShadow: [`0 0 20px ${subjectAccent}30`, `0 0 40px ${subjectAccent}60`, `0 0 20px ${subjectAccent}30`] }} transition={{ duration: 2, repeat: Infinity }}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${subjectAccent}12`, border: `2.5px solid ${subjectAccent}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: subjectAccent }}>
                      {(fightState.player1?.avatar || fightState.player1?.username || 'P1').slice(0,2).toUpperCase()}
                    </motion.div>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {fightState.player1?.username || 'Player 1'}
                      {fightState.player1?.userId?.toString() === me && <span style={{ color: '#00F5FF', fontSize: '0.6rem', marginLeft: '5px' }}>(you)</span>}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.22)', borderRadius: '20px', padding: '4px 12px' }}>
                      <motion.div animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00FF88' }} />
                      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#00FF88' }}>Ready</span>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, width: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,64,96,0.1)', border: '1.5px solid rgba(255,64,96,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '0.85rem', color: '#FF4060', boxShadow: '0 0 16px rgba(255,64,96,0.18)' }}>
                      VS
                    </motion.div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <motion.div animate={{ boxShadow: ['0 0 20px #FF406030', '0 0 40px #FF406060', '0 0 20px #FF406030'] }} transition={{ duration: 2, repeat: Infinity }}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,64,96,0.12)', border: '2.5px solid rgba(255,64,96,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#FF4060' }}>
                      {(fightState.player2?.avatar || fightState.player2?.username || 'P2').slice(0,2).toUpperCase()}
                    </motion.div>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {fightState.player2?.username || 'Player 2'}
                      {fightState.player2?.userId?.toString() === me && <span style={{ color: '#FF4060', fontSize: '0.6rem', marginLeft: '5px' }}>(you)</span>}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.22)', borderRadius: '20px', padding: '4px 12px' }}>
                      <motion.div animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00FF88' }} />
                      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#00FF88' }}>Ready</span>
                    </div>
                  </div>
                </div>

                {/* Ready button — only shown before user has clicked ready */}
                {!readyClicked ? (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(0,255,136,0.35)' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { if (fightId) callReadyAndPoll(fightId) }}
                    style={{ padding: '13px 40px', background: 'linear-gradient(135deg, #00FF88, #00C96B)', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    I&apos;m Ready!
                  </motion.button>
                ) : (
                  <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: '#00FF88', margin: 0 }}>
                    Waiting for opponent to ready up…
                  </motion.p>
                )}
              </motion.div>
            )}

                </AnimatePresence>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Countdown overlay — timestamp-based, synchronized */}
      <AnimatePresence>
        {phase === PHASE.COUNTDOWN && countdownStartedAt && (
          <LiveCountdown
            key="live-cd"
            countdownStartedAt={countdownStartedAt}
            countdownDuration={3}
            onExpired={handleCountdownExpired}
          />
        )}
      </AnimatePresence>

      {/* Result modal */}
      <FightResultModal show={phase === PHASE.DONE} result={result} player1={fightState.player1} player2={fightState.player2} currentUserId={me} totalQuestions={questions.length} onClose={resetToSetup} />

      {/* Opponent left overlay */}
      {opponentLeft && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(10,10,18,0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{
              background: 'rgba(20,20,30,0.98)',
              border: '1px solid rgba(255,184,0,0.3)',
              borderRadius: '24px',
              padding: '40px 36px',
              maxWidth: '420px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,184,0,0.15)',
            }}
          >
            <div style={{ fontSize: '2.8rem', marginBottom: '16px' }}>🚪</div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#FFB800', marginBottom: '10px' }}>
              Opponent Left
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '28px' }}>
              <strong style={{ color: '#fff' }}>
                {fightState.player1?.userId?.toString() === me ? fightState.player2?.username : fightState.player1?.username}
              </strong> has left the fight.
              <br />The match has been abandoned.
            </div>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(0,245,255,0.3)' }}
              whileTap={{ scale: 0.96 }}
              onClick={resetToSetup}
              style={{
                padding: '13px 32px',
                background: 'linear-gradient(135deg, #00F5FF, #0080FF)',
                border: 'none', borderRadius: '14px', cursor: 'pointer',
                fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem',
                color: '#000',
              }}
            >
              Back to Fight Menu
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      <AvatarAssistant />
    </motion.div>
  )
}
