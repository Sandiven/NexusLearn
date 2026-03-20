// import Fight from '../models/Fight.js'
// import User  from '../models/User.js'
// import jwt   from 'jsonwebtoken'

// // ── In-memory fight rooms ─────────────────────────────────
// // Keyed by fightId string
// const fightRooms = new Map()

// function getRoomState(fightId) {
//   if (!fightRooms.has(fightId)) {
//     fightRooms.set(fightId, {
//       sockets:          {},      // userId -> socketId
//       scores:           {},      // userId -> points total
//       answers:          {},      // userId -> [{ questionIndex, correct, timeTakenMs }]
//       currentQ:         0,
//       countdownStarted: false,
//       countdownAt:      null,    // timestamp when countdown began
//     })
//   }
//   return fightRooms.get(fightId)
// }

// // ── Accuracy-first winner ─────────────────────────────────
// function determineWinner(room, fight) {
//   const p1Id = fight.player1.user.toString()
//   const p2Id = fight.player2.user.toString()
//   const totalQ = fight.questions.length

//   const p1Answers = room.answers[p1Id] || []
//   const p2Answers = room.answers[p2Id] || []

//   const p1Correct = p1Answers.filter(a => a.correct).length
//   const p2Correct = p2Answers.filter(a => a.correct).length
//   const p1Time    = p1Answers.reduce((s, a) => s + (a.timeTakenMs || 0), 0)
//   const p2Time    = p2Answers.reduce((s, a) => s + (a.timeTakenMs || 0), 0)

//   let winnerId = null
//   let isDraw   = false

//   if      (p1Correct > p2Correct) winnerId = p1Id
//   else if (p2Correct > p1Correct) winnerId = p2Id
//   else if (p1Time < p2Time)       winnerId = p1Id
//   else if (p2Time < p1Time)       winnerId = p2Id
//   else                            isDraw   = true

//   return {
//     winnerId, isDraw,
//     p1Correct, p2Correct, p1Time, p2Time, totalQ,
//     p1Score: room.scores[p1Id] || 0,
//     p2Score: room.scores[p2Id] || 0,
//   }
// }

// export function registerFightHandlers(io) {
//   const fightNS = io.of('/fight')

//   // ── Auth middleware ──────────────────────────────────
//   fightNS.use((socket, next) => {
//     const token = socket.handshake.auth?.token
//     if (!token) return next(new Error('Authentication required'))
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET)
//       socket.userId = decoded.id
//       next()
//     } catch {
//       next(new Error('Invalid token'))
//     }
//   })

//   fightNS.on('connection', (socket) => {
//     const userId = socket.userId

//     // ── join fight room ──────────────────────────────
//     socket.on('fight:join', async ({ fightId }) => {
//       try {
//         const fight = await Fight.findById(fightId)
//           .populate('player1.user', 'username avatar')
//           .populate('player2.user', 'username avatar')

//         if (!fight) return socket.emit('fight:error', { message: 'Fight not found' })

//         const p1Id = fight.player1.user._id.toString()
//         const p2Id = fight.player2.user._id.toString()

//         if (userId !== p1Id && userId !== p2Id) {
//           return socket.emit('fight:error', { message: 'Not a participant' })
//         }

//         // Reject re-join if already done
//         if (fight.status === 'finished' || fight.status === 'cancelled') {
//           return socket.emit('fight:error', { message: 'Fight already ended' })
//         }

//         socket.join(fightId)

//         const room = getRoomState(fightId)
//         room.sockets[userId] = socket.id

//         // Init trackers
//         if (!room.scores[p1Id])  room.scores[p1Id]  = 0
//         if (!room.scores[p2Id])  room.scores[p2Id]  = 0
//         if (!room.answers[p1Id]) room.answers[p1Id] = []
//         if (!room.answers[p2Id]) room.answers[p2Id] = []

//         // Mark connected in DB
//         const playerKey = userId === p1Id ? 'player1.connected' : 'player2.connected'
//         await Fight.findByIdAndUpdate(fightId, { [playerKey]: true })

//         // Determine how much countdown time has elapsed if we're already counting
//         let elapsedCountdownMs = 0
//         if (fight.status === 'countdown' && room.countdownAt) {
//           elapsedCountdownMs = Date.now() - room.countdownAt
//         }

