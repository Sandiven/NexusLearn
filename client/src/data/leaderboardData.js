// ─────────────────────────────────────────────────────────
// Tier definitions — single source of truth for FE + BE
// ─────────────────────────────────────────────────────────
export const TIERS = {
  'S+': {
    label:   'S+',
    name:    'Elite',
    color:   '#FFB800',
    glow:    'rgba(255,184,0,0.45)',
    bg:      'rgba(255,184,0,0.12)',
    border:  'rgba(255,184,0,0.35)',
    minRank: 1,
    maxRank: 3,
  },
  'S': {
    label:   'S',
    name:    'Pro',
    color:   '#00F5FF',
    glow:    'rgba(0,245,255,0.4)',
    bg:      'rgba(0,245,255,0.1)',
    border:  'rgba(0,245,255,0.3)',
    minRank: 4,
    maxRank: 13,
  },
  'A': {
    label:   'A',
    name:    'Skilled',
    color:   '#8B5CF6',
    glow:    'rgba(139,92,246,0.38)',
    bg:      'rgba(139,92,246,0.1)',
    border:  'rgba(139,92,246,0.28)',
    minRank: 14,
    maxRank: 43,
  },
  'B': {
    label:   'B',
    name:    'Beginner',
    color:   '#00FF88',
    glow:    'rgba(0,255,136,0.3)',
    bg:      'rgba(0,255,136,0.08)',
    border:  'rgba(0,255,136,0.22)',
    minRank: 44,
    maxRank: 100,
  },
  'C': {
    label:   'C',
    name:    'Rookie',
    color:   'rgba(255,255,255,0.35)',
    glow:    'transparent',
    bg:      'rgba(255,255,255,0.05)',
    border:  'rgba(255,255,255,0.12)',
    minRank: 101,
    maxRank: Infinity,
  },
}

export function getTier(rank) {
  if (rank <= 3)   return TIERS['S+']
  if (rank <= 13)  return TIERS['S']
  if (rank <= 43)  return TIERS['A']
  if (rank <= 100) return TIERS['B']
  return TIERS['C']
}

// ── Mock global leaderboard ───────────────────────────────
export const MOCK_GLOBAL = [
  { rank: 1,  userId: 'u1',  username: 'CyberMind',    avatar: 'CM', xp: 48200, coins: 1840, streak: 34, level: 22 },
  { rank: 2,  userId: 'u2',  username: 'NightOwl',     avatar: 'NO', xp: 41500, coins: 1520, streak: 21, level: 19 },
  { rank: 3,  userId: 'u3',  username: 'QuantumCoder', avatar: 'QC', xp: 38900, coins: 1340, streak: 15, level: 18 },
  { rank: 4,  userId: 'u4',  username: 'StellarMind',  avatar: 'SM', xp: 35200, coins: 1180, streak: 9,  level: 16 },
  { rank: 5,  userId: 'u5',  username: 'NovaSpark',    avatar: 'NS', xp: 29800, coins:  960, streak: 7,  level: 14 },
  { rank: 6,  userId: 'u6',  username: 'CodeWitch',    avatar: 'CW', xp: 27400, coins:  820, streak: 12, level: 13 },
  { rank: 7,  userId: 'u7',  username: 'ByteKnight',   avatar: 'BK', xp: 24900, coins:  740, streak: 5,  level: 12 },
  { rank: 8,  userId: 'u8',  username: 'AlgoMaster',   avatar: 'AM', xp: 22100, coins:  680, streak: 18, level: 11 },
  { rank: 9,  userId: 'u9',  username: 'DataForge',    avatar: 'DF', xp: 19800, coins:  610, streak: 3,  level: 10 },
  { rank: 10, userId: 'u10', username: 'LogicPulse',   avatar: 'LP', xp: 17300, coins:  560, streak: 6,  level: 9  },
  { rank: 11, userId: 'u11', username: 'NullPointer',  avatar: 'NP', xp: 15200, coins:  490, streak: 2,  level: 8  },
  { rank: 12, userId: 'u12', username: 'PixelWarden',  avatar: 'PW', xp: 13800, coins:  430, streak: 8,  level: 8  },
  { rank: 13, userId: 'u13', username: 'VectorPath',   avatar: 'VP', xp: 12100, coins:  380, streak: 4,  level: 7  },
  { rank: 14, userId: 'u14', username: 'SyntaxRider',  avatar: 'SR', xp: 10900, coins:  330, streak: 1,  level: 7  },
  { rank: 15, userId: 'u15', username: 'BinaryGhost',  avatar: 'BG', xp:  9500, coins:  280, streak: 11, level: 6  },
  { rank: 16, userId: 'u16', username: 'KernelHawk',   avatar: 'KH', xp:  8200, coins:  240, streak: 7,  level: 6  },
  { rank: 17, userId: 'u17', username: 'StackWalker',  avatar: 'SW', xp:  7100, coins:  200, streak: 3,  level: 5  },
  { rank: 18, userId: 'u18', username: 'RecurseBot',   avatar: 'RB', xp:  6300, coins:  170, streak: 5,  level: 5  },
  { rank: 19, userId: 'u19', username: 'HashRunner',   avatar: 'HR', xp:  5400, coins:  140, streak: 2,  level: 4  },
  { rank: 20, userId: 'u20', username: 'TreeClimber',  avatar: 'TC', xp:  4600, coins:  110, streak: 9,  level: 4  },
]

// Mock contest leaderboard
export const MOCK_CONTEST_RESULTS = [
  { rank: 1, userId: 'u1', username: 'CyberMind',    avatar: 'CM', level: 22, score: 1130, correctAnswers: 10, totalQuestions: 10, completionTime: 87,  xpAwarded: 500 },
  { rank: 2, userId: 'u3', username: 'QuantumCoder', avatar: 'QC', level: 18, score: 1080, correctAnswers: 10, totalQuestions: 10, completionTime: 112, xpAwarded: 500 },
  { rank: 3, userId: 'u2', username: 'NightOwl',     avatar: 'NO', level: 19, score:  920, correctAnswers: 9,  totalQuestions: 10, completionTime: 134, xpAwarded: 390 },
  { rank: 4, userId: 'u6', username: 'CodeWitch',    avatar: 'CW', level: 13, score:  850, correctAnswers: 8,  totalQuestions: 10, completionTime: 198, xpAwarded: 340 },
  { rank: 5, userId: 'u5', username: 'NovaSpark',    avatar: 'NS', level: 14, score:  710, correctAnswers: 7,  totalQuestions: 10, completionTime: 215, xpAwarded: 265 },
  { rank: 6, userId: 'u8', username: 'AlgoMaster',   avatar: 'AM', level: 11, score:  640, correctAnswers: 6,  totalQuestions: 10, completionTime: 241, xpAwarded: 215 },
  { rank: 7, userId: 'u4', username: 'StellarMind',  avatar: 'SM', level: 16, score:  580, correctAnswers: 6,  totalQuestions: 10, completionTime: 267, xpAwarded: 215 },
  { rank: 8, userId: 'u9', username: 'DataForge',    avatar: 'DF', level: 10, score:  490, correctAnswers: 5,  totalQuestions: 10, completionTime: 289, xpAwarded: 165 },
]

export function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// Assign tiers to any sorted list
export function withTiers(entries) {
  return entries.map((e, i) => ({ ...e, rank: e.rank || i + 1, tier: getTier(e.rank || i + 1) }))
}
