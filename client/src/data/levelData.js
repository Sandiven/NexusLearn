// ─────────────────────────────────────────────────────────
// Level state enum
// ─────────────────────────────────────────────────────────
export const LEVEL_STATE = {
  COMPLETED: 'completed',
  ACTIVE:    'active',
  LOCKED:    'locked',
  CONTEST:   'contest',
}

// ─────────────────────────────────────────────────────────
// Subject accent colours keyed by subject slug
// ─────────────────────────────────────────────────────────
export const SUBJECT_ACCENTS = {
  'data-structures':   '#00F5FF',
  'algorithms':        '#8B5CF6',
  'databases':         '#0080FF',
  'operating-systems': '#FFB800',
  'networks':          '#00FF88',
  'system-design':     '#FF6B35',
}

// ─────────────────────────────────────────────────────────
// DSA static level data (used as local fallback only;
// real progress/states are fetched from API in SubjectPage)
// ─────────────────────────────────────────────────────────
export const DATA_STRUCTURES_LEVELS = [
  { id:1,  title:'Arrays & Memory',    description:'Understand arrays in memory, index ops, and time complexity.',            state:LEVEL_STATE.ACTIVE,    xpReward:150, coinReward:30,  col:1, row:0, connections:[2],  type:'standard' },
  { id:2,  title:'Linked Lists',       description:'Build singly and doubly linked lists. Insertion, deletion, traversal.',   state:LEVEL_STATE.LOCKED,    xpReward:200, coinReward:40,  col:2, row:1, connections:[3],  type:'standard' },
  { id:3,  title:'Stacks',             description:'Master the LIFO principle. Stacks for evaluation and backtracking.',      state:LEVEL_STATE.LOCKED,    xpReward:200, coinReward:40,  col:1, row:2, connections:[4],  type:'standard' },
  { id:4,  title:'Queues',             description:'FIFO semantics, circular queues, and dequeues.',                         state:LEVEL_STATE.LOCKED,    xpReward:200, coinReward:40,  col:0, row:3, connections:[5],  type:'standard' },
  { id:5,  title:'Hash Tables',        description:'Hash functions, collision handling. O(1) lookup.',                       state:LEVEL_STATE.LOCKED,    xpReward:250, coinReward:50,  col:1, row:4, connections:[6],  type:'standard' },
  { id:6,  title:'Binary Trees',       description:'Traverse, insert, delete in binary trees. DFS, BFS.',                   state:LEVEL_STATE.LOCKED,    xpReward:300, coinReward:60,  col:2, row:5, connections:[7],  type:'standard' },
  { id:7,  title:'Heaps',              description:'Min/max heaps, priority queues, heap sort.',                             state:LEVEL_STATE.LOCKED,    xpReward:300, coinReward:60,  col:1, row:6, connections:[8],  type:'standard' },
  { id:8,  title:'Graphs',             description:'Adjacency lists/matrices. BFS, DFS, shortest path.',                    state:LEVEL_STATE.LOCKED,    xpReward:350, coinReward:70,  col:0, row:7, connections:[9],  type:'standard' },
  { id:9,  title:'Dynamic Programming',description:'Memoization, tabulation, classical DP problems.',                       state:LEVEL_STATE.LOCKED,    xpReward:400, coinReward:80,  col:1, row:8, connections:[10], type:'standard' },
  { id:10, title:'Advanced DSA',       description:'Tries, segment trees, disjoint sets. Pinnacle of the path.',            state:LEVEL_STATE.LOCKED,    xpReward:500, coinReward:100, col:2, row:9, connections:[],   type:'boss'     },
]

// ─────────────────────────────────────────────────────────
// Generate 10-level placeholder for any subject
// ─────────────────────────────────────────────────────────
function makeGenericLevels(titles) {
  const colPattern = [1, 2, 1, 0, 1, 2, 1, 0, 1, 2]
  return titles.map((title, i) => ({
    id: i + 1, title, description: `Level ${i + 1} of the progression path.`,
    state: i === 0 ? LEVEL_STATE.ACTIVE : LEVEL_STATE.LOCKED,
    xpReward: 100 + (i + 1) * 20, coinReward: 20 + (i + 1) * 5,
    col: colPattern[i], row: i,
    connections: i < titles.length - 1 ? [i + 2] : [],
    type: i === titles.length - 1 ? 'boss' : 'standard',
  }))
}

export const SUBJECTS_META = {
  'data-structures': {
    name: 'Data Structures', slug: 'data-structures',
    description: 'Build the foundational knowledge every engineer needs.',
    accentColor: '#00F5FF',
    levels: DATA_STRUCTURES_LEVELS,
    totalXP: DATA_STRUCTURES_LEVELS.reduce((a, l) => a + l.xpReward, 0),
  },
  'algorithms': {
    name: 'Algorithms', slug: 'algorithms', accentColor: '#8B5CF6',
    description: 'Sorting, searching, dynamic programming, and graph algorithms.',
    levels: makeGenericLevels(['Sorting Basics','Binary Search','Recursion','Divide & Conquer','Greedy Algorithms','Graph BFS/DFS','Dijkstra','Dynamic Programming','Advanced DP','NP-Completeness']),
    totalXP: 2800,
  },
  'databases': {
    name: 'Databases', slug: 'databases', accentColor: '#0080FF',
    description: 'SQL, NoSQL, indexing, transactions, and query optimization.',
    levels: makeGenericLevels(['SQL Basics','Joins','Indexes','Transactions','Normalization','NoSQL Intro','MongoDB','Query Optimization','Sharding','Database Design']),
    totalXP: 2800,
  },
  'operating-systems': {
    name: 'Operating Systems', slug: 'operating-systems', accentColor: '#FFB800',
    description: 'Processes, memory management, scheduling, and concurrency.',
    levels: makeGenericLevels(['Processes & Threads','CPU Scheduling','Memory Management','Virtual Memory','File Systems','I/O Management','Concurrency','Deadlocks','Security','Distributed OS']),
    totalXP: 2800,
  },
  'networks': {
    name: 'Computer Networks', slug: 'networks', accentColor: '#00FF88',
    description: 'TCP/IP, HTTP, DNS, routing, and network security.',
    levels: makeGenericLevels(['OSI Model','TCP/IP','HTTP/HTTPS','DNS','Routing','Switching','Firewalls','Network Security','Load Balancing','CDN & Edge']),
    totalXP: 2800,
  },
  'system-design': {
    name: 'System Design', slug: 'system-design', accentColor: '#FF6B35',
    description: 'Scalable architecture, microservices, caching, and load balancing.',
    levels: makeGenericLevels(['Design Fundamentals','Scalability','Load Balancers','Caching','Databases at Scale','Microservices','Message Queues','CDN','Rate Limiting','Case Studies']),
    totalXP: 2800,
  },
}

export function getSubjectMeta(slug) {
  return SUBJECTS_META[slug] || SUBJECTS_META['data-structures']
}

export function countCompleted(levels) {
  return levels.filter(l => l.state === LEVEL_STATE.COMPLETED).length
}