//         // Send current fight state to this player
//         socket.emit('fight:state', {
//           fightId,
//           player1:         { userId: p1Id, username: fight.player1.user.username, avatar: fight.player1.user.avatar, score: room.scores[p1Id] },
//           player2:         { userId: p2Id, username: fight.player2.user.username, avatar: fight.player2.user.avatar, score: room.scores[p2Id] },
//           status:          fight.status,
//           questions:       fight.questions,
//           questionCount:   fight.questions.length,
//           timePerQuestion: fight.timePerQuestion,
//           currentQuestion: room.currentQ,
//           // If already in countdown, tell client where we are
//           ...(fight.status === 'countdown' && {
//             countdownCount:     Math.max(1, 3 - Math.floor(elapsedCountdownMs / 1000)),
//             elapsedCountdownMs,
//           }),
//           // If already active, tell client which question we're on
//           ...(fight.status === 'active' && {
//             currentQuestion: room.currentQ,
//             startedAt:       fight.startedAt,
//           }),
//         })

//         // Broadcast join event
//         const bothConnected = Object.keys(room.sockets).length >= 2
//         fightNS.to(fightId).emit('fight:player_joined', {
//           userId,
//           username:      userId === p1Id ? fight.player1.user.username : fight.player2.user.username,
//           bothConnected,
//         })

//         // ── Auto-start countdown when both connected ──
//         if (bothConnected && !room.countdownStarted) {
//           if (['invited', 'accepted'].includes(fight.status)) {
//             room.countdownStarted = true
//             room.countdownAt = Date.now()
//             await Fight.findByIdAndUpdate(fightId, { status: 'countdown' })
//             startCountdown(fightNS, fightId, fight)
//           } else if (fight.status === 'countdown') {
//             // Both reconnected during countdown — send sync'd count
//             room.countdownStarted = true
//             const elapsed = room.countdownAt ? Date.now() - room.countdownAt : 0
//             const remaining = Math.max(1, 3 - Math.floor(elapsed / 1000))
//             fightNS.to(fightId).emit('fight:countdown', { count: remaining })
//           } else if (fight.status === 'active') {
//             // Both reconnected during active fight — send resume event
//             fightNS.to(fightId).emit('fight:resumed', {
//               currentQuestion: room.currentQ,
//               questions:       fight.questions,
//               timePerQuestion: fight.timePerQuestion,
//             })
//           }
//         }
//         // Single player reconnected to an already-active fight
//         else if (fight.status === 'active' && !bothConnected) {
//           socket.emit('fight:resumed', {
//             currentQuestion: room.currentQ,
//             questions:       fight.questions,
//             timePerQuestion: fight.timePerQuestion,
//           })
//         }
//       } catch (err) {
//         console.error('fight:join error', err)
//         socket.emit('fight:error', { message: 'Failed to join fight' })
//       }
//     })

//     // ── Submit answer ────────────────────────────────
//     socket.on('fight:answer', async ({ fightId, questionIndex, selectedIndex, timeTakenMs }) => {
//       try {
//         const fight = await Fight.findById(fightId).lean()
//         if (!fight || fight.status !== 'active') return

//         const room = getRoomState(fightId)
//         if (!room.answers[userId]) room.answers[userId] = []

//         // Ignore duplicate answers
//         if (room.answers[userId].some(a => a.questionIndex === questionIndex)) return

//         const q         = fight.questions[questionIndex]
//         const isCorrect = q ? selectedIndex === q.correctIndex : false
//         const points    = isCorrect ? Math.max(50, 100 - Math.floor(timeTakenMs / 200)) : 0

//         room.scores[userId] = (room.scores[userId] || 0) + points
//         room.answers[userId].push({ questionIndex, selectedIndex, correct: isCorrect, timeTakenMs, points })

//         fightNS.to(fightId).emit('fight:score_update', {
//           userId,
//           score:         room.scores[userId],
//           questionIndex,
//           correct:       isCorrect,
//           points,
//         })

//         // Check if both answered this question
//         const p1Id   = fight.player1.user.toString()
//         const p2Id   = fight.player2.user.toString()
//         const p1Done = room.answers[p1Id]?.some(a => a.questionIndex === questionIndex)
//         const p2Done = room.answers[p2Id]?.some(a => a.questionIndex === questionIndex)

