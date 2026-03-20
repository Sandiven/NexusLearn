// ─────────────────────────────────────────────────────────
// Achievement Engine — pure stateless evaluation logic
// All functions are testable without DB calls.
// ─────────────────────────────────────────────────────────

// ── Achievement event types ───────────────────────────────
export const ACH_EVENT = {
  LEVEL_COMPLETED:    'LEVEL_COMPLETED',
  SUBJECT_COMPLETED:  'SUBJECT_COMPLETED',
  STREAK_UPDATED:     'STREAK_UPDATED',
  XP_EARNED:          'XP_EARNED',
  CONTEST_WON:        'CONTEST_WON',
  CONTEST_ENTERED:    'CONTEST_ENTERED',
  FIGHT_WON:          'FIGHT_WON',
  FIGHT_PLAYED:       'FIGHT_PLAYED',
  FRIEND_ADDED:       'FRIEND_ADDED',
  PROFILE_COMPLETED:  'PROFILE_COMPLETED',
}

// ── Full achievement catalogue (mirrors what's in DB) ────
export const ACHIEVEMENT_CATALOGUE = [

  // ── LEARNING ─────────────────────────────────────────
  {
    key: 'first_level', name: 'First Blood',
    description: 'Complete your very first learning level.',
    icon: '▶', category: 'learning', rarity: 'common',
    trigger: { event: ACH_EVENT.LEVEL_COMPLETED, field: 'totalLevelsCompleted', operator: 'gte', value: 1 },
    xpReward: 50, coinReward: 10, badgeColor: '#00F5FF', order: 1,
  },
  {
    key: 'level_5', name: 'Getting Started',
    description: 'Complete 5 levels across any subjects.',
    icon: '◈', category: 'learning', rarity: 'common',
    trigger: { event: ACH_EVENT.LEVEL_COMPLETED, field: 'totalLevelsCompleted', operator: 'gte', value: 5 },
    xpReward: 100, coinReward: 20, badgeColor: '#00F5FF', order: 2,
  },
  {
    key: 'level_25', name: 'Dedicated Learner',
    description: 'Complete 25 levels — you\'re building real momentum.',
    icon: '◉', category: 'learning', rarity: 'rare',
    trigger: { event: ACH_EVENT.LEVEL_COMPLETED, field: 'totalLevelsCompleted', operator: 'gte', value: 25 },
    xpReward: 250, coinReward: 50, badgeColor: '#0080FF', order: 3,
  },
  {
    key: 'level_100', name: 'Centurion',
    description: '100 levels completed. An unstoppable learner.',
    icon: '⬡', category: 'learning', rarity: 'epic',
    trigger: { event: ACH_EVENT.LEVEL_COMPLETED, field: 'totalLevelsCompleted', operator: 'gte', value: 100 },
    xpReward: 750, coinReward: 150, badgeColor: '#8B5CF6', order: 4,
  },
  {
    key: 'first_subject', name: 'Subject Master',
    description: 'Complete all levels in a subject.',
    icon: '◆', category: 'learning', rarity: 'rare',
    trigger: { event: ACH_EVENT.SUBJECT_COMPLETED, field: 'subjectsCompleted', operator: 'gte', value: 1 },
    xpReward: 300, coinReward: 75, badgeColor: '#00F5FF', order: 5,
  },
  {
    key: 'three_subjects', name: 'Polymath',
    description: 'Complete all levels in 3 different subjects.',
    icon: '◐', category: 'learning', rarity: 'epic',
    trigger: { event: ACH_EVENT.SUBJECT_COMPLETED, field: 'subjectsCompleted', operator: 'gte', value: 3 },
    xpReward: 800, coinReward: 200, badgeColor: '#8B5CF6', order: 6,
  },

  // ── XP MILESTONES ────────────────────────────────────
  {
    key: 'xp_500', name: 'XP Initiate',
    description: 'Earn 500 total XP.',
    icon: '⚡', category: 'learning', rarity: 'common',
    trigger: { event: ACH_EVENT.XP_EARNED, field: 'xp', operator: 'gte', value: 500 },
    xpReward: 50, coinReward: 0, badgeColor: '#FFB800', order: 7,
  },
  {
    key: 'xp_1000', name: 'XP Machine',
    description: 'Earn 1,000 total XP.',
    icon: '⚡', category: 'learning', rarity: 'common',
    trigger: { event: ACH_EVENT.XP_EARNED, field: 'xp', operator: 'gte', value: 1000 },
    xpReward: 100, coinReward: 0, badgeColor: '#FFB800', order: 8,
  },
  {
    key: 'xp_10000', name: 'XP Legend',
    description: 'Earn 10,000 total XP. Pure dedication.',
    icon: '⚡', category: 'learning', rarity: 'legendary',
    trigger: { event: ACH_EVENT.XP_EARNED, field: 'xp', operator: 'gte', value: 10000 },
    xpReward: 500, coinReward: 200, badgeColor: '#FFB800', order: 9,
  },

  // ── STREAK ───────────────────────────────────────────
  {
    key: 'streak_3', name: 'Consistent',
    description: 'Maintain a 3-day learning streak.',
    icon: '🔥', category: 'streak', rarity: 'common',
    trigger: { event: ACH_EVENT.STREAK_UPDATED, field: 'streak', operator: 'gte', value: 3 },
    xpReward: 50, coinReward: 10, badgeColor: '#FF6B35', order: 10,
  },
  {
    key: 'streak_7', name: 'Week Warrior',
    description: 'Achieve a 7-day streak.',
    icon: '🔥', category: 'streak', rarity: 'rare',
    trigger: { event: ACH_EVENT.STREAK_UPDATED, field: 'streak', operator: 'gte', value: 7 },
    xpReward: 100, coinReward: 25, badgeColor: '#FF6B35', order: 11,
  },
  {
    key: 'streak_30', name: 'Month Warrior',
    description: 'A 30-day streak. Iron discipline.',
    icon: '🔥', category: 'streak', rarity: 'epic',
    trigger: { event: ACH_EVENT.STREAK_UPDATED, field: 'streak', operator: 'gte', value: 30 },
    xpReward: 500, coinReward: 100, badgeColor: '#FF4060', order: 12,
  },
  {
    key: 'streak_100', name: 'Immortal',
    description: '100-day streak. A true legend.',
    icon: '🔥', category: 'streak', rarity: 'legendary',
    trigger: { event: ACH_EVENT.STREAK_UPDATED, field: 'streak', operator: 'gte', value: 100 },
    xpReward: 2000, coinReward: 500, badgeColor: '#FFB800', order: 13,
  },

  // ── COMPETITION ──────────────────────────────────────
  {
    key: 'first_contest', name: 'Contestant',
    description: 'Enter your first contest.',
    icon: '★', category: 'competition', rarity: 'common',
    trigger: { event: ACH_EVENT.CONTEST_ENTERED, field: 'contestsEntered', operator: 'gte', value: 1 },
    xpReward: 25, coinReward: 5, badgeColor: '#0080FF', order: 14,
  },
  {
    key: 'contest_win', name: 'Contest Champion',
    description: 'Win your first contest.',
    icon: '★', category: 'competition', rarity: 'epic',
    trigger: { event: ACH_EVENT.CONTEST_WON, field: 'contestsWon', operator: 'gte', value: 1 },
    xpReward: 300, coinReward: 100, badgeColor: '#FFB800', order: 15,
  },
  {
    key: 'contest_5wins', name: 'Repeat Champion',
    description: 'Win 5 contests. Dominance.',
    icon: '★', category: 'competition', rarity: 'legendary',
    trigger: { event: ACH_EVENT.CONTEST_WON, field: 'contestsWon', operator: 'gte', value: 5 },
    xpReward: 1000, coinReward: 300, badgeColor: '#FFB800', order: 16,
  },
  {
    key: 'first_fight', name: 'Fighter',
    description: 'Win your first custom fight.',
    icon: '⚔', category: 'competition', rarity: 'rare',
    trigger: { event: ACH_EVENT.FIGHT_WON, field: 'fightsWon', operator: 'gte', value: 1 },
    xpReward: 150, coinReward: 50, badgeColor: '#FF4060', order: 17,
  },

  // ── SOCIAL ───────────────────────────────────────────
  {
    key: 'first_friend', name: 'Connected',
    description: 'Add your first friend.',
    icon: '◈', category: 'social', rarity: 'common',
    trigger: { event: ACH_EVENT.FRIEND_ADDED, field: 'friendCount', operator: 'gte', value: 1 },
    xpReward: 25, coinReward: 5, badgeColor: '#8B5CF6', order: 18,
  },
  {
    key: 'ten_friends', name: 'Networker',
    description: 'Build a network of 10 friends.',
    icon: '◈', category: 'social', rarity: 'rare',
    trigger: { event: ACH_EVENT.FRIEND_ADDED, field: 'friendCount', operator: 'gte', value: 10 },
    xpReward: 200, coinReward: 50, badgeColor: '#8B5CF6', order: 19,
  },

  // ── SPECIAL ──────────────────────────────────────────
  {
    key: 'pioneer', name: 'Pioneer',
    description: 'One of the first 1,000 users on Nexus Learn.',
    icon: '◎', category: 'special', rarity: 'legendary',
    isSecret: false,
    trigger: { event: 'MANUAL', field: null, operator: 'gte', value: 1 },
    xpReward: 500, coinReward: 200, badgeColor: '#FFB800', order: 20,
  },
]

