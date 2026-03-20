// ─────────────────────────────────────────────────────────────────────────────
// Daily Challenge question pool — 30 medium/hard questions across all subjects
// One is selected deterministically per calendar day (index = dayOfYear % pool.length)
// ─────────────────────────────────────────────────────────────────────────────

export const DAILY_POOL = [
  // ── DATA STRUCTURES ───────────────────────────────────────────────────────
  {
    id: 1, subject: 'data-structures', subjectLabel: 'Data Structures',
    difficulty: 'hard', accentColor: '#00F5FF',
    title: 'AVL Rotation',
    question: 'In an AVL tree, after inserting a node causes a left-right imbalance, which rotations are performed?',
    options: ['Single right rotation', 'Single left rotation', 'Left rotation then right rotation', 'Right rotation then left rotation'],
    correctIndex: 2,
    explanation: 'A left-right case requires a left rotation on the left child first, then a right rotation on the unbalanced node.',
  },
  {
    id: 2, subject: 'data-structures', subjectLabel: 'Data Structures',
    difficulty: 'hard', accentColor: '#00F5FF',
    title: 'Red-Black Tree Property',
    question: 'Which property of a Red-Black Tree ensures O(log n) operations?',
    options: ['Root is always red', 'Every path from root to null has the same number of black nodes', 'All leaves are red', 'No two adjacent nodes exist'],
    correctIndex: 1,
    explanation: 'The black-height property ensures the tree remains roughly balanced, guaranteeing O(log n) height.',
  },
  {
    id: 3, subject: 'data-structures', subjectLabel: 'Data Structures',
    difficulty: 'medium', accentColor: '#00F5FF',
    title: 'Hash Collision',
    question: 'Which technique resolves hash collisions by storing all colliding elements in a linked list at the same bucket?',
    options: ['Open addressing', 'Linear probing', 'Separate chaining', 'Quadratic probing'],
    correctIndex: 2,
    explanation: 'Separate chaining appends colliding elements to a linked list at the bucket index.',
  },
  {
    id: 4, subject: 'data-structures', subjectLabel: 'Data Structures',
    difficulty: 'hard', accentColor: '#00F5FF',
    title: 'Segment Tree Query',
    question: 'What is the time complexity of a range query on a Segment Tree?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctIndex: 1,
    explanation: 'A segment tree answers range queries in O(log n) by traversing at most O(log n) nodes.',
  },
  {
    id: 5, subject: 'data-structures', subjectLabel: 'Data Structures',
    difficulty: 'medium', accentColor: '#00F5FF',
    title: 'Graph Representation',
    question: 'For a sparse graph with V vertices and E edges (E << V squared), which representation is most memory-efficient?',
    options: ['Adjacency matrix', 'Adjacency list', 'Edge list only', 'Incidence matrix'],
    correctIndex: 1,
    explanation: 'Adjacency list uses O(V + E) space, far more efficient than adjacency matrix O(V squared) for sparse graphs.',
  },
  // ── ALGORITHMS ────────────────────────────────────────────────────────────
  {
    id: 6, subject: 'algorithms', subjectLabel: 'Algorithms',
    difficulty: 'hard', accentColor: '#8B5CF6',
    title: 'Quicksort Best Pivot',
    question: 'What pivot strategy gives Quicksort an expected O(n log n) performance even on sorted input?',
    options: ['Always pick first element', 'Always pick last element', 'Random pivot selection', 'Always pick the minimum'],
    correctIndex: 2,
    explanation: 'Randomly selecting a pivot avoids worst-case O(n squared) on already-sorted or reverse-sorted arrays.',
  },
  {
    id: 7, subject: 'algorithms', subjectLabel: 'Algorithms',
    difficulty: 'hard', accentColor: '#8B5CF6',
    title: 'Master Theorem',
    question: 'For T(n) = 2T(n/2) + O(n), what does the Master Theorem give?',
    options: ['O(n)', 'O(n log n)', 'O(n squared)', 'O(log n)'],
    correctIndex: 1,
    explanation: 'Case 2 of Master Theorem: a=2, b=2, f(n)=n matches n^(log_b a) giving T(n) = O(n log n).',
  },
  {
    id: 8, subject: 'algorithms', subjectLabel: 'Algorithms',
    difficulty: 'medium', accentColor: '#8B5CF6',
    title: 'Kruskal vs Prim',
    question: 'For a dense graph, which MST algorithm is generally more efficient?',
    options: ["Kruskal's (edge-sort based)", "Prim's with adjacency matrix", "Kruskal's with union-find", 'Both are equally efficient'],
    correctIndex: 1,
    explanation: "Prim's with an adjacency matrix runs O(V squared) which beats Kruskal's O(E log E) when E approaches V squared.",
  },
  {
    id: 9, subject: 'algorithms', subjectLabel: 'Algorithms',
    difficulty: 'hard', accentColor: '#8B5CF6',
    title: 'LCS Recurrence',
    question: 'In the Longest Common Subsequence problem, what is the recurrence when characters match (X[i] == Y[j])?',
    options: ['LCS[i][j] = LCS[i-1][j-1]', 'LCS[i][j] = 1 + LCS[i-1][j-1]', 'LCS[i][j] = max(LCS[i-1][j], LCS[i][j-1])', 'LCS[i][j] = LCS[i][j-1] + 1'],
    correctIndex: 1,
    explanation: 'When characters match, we extend the LCS of the preceding substrings by 1.',
  },
  {
    id: 10, subject: 'algorithms', subjectLabel: 'Algorithms',
    difficulty: 'medium', accentColor: '#8B5CF6',
    title: 'Stable Sort',
    question: 'Which sorting algorithm is stable and has O(n log n) worst-case time complexity?',
    options: ['Quicksort', 'Heapsort', 'Merge Sort', 'Shell Sort'],
    correctIndex: 2,
    explanation: 'Merge Sort is stable (preserves relative order of equal elements) and always runs O(n log n).',
  },
  // ── DATABASES ─────────────────────────────────────────────────────────────
  {
    id: 11, subject: 'databases', subjectLabel: 'Databases',
    difficulty: 'hard', accentColor: '#0080FF',
    title: 'Phantom Read',
    question: 'A phantom read occurs when a transaction re-executes a query and finds rows that were inserted or deleted by another committed transaction.',
    options: ['Deleted only', 'Updated only', 'Inserted or deleted', 'Locked by another transaction'],
    correctIndex: 2,
    explanation: 'Phantom reads involve rows that appear or disappear due to INSERTs or DELETEs from other committed transactions.',
  },
  {
    id: 12, subject: 'databases', subjectLabel: 'Databases',
    difficulty: 'hard', accentColor: '#0080FF',
    title: 'MVCC',
    question: 'Multi-Version Concurrency Control (MVCC) improves read performance by:',
    options: ['Locking rows for readers', 'Keeping multiple versions so reads do not block writes', 'Using optimistic locking only', 'Serializing all transactions'],
    correctIndex: 1,
    explanation: 'MVCC maintains snapshots so readers see a consistent view without blocking writers and vice versa.',
  },
  {
    id: 13, subject: 'databases', subjectLabel: 'Databases',
    difficulty: 'medium', accentColor: '#0080FF',
    title: 'Index Selectivity',
    question: 'A column with HIGH selectivity means:',
    options: ['Many rows share the same value', 'Few rows share the same value (values are mostly unique)', 'The column has a composite index', 'The column is a foreign key'],
    correctIndex: 1,
    explanation: 'High selectivity = high cardinality; most values are distinct, making the index very effective.',
  },
  {
    id: 14, subject: 'databases', subjectLabel: 'Databases',
    difficulty: 'hard', accentColor: '#0080FF',
    title: 'Denormalisation Trade-off',
    question: 'Denormalisation intentionally introduces redundancy to primarily improve:',
    options: ['Write performance', 'Data integrity', 'Read query performance', 'Storage efficiency'],
    correctIndex: 2,
    explanation: 'Denormalisation avoids costly JOINs at the expense of redundancy, boosting read throughput.',
  },
  {
    id: 15, subject: 'databases', subjectLabel: 'Databases',
    difficulty: 'medium', accentColor: '#0080FF',
    title: 'Eventually Consistent',
    question: 'In BASE consistency (used by many NoSQL systems), "Eventually Consistent" means:',
    options: ['All reads return the latest write immediately', 'The system will reach consistency over time without guaranteeing it at every moment', 'Writes are rejected until all replicas confirm', 'Transactions are serialised'],
    correctIndex: 1,
    explanation: 'BASE systems favour availability; replicas may lag but converge to consistency eventually.',
  },
  // ── OPERATING SYSTEMS ─────────────────────────────────────────────────────
  {
    id: 16, subject: 'operating-systems', subjectLabel: 'Operating Systems',
    difficulty: 'hard', accentColor: '#FFB800',
    title: 'Priority Inversion',
    question: 'Priority inversion occurs when a high-priority task is blocked waiting for a resource held by:',
    options: ['Another high-priority task', 'A lower-priority task', 'The kernel scheduler', 'An I/O device'],
    correctIndex: 1,
    explanation: 'Priority inversion: a low-priority task holds a lock needed by a high-priority task, effectively inverting priority order.',
  },
  {
    id: 17, subject: 'operating-systems', subjectLabel: 'Operating Systems',
    difficulty: 'hard', accentColor: '#FFB800',
    title: 'Copy-on-Write Fork',
    question: 'Copy-on-Write (COW) in fork() means:',
    options: ['Child always gets a full memory copy at fork time', 'Parent and child share pages until one writes, then a copy is made', 'Pages are copied lazily to disk', 'The OS duplicates stack only'],
    correctIndex: 1,
    explanation: 'COW defers actual page copying until a write occurs, making fork() very fast for read-heavy workloads.',
  },
  {
    id: 18, subject: 'operating-systems', subjectLabel: 'Operating Systems',
    difficulty: 'medium', accentColor: '#FFB800',
    title: 'Mutex vs Semaphore',
    question: 'A key difference between a mutex and a binary semaphore is:',
    options: ['Mutexes allow multiple holders', 'Only the thread that locked a mutex can unlock it', 'Semaphores cannot be used for signalling', 'Mutexes are always faster'],
    correctIndex: 1,
    explanation: 'A mutex has ownership: only the locking thread can unlock it. A semaphore has no ownership concept.',
  },
  {
    id: 19, subject: 'operating-systems', subjectLabel: 'Operating Systems',
    difficulty: 'hard', accentColor: '#FFB800',
    title: 'TLB Role',
    question: 'The Translation Lookaside Buffer (TLB) speeds up virtual memory access by:',
    options: ['Replacing the page table entirely', 'Caching recent virtual-to-physical address translations', 'Storing page frames in RAM', 'Pre-fetching disk pages'],
    correctIndex: 1,
    explanation: 'The TLB is a small, fast cache of recent page table entries, avoiding expensive page table walks on each access.',
  },
  {
    id: 20, subject: 'operating-systems', subjectLabel: 'Operating Systems',
    difficulty: 'medium', accentColor: '#FFB800',
    title: 'Convoy Effect',
    question: 'The convoy effect in CPU scheduling occurs when:',
    options: ['Many short processes queue behind one long-running process', 'High-priority processes starve low-priority ones', 'Processes have equal burst times', 'The ready queue is empty'],
    correctIndex: 0,
    explanation: 'FCFS suffers convoy effect: short processes must wait for a long one to complete, degrading throughput.',
  },
  // ── COMPUTER NETWORKS ─────────────────────────────────────────────────────
  {
    id: 21, subject: 'computer-networks', subjectLabel: 'Computer Networks',
    difficulty: 'hard', accentColor: '#00FF88',
    title: 'TCP Slow Start Threshold',
    question: 'After TCP detects congestion via timeout, what does it set ssthresh to?',
    options: ['Zero', 'Half the current congestion window', 'The maximum segment size', 'The full receiver window'],
    correctIndex: 1,
    explanation: 'On timeout, ssthresh = cwnd / 2, then cwnd resets to 1 MSS and slow start begins again.',
  },
  {
    id: 22, subject: 'computer-networks', subjectLabel: 'Computer Networks',
    difficulty: 'hard', accentColor: '#00FF88',
    title: 'ARP Spoofing',
    question: 'ARP spoofing allows an attacker to:',
    options: ['Inject false DNS records', 'Associate their MAC address with a legitimate IP to intercept traffic', 'Block HTTPS connections', 'Overflow the routing table'],
    correctIndex: 1,
    explanation: 'ARP spoofing sends fake ARP replies linking the attackers MAC to another hosts IP, enabling man-in-the-middle attacks.',
  },
  {
    id: 23, subject: 'computer-networks', subjectLabel: 'Computer Networks',
    difficulty: 'medium', accentColor: '#00FF88',
    title: 'NAT Purpose',
    question: 'Network Address Translation (NAT) primarily solves:',
    options: ['Routing table overflow', 'IPv4 address exhaustion by allowing many hosts to share one public IP', 'DNS resolution latency', 'Encryption of packets'],
    correctIndex: 1,
    explanation: 'NAT maps multiple private IPs to a single public IP, conserving the scarce IPv4 address space.',
  },
  {
    id: 24, subject: 'computer-networks', subjectLabel: 'Computer Networks',
    difficulty: 'hard', accentColor: '#00FF88',
    title: 'OSPF vs RIP',
    question: 'OSPF is preferred over RIP in large networks primarily because:',
    options: ['RIP uses link-state routing', 'OSPF has no hop count limit and converges faster using Dijkstra', 'RIP uses Dijkstra internally', 'OSPF is distance-vector based'],
    correctIndex: 1,
    explanation: 'OSPF is link-state, runs Dijkstra, has no 15-hop limit, and converges much faster than RIP.',
  },
  {
    id: 25, subject: 'computer-networks', subjectLabel: 'Computer Networks',
    difficulty: 'medium', accentColor: '#00FF88',
    title: 'HTTP/2 Multiplexing',
    question: 'HTTP/2 multiplexing allows:',
    options: ['Multiple TCP connections per domain', 'Multiple requests and responses concurrently over a single TCP connection', 'Parallel DNS lookups', 'Compressed IP headers'],
    correctIndex: 1,
    explanation: 'HTTP/2 streams allow many request/response pairs to fly concurrently over one TCP connection.',
  },
  // ── SYSTEM DESIGN ─────────────────────────────────────────────────────────
  {
    id: 26, subject: 'system-design', subjectLabel: 'System Design',
    difficulty: 'hard', accentColor: '#FF6B35',
    title: 'Write-Ahead Logging',
    question: 'Databases use Write-Ahead Logging (WAL) to ensure:',
    options: ['Faster reads', 'Durability and crash recovery by writing logs before applying changes', 'Higher write throughput without any overhead', 'Automatic index updates'],
    correctIndex: 1,
    explanation: 'WAL writes changes to a log first; if the system crashes, the log is replayed to restore consistency.',
  },
  {
    id: 27, subject: 'system-design', subjectLabel: 'System Design',
    difficulty: 'hard', accentColor: '#FF6B35',
    title: 'Saga Pattern',
    question: 'The Saga pattern in microservices handles distributed transactions by:',
    options: ['Using 2PC across all services', 'Breaking transactions into local transactions with compensating actions on failure', 'Locking all services simultaneously', 'Bypassing consistency entirely'],
    correctIndex: 1,
    explanation: 'A Saga chains local transactions; if one fails, compensating transactions undo the preceding steps.',
  },
  {
    id: 28, subject: 'system-design', subjectLabel: 'System Design',
    difficulty: 'medium', accentColor: '#FF6B35',
    title: 'Bloom Filter',
    question: 'A Bloom filter can definitively answer which type of query?',
    options: ['Is this element definitely in the set?', 'Is this element definitely NOT in the set?', 'How many times was this element inserted?', 'What is the element value?'],
    correctIndex: 1,
    explanation: 'Bloom filters have no false negatives: if the filter says not present, it is definitely absent. But positives may be false.',
  },
  {
    id: 29, subject: 'system-design', subjectLabel: 'System Design',
    difficulty: 'hard', accentColor: '#FF6B35',
    title: 'Thundering Herd',
    question: 'The thundering herd problem in caching occurs when:',
    options: ['A cache fills up and evicts all entries', 'A popular cache key expires and many requests simultaneously hit the DB', 'The load balancer crashes', 'Too many writes bypass the cache'],
    correctIndex: 1,
    explanation: 'When a hot key expires, all concurrent cache misses stampede to the DB. Solved by mutex locks or cache warming.',
  },
  {
    id: 30, subject: 'system-design', subjectLabel: 'System Design',
    difficulty: 'medium', accentColor: '#FF6B35',
    title: 'Idempotency Key',
    question: 'An idempotency key in an API ensures that:',
    options: ['Requests are always authenticated', 'Retrying the same request produces the same result without side effects', 'Responses are cached indefinitely', 'The API uses eventual consistency'],
    correctIndex: 1,
    explanation: 'An idempotency key lets clients safely retry requests; the server detects duplicates and returns the original response.',
  },
]

/**
 * Deterministically pick a question for a given date string (YYYY-MM-DD).
 */
export function pickQuestionForDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z')
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0))
  const dayOfYear = Math.floor((d - start) / 86_400_000)
  const index = dayOfYear % DAILY_POOL.length
  return DAILY_POOL[index]
}

/** Returns today as YYYY-MM-DD in UTC */
export function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}