//         if (p1Done && p2Done) {
//           const nextQ = questionIndex + 1
//           room.currentQ = nextQ
//           // Persist current question progress
//           await Fight.findByIdAndUpdate(fightId, { currentQuestion: nextQ })

//           if (nextQ >= fight.questions.length) {
//             await finishFight(fightNS, fightId, room, fight)
//           } else {
//             fightNS.to(fightId).emit('fight:next_question', { questionIndex: nextQ })
//           }
//         }
//       } catch (err) {
//         console.error('fight:answer error', err)
//       }
//     })

//     // ── Question timeout ─────────────────────────────
//     socket.on('fight:timeout', async ({ fightId, questionIndex }) => {
//       try {
//         const fight = await Fight.findById(fightId).lean()
//         if (!fight || fight.status !== 'active') return

//         const room = getRoomState(fightId)
//         if (!room.answers[userId]) room.answers[userId] = []

//         if (!room.answers[userId].some(a => a.questionIndex === questionIndex)) {
//           room.answers[userId].push({
//             questionIndex, selectedIndex: -1,
//             correct: false, timeTakenMs: fight.timePerQuestion * 1000, points: 0,
//           })

//           const p1Id   = fight.player1.user.toString()
//           const p2Id   = fight.player2.user.toString()
//           const p1Done = room.answers[p1Id]?.some(a => a.questionIndex === questionIndex)
//           const p2Done = room.answers[p2Id]?.some(a => a.questionIndex === questionIndex)

//           if (p1Done && p2Done) {
//             const nextQ = questionIndex + 1
//             room.currentQ = nextQ
//             await Fight.findByIdAndUpdate(fightId, { currentQuestion: nextQ })

//             if (nextQ >= fight.questions.length) {
//               await finishFight(fightNS, fightId, room, fight)
//             } else {
//               fightNS.to(fightId).emit('fight:next_question', { questionIndex: nextQ })
//             }
//           }
//         }
//       } catch (err) {
//         console.error('fight:timeout error', err)
//       }
//     })

//     // ── Disconnect ───────────────────────────────────
//     socket.on('disconnect', () => {
//       for (const [fid, room] of fightRooms) {
//         if (room.sockets[userId] === socket.id) {
//           delete room.sockets[userId]
//           fightNS.to(fid).emit('fight:player_disconnected', { userId })
//           break
//         }
//       }
//     })
//   })
// }

// // ── Countdown 3→2→1→Start ───────────────────────────────
// function startCountdown(ns, fightId, fight) {
//   let count = 3
//   ns.to(fightId).emit('fight:countdown', { count })

//   const interval = setInterval(async () => {
//     count--
//     if (count > 0) {
//       ns.to(fightId).emit('fight:countdown', { count })
//     } else {
//       clearInterval(interval)
//       try {
//         await Fight.findByIdAndUpdate(fightId, { status: 'active', startedAt: new Date(), currentQuestion: 0 })
//       } catch {}
//       ns.to(fightId).emit('fight:started', {
//         questions:       fight.questions,
//         timePerQuestion: fight.timePerQuestion,
//       })
//     }
//   }, 1000)
// }

// // ── Finish fight ────────────────────────────────────────
// async function finishFight(ns, fightId, room, fight) {
//   try {
//     const p1Id = fight.player1.user.toString()
//     const p2Id = fight.player2.user.toString()

//     const { winnerId, isDraw, p1Correct, p2Correct, p1Time, p2Time, totalQ, p1Score, p2Score } = determineWinner(room, fight)

//     await Fight.findByIdAndUpdate(fightId, {
//       status:          'finished',
//       winner:          winnerId,
//       isDraw,
//       finishedAt:      new Date(),
//       'player1.score': p1Score,
//       'player2.score': p2Score,
//     })

//     ns.to(fightId).emit('fight:finished', {
//       winnerId,
//       isDraw,
//       scores:         { [p1Id]: p1Score,   [p2Id]: p2Score },
//       accuracy:       { [p1Id]: p1Correct, [p2Id]: p2Correct },
//       timeTotals:     { [p1Id]: p1Time,    [p2Id]: p2Time },
//       totalQuestions: totalQ,
//     })

//     fightRooms.delete(fightId)
//   } catch (err) {
//     console.error('finishFight error', err)
//   }
// }
import Fight from '../models/Fight.js'
import User  from '../models/User.js'
import jwt   from 'jsonwebtoken'

