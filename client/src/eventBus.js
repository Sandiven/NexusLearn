// ─────────────────────────────────────────────────────────
// Nexus Learn — Global Event Bus
// Lightweight pub/sub for cross-feature communication.
// Usage:
//   import eventBus, { EVENTS } from '@/eventBus'
//   eventBus.emit(EVENTS.LEVEL_COMPLETED, { levelId: 1, xp: 200 })
//   const unsub = eventBus.on(EVENTS.XP_EARNED, (data) => { ... })
//   unsub()  // cleanup
// ─────────────────────────────────────────────────────────

// ── Event type catalogue ──────────────────────────────────
export const EVENTS = {
  // Learning
  LEVEL_COMPLETED:       'LEVEL_COMPLETED',
  SUBJECT_COMPLETED:     'SUBJECT_COMPLETED',
  QUIZ_ANSWERED:         'QUIZ_ANSWERED',

  // Gamification
  XP_EARNED:             'XP_EARNED',
  COINS_EARNED:          'COINS_EARNED',
  LEVEL_UP:              'LEVEL_UP',
  STREAK_UPDATED:        'STREAK_UPDATED',
  STREAK_BROKEN:         'STREAK_BROKEN',

  // Achievements
  ACHIEVEMENT_UNLOCKED:  'ACHIEVEMENT_UNLOCKED',
  ACHIEVEMENT_CHECKED:   'ACHIEVEMENT_CHECKED',

  // Contests
  CONTEST_STARTED:       'CONTEST_STARTED',
  CONTEST_FINISHED:      'CONTEST_FINISHED',
  CONTEST_WON:           'CONTEST_WON',

  // Fights
  FIGHT_STARTED:         'FIGHT_STARTED',
  FIGHT_FINISHED:        'FIGHT_FINISHED',
  FIGHT_WON:             'FIGHT_WON',

  // Social
  FRIEND_ADDED:          'FRIEND_ADDED',
  FRIEND_REQUEST_SENT:   'FRIEND_REQUEST_SENT',

  // Store
  ITEM_PURCHASED:        'ITEM_PURCHASED',
  COINS_SPENT:           'COINS_SPENT',

  // Auth
  USER_LOGGED_IN:        'USER_LOGGED_IN',
  USER_LOGGED_OUT:       'USER_LOGGED_OUT',
}

// ── Bus implementation ────────────────────────────────────
class EventBus {
  constructor() {
    this._listeners = new Map()
  }

  // Subscribe to an event — returns unsubscribe fn
  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set())
    }
    this._listeners.get(event).add(handler)

    return () => this.off(event, handler)
  }

  // Subscribe once
  once(event, handler) {
    const wrapped = (data) => {
      handler(data)
      this.off(event, wrapped)
    }
    return this.on(event, wrapped)
  }

  // Unsubscribe
  off(event, handler) {
    this._listeners.get(event)?.delete(handler)
  }

  // Emit
  emit(event, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[EventBus] ${event}`, data)
    }
    this._listeners.get(event)?.forEach(handler => {
      try { handler(data) } catch (err) {
        console.error(`[EventBus] Error in handler for ${event}:`, err)
      }
    })
  }

  // Remove all listeners for an event
  clear(event) {
    if (event) this._listeners.delete(event)
    else this._listeners.clear()
  }
}

const eventBus = new EventBus()
export default eventBus
