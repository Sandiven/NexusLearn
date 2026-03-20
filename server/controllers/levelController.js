import Question          from '../models/Question.js'
import LevelProgress     from '../models/LevelProgress.js'
import UserSubjectProgress from '../models/UserSubjectProgress.js'
import User              from '../models/User.js'
import XPHistory         from '../models/XPHistory.js'

// ── Level metadata per subject ──────────────────────────────────────
const DSA_LEVEL_META = [
  { levelNumber: 1,  title: 'Arrays & Memory',    description: 'Understand arrays in memory, index operations, time complexity.',       xpReward: 10, coinReward: 0,  passingScore: 70 },
  { levelNumber: 2,  title: 'Linked Lists',        description: 'Build singly and doubly linked lists. Insertion, deletion, traversal.', xpReward: 12, coinReward: 0,  passingScore: 70 },
  { levelNumber: 3,  title: 'Stacks',              description: 'Master LIFO. Implement stacks for expression evaluation.',               xpReward: 12, coinReward: 0,  passingScore: 70 },
  { levelNumber: 4,  title: 'Queues',              description: 'FIFO semantics, circular queues, and dequeues.',                        xpReward: 14, coinReward: 0,  passingScore: 70 },
  { levelNumber: 5,  title: 'Hash Tables',         description: 'Hash functions, collision handling. O(1) lookup.',                      xpReward: 14, coinReward: 0,  passingScore: 70 },
  { levelNumber: 6,  title: 'Binary Trees',        description: 'Traverse, insert, delete. DFS, BFS, recursive patterns.',              xpReward: 16, coinReward: 0,  passingScore: 70 },
  { levelNumber: 7,  title: 'Heaps',               description: 'Min/max heaps, priority queues, heap sort.',                           xpReward: 16, coinReward: 0,  passingScore: 70 },
  { levelNumber: 8,  title: 'Graphs',              description: 'Adjacency lists/matrices. BFS, DFS, shortest path.',                   xpReward: 18, coinReward: 0,  passingScore: 70 },
  { levelNumber: 9,  title: 'Dynamic Programming', description: 'Memoization, tabulation, classical DP problems.',                     xpReward: 18, coinReward: 0,  passingScore: 70 },
  { levelNumber: 10, title: 'Advanced DSA',        description: 'Tries, segment trees, and disjoint sets. Pinnacle of the path.',       xpReward: 20, coinReward: 100, passingScore: 70 },
]

// Total XP for DSA = 10+12+12+14+14+16+16+18+18+20 = 150
// Coins: only awarded on full course completion (last level = 100 coins)

function getGenericMeta(levelNumber, subjectName) {
  const totalLevels = 10
  const isLast = levelNumber === totalLevels
  return { levelNumber, title: `${subjectName} — Level ${levelNumber}`, description: `Level ${levelNumber} of ${subjectName}.`, xpReward: 10 + levelNumber, coinReward: isLast ? 100 : 0, passingScore: 70 }
}

const SUBJECT_NAMES = { algorithms: 'Algorithms', databases: 'Databases', 'operating-systems': 'Operating Systems', networks: 'Computer Networks', 'system-design': 'System Design' }

function getLevelMeta(subjectSlug, levelNumber) {
  if (subjectSlug === 'dsa' || subjectSlug === 'data-structures') {
    return DSA_LEVEL_META[levelNumber - 1] || getGenericMeta(levelNumber, 'Data Structures')
  }
  return getGenericMeta(levelNumber, SUBJECT_NAMES[subjectSlug] || subjectSlug)
}

// ── GET /api/levels/:id  (legacy compat) ──────────────────────────────
export const getLevelById = async (req, res, next) => {
  try {
    const { id } = req.params
    const meta = getLevelMeta('data-structures', parseInt(id))
    res.status(200).json({ success: true, data: { ...meta, id: parseInt(id) } })
  } catch (err) { next(err) }
}

// ── GET /api/levels/questions/:levelId ────────────────────────────────
export const getQuestionsByLevel = async (req, res, next) => {
  try {
    const { levelId } = req.params
    const { phase, subjectSlug } = req.query
    const filter = { levelId: parseInt(levelId) }
    if (phase)       filter.phase       = phase
    if (subjectSlug) filter.subjectSlug = subjectSlug
    const questions = await Question.find(filter).select('-correctIndex')
    res.status(200).json({ success: true, data: questions })
  } catch (err) { next(err) }
}