// ── Evaluate which achievements should be granted ─────────
// @param event     — ACH_EVENT string
// @param userStats — { xp, streak, totalLevelsCompleted, subjectsCompleted, contestsWon, ... }
// @param unlockedKeys — Set of keys user already has
// Returns array of achievement keys to unlock
export function checkAchievements(event, userStats, unlockedKeys = new Set()) {
  const toUnlock = []

  for (const ach of ACHIEVEMENT_CATALOGUE) {
    if (!ach.isActive) continue
    if (unlockedKeys.has(ach.key)) continue
    if (ach.trigger.event !== event) continue

    const field = ach.trigger.field
    if (!field) continue

    const userValue = userStats[field] ?? 0
    const threshold = ach.trigger.value
    const op        = ach.trigger.operator

    let passes = false
    switch (op) {
      case 'gte': passes = userValue >= threshold; break
      case 'gt':  passes = userValue >  threshold; break
      case 'lte': passes = userValue <= threshold; break
      case 'lt':  passes = userValue <  threshold; break
      case 'eq':  passes = userValue === threshold; break
    }

    if (passes) toUnlock.push(ach.key)
  }

  return toUnlock
}

export function getAchievementByKey(key) {
  return ACHIEVEMENT_CATALOGUE.find(a => a.key === key) || null
}
