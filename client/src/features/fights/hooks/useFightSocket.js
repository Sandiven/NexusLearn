// import { useEffect, useRef, useCallback, useState } from 'react'
// import { io } from 'socket.io-client'

// const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

// export function useFightSocket({ fightId, token, onEvent }) {
//   const socketRef  = useRef(null)
//   const onEventRef = useRef(onEvent)
//   const [connected, setConnected] = useState(false)
//   const [error,     setError]     = useState(null)

//   // Keep onEvent ref current so socket always calls the latest handler
//   useEffect(() => { onEventRef.current = onEvent }, [onEvent])

//   useEffect(() => {
//     if (!fightId || !token) {
//       // Clean up any existing socket when disabled
//       if (socketRef.current) {
//         socketRef.current.disconnect()
//         socketRef.current = null
//         setConnected(false)
//       }
//       return
//     }

//     // Disconnect any existing socket before creating a new one
//     if (socketRef.current) {
//       socketRef.current.disconnect()
//       socketRef.current = null
//     }

//     const socket = io(`${SOCKET_URL}/fight`, {
//       auth: { token },
//       transports: ['websocket', 'polling'],
//       reconnectionAttempts: 8,
//       reconnectionDelay:    500,
//     })

//     socketRef.current = socket

//     socket.on('connect', () => {
//       setConnected(true)
//       setError(null)
//       socket.emit('fight:join', { fightId })
//     })

//     socket.on('connect_error', (err) => {
//       setError(err.message)
//       setConnected(false)
//     })

//     socket.on('disconnect', () => {
//       setConnected(false)
//     })

//     // Re-join on reconnect (in case of brief disconnect)
//     socket.on('reconnect', () => {
//       socket.emit('fight:join', { fightId })
//     })

//     const EVENTS = [
//       'fight:state',
//       'fight:player_joined',
//       'fight:player_disconnected',
//       'fight:countdown',
//       'fight:started',
//       'fight:resumed',
//       'fight:score_update',
//       'fight:next_question',
//       'fight:finished',
//       'fight:error',
//     ]

//     // Use ref-based handler so always calls the latest onEvent
//     EVENTS.forEach(evt => {
//       socket.on(evt, (payload) => onEventRef.current?.(evt, payload))
//     })

//     return () => {
//       EVENTS.forEach(evt => socket.off(evt))
//       socket.disconnect()
//       socketRef.current = null
//     }
//   }, [fightId, token])

//   const submitAnswer = useCallback((questionIndex, selectedIndex, timeTakenMs, correct) => {
//     if (socketRef.current?.connected) {
//       socketRef.current.emit('fight:answer', { fightId, questionIndex, selectedIndex, timeTakenMs, correct })
//     }
//   }, [fightId])

//   const reportTimeout = useCallback((questionIndex) => {
//     if (socketRef.current?.connected) {
//       socketRef.current.emit('fight:timeout', { fightId, questionIndex })
//     }
//   }, [fightId])

//   return { connected, error, submitAnswer, reportTimeout }
// }
import { useEffect, useRef, useCallback, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

export function useFightSocket({ fightId, token, onEvent }) {
  const socketRef  = useRef(null)
  const onEventRef = useRef(onEvent)
  const [connected, setConnected] = useState(false)
  const [error,     setError]     = useState(null)

  // Keep onEvent ref current so socket always calls the latest handler
  useEffect(() => { onEventRef.current = onEvent }, [onEvent])

  useEffect(() => {
    if (!fightId || !token) {
      // Clean up any existing socket when disabled
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setConnected(false)
      }
      return
    }

    // Disconnect any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const socket = io(`${SOCKET_URL}/fight`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 8,
      reconnectionDelay:    500,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setError(null)
      socket.emit('fight:join', { fightId })
    })

    socket.on('connect_error', (err) => {
      setError(err.message)
      setConnected(false)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    // Re-join on reconnect (in case of brief disconnect)
    socket.on('reconnect', () => {
      socket.emit('fight:join', { fightId })
    })

    const EVENTS = [
      'fight:state',
      'fight:player_joined',
      'fight:player_disconnected',
      'fight:countdown',
      'fight:started',
      'fight:resumed',
      'fight:score_update',
      'fight:next_question',
      'fight:finished',
      'fight:error',
    ]

    // Use ref-based handler so always calls the latest onEvent
    EVENTS.forEach(evt => {
      socket.on(evt, (payload) => onEventRef.current?.(evt, payload))
    })

    return () => {
      EVENTS.forEach(evt => socket.off(evt))
      socket.disconnect()
      socketRef.current = null
    }
  }, [fightId, token])

  const submitAnswer = useCallback((questionIndex, selectedIndex, timeTakenMs, correct) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('fight:answer', { fightId, questionIndex, selectedIndex, timeTakenMs, correct })
    }
  }, [fightId])

  const reportTimeout = useCallback((questionIndex) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('fight:timeout', { fightId, questionIndex })
    }
  }, [fightId])

  return { connected, error, submitAnswer, reportTimeout }
}