// ── In-memory fight rooms ─────────────────────────────────
// Keyed by fightId string
const fightRooms = new Map()

function getRoomState(fightId) {
  if (!fightRooms.has(fightId)) {
    fightRooms.set(fightId, {
      sockets:          {},      // userId -> socketId
      scores:           {},      // userId -> points total
      answers:          {},      // userId -> [{ questionIndex, correct, timeTakenMs }]
      currentQ:         0,
      countdownStarted: false,
      countdownAt:      null,    // timestamp when countdown began
    })
  }
  return fightRooms.get(fightId)
}

// ── Accuracy-first winner ─────────────────────────────────
function determineWinner(room, fight) {
  const p1Id = fight.player1.user.toString()
  const p2Id = fight.player2.user.toString()
  const totalQ = fight.questions.length

  const p1Answers = room.answers[p1Id] || []
  const p2Answers = room.answers[p2Id] || []

  const p1Correct = p1Answers.filter(a => a.correct).length
  const p2Correct = p2Answers.filter(a => a.correct).length
  const p1Time    = p1Answers.reduce((s, a) => s + (a.timeTakenMs || 0), 0)
  const p2Time    = p2Answers.reduce((s, a) => s + (a.timeTakenMs || 0), 0)

  let winnerId = null
  let isDraw   = false

  if      (p1Correct > p2Correct) winnerId = p1Id
  else if (p2Correct > p1Correct) winnerId = p2Id
  else if (p1Time < p2Time)       winnerId = p1Id
  else if (p2Time < p1Time)       winnerId = p2Id
  else                            isDraw   = true

  return {
    winnerId, isDraw,
    p1Correct, p2Correct, p1Time, p2Time, totalQ,
    p1Score: room.scores[p1Id] || 0,
    p2Score: room.scores[p2Id] || 0,
  }
}

