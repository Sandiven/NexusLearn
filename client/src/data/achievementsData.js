// ─────────────────────────────────────────────────────────
// Achievement catalogue — mirrors achievementEngine.js
// ─────────────────────────────────────────────────────────

export const RARITY_CONFIG = {
  common:    { label: 'Common',    color: 'rgba(255,255,255,0.55)', glow: 'rgba(255,255,255,0.1)',   border: 'rgba(255,255,255,0.18)', ring: 'rgba(255,255,255,0.12)' },
  rare:      { label: 'Rare',      color: '#00F5FF',                glow: 'rgba(0,245,255,0.25)',   border: 'rgba(0,245,255,0.35)',   ring: 'rgba(0,245,255,0.15)'  },
  epic:      { label: 'Epic',      color: '#8B5CF6',                glow: 'rgba(139,92,246,0.3)',   border: 'rgba(139,92,246,0.4)',   ring: 'rgba(139,92,246,0.15)' },
  legendary: { label: 'Legendary', color: '#FFB800',                glow: 'rgba(255,184,0,0.35)',   border: 'rgba(255,184,0,0.5)',    ring: 'rgba(255,184,0,0.18)'  },
}

export const CATEGORY_CONFIG = {
  learning:    { label: 'Learning',     accent: '#00F5FF' },
  streak:      { label: 'Streak',       accent: '#FF6B35' },
  competition: { label: 'Competition',  accent: '#FFB800' },
  social:      { label: 'Social',       accent: '#8B5CF6' },
  collection:  { label: 'Collection',   accent: '#00FF88' },
  special:     { label: 'Special',      accent: '#FFB800' },
}

