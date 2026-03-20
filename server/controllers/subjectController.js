import Subject              from '../models/Subject.js'
import UserSubjectProgress  from '../models/UserSubjectProgress.js'

// ── Default subjects seeded when DB is empty ──────────────
const DEFAULT_SUBJECTS = [
  { name: 'Data Structures',   slug: 'data-structures',   accentColor: '#00F5FF', order: 1, totalLevels: 10, isPublished: true, description: 'Arrays, linked lists, trees, graphs, and more.' },
  { name: 'Algorithms',        slug: 'algorithms',        accentColor: '#8B5CF6', order: 2, totalLevels: 10, isPublished: true, description: 'Sorting, searching, dynamic programming, and graph algorithms.' },
  { name: 'Databases',         slug: 'databases',         accentColor: '#0080FF', order: 3, totalLevels: 10, isPublished: true, description: 'SQL, NoSQL, indexing, transactions, and query optimization.' },
  { name: 'Operating Systems', slug: 'operating-systems', accentColor: '#FFB800', order: 4, totalLevels: 10, isPublished: true, description: 'Processes, memory management, scheduling, and concurrency.' },
  { name: 'Computer Networks', slug: 'networks',          accentColor: '#00FF88', order: 5, totalLevels: 10, isPublished: true, description: 'TCP/IP, HTTP, DNS, routing, and network security.' },
  { name: 'System Design',     slug: 'system-design',     accentColor: '#FF6B35', order: 6, totalLevels: 10, isPublished: true, description: 'Scalable architecture, microservices, caching, and load balancing.' },
]

// Ensure default subjects exist in DB (idempotent — safe to call every request)
async function ensureDefaultSubjects() {
  const count = await Subject.countDocuments()
  if (count === 0) {
    await Subject.insertMany(DEFAULT_SUBJECTS)
  }
}

// @route  GET /api/subjects
// @access Public
export const getAllSubjects = async (req, res, next) => {
  try {
    await ensureDefaultSubjects()
    const subjects = await Subject.find({ isPublished: true }).sort({ order: 1 })
    res.status(200).json({ success: true, data: subjects })
  } catch (err) {
    next(err)
  }
}

// @route  GET /api/subjects/:slug
// @access Public
export const getSubjectBySlug = async (req, res, next) => {
  try {
    await ensureDefaultSubjects()
    const subject = await Subject.findOne({ slug: req.params.slug, isPublished: true })
    if (!subject) return res.status(404).json({ message: 'Subject not found' })
    res.status(200).json({ success: true, data: subject })
  } catch (err) {
    next(err)
  }
}

// @route  POST /api/subjects
// @access Admin
export const createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body)
    res.status(201).json({ success: true, data: subject })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/subjects/progress/me
// Returns the current user's per-subject progress.
// Auto-seeds default subjects if DB is empty.
// Creates default progress records (level=1, xp=0) for any
// subjects the user hasn't started yet.
// ─────────────────────────────────────────────────────────
export const getMySubjectProgress = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Ensure subjects exist first
    await ensureDefaultSubjects()

    const subjects = await Subject.find({ isPublished: true }).sort({ order: 1 })

    if (subjects.length === 0) {
      return res.status(200).json({ success: true, data: [] })
    }

    // Upsert progress doc for each subject — new users get level=1, xpEarned=0
    const progressDocs = await Promise.all(
      subjects.map(s =>
        UserSubjectProgress.findOneAndUpdate(
          { user: userId, subjectSlug: s.slug },
          {
            $setOnInsert: {
              subjectName: s.name,
              totalLevels: s.totalLevels || 10,
              level:           1,
              xpEarned:        0,
              levelsCompleted: 0,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    )

    const data = subjects.map((s, i) => ({
      id:              s._id,
      name:            s.name,
      slug:            s.slug,
      accentColor:     s.accentColor || '#00F5FF',
      totalLevels:     progressDocs[i]?.totalLevels     ?? (s.totalLevels || 10),
      level:           progressDocs[i]?.level           ?? 1,
      xpEarned:        progressDocs[i]?.xpEarned        ?? 0,
      levelsCompleted: progressDocs[i]?.levelsCompleted ?? 0,
    }))

    res.status(200).json({ success: true, data })
  } catch (err) { next(err) }
}
