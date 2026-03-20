// ─────────────────────────────────────────────────────────
// Quiz phase enum
// ─────────────────────────────────────────────────────────
export const PHASE = {
  LECTURE:       'lecture',
  NOTES:         'notes',
  CONTENT_TEST:  'content_test',
  CUMULATIVE:    'cumulative',
  COMPLETE:      'complete',
}

// ─────────────────────────────────────────────────────────
// Level 1 — Arrays & Memory
// ─────────────────────────────────────────────────────────
export const LEVEL_1 = {
  id: 1,
  title: 'Arrays & Memory',
  subject: 'Data Structures',
  accentColor: '#00F5FF',
  xpReward: 10,
  coinReward: 0,
  passingScore: 70,
  hasCumulative: false,

  // Lecture video — replace this file with a real mp4 when ready
  lectureVideo: '/lectures/level-1.mp4',

  // Minimal lecture blocks shown alongside/below the video
  lecture: [
    {
      type: 'intro',
      heading: 'Arrays & Memory — Lecture Video',
      body: 'Watch the lecture video above to learn about arrays, contiguous memory, indexing, and time complexity.',
    },
  ],

  // Notes contain the full written study material (moved from lecture)
  notes: [
    { point: 'An array stores elements at contiguous memory locations. Address formula: address = base + (index × element_size).' },
    { point: "Random access is O(1) — the CPU computes any element's address in one arithmetic step, regardless of array size." },
    { point: 'Insertion or deletion in the middle of an array is O(n) — every subsequent element must be shifted.' },
    { point: 'Arrays are zero-indexed in most modern languages: the first element is arr[0], not arr[1].' },
    { point: 'Memory layout example: if A[0] is at 0x100 and each element is 4 bytes, then A[3] is at 0x100 + 3×4 = 0x10C.' },
    { point: 'Static arrays allocate memory once at declaration. Dynamic arrays (like JS Array) grow by allocating a new block and copying.' },
    { point: 'Code: const arr = [10, 20, 30]; — arr[0] gives 10 in O(1). Iterating with a for loop is O(n).' },
    { point: 'Key trade-off: arrays win on O(1) random access but lose on O(n) mid-insertions. Linked lists flip this.' },
  ],

  contentTest: [
    { id: 'ct_1', text: 'What is the time complexity for accessing an element in an array by index?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctIndex: 2, explanation: 'Arrays store elements contiguously so address = base + i×size — computed in O(1).' },
    { id: 'ct_2', text: 'Which best describes how arrays store data in memory?', options: ['Scattered across random addresses', 'In contiguous (adjacent) memory locations', 'In a tree structure', 'In doubly linked nodes'], correctIndex: 1, explanation: 'Arrays use contiguous memory, which enables O(1) access.' },
    { id: 'ct_3', text: 'What is the time complexity of inserting an element in the middle of an array?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctIndex: 2, explanation: 'Inserting in the middle requires shifting all subsequent elements.' },
    { id: 'ct_4', text: 'How is the memory address of arr[i] calculated?', options: ['base + i', 'base × i', 'base + (i × element_size)', 'base - (i × element_size)'], correctIndex: 2, explanation: 'The formula is base + (index × element_size).' },
  ],

  cumulativeQuiz: [],
}

export const LEVEL_2 = {
  id: 2,
  title: 'Linked Lists',
  subject: 'Data Structures',
  accentColor: '#00F5FF',
  xpReward: 12,
  coinReward: 0,
  passingScore: 70,
  hasCumulative: true,

  // Lecture video — replace this file with a real mp4 when ready
  lectureVideo: '/lectures/level-2.mp4',

  // Minimal lecture blocks shown alongside/below the video
  lecture: [
    {
      type: 'intro',
      heading: 'Linked Lists — Lecture Video',
      body: 'Watch the lecture video above to learn about linked list nodes, pointer-based insertion, singly vs doubly linked lists, and time complexity trade-offs.',
    },
  ],

  // Notes contain the full written study material (moved from lecture)
  notes: [
    { point: "A linked list node stores its data value AND a pointer (reference) to the next node. The last node's pointer is null."},
    { point: 'Inserting at the HEAD is O(1) — create a new node, set its next to the current head, update head.' },
    { point: 'Accessing the k-th element requires traversing k nodes from head — O(k), effectively O(n).' },
    { point: 'A doubly linked list adds a "prev" pointer to each node, enabling O(1) deletion when you have a direct reference to the node.' },
    { point: 'No shifting needed for insertions/deletions — just rewire the next/prev pointers of neighbouring nodes.' },
    { point: 'Arrays vs Linked Lists: Arrays win on O(1) random access; linked lists win on O(1) head insertion and pointer-based deletion.' },
    { point: 'JS implementation: class Node { constructor(data) { this.data = data; this.next = null; } }' },
    { point: 'Deleting the tail of a singly linked list (no tail pointer) is O(n) — you must traverse to find the second-to-last node.' },
  ],

  contentTest: [
    { id: 'ct_1', text: 'What is the time complexity of inserting a node at the HEAD of a singly linked list?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctIndex: 2, explanation: 'Prepending only updates the head pointer — constant time.' },
    { id: 'ct_2', text: 'What is the time complexity of accessing the k-th node in a singly linked list?', options: ['O(1)', 'O(k)', 'O(log k)', 'O(n log n)'], correctIndex: 1, explanation: 'No direct index access — you must traverse k nodes from head.' },
    { id: 'ct_3', text: 'What does each node in a singly linked list store?', options: ['Only its data value', 'Data and a pointer to the NEXT node', 'Data and pointers to NEXT and PREV', 'Only a pointer to next'], correctIndex: 1, explanation: 'Singly linked list node stores its value and a single next pointer.' },
    { id: 'ct_4', text: 'What is the main advantage of linked lists over arrays for frequent mid-list insertions?', options: ['O(1) random access', 'Less memory per element', 'No shifting of elements required', 'Better CPU cache performance'], correctIndex: 2, explanation: 'Linked list insertion only rewires pointers — no element shifting needed.' },
  ],

  cumulativeQuiz: [
    { id: 'cum_1', text: '[L1] What is the time complexity of reading element at index 7 from an array of 1000 integers?', options: ['O(1)', 'O(7)', 'O(1000)', 'O(log 1000)'], correctIndex: 0, levelSource: 1 },
    { id: 'cum_2', text: '[L1] Which formula correctly calculates the memory address of array element at index i?', options: ['base + i', 'base × i × element_size', 'base + i × element_size', 'base - i × element_size'], correctIndex: 2, levelSource: 1 },
    { id: 'cum_3', text: '[L2] In a doubly linked list, what extra pointer does each node store vs a singly linked list?', options: ['A pointer to the head', 'A pointer to the previous node', 'A pointer to a random node', 'Two next pointers'], correctIndex: 1, levelSource: 2 },
    { id: 'cum_4', text: '[L2] Time complexity of deleting the TAIL node of a singly linked list (no tail pointer)?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctIndex: 2, levelSource: 2 },
    { id: 'cum_5', text: '[L1 vs L2] Which data structure supports O(1) random access by index?', options: ['Singly linked list', 'Doubly linked list', 'Array', 'Both linked lists and arrays'], correctIndex: 2, levelSource: 1 },
    { id: 'cum_6', text: '[L2] Given a pointer to a node in a singly linked list, inserting a new node AFTER it takes:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctIndex: 2, levelSource: 2 },
  ],
}


// ─────────────────────────────────────────────────────────
// Generic placeholder for levels 3–10
// ─────────────────────────────────────────────────────────
function makePlaceholderLevel(id, title) {
  return {
    id, title, subject: 'Data Structures', accentColor: '#00F5FF',
    xpReward: 10 + id, coinReward: id === 10 ? 100 : 0, passingScore: 70,
    hasCumulative: true,
    lecture: [{ type: 'intro', heading: title, body: `Content for ${title} — coming soon.` }],
    notes: [{ point: `${title} content will be available soon.` }],
    contentTest: [{ id: 'ct_1', text: `Placeholder question for ${title}`, options: ['A', 'B', 'C', 'D'], correctIndex: 0 }],
    cumulativeQuiz: [{ id: 'cum_1', text: `Cumulative placeholder for ${title}`, options: ['A', 'B', 'C', 'D'], correctIndex: 0, levelSource: id }],
  }
}

// ─────────────────────────────────────────────────────────
// Level store
// ─────────────────────────────────────────────────────────
export const LEVELS_DATA = {
  1:  LEVEL_1,
  2:  LEVEL_2,
  3:  makePlaceholderLevel(3, 'Stacks'),
  4:  makePlaceholderLevel(4, 'Queues'),
  5:  makePlaceholderLevel(5, 'Hash Tables'),
  6:  makePlaceholderLevel(6, 'Binary Trees'),
  7:  makePlaceholderLevel(7, 'Heaps'),
  8:  makePlaceholderLevel(8, 'Graphs'),
  9:  makePlaceholderLevel(9, 'Dynamic Programming'),
  10: makePlaceholderLevel(10, 'Advanced DSA'),
}

export function getLevelData(id) {
  return LEVELS_DATA[parseInt(id)] || LEVEL_1
}

export function calcScore(answers, questions) {
  if (!questions || questions.length === 0) return 0
  const correct = answers.filter((ans, i) => {
    const q = questions[i]
    return q != null && ans !== undefined && ans !== null && ans === q.correctIndex
  }).length
  return Math.round((correct / questions.length) * 100)
}