// ── GET /api/levels/subject/:slug/questions/:levelNumber ──────────────
export const getQuestionsBySubjectLevel = async (req, res, next) => {
  try {
    const { slug, levelNumber } = req.params
    const { phase } = req.query
    const filter = { levelId: parseInt(levelNumber), subjectSlug: slug }
    if (phase) filter.phase = phase
    const questions = await Question.find(filter).select('-correctIndex')
    res.status(200).json({ success: true, data: questions })
  } catch (err) { next(err) }
}

// ── GET /api/levels/subject/:slug/progress ────────────────────────────
export const getSubjectLevelProgress = async (req, res, next) => {
  try {
    const { slug } = req.params
    const userId = req.user._id

    const subjectProg = await UserSubjectProgress.findOne({ user: userId, subjectSlug: slug })
    const currentLevel = subjectProg?.level ?? 1

    const levelProgressList = await LevelProgress.find({ user: userId, subjectSlug: slug })
    const lpMap = {}
    levelProgressList.forEach(lp => { lpMap[lp.levelId] = lp })

    const TOTAL = 10
    const levels = []
    for (let i = 1; i <= TOTAL; i++) {
      const meta = getLevelMeta(slug, i)
      const lp   = lpMap[i]
      let state  = 'locked'
      if (lp?.passed || i < currentLevel) state = 'completed'
      else if (i === currentLevel)        state = 'active'

      // Zigzag column layout: 1,2,0,1,2,0...
      const colPattern = [1, 2, 1, 0, 1, 2, 1, 0, 1, 1]
      levels.push({
        id: i, levelNumber: i,
        title: meta.title, description: meta.description,
        xpReward: meta.xpReward, coinReward: meta.coinReward, passingScore: meta.passingScore,
        state,
        col: colPattern[i - 1] ?? 1, row: i - 1,
        connections: i < TOTAL ? [i + 1] : [],
        type: i === TOTAL ? 'boss' : 'standard',
        progress: lp ? {
          phase: lp.phase,
          lectureCompleted: lp.lectureCompleted || false,
          notesCompleted:   lp.notesCompleted   || false,
          testCompleted:    lp.testCompleted     || false,
          cumulativeCompleted: lp.cumulativeCompleted || false,
          contentTestScore: lp.contentTestScore,
          cumulativeScore:  lp.cumulativeScore,
          passed:           lp.passed,
        } : null,
      })
    }

    res.status(200).json({
      success: true,
      data: {
        levels, currentLevel,
        subjectProgress: { xpEarned: subjectProg?.xpEarned ?? 0, levelsCompleted: subjectProg?.levelsCompleted ?? 0 },
      },
    })
  } catch (err) { next(err) }
}

// ── POST /api/levels/progress/update ─────────────────────────────────
export const updateContentProgress = async (req, res, next) => {
  try {
    const { levelId, subjectSlug, field } = req.body
    const userId = req.user._id

    let progress = await LevelProgress.findOne({ user: userId, levelId: parseInt(levelId), subjectSlug })
    if (!progress) progress = new LevelProgress({ user: userId, levelId: parseInt(levelId), subjectSlug })

    if (field === 'lectureCompleted') progress.lectureCompleted = true
    if (field === 'notesCompleted')   progress.notesCompleted   = true

    if (progress.lectureCompleted && progress.notesCompleted) {
      if (!progress.testCompleted) progress.phase = 'content_test'
    }

    await progress.save()
    res.status(200).json({ success: true, data: { lectureCompleted: progress.lectureCompleted, notesCompleted: progress.notesCompleted, phase: progress.phase } })
  } catch (err) { next(err) }
}

// ── POST /api/levels/complete ─────────────────────────────────────────
export const completeLevel = async (req, res, next) => {
  try {
    const { levelId, subjectSlug, phase, answers } = req.body
    const userId = req.user._id
    const lvlNum = parseInt(levelId)

    const questions = await Question.find({ levelId: lvlNum, subjectSlug, phase }).sort({ _id: 1 })
    if (!questions.length) return res.status(404).json({ message: 'No questions found for this level/phase' })

    const correct = answers.filter((ans, i) => ans !== undefined && ans !== null && ans === questions[i]?.correctIndex).length
    const score   = Math.round((correct / questions.length) * 100)
    const meta    = getLevelMeta(subjectSlug, lvlNum)
    const passed  = score >= (meta.passingScore || 70)

    let progress = await LevelProgress.findOne({ user: userId, levelId: lvlNum, subjectSlug })
    if (!progress) progress = new LevelProgress({ user: userId, levelId: lvlNum, subjectSlug })

    progress.attempts += 1

    if (phase === 'content_test') {
      progress.contentTestScore = score
      progress.testCompleted    = true
      if (lvlNum === 1 && passed) {
        await _awardAndAdvance(userId, subjectSlug, lvlNum, meta, progress)
      } else if (lvlNum > 1 && passed) {
        progress.phase = 'cumulative'
      } else if (!passed) {
        // Failed — stay at content_test for retry
        progress.phase = 'content_test'
      }
    }

    if (phase === 'cumulative') {
      progress.cumulativeScore    = score
      progress.cumulativeCompleted = true
      if (passed) {
        await _awardAndAdvance(userId, subjectSlug, lvlNum, meta, progress)
      }
    }

    await progress.save()

    res.status(200).json({ success: true, data: { score, passed, correct, total: questions.length, phase, levelCompleted: progress.passed } })
  } catch (err) { next(err) }
}