export function registerFightHandlers(io) {
  const fightNS = io.of('/fight')

  // ── Auth middleware ──────────────────────────────────
  fightNS.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  fightNS.on('connection', (socket) => {
    const userId = socket.userId

    // ── join fight room ──────────────────────────────
    socket.on('fight:join', async ({ fightId }) => {
      try {
        const fight = await Fight.findById(fightId)
          .populate('player1.user', 'username avatar')
          .populate('player2.user', 'username avatar')

        if (!fight) return socket.emit('fight:error', { message: 'Fight not found' })

        const p1Id = fight.player1.user._id.toString()
        const p2Id = fight.player2.user._id.toString()

        if (userId !== p1Id && userId !== p2Id) {
          return socket.emit('fight:error', { message: 'Not a participant' })
        }

        // Reject re-join if already done
        if (fight.status === 'finished' || fight.status === 'cancelled') {
          return socket.emit('fight:error', { message: 'Fight already ended' })
        }

        socket.join(fightId)

        const room = getRoomState(fightId)
        room.sockets[userId] = socket.id

        // Init trackers
        if (!room.scores[p1Id])  room.scores[p1Id]  = 0
        if (!room.scores[p2Id])  room.scores[p2Id]  = 0
        if (!room.answers[p1Id]) room.answers[p1Id] = []
        if (!room.answers[p2Id]) room.answers[p2Id] = []

        // Mark connected in DB
        const playerKey = userId === p1Id ? 'player1.connected' : 'player2.connected'
        await Fight.findByIdAndUpdate(fightId, { [playerKey]: true })

        // Determine how much countdown time has elapsed if we're already counting
        let elapsedCountdownMs = 0
        if (fight.status === 'countdown' && room.countdownAt) {
          elapsedCountdownMs = Date.now() - room.countdownAt
        }

        // Send current fight state to this player
        socket.emit('fight:state', {
          fightId,
          player1:         { userId: p1Id, username: fight.player1.user.username, avatar: fight.player1.user.avatar, score: room.scores[p1Id] },
          player2:         { userId: p2Id, username: fight.player2.user.username, avatar: fight.player2.user.avatar, score: room.scores[p2Id] },
          status:          fight.status,
          questions:       fight.questions,
          questionCount:   fight.questions.length,
          timePerQuestion: fight.timePerQuestion,
          currentQuestion: room.currentQ,
          // If already in countdown, tell client where we are
          ...(fight.status === 'countdown' && {
            countdownCount:     Math.max(1, 3 - Math.floor(elapsedCountdownMs / 1000)),
            elapsedCountdownMs,
          }),
          // If already active, tell client which question we're on
          ...(fight.status === 'active' && {
            currentQuestion: room.currentQ,
            startedAt:       fight.startedAt,
          }),
        })

        // Broadcast join event
        const bothConnected = Object.keys(room.sockets).length >= 2
        fightNS.to(fightId).emit('fight:player_joined', {
          userId,
          username:      userId === p1Id ? fight.player1.user.username : fight.player2.user.username,
          bothConnected,
        })

        // ── Auto-start countdown when both connected ──
        if (bothConnected && !room.countdownStarted) {
          if (['invited', 'accepted'].includes(fight.status)) {
            room.countdownStarted = true
            room.countdownAt = Date.now()
            await Fight.findByIdAndUpdate(fightId, { status: 'countdown' })
            startCountdown(fightNS, fightId, fight)
          } else if (fight.status === 'countdown') {
            // Both reconnected during countdown — send sync'd count
            room.countdownStarted = true
            const elapsed = room.countdownAt ? Date.now() - room.countdownAt : 0
            const remaining = Math.max(1, 3 - Math.floor(elapsed / 1000))
            fightNS.to(fightId).emit('fight:countdown', { count: remaining })
          } else if (fight.status === 'active') {
            // Both reconnected during active fight — send resume event
            fightNS.to(fightId).emit('fight:resumed', {
              currentQuestion:   room.currentQ,
              questions:         fight.questions,
              timePerQuestion:   fight.timePerQuestion,
              questionStartedAt: fight.questionStartedAt?.toISOString() || null,
            })
          }
        }
        // Single player reconnected to an already-active fight
        else if (fight.status === 'active' && !bothConnected) {
          socket.emit('fight:resumed', {
            currentQuestion:   room.currentQ,
            questions:         fight.questions,
            timePerQuestion:   fight.timePerQuestion,
            questionStartedAt: fight.questionStartedAt?.toISOString() || null,
          })
        }
      } catch (err) {
        console.error('fight:join error', err)
        socket.emit('fight:error', { message: 'Failed to join fight' })
      }
    })

    // ── Submit answer ────────────────────────────────
    socket.on('fight:answer', async ({ fightId, questionIndex, selectedIndex, timeTakenMs }) => {
      try {
        const fight = await Fight.findById(fightId).lean()
        if (!fight || fight.status !== 'active') return

        const room = getRoomState(fightId)
        if (!room.answers[userId]) room.answers[userId] = []

        // Ignore duplicate answers
        if (room.answers[userId].some(a => a.questionIndex === questionIndex)) return

        const q         = fight.questions[questionIndex]
        const isCorrect = q ? selectedIndex === q.correctIndex : false
        const points    = isCorrect ? Math.max(50, 100 - Math.floor(timeTakenMs / 200)) : 0

        room.scores[userId] = (room.scores[userId] || 0) + points
        room.answers[userId].push({ questionIndex, selectedIndex, correct: isCorrect, timeTakenMs, points })

        fightNS.to(fightId).emit('fight:score_update', {
          userId,
          score:         room.scores[userId],
          questionIndex,
          correct:       isCorrect,
          points,
        })

        // Check if both answered this question
        const p1Id   = fight.player1.user.toString()
        const p2Id   = fight.player2.user.toString()
        const p1Done = room.answers[p1Id]?.some(a => a.questionIndex === questionIndex)
        const p2Done = room.answers[p2Id]?.some(a => a.questionIndex === questionIndex)

        if (p1Done && p2Done) {
          const nextQ = questionIndex + 1
          room.currentQ = nextQ
          // Persist current question progress
          await Fight.findByIdAndUpdate(fightId, { currentQuestion: nextQ })

          if (nextQ >= fight.questions.length) {
            await finishFight(fightNS, fightId, room, fight)
          } else {
            const qStartedAt = new Date()
            await Fight.findByIdAndUpdate(fightId, { questionStartedAt: qStartedAt })
            fightNS.to(fightId).emit('fight:next_question', { questionIndex: nextQ, questionStartedAt: qStartedAt.toISOString() })
          }
        }
      } catch (err) {
        console.error('fight:answer error', err)
      }
    })

    // ── Question timeout ─────────────────────────────
    socket.on('fight:timeout', async ({ fightId, questionIndex }) => {
      try {
        const fight = await Fight.findById(fightId).lean()
        if (!fight || fight.status !== 'active') return

        const room = getRoomState(fightId)
        if (!room.answers[userId]) room.answers[userId] = []

        if (!room.answers[userId].some(a => a.questionIndex === questionIndex)) {
          room.answers[userId].push({
            questionIndex, selectedIndex: -1,
            correct: false, timeTakenMs: fight.timePerQuestion * 1000, points: 0,
          })

          const p1Id   = fight.player1.user.toString()
          const p2Id   = fight.player2.user.toString()
          const p1Done = room.answers[p1Id]?.some(a => a.questionIndex === questionIndex)
          const p2Done = room.answers[p2Id]?.some(a => a.questionIndex === questionIndex)

          if (p1Done && p2Done) {
            const nextQ = questionIndex + 1
            room.currentQ = nextQ
            await Fight.findByIdAndUpdate(fightId, { currentQuestion: nextQ })

            if (nextQ >= fight.questions.length) {
              await finishFight(fightNS, fightId, room, fight)
            } else {
              const qStartedAt = new Date()
            await Fight.findByIdAndUpdate(fightId, { questionStartedAt: qStartedAt })
            fightNS.to(fightId).emit('fight:next_question', { questionIndex: nextQ, questionStartedAt: qStartedAt.toISOString() })
            }
          }
        }
      } catch (err) {
        console.error('fight:timeout error', err)
      }
    })

    // ── Disconnect ───────────────────────────────────
    socket.on('disconnect', () => {
      for (const [fid, room] of fightRooms) {
        if (room.sockets[userId] === socket.id) {
          delete room.sockets[userId]
          fightNS.to(fid).emit('fight:player_disconnected', { userId })
          // After 15s grace period, if player hasn't reconnected, mark fight abandoned
          setTimeout(async () => {
            const stillGone = !room.sockets[userId]
            if (stillGone) {
              try {
                const fight = await Fight.findById(fid)
                if (fight && fight.status === 'active') {
                  await Fight.findByIdAndUpdate(fid, { status: 'finished', finishedAt: new Date(), abandonedBy: userId })
                  fightNS.to(fid).emit('fight:abandoned', { userId })
                }
              } catch {}
            }
          }, 15000)
          break
        }
      }
    })
  })
}