export const ACHIEVEMENTS = [
  // Learning
  { key: 'first_level',   name: 'First Blood',       desc: 'Complete your very first learning level.',                    icon: '▶', category: 'learning',    rarity: 'common',    xpReward: 50,   coinReward: 10,  badgeColor: '#00F5FF', order: 1  },
  { key: 'level_5',       name: 'Getting Started',   desc: 'Complete 5 levels across any subjects.',                     icon: '◈', category: 'learning',    rarity: 'common',    xpReward: 100,  coinReward: 20,  badgeColor: '#00F5FF', order: 2  },
  { key: 'level_25',      name: 'Dedicated Learner', desc: 'Complete 25 levels — you\'re building real momentum.',       icon: '◉', category: 'learning',    rarity: 'rare',      xpReward: 250,  coinReward: 50,  badgeColor: '#0080FF', order: 3  },
  { key: 'level_100',     name: 'Centurion',         desc: '100 levels completed. An unstoppable learner.',              icon: '⬡', category: 'learning',    rarity: 'epic',      xpReward: 750,  coinReward: 150, badgeColor: '#8B5CF6', order: 4  },
  { key: 'first_subject', name: 'Subject Master',    desc: 'Complete all levels in a subject.',                          icon: '◆', category: 'learning',    rarity: 'rare',      xpReward: 300,  coinReward: 75,  badgeColor: '#00F5FF', order: 5  },
  { key: 'three_subjects',name: 'Polymath',          desc: 'Complete all levels in 3 different subjects.',              icon: '◐', category: 'learning',    rarity: 'epic',      xpReward: 800,  coinReward: 200, badgeColor: '#8B5CF6', order: 6  },
  // XP
  { key: 'xp_500',        name: 'XP Initiate',       desc: 'Earn 500 total XP.',                                          icon: '⚡', category: 'learning',    rarity: 'common',    xpReward: 50,   coinReward: 0,   badgeColor: '#FFB800', order: 7  },
  { key: 'xp_1000',       name: 'XP Machine',        desc: 'Earn 1,000 total XP.',                                        icon: '⚡', category: 'learning',    rarity: 'common',    xpReward: 100,  coinReward: 0,   badgeColor: '#FFB800', order: 8  },
  { key: 'xp_10000',      name: 'XP Legend',         desc: 'Earn 10,000 total XP. Pure dedication.',                     icon: '⚡', category: 'learning',    rarity: 'legendary', xpReward: 500,  coinReward: 200, badgeColor: '#FFB800', order: 9  },
  // Streak
  { key: 'streak_3',      name: 'Consistent',        desc: 'Maintain a 3-day learning streak.',                          icon: '🔥', category: 'streak',      rarity: 'common',    xpReward: 50,   coinReward: 10,  badgeColor: '#FF6B35', order: 10 },
  { key: 'streak_7',      name: 'Week Warrior',      desc: 'Achieve a 7-day streak.',                                    icon: '🔥', category: 'streak',      rarity: 'rare',      xpReward: 100,  coinReward: 25,  badgeColor: '#FF6B35', order: 11 },
  { key: 'streak_30',     name: 'Month Warrior',     desc: 'A 30-day streak. Iron discipline.',                          icon: '🔥', category: 'streak',      rarity: 'epic',      xpReward: 500,  coinReward: 100, badgeColor: '#FF4060', order: 12 },
  { key: 'streak_100',    name: 'Immortal',          desc: '100-day streak. A true legend.',                              icon: '🔥', category: 'streak',      rarity: 'legendary', xpReward: 2000, coinReward: 500, badgeColor: '#FFB800', order: 13 },
  // Competition
  { key: 'first_contest', name: 'Contestant',        desc: 'Enter your first contest.',                                  icon: '★', category: 'competition', rarity: 'common',    xpReward: 25,   coinReward: 5,   badgeColor: '#0080FF', order: 14 },
  { key: 'contest_win',   name: 'Contest Champion',  desc: 'Win your first contest.',                                    icon: '★', category: 'competition', rarity: 'epic',      xpReward: 300,  coinReward: 100, badgeColor: '#FFB800', order: 15 },
  { key: 'contest_5wins', name: 'Repeat Champion',   desc: 'Win 5 contests. Dominance.',                                icon: '★', category: 'competition', rarity: 'legendary', xpReward: 1000, coinReward: 300, badgeColor: '#FFB800', order: 16 },
  { key: 'first_fight',   name: 'Fighter',           desc: 'Win your first custom fight.',                               icon: '⚔', category: 'competition', rarity: 'rare',      xpReward: 150,  coinReward: 50,  badgeColor: '#FF4060', order: 17 },
  // Social
  { key: 'first_friend',  name: 'Connected',         desc: 'Add your first friend.',                                     icon: '◈', category: 'social',      rarity: 'common',    xpReward: 25,   coinReward: 5,   badgeColor: '#8B5CF6', order: 18 },
  { key: 'ten_friends',   name: 'Networker',         desc: 'Build a network of 10 friends.',                             icon: '◈', category: 'social',      rarity: 'rare',      xpReward: 200,  coinReward: 50,  badgeColor: '#8B5CF6', order: 19 },
  // Special
  { key: 'pioneer',       name: 'Pioneer',           desc: 'One of the first 1,000 users on Nexus Learn.',               icon: '◎', category: 'special',     rarity: 'legendary', xpReward: 500,  coinReward: 200, badgeColor: '#FFB800', order: 20 },
]

// Mock unlocked achievements for UI dev
export const MOCK_UNLOCKED = new Set([
  'first_level', 'level_5', 'xp_500', 'xp_1000', 'streak_3',
  'streak_7', 'first_contest', 'first_friend', 'pioneer',
])

export const MOCK_UNLOCK_DATES = {
  first_level:   '2025-01-10T10:00:00Z',
  level_5:       '2025-01-15T14:30:00Z',
  xp_500:        '2025-01-18T09:15:00Z',
  xp_1000:       '2025-02-01T11:00:00Z',
  streak_3:      '2025-01-13T08:00:00Z',
  streak_7:      '2025-01-17T08:00:00Z',
  first_contest: '2025-01-20T16:00:00Z',
  first_friend:  '2025-01-12T12:00:00Z',
  pioneer:       '2025-01-10T09:00:00Z',
}

export const CATEGORIES = [
  { key: 'all',         label: 'All' },
  { key: 'learning',    label: 'Learning'    },
  { key: 'streak',      label: 'Streak'      },
  { key: 'competition', label: 'Competition' },
  { key: 'social',      label: 'Social'      },
  { key: 'special',     label: 'Special'     },
]

export function getRelativeUnlockDate(iso) {
  if (!iso) return ''
  const diff  = Date.now() - new Date(iso).getTime()
  const days  = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  if (days < 1)     return 'Today'
  if (days === 1)   return 'Yesterday'
  if (days < 7)     return `${days} days ago`
  if (weeks < 4)    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  return `${months} month${months > 1 ? 's' : ''} ago`
}
