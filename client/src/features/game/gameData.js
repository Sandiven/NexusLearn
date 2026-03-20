// ─────────────────────────────────────────────────────────
// DoorQuest — question bank
// Isolated to this feature. Replace with API call later.
// ─────────────────────────────────────────────────────────

export const DOOR_REWARDS = {
  fire:  { xp: 80,  coins: 20 },   // Hard
  water: { xp: 50,  coins: 12 },   // Medium
  stone: { xp: 30,  coins: 8  },   // Easy
  final: { xp: 200, coins: 50 },   // Grand Door win
}

// Easy questions (Stone Door)
const EASY = [
  {
    question: 'What data structure follows Last-In, First-Out (LIFO) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Heap'],
    correctAnswer: 1,
    difficulty: 'easy',
  },
  {
    question: 'What is the time complexity of accessing an element in an array by index?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    correctAnswer: 2,
    difficulty: 'easy',
  },
  {
    question: 'Which sorting algorithm has a best-case time complexity of O(n)?',
    options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Selection Sort'],
    correctAnswer: 2,
    difficulty: 'easy',
  },
]

// Medium questions (Water Door)
const MEDIUM = [
  {
    question: 'In a binary search tree, what is the average time complexity for search?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 1,
    difficulty: 'medium',
  },
  {
    question: 'Which traversal of a BST gives nodes in sorted order?',
    options: ['Pre-order', 'Post-order', 'Level-order', 'In-order'],
    correctAnswer: 3,
    difficulty: 'medium',
  },
  {
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Standard Query Logic',
      'Sequential Query Layer',
    ],
    correctAnswer: 0,
    difficulty: 'medium',
  },
]

// Hard questions (Fire Door)
const HARD = [
  {
    question: "Dijkstra's algorithm fails on graphs with:",
    options: [
      'Undirected edges',
      'Negative weight edges',
      'Disconnected components',
      'Weighted edges',
    ],
    correctAnswer: 1,
    difficulty: 'hard',
  },
  {
    question: 'In dynamic programming, which technique stores results of sub-problems to avoid re-computation?',
    options: ['Greedy', 'Backtracking', 'Memoization', 'Divide and conquer'],
    correctAnswer: 2,
    difficulty: 'hard',
  },
  {
    question: 'Which consistency model guarantees all nodes see the same data simultaneously?',
    options: ['Eventual consistency', 'Strong consistency', 'Causal consistency', 'Read-your-writes'],
    correctAnswer: 1,
    difficulty: 'hard',
  },
]

// Grand Final Door — always hard
const FINAL = [
  {
    question: 'In CAP theorem, a system under network partition can guarantee at most which two properties?',
    options: [
      'Consistency and Availability',
      'Availability and Partition tolerance',
      'Consistency and Partition tolerance',
      'All three — CAP is not a real trade-off',
    ],
    correctAnswer: 0,
    difficulty: 'hard',
  },
  {
    question: 'Which algorithm finds the minimum spanning tree of a weighted graph using a greedy approach starting from an arbitrary vertex?',
    options: ["Kruskal's", "Dijkstra's", "Prim's", "Bellman-Ford"],
    correctAnswer: 2,
    difficulty: 'hard',
  },
  {
    question: 'What is the space complexity of a recursive DFS on a graph with V vertices and E edges?',
    options: ['O(1)', 'O(E)', 'O(V)', 'O(V + E)'],
    correctAnswer: 2,
    difficulty: 'hard',
  },
]

// ── Helpers ───────────────────────────────────────────────

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getQuestionForDoor(doorType) {
  switch (doorType) {
    case 'fire':  return pickRandom(HARD)
    case 'water': return pickRandom(MEDIUM)
    case 'stone': return pickRandom(EASY)
    default:      return pickRandom(MEDIUM)
  }
}

export function getFinalQuestion() {
  return pickRandom(FINAL)
}

export const DOOR_CONFIG = {
  fire: {
    id:         'fire',
    label:      'Fire Door',
    difficulty: 'Hard',
    diffColor:  '#FF6B35',
    tagline:    'Test your limits',
    // Visual tokens — used inline
    glowColor:  'rgba(255, 100, 30, 0.55)',
    rimColor:   '#FF6B35',
    bgFrom:     'rgba(60, 20, 5, 0.92)',
    bgTo:       'rgba(25, 8, 2, 0.98)',
    innerLight: 'rgba(255, 120, 40, 0.18)',
    borderColor:'rgba(255, 107, 53, 0.35)',
  },
  water: {
    id:         'water',
    label:      'Water Door',
    difficulty: 'Medium',
    diffColor:  '#00BFFF',
    tagline:    'Flow with knowledge',
    glowColor:  'rgba(0, 160, 255, 0.45)',
    rimColor:   '#00BFFF',
    bgFrom:     'rgba(5, 25, 55, 0.92)',
    bgTo:       'rgba(2, 10, 30, 0.98)',
    innerLight: 'rgba(0, 180, 255, 0.14)',
    borderColor:'rgba(0, 191, 255, 0.35)',
  },
  stone: {
    id:         'stone',
    label:      'Stone Door',
    difficulty: 'Easy',
    diffColor:  '#A0A0B0',
    tagline:    'Build your foundation',
    glowColor:  'rgba(140, 140, 160, 0.35)',
    rimColor:   '#9090A8',
    bgFrom:     'rgba(22, 22, 30, 0.95)',
    bgTo:       'rgba(12, 12, 18, 0.99)',
    innerLight: 'rgba(160, 160, 180, 0.10)',
    borderColor:'rgba(144, 144, 168, 0.30)',
  },
}