// ── Countdown 3→2→1→Start ───────────────────────────────
function startCountdown(ns, fightId, fight) {
  let count = 3
  ns.to(fightId).emit('fight:countdown', { count })

  const interval = setInterval(async () => {
    count--
    if (count > 0) {
      ns.to(fightId).emit('fight:countdown', { count })
    } else {
      clearInterval(interval)
      try {
        await Fight.findByIdAndUpdate(fightId, { status: 'active', startedAt: new Date(), currentQuestion: 0 })
      } catch {}
      const questionStartedAt = new Date()
      await Fight.findByIdAndUpdate(fightId, { questionStartedAt })
      ns.to(fightId).emit('fight:started', {
        questions:        fight.questions,
        timePerQuestion:  fight.timePerQuestion,
        questionStartedAt: questionStartedAt.toISOString(),
      })
    }
  }, 1000)
}

// ── Finish fight ────────────────────────────────────────
async function finishFight(ns, fightId, room, fight) {
  try {
    const p1Id = fight.player1.user.toString()
    const p2Id = fight.player2.user.toString()

    const { winnerId, isDraw, p1Correct, p2Correct, p1Time, p2Time, totalQ, p1Score, p2Score } = determineWinner(room, fight)

    await Fight.findByIdAndUpdate(fightId, {
      status:          'finished',
      winner:          winnerId,
      isDraw,
      finishedAt:      new Date(),
      'player1.score': p1Score,
      'player2.score': p2Score,
    })

    ns.to(fightId).emit('fight:finished', {
      winnerId,
      isDraw,
      scores:         { [p1Id]: p1Score,   [p2Id]: p2Score },
      accuracy:       { [p1Id]: p1Correct, [p2Id]: p2Correct },
      timeTotals:     { [p1Id]: p1Time,    [p2Id]: p2Time },
      totalQuestions: totalQ,
    })

    fightRooms.delete(fightId)
  } catch (err) {
    console.error('finishFight error', err)
  }
}
