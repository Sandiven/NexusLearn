import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useContestTimer
 * @param {number}   totalSeconds  — full contest time
 * @param {boolean}  active        — whether timer should run
 * @param {function} onExpire      — called when it hits zero
 */
export function useContestTimer(totalSeconds, active, onExpire) {
  const [remaining,  setRemaining]  = useState(totalSeconds)
  const [isRunning,  setIsRunning]  = useState(false)
  const intervalRef  = useRef(null)
  const startTimeRef = useRef(null)
  const hasExpired   = useRef(false)

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
  }, [])

  const reset = useCallback(() => {
    stop()
    setRemaining(totalSeconds)
    hasExpired.current = false
  }, [totalSeconds, stop])

  // Elapsed time since start (seconds used)
  const getElapsed = useCallback(() => {
    if (!startTimeRef.current) return 0
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }, [])

  useEffect(() => {
    if (!active) return

    start()
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = Math.max(0, prev - 1)
        if (next === 0 && !hasExpired.current) {
          hasExpired.current = true
          clearInterval(intervalRef.current)
          setIsRunning(false)
          onExpire?.()
        }
        return next
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [active])

  return { remaining, isRunning, start, stop, reset, getElapsed }
}
