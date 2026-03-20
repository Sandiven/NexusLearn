import { useCallback } from 'react'
import useGamificationStore from '@store/gamificationStore'

// Re-export GAME_EVENT for consumers
export { default as useGamificationStore } from '@store/gamificationStore'

export const GAME_EVENT = {
  ATTENTION_QUIZ_CORRECT:  'ATTENTION_QUIZ_CORRECT',
  CONTENT_TEST_COMPLETE:   'CONTENT_TEST_COMPLETE',
  LEVEL_COMPLETED:         'LEVEL_COMPLETED',
  CONTEST_WIN:             'CONTEST_WIN',
  CONTEST_PARTICIPATE:     'CONTEST_PARTICIPATE',
  DAILY_CHALLENGE:         'DAILY_CHALLENGE',
}

/**
 * useGamification — hook for dispatching game events and reading state
 *
 * Usage:
 *   const { dispatch, xp, coins, streak, progress } = useGamification()
 *   await dispatch(GAME_EVENT.LEVEL_COMPLETED)
 *   await dispatch(GAME_EVENT.CONTENT_TEST_COMPLETE, { score: 85 })
 */
export function useGamification() {
  const store = useGamificationStore()

  const dispatch = useCallback(
    async (event, options = {}) => {
      return store.processEvent(event, options)
    },
    [store.processEvent]
  )

  return {
    dispatch,
    xp:            store.xp,
    coins:         store.coins,
    streak:        store.streak,
    longestStreak: store.longestStreak,
    level:         store.level,
    progress:      store.progress,
    isLoading:     store.isLoading,
    fetchProgress: store.fetchProgress,
    hydrateFromUser: store.hydrateFromUser,
  }
}
