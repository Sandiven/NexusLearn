// ─────────────────────────────────────────────────────────
// Mock contest data — used until API is live
// ─────────────────────────────────────────────────────────

export const CONTEST_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE:   'active',
  ENDED:    'ended',
}

export const MOCK_CONTESTS = [
  {
    _id:         'c001',
    title:       'Data Structures Sprint',
    description: 'Race through 10 essential data structure questions. Top 3 earn bonus XP.',
    subjectSlug: 'data-structures',
    accentColor: '#00F5FF',
    timeLimit:   300, // 5 minutes in seconds
    status:      CONTEST_STATUS.ACTIVE,
    startTime:   new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    endTime:     new Date(Date.now() + 1000 * 60 * 50).toISOString(),
    xpReward:    500,
    coinReward:  100,
    participationXP: 50,
    isPublished: true,
    participants: 234,
    questions: [
      {
        _id: 'q1', questionText: 'What is the time complexity of accessing an element in an array by index?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctIndex: 2, points: 100, difficulty: 'easy',
      },
      {
        _id: 'q2', questionText: 'Which data structure uses LIFO (Last In, First Out) order?',
        options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'], correctIndex: 1, points: 100, difficulty: 'easy',
      },
      {
        _id: 'q3', questionText: 'What is the worst-case time complexity of searching in a binary search tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 2, points: 100, difficulty: 'medium',
      },
      {
        _id: 'q4', questionText: 'A hash table offers average-case time complexity of ___ for lookups.',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctIndex: 3, points: 100, difficulty: 'easy',
      },
      {
        _id: 'q5', questionText: 'What traversal visits root, left subtree, then right subtree?',
        options: ['Inorder', 'Postorder', 'Preorder', 'Level-order'], correctIndex: 2, points: 100, difficulty: 'medium',
      },
      {
        _id: 'q6', questionText: 'Which heap property states every parent is ≤ its children?',
        options: ['Max-heap', 'Min-heap', 'AVL property', 'BST property'], correctIndex: 1, points: 100, difficulty: 'medium',
      },
      {
        _id: 'q7', questionText: 'What is the space complexity of a singly linked list with n elements?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctIndex: 2, points: 100, difficulty: 'easy',
      },
      {
        _id: 'q8', questionText: 'In a queue, elements are added at the ___ and removed from the ___.',
        options: ['front, rear', 'rear, front', 'top, bottom', 'head, tail'], correctIndex: 1, points: 100, difficulty: 'easy',
      },
      {
        _id: 'q9', questionText: 'Which data structure is most efficient for implementing a priority queue?',
        options: ['Array', 'Linked List', 'Heap', 'Stack'], correctIndex: 2, points: 100, difficulty: 'medium',
      },
      {
        _id: 'q10', questionText: 'What is the time complexity of inserting into a balanced BST?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 1, points: 100, difficulty: 'hard',
      },
    ],
  },
  {
    _id:         'c002',
    title:       'Algorithm Challenge',
    description: 'Sort algorithms, Big-O, and complexity theory. 8 questions, 4 minutes.',
    subjectSlug: 'algorithms',
    accentColor: '#8B5CF6',
    timeLimit:   240,
    status:      CONTEST_STATUS.ACTIVE,
    startTime:   new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    endTime:     new Date(Date.now() + 1000 * 60 * 115).toISOString(),
    xpReward:    400,
    coinReward:  80,
    participationXP: 40,
    isPublished: true,
    participants: 187,
    questions: [
      {
        _id: 'aq1', questionText: 'What is the best-case time complexity of QuickSort?',
        options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'], correctIndex: 2, points: 100, difficulty: 'medium',
      },
      {
        _id: 'aq2', questionText: 'Which sorting algorithm is stable by nature?',
        options: ['QuickSort', 'Heap Sort', 'Merge Sort', 'Selection Sort'], correctIndex: 2, points: 100, difficulty: 'medium',
      },
      {
        _id: 'aq3', questionText: 'What does O(1) space complexity mean?',
        options: ['Linear memory use', 'Logarithmic memory', 'Constant memory regardless of input', 'No memory used'],
        correctIndex: 2, points: 100, difficulty: 'easy',
      },
      {
        _id: 'aq4', questionText: 'Binary search requires the input array to be ___.',
        options: ['Unsorted', 'Sorted', 'Reversed', 'Unique elements only'], correctIndex: 1, points: 100, difficulty: 'easy',
      },
      {
        _id: 'aq5', questionText: 'What is the time complexity of building a heap from n elements?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], correctIndex: 2, points: 100, difficulty: 'hard',
      },
      {
        _id: 'aq6', questionText: 'Which algorithm uses divide and conquer with O(n log n) average?',
        options: ['Bubble Sort', 'Insertion Sort', 'MergeSort', 'Counting Sort'], correctIndex: 2, points: 100, difficulty: 'medium',
      },
      {
        _id: 'aq7', questionText: 'The master theorem applies to recurrences of the form T(n) = ___.',
        options: ['T(n-1) + f(n)', 'aT(n/b) + f(n)', 'T(n) + T(n-1)', 'n·T(n/2)'], correctIndex: 1, points: 100, difficulty: 'hard',
      },
      {
        _id: 'aq8', questionText: 'What is the time complexity of DFS on a graph with V vertices and E edges?',
        options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V × E)'], correctIndex: 2, points: 100, difficulty: 'medium',
      },
    ],
  },
  {
    _id:         'c003',
    title:       'Database Fundamentals',
    description: 'SQL, NoSQL, indexing, and transactions. Starts in 2 hours.',
    subjectSlug: 'databases',
    accentColor: '#0080FF',
    timeLimit:   360,
    status:      CONTEST_STATUS.UPCOMING,
    startTime:   new Date(Date.now() + 1000 * 60 * 120).toISOString(),
    endTime:     new Date(Date.now() + 1000 * 60 * 240).toISOString(),
    xpReward:    450,
    coinReward:  90,
    participationXP: 45,
    isPublished: true,
    participants: 0,
    questions: [],
  },
]

export const MOCK_LEADERBOARD = [
  { rank: 1, username: 'CyberMind',    userLevel: 18, score: 1130, correctAnswers: 10, totalQuestions: 10, completionTime: 87,  xpAwarded: 500 },
  { rank: 2, username: 'QuantumCoder', userLevel: 15, score: 1080, correctAnswers: 10, totalQuestions: 10, completionTime: 112, xpAwarded: 500 },
  { rank: 3, username: 'NightOwl',     userLevel: 12, score: 920,  correctAnswers: 9,  totalQuestions: 10, completionTime: 134, xpAwarded: 390 },
  { rank: 4, username: 'StellarMind',  userLevel: 11, score: 850,  correctAnswers: 8,  totalQuestions: 10, completionTime: 198, xpAwarded: 340 },
  { rank: 5, username: 'NovaSpark',    userLevel: 9,  score: 710,  correctAnswers: 7,  totalQuestions: 10, completionTime: 215, xpAwarded: 265 },
]

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getContestById(id) {
  return MOCK_CONTESTS.find(c => c._id === id) || MOCK_CONTESTS[0]
}