async function _awardAndAdvance(userId, subjectSlug, lvlNum, meta, progress) {
  const xpReward   = meta.xpReward  || 10
  const coinReward = meta.coinReward || 0

  // Guard: only award XP/coins and increment counters the FIRST time this level is passed
  const alreadyPassed = progress.passed

  progress.passed       = true
  progress.phase        = 'complete'
  progress.xpAwarded    = xpReward
  progress.coinsAwarded = coinReward
  progress.completedAt  = progress.completedAt || new Date()

  if (!alreadyPassed) {
    await User.findByIdAndUpdate(userId, { $inc: { xp: xpReward, coins: coinReward } })
    await UserSubjectProgress.findOneAndUpdate(
      { user: userId, subjectSlug },
      { $inc: { xpEarned: xpReward, levelsCompleted: 1 }, $max: { level: lvlNum + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    // Record XP event so the XP Activity graph on the Progress page shows level completions
    await XPHistory.create({
      user:     userId,
      amount:   xpReward,
      event:    `level_complete:${subjectSlug}:${lvlNum}`,
      earnedAt: new Date(),
    }).catch(() => {}) // non-critical — never block level completion
  } else {
    // Already passed — just keep the subject level pointer up to date (idempotent)
    await UserSubjectProgress.findOneAndUpdate(
      { user: userId, subjectSlug },
      { $max: { level: lvlNum + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
}

// ── POST /api/levels/seed  — idempotent DSA demo seed ─────────────────
export const seedDemoContent = async (req, res, next) => {
  try {
    const existing = await Question.countDocuments({ subjectSlug: 'data-structures' })
    if (existing > 0) return res.status(200).json({ success: true, message: 'Already seeded', count: existing })
    await seedDSAQuestions()
    const count = await Question.countDocuments({ subjectSlug: 'data-structures' })
    res.status(201).json({ success: true, message: 'DSA questions seeded', count })
  } catch (err) { next(err) }
}

export async function seedDSAQuestions() {
  const existing = await Question.countDocuments({ subjectSlug: 'data-structures' })
  if (existing > 0) return

  await Question.insertMany([
    // ── Level 1 — content_test ─────────────────────────────────────────
    { levelId:1, subjectSlug:'data-structures', phase:'content_test', levelSource:1,
      questionText:'What is the time complexity for accessing an element in an array by index?',
      options:['O(n)','O(log n)','O(1)','O(n²)'], correctIndex:2,
      explanation:'Arrays store elements contiguously so address = base + i×size — computed in O(1).', difficulty:'easy', points:10 },
    { levelId:1, subjectSlug:'data-structures', phase:'content_test', levelSource:1,
      questionText:'What is the time complexity of deleting the first element of an array (elements must shift)?',
      options:['O(1)','O(log n)','O(n)','O(n²)'], correctIndex:2,
      explanation:'Every subsequent element must shift left by one position — O(n).', difficulty:'easy', points:10 },
    { levelId:1, subjectSlug:'data-structures', phase:'content_test', levelSource:1,
      questionText:'An integer array starts at address 0x200; each integer is 4 bytes. What is the address of index 3?',
      options:['0x203','0x20B','0x20C','0x210'], correctIndex:2,
      explanation:'0x200 + 3×4 = 0x200 + 12 = 0x20C.', difficulty:'medium', points:15 },
    { levelId:1, subjectSlug:'data-structures', phase:'content_test', levelSource:1,
      questionText:'Which of the following array operations is NOT O(1)?',
      options:['Read element at index 5','Update element at index 2','Insert at the middle','Read the last element'], correctIndex:2,
      explanation:'Inserting in the middle requires shifting all elements after it — O(n).', difficulty:'easy', points:10 },
    { levelId:1, subjectSlug:'data-structures', phase:'content_test', levelSource:1,
      questionText:'Why do arrays offer O(1) random access?',
      options:['Elements are sorted enabling binary search','A hash table maps each index','Address = base + index × element_size','The OS caches the first element'], correctIndex:2,
      explanation:'Contiguous storage lets CPU calculate any address with one arithmetic operation.', difficulty:'medium', points:10 },

    // ── Level 2 — content_test ─────────────────────────────────────────
    { levelId:2, subjectSlug:'data-structures', phase:'content_test', levelSource:2,
      questionText:'What is the time complexity of inserting a node at the HEAD of a singly linked list?',
      options:['O(n)','O(log n)','O(1)','O(n²)'], correctIndex:2,
      explanation:'Prepending only updates the head pointer — constant time.', difficulty:'easy', points:10 },
    { levelId:2, subjectSlug:'data-structures', phase:'content_test', levelSource:2,
      questionText:'What is the time complexity of accessing the k-th node in a singly linked list?',
      options:['O(1)','O(k)','O(log k)','O(n log n)'], correctIndex:1,
      explanation:'No direct index access — you must traverse k nodes from head.', difficulty:'easy', points:10 },
    { levelId:2, subjectSlug:'data-structures', phase:'content_test', levelSource:2,
      questionText:'What does each node in a singly linked list store?',
      options:['Only its data value','Data and a pointer to the NEXT node','Data and pointers to NEXT and PREV','Only a pointer to next'], correctIndex:1,
      explanation:'Singly linked list node stores its value and a single next pointer.', difficulty:'easy', points:10 },
    { levelId:2, subjectSlug:'data-structures', phase:'content_test', levelSource:2,
      questionText:'Which linked list operation requires O(n) time (singly linked, no tail pointer)?',
      options:['Insert at head','Delete head node','Find and reach the tail node','Read head value'], correctIndex:2,
      explanation:'Without a tail pointer you must traverse all n nodes to find the end.', difficulty:'medium', points:15 },
    { levelId:2, subjectSlug:'data-structures', phase:'content_test', levelSource:2,
      questionText:'What is the main advantage of a linked list over an array for frequent mid-list insertions?',
      options:['O(1) random access','Less memory per element','No shifting of elements required','Better CPU cache performance'], correctIndex:2,
      explanation:'Linked list insertion only rewires pointers — no element shifting needed.', difficulty:'medium', points:10 },

    // ── Level 2 — cumulative (L1 + L2) ────────────────────────────────
    { levelId:2, subjectSlug:'data-structures', phase:'cumulative', levelSource:1,
      questionText:'[L1] What is the time complexity of reading element at index 7 from an array of 1000 integers?',
      options:['O(1)','O(7)','O(1000)','O(log 1000)'], correctIndex:0,
      explanation:'Array index access is always O(1) regardless of size or index.', difficulty:'easy', points:10 },
    { levelId:2, subjectSlug:'data-structures', phase:'cumulative', levelSource:1,
      questionText:'[L1] Which formula correctly calculates the memory address of array element at index i?',
      options:['base + i','base × i × element_size','base + i × element_size','base - i × element_size'], correctIndex:2,
      explanation:'Address = base + i × element_size — this is why random access is O(1).', difficulty:'medium', points:10 },
    { levelId:2, subjectSlug:'data-structures', phase:'cumulative', levelSource:2,
      questionText:'[L2] In a doubly linked list, what extra pointer does each node store vs a singly linked list?',
      options:['A pointer to the head','A pointer to the previous node','A pointer to a random node','Two next pointers'], correctIndex:1,
      explanation:'Doubly linked list adds a prev pointer for bidirectional traversal.', difficulty:'easy', points:10 },
    { levelId:2, subjectSlug:'data-structures', phase:'cumulative', levelSource:2,
      questionText:'[L2] Time complexity of deleting the TAIL node of a singly linked list (no tail pointer)?',
      options:['O(1)','O(log n)','O(n)','O(n²)'], correctIndex:2,
      explanation:'Must traverse to second-to-last node to update its next pointer — O(n).', difficulty:'medium', points:15 },
    { levelId:2, subjectSlug:'data-structures', phase:'cumulative', levelSource:1,
      questionText:'[L1 vs L2] Which data structure supports O(1) random access by index?',
      options:['Singly linked list','Doubly linked list','Array','Both linked lists and arrays'], correctIndex:2,
      explanation:'Only arrays offer O(1) random access. Linked list access is O(n).', difficulty:'easy', points:10 },
    { levelId:2, subjectSlug:'data-structures', phase:'cumulative', levelSource:2,
      questionText:'[L2] Given a pointer to a node in a singly linked list, inserting a new node AFTER it takes:',
      options:['O(n)','O(log n)','O(1)','O(n²)'], correctIndex:2,
      explanation:'With a direct pointer, only two pointer updates needed — O(1).', difficulty:'medium', points:10 },
  ])
}