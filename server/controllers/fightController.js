// import Fight from '../models/Fight.js'
// import User  from '../models/User.js'

// // POST /api/fights/invite
// export const inviteToFight = async (req, res, next) => {
//   try {
//     const { opponentId, subjectSlug = 'data-structures' } = req.body
//     const userId = req.user._id
//     if (opponentId === userId.toString()) return res.status(400).json({ message: 'Cannot fight yourself' })
//     const opponent = await User.findById(opponentId).select('username avatar')
//     if (!opponent) return res.status(404).json({ message: 'Opponent not found' })
//     const existing = await Fight.findOne({ status: { $in: ['invited','accepted','active'] }, $or: [{ 'player1.user': userId, 'player2.user': opponentId }, { 'player1.user': opponentId, 'player2.user': userId }] })
//     if (existing) return res.status(409).json({ message: 'Fight already in progress', fightId: existing._id })
//     const questions = getRandomQuestions(subjectSlug)
//     const fight = await Fight.create({ player1: { user: userId, score: 0, correctAnswers: 0, answers: [] }, player2: { user: opponentId, score: 0, correctAnswers: 0, answers: [] }, questions, subjectSlug, status: 'invited', questionCount: questions.length })
//     res.status(201).json({ success: true, data: { fightId: fight._id, opponent } })
//   } catch (err) { next(err) }
// }

// // POST /api/fights/accept
// export const acceptFight = async (req, res, next) => {
//   try {
//     const { fightId } = req.body
//     const fight = await Fight.findById(fightId)
//     if (!fight) return res.status(404).json({ message: 'Fight not found' })
//     if (fight.player2.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not invited' })
//     if (fight.status !== 'invited') return res.status(400).json({ message: `Already ${fight.status}` })
//     fight.status = 'accepted'
//     await fight.save()
//     res.status(200).json({ success: true, data: { fightId: fight._id } })
//   } catch (err) { next(err) }
// }

// // GET /api/fights/:id
// export const getFight = async (req, res, next) => {
//   try {
//     const fight = await Fight.findById(req.params.id).populate('player1.user','username avatar level xp').populate('player2.user','username avatar level xp').populate('winner','username avatar')
//     if (!fight) return res.status(404).json({ message: 'Not found' })
//     const uid = req.user._id.toString()
//     if (uid !== fight.player1.user._id.toString() && uid !== fight.player2.user._id.toString()) return res.status(403).json({ message: 'Not a participant' })
//     const data = fight.toObject()
//     if (['active','countdown'].includes(fight.status)) data.questions = data.questions.map(({ correctIndex, ...q }) => q)
//     res.status(200).json({ success: true, data })
//   } catch (err) { next(err) }
// }

// // GET /api/fights/pending
// export const getPendingFights = async (req, res, next) => {
//   try {
//     const fights = await Fight.find({ 'player2.user': req.user._id, status: 'invited' }).populate('player1.user','username avatar level').sort({ createdAt: -1 }).limit(10)
//     res.status(200).json({ success: true, data: fights })
//   } catch (err) { next(err) }
// }

// // ── In-memory random matchmaking queues (per subject) ─────
// // subjectSlug → [{ userId, socketId, username, avatar, level, xp, joinedAt }]
// export const matchmakingQueues = new Map()

// // ── Subject question pools for 1v1 fights ────────────────
// // Each subject has a pool of questions; 15-20 are picked randomly per match
// // ── Static 15-question sets per subject (demo-stable) ─────
// // Each subject has exactly 15 fixed questions.
// // To replace with dynamic questions later, swap getSubjectQuestions().
// export const SUBJECT_QUESTIONS = {
//   'data-structures': [
//     { id: 'ds01', questionText: 'What is the time complexity of accessing an array element by index?', options: ['O(n)','O(log n)','O(1)','O(n²)'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'ds02', questionText: 'Which data structure uses LIFO order?', options: ['Queue','Stack','Linked List','Tree'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'ds03', questionText: 'What is the worst-case time complexity of binary search?', options: ['O(1)','O(log n)','O(n)','O(n log n)'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'ds04', questionText: 'Which traversal visits: left → root → right?', options: ['Preorder','Postorder','Inorder','Level-order'], correctIndex: 2, difficulty: 'medium', points: 100 },
//     { id: 'ds05', questionText: 'What is the average time complexity of a hash table lookup?', options: ['O(n)','O(log n)','O(n²)','O(1)'], correctIndex: 3, difficulty: 'easy', points: 100 },
//     { id: 'ds06', questionText: 'What is the space complexity of a recursive DFS on a tree of depth h?', options: ['O(1)','O(h)','O(n)','O(n²)'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'ds07', questionText: 'Which data structure is best for implementing a priority queue?', options: ['Stack','Queue','Heap','Linked List'], correctIndex: 2, difficulty: 'medium', points: 100 },
//     { id: 'ds08', questionText: 'What is the time complexity of inserting into a sorted linked list?', options: ['O(1)','O(log n)','O(n)','O(n log n)'], correctIndex: 2, difficulty: 'medium', points: 100 },
//     { id: 'ds09', questionText: 'In a max-heap, what is true about the root node?', options: ['Smallest element','Largest element','Median element','Random element'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'ds10', questionText: 'Which operation on a stack is O(1)?', options: ['Search','Push','Sort','Find min'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'ds11', questionText: 'What is the height of a complete binary tree with n nodes?', options: ['O(n)','O(log n)','O(n²)','O(1)'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'ds12', questionText: 'Which traversal gives a sorted order for a BST?', options: ['Preorder','Postorder','Inorder','Level-order'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'ds13', questionText: 'What is the worst-case time complexity of quicksort?', options: ['O(n)','O(n log n)','O(n²)','O(log n)'], correctIndex: 2, difficulty: 'medium', points: 100 },
//     { id: 'ds14', questionText: 'Which data structure uses FIFO order?', options: ['Stack','Queue','Tree','Graph'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'ds15', questionText: 'What is the time complexity of BFS on a graph with V vertices and E edges?', options: ['O(V)','O(E)','O(V+E)','O(V*E)'], correctIndex: 2, difficulty: 'hard', points: 100 },
//   ],
//   'algorithms': [
//     { id: 'al01', questionText: 'What algorithm finds the shortest path in an unweighted graph?', options: ['DFS','BFS','Dijkstra','Bellman-Ford'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'al02', questionText: "Dijkstra's algorithm fails with?", options: ['Directed graphs','Negative weight edges','Cycles','Dense graphs'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'al03', questionText: 'What is dynamic programming?', options: ['Randomized algorithm','Divide and conquer','Memoization of overlapping subproblems','Greedy strategy'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'al04', questionText: 'Which algorithm uses a greedy approach for MST?', options: ['Bellman-Ford','Floyd-Warshall','Kruskal','BFS'], correctIndex: 2, difficulty: 'medium', points: 100 },
//     { id: 'al05', questionText: 'Time complexity of Floyd-Warshall?', options: ['O(V²)','O(V³)','O(E log V)','O(VE)'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'al06', questionText: 'What does memoization do?', options: ['Sorts data','Caches results of subproblems','Parallelizes computation','Reduces memory usage'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'al07', questionText: 'Which paradigm does merge sort use?', options: ['Greedy','Dynamic programming','Divide and conquer','Backtracking'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'al08', questionText: 'The 0/1 Knapsack problem is solved by?', options: ['Greedy','Dynamic programming','Binary search','Graph traversal'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'al09', questionText: 'What is the purpose of the KMP algorithm?', options: ['Graph shortest path','String pattern matching','Sorting','Tree balancing'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'al10', questionText: "Prim's algorithm builds?", options: ['Shortest path tree','Minimum spanning tree','Balanced BST','Topological order'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'al11', questionText: 'Which problem is solved by Bellman-Ford?', options: ['Shortest path with negative weights','MST','Topological sort','Pattern matching'], correctIndex: 0, difficulty: 'hard', points: 100 },
//     { id: 'al12', questionText: 'What is backtracking?', options: ['Trying all possibilities by abandoning invalid paths','Sorting in reverse','Graph shortest path','String search'], correctIndex: 0, difficulty: 'medium', points: 100 },
//     { id: 'al13', questionText: 'Time complexity of topological sort?', options: ['O(V²)','O(V+E)','O(E log V)','O(V log V)'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'al14', questionText: 'Binary search requires the input to be?', options: ['Sorted','Unsorted','A linked list','A graph'], correctIndex: 0, difficulty: 'easy', points: 100 },
//     { id: 'al15', questionText: 'Longest Common Subsequence has complexity?', options: ['O(n)','O(n log n)','O(n*m)','O(n²*m)'], correctIndex: 2, difficulty: 'hard', points: 100 },
//   ],
//   'databases': [
//     { id: 'db01', questionText: 'What does ACID stand for?', options: ['Atomicity, Consistency, Isolation, Durability','Access, Control, Index, Data','Advanced, Cascading, Integrity, Deferred','None of the above'], correctIndex: 0, difficulty: 'easy', points: 100 },
//     { id: 'db02', questionText: 'What is a primary key?', options: ['A key that allows duplicates','A unique identifier for a table row','A foreign table reference','An index key'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'db03', questionText: 'What is normalization?', options: ['Encrypting data','Organizing tables to reduce redundancy','Indexing all columns','Sharding databases'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'db04', questionText: 'Which SQL clause filters grouped results?', options: ['WHERE','HAVING','GROUP BY','ORDER BY'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'db05', questionText: 'INNER JOIN returns?', options: ['All rows from left table','All rows from both tables','Only matching rows from both tables','All non-matching rows'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'db06', questionText: 'What is an index in a database?', options: ['A list of records','A data structure to speed up queries','A foreign key reference','A stored procedure'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'db07', questionText: 'CAP theorem states a distributed system can guarantee?', options: ['All three: C, A, P','Only two of: Consistency, Availability, Partition Tolerance','None of the three','C and A only'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'db08', questionText: 'What does a clustered index do?', options: ['Creates a copy of the table','Sorts the table data by the index key','Creates a hash of all rows','Only applies to foreign keys'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'db09', questionText: 'What is a transaction?', options: ['A query with multiple tables','A unit of work that is atomic','A type of index','A database schema'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'db10', questionText: 'Which NoSQL type is MongoDB?', options: ['Key-value','Column-family','Document store','Graph'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'db11', questionText: 'What is sharding?', options: ['Encrypting data','Horizontally partitioning data across nodes','Vertically splitting tables','Indexing all columns'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'db12', questionText: 'A deadlock in a database occurs when?', options: ['Two transactions wait on each other indefinitely','A table has too many rows','An index is corrupted','A query takes too long'], correctIndex: 0, difficulty: 'medium', points: 100 },
//     { id: 'db13', questionText: 'What is a view in SQL?', options: ['A virtual table based on a query','A stored procedure','A trigger','An index'], correctIndex: 0, difficulty: 'medium', points: 100 },
//     { id: 'db14', questionText: 'Third Normal Form (3NF) eliminates?', options: ['Functional dependencies','Transitive dependencies','Partial dependencies','All redundancy'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'db15', questionText: 'What is eventual consistency?', options: ['Data is always consistent','All nodes converge to same value given no updates','Transactions never conflict','A type of isolation level'], correctIndex: 1, difficulty: 'hard', points: 100 },
//   ],
//   'operating-systems': [
//     { id: 'os01', questionText: 'What is a process?', options: ['A program on disk','A program in execution','A CPU instruction','A system call'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'os02', questionText: 'What is a thread?', options: ['An independent process','A lightweight unit of execution within a process','A system call','A file descriptor'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'os03', questionText: 'What causes a deadlock?', options: ['Too many processes','Circular wait for resources','High CPU usage','Memory leak'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'os04', questionText: 'Virtual memory allows?', options: ['Faster CPU execution','Processes to use more memory than physically available','Hard disk to be used as CPU cache','Unlimited RAM'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'os05', questionText: 'What is paging?', options: ['Swapping processes','Dividing memory into fixed-size pages','Cache replacement policy','CPU scheduling'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'os06', questionText: 'A semaphore is used for?', options: ['Sorting','Synchronization and mutual exclusion','Memory allocation','File management'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'os07', questionText: 'Round-robin scheduling is?', options: ['Priority-based','Time-slice based with circular queue','First-come-first-served','Shortest-job-first'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'os08', questionText: 'What is a race condition?', options: ['A CPU speed test','Outcome depends on non-deterministic order of events','Deadlock between processes','Memory overflow'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'os09', questionText: 'What does a mutex do?', options: ['Allocates memory','Ensures mutual exclusion on shared resource','Schedules processes','Manages file I/O'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'os10', questionText: 'TLB stands for?', options: ['Transfer Layer Buffer','Translation Lookaside Buffer','Thread Load Balancer','Temporary Logic Block'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'os11', questionText: 'What is thrashing in OS?', options: ['High CPU usage','Excessive paging causing low CPU utilization','Deadlock state','Cache miss flood'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'os12', questionText: 'A context switch saves?', options: ['File data','Process state (registers, PC, etc.)','Network connections','Memory pages'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'os13', questionText: 'What is the kernel?', options: ['Application layer','Core of OS managing hardware','User-space library','A device driver'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'os14', questionText: 'What is a page fault?', options: ['A kernel crash','Accessing a page not in physical memory','A segmentation fault','A file system error'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'os15', questionText: 'What is a zombie process?', options: ['Crashed process','Process that completed but entry not removed from table','Sleeping process','A process with no parent'], correctIndex: 1, difficulty: 'hard', points: 100 },
//   ],
//   'networks': [
//     { id: 'nw01', questionText: 'What does DNS do?', options: ['Encrypts data','Translates domain names to IP addresses','Routes packets','Manages TCP connections'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'nw02', questionText: 'TCP vs UDP: which is reliable?', options: ['UDP','TCP','Both','Neither'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'nw03', questionText: 'What layer does HTTP operate at?', options: ['Network','Transport','Application','Data Link'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'nw04', questionText: 'What is a subnet mask?', options: ['A type of firewall','Differentiates network and host portions of an IP','A routing protocol','A MAC address filter'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'nw05', questionText: 'What is the 3-way handshake in TCP?', options: ['SYN, SYN-ACK, ACK','ACK, SYN, FIN','CONNECT, ACK, START','SYN, ACK, FIN'], correctIndex: 0, difficulty: 'medium', points: 100 },
//     { id: 'nw06', questionText: 'HTTPS uses which port by default?', options: ['80','21','443','8080'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'nw07', questionText: 'What is ARP?', options: ['A routing protocol','Maps IP address to MAC address','Encrypts packets','Manages DNS entries'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'nw08', questionText: 'What is the OSI model?', options: ['A network routing protocol','7-layer conceptual model for network communication','A physical cable standard','A wireless protocol'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'nw09', questionText: 'What does DHCP do?', options: ['Routes packets','Dynamically assigns IP addresses','Resolves domain names','Encrypts traffic'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'nw10', questionText: 'What is NAT?', options: ['Network Address Translation','Node Authentication Token','Network Access Technology','None'], correctIndex: 0, difficulty: 'medium', points: 100 },
//     { id: 'nw11', questionText: 'Which protocol is used for email sending?', options: ['HTTP','FTP','SMTP','POP3'], correctIndex: 2, difficulty: 'easy', points: 100 },
//     { id: 'nw12', questionText: 'BGP is used for?', options: ['LAN routing','Inter-autonomous system routing on the Internet','DNS resolution','Wireless connectivity'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'nw13', questionText: 'What does HTTP status 404 mean?', options: ['Server error','Resource not found','Redirect','Unauthorized'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'nw14', questionText: 'What is CDN?', options: ['Core DNS Node','Content Delivery Network distributing content geographically','Central Database Node','Circuit Delivery Network'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'nw15', questionText: 'WebSockets provide?', options: ['One-way communication','Full-duplex persistent connection over TCP','UDP-based streaming','FTP file transfer'], correctIndex: 1, difficulty: 'medium', points: 100 },
//   ],
//   'system-design': [
//     { id: 'sd01', questionText: 'What is horizontal scaling?', options: ['Upgrading a single server','Adding more servers to distribute load','Increasing CPU on one machine','Removing old servers'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'sd02', questionText: 'What is a load balancer?', options: ['A database type','Distributes traffic across multiple servers','An encryption service','A file storage system'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'sd03', questionText: 'What is caching used for?', options: ['Long-term data storage','Reducing latency by storing frequently accessed data','Encrypting data','Routing network packets'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'sd04', questionText: 'What is a microservice?', options: ['A tiny physical server','An independently deployable service with single responsibility','A compressed file','A database view'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'sd05', questionText: 'What is eventual consistency?', options: ['Data is always consistent','System reaches consistency given no new updates','Transactions are atomic','Immediate consistency after write'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'sd06', questionText: 'CDN primarily improves?', options: ['Database performance','Content delivery speed by geographic proximity','Security','Server uptime'], correctIndex: 1, difficulty: 'easy', points: 100 },
//     { id: 'sd07', questionText: 'What is a message queue?', options: ['A database table','Asynchronous communication buffer between services','A REST API endpoint','A synchronous RPC call'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'sd08', questionText: 'What is the CAP theorem?', options: ['A caching strategy','Trade-offs between Consistency, Availability, Partition Tolerance','A security protocol','A database index type'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'sd09', questionText: 'What is rate limiting?', options: ['Limiting database size','Controlling the rate of incoming requests','Restricting server CPU','A load balancing strategy'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'sd10', questionText: 'What is a reverse proxy?', options: ['A database proxy','Server that forwards client requests to backend servers','An encryption layer','A type of CDN'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'sd11', questionText: 'What is database sharding?', options: ['Encrypting database','Horizontally partitioning data across multiple databases','Creating database backups','A type of indexing'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'sd12', questionText: 'What is an API gateway?', options: ['A router','Entry point managing API routing, auth, rate limiting','A load balancer only','A caching layer'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'sd13', questionText: 'What is idempotency?', options: ['A type of API','Same operation can be applied multiple times with same result','A caching strategy','A database consistency model'], correctIndex: 1, difficulty: 'hard', points: 100 },
//     { id: 'sd14', questionText: 'SQL vs NoSQL: which offers better horizontal scalability?', options: ['SQL','NoSQL','Both equally','Neither'], correctIndex: 1, difficulty: 'medium', points: 100 },
//     { id: 'sd15', questionText: 'What is a circuit breaker pattern?', options: ['Electrical safety','Prevents cascading failures by stopping calls to failing service','A caching strategy','An auth pattern'], correctIndex: 1, difficulty: 'hard', points: 100 },
//   ],
// }

// // Returns the static 15-question set for the subject.
// // Falls back to data-structures if subject not found.
// export function getSubjectQuestions(subjectSlug) {
//   return SUBJECT_QUESTIONS[subjectSlug] || SUBJECT_QUESTIONS['data-structures']
// }

// // Legacy alias used by queue/challenge flows
// export function getRandomQuestions(subjectSlug) {
//   return getSubjectQuestions(subjectSlug)
// }

// // ── POST /api/fights/queue/join ───────────────────────────
// export const joinQueue = async (req, res, next) => {
//   try {
//     const { subjectSlug } = req.body
//     const userId   = req.user._id.toString()
//     const user     = await User.findById(userId).select('username avatar level xp')
//     const queue    = matchmakingQueues.get(subjectSlug) || []

//     // Check if already in queue
//     const alreadyIn = queue.find(e => e.userId === userId)
//     if (alreadyIn) return res.status(200).json({ success: true, matched: false, message: 'Already in queue' })

//     // Find opponent (first in queue for same subject)
//     const opponentIdx = queue.findIndex(e => e.userId !== userId)

//     if (opponentIdx >= 0) {
//       // Match found — remove opponent from queue
//       const opponent = queue.splice(opponentIdx, 1)[0]
//       matchmakingQueues.set(subjectSlug, queue)

//       // Create fight
//       const questions = getRandomQuestions(subjectSlug)
//       const fight = await Fight.create({
//         player1: { user: userId,       score: 0, correctAnswers: 0, answers: [] },
//         player2: { user: opponent.userId, score: 0, correctAnswers: 0, answers: [] },
//         questions,
//         subjectSlug,
//         status: 'accepted',
//         questionCount: questions.length,
//       })

//       return res.status(201).json({
//         success: true, matched: true,
//         data: {
//           fightId:  fight._id,
//           opponent: { username: opponent.username, avatar: opponent.avatar, level: opponent.level },
//         },
//       })
//     }

//     // No opponent — add to queue
//     queue.push({ userId, username: user.username, avatar: user.avatar, level: user.level, xp: user.xp, joinedAt: Date.now() })
//     matchmakingQueues.set(subjectSlug, queue)
//     res.status(200).json({ success: true, matched: false, message: 'Joined queue, waiting for opponent' })
//   } catch (err) { next(err) }
// }

// // ── POST /api/fights/queue/leave ─────────────────────────
// // Changed to POST so body is reliably parsed
// export const leaveQueue = async (req, res, next) => {
//   try {
//     const { subjectSlug } = req.body
//     const userId = req.user._id.toString()

//     // Remove from all queues if no subjectSlug provided (cleanup)
//     if (subjectSlug) {
//       const queue = matchmakingQueues.get(subjectSlug) || []
//       matchmakingQueues.set(subjectSlug, queue.filter(e => e.userId !== userId))
//     } else {
//       // Remove from every subject queue
//       for (const [slug, queue] of matchmakingQueues) {
//         matchmakingQueues.set(slug, queue.filter(e => e.userId !== userId))
//       }
//     }

//     res.status(200).json({ success: true })
//   } catch (err) { next(err) }
// }

// // ── POST /api/fights/challenge ────────────────────────────
// // Challenge a friend to a subject-specific fight
// export const challengeFriend = async (req, res, next) => {
//   try {
//     const { friendId, subjectSlug } = req.body
//     const userId = req.user._id
//     if (friendId === userId.toString()) return res.status(400).json({ message: 'Cannot challenge yourself' })

//     const [challenger, friend] = await Promise.all([
//       User.findById(userId).select('username avatar level xp friends'),
//       User.findById(friendId).select('username avatar level xp'),
//     ])
//     if (!friend) return res.status(404).json({ message: 'Friend not found' })

//     // Verify friendship
//     const isFriend = challenger.friends.map(f => f.toString()).includes(friendId)
//     if (!isFriend) return res.status(403).json({ message: 'User is not your friend' })

//     // Auto-expire stale invited fights older than 5 minutes before checking
//     const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
//     await Fight.updateMany(
//       {
//         status: 'invited',
//         createdAt: { $lt: fiveMinAgo },
//         $or: [
//           { 'player1.user': userId, 'player2.user': friendId },
//           { 'player1.user': friendId, 'player2.user': userId },
//         ],
//       },
//       { status: 'cancelled', finishedAt: new Date() }
//     )

//     // Check no truly active fight between them
//     const existing = await Fight.findOne({
//       status: { $in: ['invited','accepted','active','countdown'] },
//       $or: [
//         { 'player1.user': userId, 'player2.user': friendId },
//         { 'player1.user': friendId, 'player2.user': userId },
//       ],
//     })
//     if (existing) return res.status(409).json({ message: 'A challenge is already pending or in progress', fightId: existing._id })

//     const questions = getRandomQuestions(subjectSlug)
//     const fight = await Fight.create({
//       player1: { user: userId,  score: 0, correctAnswers: 0, answers: [] },
//       player2: { user: friendId, score: 0, correctAnswers: 0, answers: [] },
//       questions,
//       subjectSlug,
//       status: 'invited',
//       questionCount: questions.length,
//     })

//     res.status(201).json({
//       success: true,
//       data: {
//         fightId:  fight._id,
//         opponent: { username: friend.username, avatar: friend.avatar, level: friend.level },
//       },
//     })
//   } catch (err) { next(err) }
// }

// // ── DELETE /api/fights/:id/cancel ─────────────────────────
// // Sender cancels a pending fight challenge
// export const cancelChallenge = async (req, res, next) => {
//   try {
//     const { id } = req.params
//     const userId = req.user._id.toString()

//     const fight = await Fight.findById(id)
//     if (!fight) return res.status(404).json({ message: 'Fight not found' })

//     // Only player1 (the challenger) can cancel
//     if (fight.player1.user.toString() !== userId) {
//       return res.status(403).json({ message: 'Only the challenger can cancel' })
//     }

//     if (!['invited','accepted'].includes(fight.status)) {
//       return res.status(400).json({ message: `Cannot cancel a ${fight.status} fight` })
//     }

//     await Fight.findByIdAndUpdate(id, { status: 'cancelled', finishedAt: new Date() })
//     res.status(200).json({ success: true })
//   } catch (err) { next(err) }
// }

// // ── POST /api/fights/:id/decline ──────────────────────────
// // Invitee declines a pending fight challenge
// export const declineChallenge = async (req, res, next) => {
//   try {
//     const { id } = req.params
//     const userId = req.user._id.toString()

//     const fight = await Fight.findById(id)
//     if (!fight) return res.status(404).json({ message: 'Fight not found' })

//     // Only player2 (the invitee) can decline
//     if (fight.player2.user.toString() !== userId) {
//       return res.status(403).json({ message: 'Only the invitee can decline' })
//     }

//     if (fight.status !== 'invited') {
//       return res.status(400).json({ message: `Cannot decline a ${fight.status} fight` })
//     }

//     await Fight.findByIdAndUpdate(id, { status: 'cancelled', finishedAt: new Date() })
//     res.status(200).json({ success: true })
//   } catch (err) { next(err) }
// }

// // ── POST /api/fights/cleanup-stale ────────────────────────
// // Internal: clear any old active/invited fights for the current user
// // Called proactively so stale state never blocks new challenges
// export const cleanupStaleFights = async (req, res, next) => {
//   try {
//     const userId = req.user._id
//     const cutoff = new Date(Date.now() - 30 * 60 * 1000) // 30 min old

//     await Fight.updateMany(
//       {
//         $or: [{ 'player1.user': userId }, { 'player2.user': userId }],
//         status: { $in: ['invited', 'accepted', 'countdown'] },
//         createdAt: { $lt: cutoff },
//       },
//       { status: 'cancelled', finishedAt: new Date() }
//     )

//     res.status(200).json({ success: true })
//   } catch (err) { next(err) }
// }

// // ── GET /api/fights/active ────────────────────────────────
// // Returns the current user's active fight (invited/accepted/countdown/active)
// // Used by frontend on mount to resume an ongoing match after refresh
// export const getActiveFight = async (req, res, next) => {
//   try {
//     const userId = req.user._id

//     const fight = await Fight.findOne({
//       status: { $in: ['invited', 'accepted', 'countdown', 'active'] },
//       $or: [{ 'player1.user': userId }, { 'player2.user': userId }],
//     })
//       .populate('player1.user', 'username avatar level xp')
//       .populate('player2.user', 'username avatar level xp')
//       .sort({ createdAt: -1 })

//     if (!fight) {
//       return res.status(200).json({ success: true, data: null })
//     }

//     // Return full fight including questions (needed to restore quiz state)
//     const data = fight.toObject()
//     res.status(200).json({ success: true, data })
//   } catch (err) { next(err) }
// }

// // ── POST /api/fights/:id/ready ────────────────────────────
// // Called by each player when they reach the lobby screen.
// // When both players have called ready, server sets countdownStartedAt
// // and transitions status to 'countdown'.
// // Returns current fight state including countdownStartedAt.
// export const readyUp = async (req, res, next) => {
//   try {
//     const { id } = req.params
//     const userId = req.user._id.toString()

//     const fight = await Fight.findById(id)
//       .populate('player1.user', 'username avatar')
//       .populate('player2.user', 'username avatar')

//     if (!fight) return res.status(404).json({ message: 'Fight not found' })

//     const p1Id = fight.player1.user._id.toString()
//     const p2Id = fight.player2.user._id.toString()

//     if (userId !== p1Id && userId !== p2Id) {
//       return res.status(403).json({ message: 'Not a participant' })
//     }

//     // Only valid for accepted/countdown status
//     if (!['invited', 'accepted', 'countdown'].includes(fight.status)) {
//       return res.status(200).json({ success: true, data: fight.toObject() })
//     }

//     // Mark this player as connected/ready
//     const playerKey = userId === p1Id ? 'player1.connected' : 'player2.connected'
//     await Fight.findByIdAndUpdate(id, { [playerKey]: true })

//     // Re-fetch to get updated state
//     const updated = await Fight.findById(id)
//       .populate('player1.user', 'username avatar')
//       .populate('player2.user', 'username avatar')

//     const p1Ready = updated.player1.connected
//     const p2Ready = updated.player2.connected

//     // If both ready and not yet in countdown, start it
//     if (p1Ready && p2Ready && updated.status === 'accepted') {
//       const now = new Date()
//       await Fight.findByIdAndUpdate(id, {
//         status:             'countdown',
//         countdownStartedAt: now,
//       })
//       const fresh = await Fight.findById(id)
//         .populate('player1.user', 'username avatar')
//         .populate('player2.user', 'username avatar')
//       return res.status(200).json({ success: true, data: fresh.toObject() })
//     }

//     // Also handle: if invited, mark as accepted when player2 ready-ups (they already accepted)
//     if (updated.status === 'invited' && userId === p2Id) {
//       await Fight.findByIdAndUpdate(id, { status: 'accepted' })
//     }

//     return res.status(200).json({ success: true, data: updated.toObject() })
//   } catch (err) { next(err) }
// }

// // ── POST /api/fights/:id/advance ─────────────────────────
// // Safety valve: if countdownStartedAt is old enough, advance to active.
// // Called by frontend as fallback if socket missed the start event.
// export const advanceFight = async (req, res, next) => {
//   try {
//     const { id } = req.params
//     const fight = await Fight.findById(id)
//       .populate('player1.user', 'username avatar')
//       .populate('player2.user', 'username avatar')

//     if (!fight) return res.status(404).json({ message: 'Fight not found' })

//     if (fight.status === 'countdown' && fight.countdownStartedAt) {
//       const elapsed = Date.now() - new Date(fight.countdownStartedAt).getTime()
//       // If countdown started more than 4s ago, advance to active
//       if (elapsed >= 4000) {
//         await Fight.findByIdAndUpdate(id, {
//           status:    'active',
//           startedAt: new Date(fight.countdownStartedAt.getTime() + 4000),
//           currentQuestion: 0,
//         })
//         const fresh = await Fight.findById(id)
//           .populate('player1.user', 'username avatar')
//           .populate('player2.user', 'username avatar')
//         return res.status(200).json({ success: true, data: fresh.toObject() })
//       }
//     }

//     return res.status(200).json({ success: true, data: fight.toObject() })
//   } catch (err) { next(err) }
// }
import Fight from '../models/Fight.js'
import User  from '../models/User.js'

// POST /api/fights/invite
export const inviteToFight = async (req, res, next) => {
  try {
    const { opponentId, subjectSlug = 'data-structures' } = req.body
    const userId = req.user._id
    if (opponentId === userId.toString()) return res.status(400).json({ message: 'Cannot fight yourself' })
    const opponent = await User.findById(opponentId).select('username avatar')
    if (!opponent) return res.status(404).json({ message: 'Opponent not found' })
    const existing = await Fight.findOne({ status: { $in: ['invited','accepted','active'] }, $or: [{ 'player1.user': userId, 'player2.user': opponentId }, { 'player1.user': opponentId, 'player2.user': userId }] })
    if (existing) return res.status(409).json({ message: 'Fight already in progress', fightId: existing._id })
    const questions = getRandomQuestions(subjectSlug)
    const fight = await Fight.create({ player1: { user: userId, score: 0, correctAnswers: 0, answers: [] }, player2: { user: opponentId, score: 0, correctAnswers: 0, answers: [] }, questions, subjectSlug, status: 'invited', questionCount: questions.length })
    res.status(201).json({ success: true, data: { fightId: fight._id, opponent } })
  } catch (err) { next(err) }
}

// POST /api/fights/accept
export const acceptFight = async (req, res, next) => {
  try {
    const { fightId } = req.body
    const fight = await Fight.findById(fightId)
    if (!fight) return res.status(404).json({ message: 'Fight not found' })
    if (fight.player2.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not invited' })
    if (fight.status !== 'invited') return res.status(400).json({ message: `Already ${fight.status}` })
    fight.status = 'accepted'
    await fight.save()
    res.status(200).json({ success: true, data: { fightId: fight._id } })
  } catch (err) { next(err) }
}

// GET /api/fights/:id
export const getFight = async (req, res, next) => {
  try {
    const fight = await Fight.findById(req.params.id).populate('player1.user','username avatar level xp').populate('player2.user','username avatar level xp').populate('winner','username avatar')
    if (!fight) return res.status(404).json({ message: 'Not found' })
    const uid = req.user._id.toString()
    if (uid !== fight.player1.user._id.toString() && uid !== fight.player2.user._id.toString()) return res.status(403).json({ message: 'Not a participant' })
    const data = fight.toObject()
    if (['active','countdown'].includes(fight.status)) data.questions = data.questions.map(({ correctIndex, ...q }) => q)
    res.status(200).json({ success: true, data })
  } catch (err) { next(err) }
}

// GET /api/fights/pending
export const getPendingFights = async (req, res, next) => {
  try {
    const fights = await Fight.find({ 'player2.user': req.user._id, status: 'invited' }).populate('player1.user','username avatar level').sort({ createdAt: -1 }).limit(10)
    res.status(200).json({ success: true, data: fights })
  } catch (err) { next(err) }
}

// ── In-memory random matchmaking queues (per subject) ─────
// subjectSlug → [{ userId, socketId, username, avatar, level, xp, joinedAt }]
export const matchmakingQueues = new Map()

// ── Subject question pools for 1v1 fights ────────────────
// Each subject has a pool of questions; 15-20 are picked randomly per match
// ── Static 15-question sets per subject (demo-stable) ─────
// Each subject has exactly 15 fixed questions.
// To replace with dynamic questions later, swap getSubjectQuestions().
export const SUBJECT_QUESTIONS = {
  'data-structures': [
    { id: 'ds01', questionText: 'What is the time complexity of accessing an array element by index?', options: ['O(n)','O(log n)','O(1)','O(n²)'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'ds02', questionText: 'Which data structure uses LIFO order?', options: ['Queue','Stack','Linked List','Tree'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'ds03', questionText: 'What is the worst-case time complexity of binary search?', options: ['O(1)','O(log n)','O(n)','O(n log n)'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'ds04', questionText: 'Which traversal visits: left → root → right?', options: ['Preorder','Postorder','Inorder','Level-order'], correctIndex: 2, difficulty: 'medium', points: 100 },
    { id: 'ds05', questionText: 'What is the average time complexity of a hash table lookup?', options: ['O(n)','O(log n)','O(n²)','O(1)'], correctIndex: 3, difficulty: 'easy', points: 100 },
    { id: 'ds06', questionText: 'What is the space complexity of a recursive DFS on a tree of depth h?', options: ['O(1)','O(h)','O(n)','O(n²)'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'ds07', questionText: 'Which data structure is best for implementing a priority queue?', options: ['Stack','Queue','Heap','Linked List'], correctIndex: 2, difficulty: 'medium', points: 100 },
    { id: 'ds08', questionText: 'What is the time complexity of inserting into a sorted linked list?', options: ['O(1)','O(log n)','O(n)','O(n log n)'], correctIndex: 2, difficulty: 'medium', points: 100 },
    { id: 'ds09', questionText: 'In a max-heap, what is true about the root node?', options: ['Smallest element','Largest element','Median element','Random element'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'ds10', questionText: 'Which operation on a stack is O(1)?', options: ['Search','Push','Sort','Find min'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'ds11', questionText: 'What is the height of a complete binary tree with n nodes?', options: ['O(n)','O(log n)','O(n²)','O(1)'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'ds12', questionText: 'Which traversal gives a sorted order for a BST?', options: ['Preorder','Postorder','Inorder','Level-order'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'ds13', questionText: 'What is the worst-case time complexity of quicksort?', options: ['O(n)','O(n log n)','O(n²)','O(log n)'], correctIndex: 2, difficulty: 'medium', points: 100 },
    { id: 'ds14', questionText: 'Which data structure uses FIFO order?', options: ['Stack','Queue','Tree','Graph'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'ds15', questionText: 'What is the time complexity of BFS on a graph with V vertices and E edges?', options: ['O(V)','O(E)','O(V+E)','O(V*E)'], correctIndex: 2, difficulty: 'hard', points: 100 },
  ],
  'algorithms': [
    { id: 'al01', questionText: 'What algorithm finds the shortest path in an unweighted graph?', options: ['DFS','BFS','Dijkstra','Bellman-Ford'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'al02', questionText: "Dijkstra's algorithm fails with?", options: ['Directed graphs','Negative weight edges','Cycles','Dense graphs'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'al03', questionText: 'What is dynamic programming?', options: ['Randomized algorithm','Divide and conquer','Memoization of overlapping subproblems','Greedy strategy'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'al04', questionText: 'Which algorithm uses a greedy approach for MST?', options: ['Bellman-Ford','Floyd-Warshall','Kruskal','BFS'], correctIndex: 2, difficulty: 'medium', points: 100 },
    { id: 'al05', questionText: 'Time complexity of Floyd-Warshall?', options: ['O(V²)','O(V³)','O(E log V)','O(VE)'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'al06', questionText: 'What does memoization do?', options: ['Sorts data','Caches results of subproblems','Parallelizes computation','Reduces memory usage'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'al07', questionText: 'Which paradigm does merge sort use?', options: ['Greedy','Dynamic programming','Divide and conquer','Backtracking'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'al08', questionText: 'The 0/1 Knapsack problem is solved by?', options: ['Greedy','Dynamic programming','Binary search','Graph traversal'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'al09', questionText: 'What is the purpose of the KMP algorithm?', options: ['Graph shortest path','String pattern matching','Sorting','Tree balancing'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'al10', questionText: "Prim's algorithm builds?", options: ['Shortest path tree','Minimum spanning tree','Balanced BST','Topological order'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'al11', questionText: 'Which problem is solved by Bellman-Ford?', options: ['Shortest path with negative weights','MST','Topological sort','Pattern matching'], correctIndex: 0, difficulty: 'hard', points: 100 },
    { id: 'al12', questionText: 'What is backtracking?', options: ['Trying all possibilities by abandoning invalid paths','Sorting in reverse','Graph shortest path','String search'], correctIndex: 0, difficulty: 'medium', points: 100 },
    { id: 'al13', questionText: 'Time complexity of topological sort?', options: ['O(V²)','O(V+E)','O(E log V)','O(V log V)'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'al14', questionText: 'Binary search requires the input to be?', options: ['Sorted','Unsorted','A linked list','A graph'], correctIndex: 0, difficulty: 'easy', points: 100 },
    { id: 'al15', questionText: 'Longest Common Subsequence has complexity?', options: ['O(n)','O(n log n)','O(n*m)','O(n²*m)'], correctIndex: 2, difficulty: 'hard', points: 100 },
  ],
  'databases': [
    { id: 'db01', questionText: 'What does ACID stand for?', options: ['Atomicity, Consistency, Isolation, Durability','Access, Control, Index, Data','Advanced, Cascading, Integrity, Deferred','None of the above'], correctIndex: 0, difficulty: 'easy', points: 100 },
    { id: 'db02', questionText: 'What is a primary key?', options: ['A key that allows duplicates','A unique identifier for a table row','A foreign table reference','An index key'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'db03', questionText: 'What is normalization?', options: ['Encrypting data','Organizing tables to reduce redundancy','Indexing all columns','Sharding databases'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'db04', questionText: 'Which SQL clause filters grouped results?', options: ['WHERE','HAVING','GROUP BY','ORDER BY'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'db05', questionText: 'INNER JOIN returns?', options: ['All rows from left table','All rows from both tables','Only matching rows from both tables','All non-matching rows'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'db06', questionText: 'What is an index in a database?', options: ['A list of records','A data structure to speed up queries','A foreign key reference','A stored procedure'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'db07', questionText: 'CAP theorem states a distributed system can guarantee?', options: ['All three: C, A, P','Only two of: Consistency, Availability, Partition Tolerance','None of the three','C and A only'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'db08', questionText: 'What does a clustered index do?', options: ['Creates a copy of the table','Sorts the table data by the index key','Creates a hash of all rows','Only applies to foreign keys'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'db09', questionText: 'What is a transaction?', options: ['A query with multiple tables','A unit of work that is atomic','A type of index','A database schema'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'db10', questionText: 'Which NoSQL type is MongoDB?', options: ['Key-value','Column-family','Document store','Graph'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'db11', questionText: 'What is sharding?', options: ['Encrypting data','Horizontally partitioning data across nodes','Vertically splitting tables','Indexing all columns'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'db12', questionText: 'A deadlock in a database occurs when?', options: ['Two transactions wait on each other indefinitely','A table has too many rows','An index is corrupted','A query takes too long'], correctIndex: 0, difficulty: 'medium', points: 100 },
    { id: 'db13', questionText: 'What is a view in SQL?', options: ['A virtual table based on a query','A stored procedure','A trigger','An index'], correctIndex: 0, difficulty: 'medium', points: 100 },
    { id: 'db14', questionText: 'Third Normal Form (3NF) eliminates?', options: ['Functional dependencies','Transitive dependencies','Partial dependencies','All redundancy'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'db15', questionText: 'What is eventual consistency?', options: ['Data is always consistent','All nodes converge to same value given no updates','Transactions never conflict','A type of isolation level'], correctIndex: 1, difficulty: 'hard', points: 100 },
  ],
  'operating-systems': [
    { id: 'os01', questionText: 'What is a process?', options: ['A program on disk','A program in execution','A CPU instruction','A system call'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'os02', questionText: 'What is a thread?', options: ['An independent process','A lightweight unit of execution within a process','A system call','A file descriptor'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'os03', questionText: 'What causes a deadlock?', options: ['Too many processes','Circular wait for resources','High CPU usage','Memory leak'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'os04', questionText: 'Virtual memory allows?', options: ['Faster CPU execution','Processes to use more memory than physically available','Hard disk to be used as CPU cache','Unlimited RAM'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'os05', questionText: 'What is paging?', options: ['Swapping processes','Dividing memory into fixed-size pages','Cache replacement policy','CPU scheduling'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'os06', questionText: 'A semaphore is used for?', options: ['Sorting','Synchronization and mutual exclusion','Memory allocation','File management'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'os07', questionText: 'Round-robin scheduling is?', options: ['Priority-based','Time-slice based with circular queue','First-come-first-served','Shortest-job-first'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'os08', questionText: 'What is a race condition?', options: ['A CPU speed test','Outcome depends on non-deterministic order of events','Deadlock between processes','Memory overflow'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'os09', questionText: 'What does a mutex do?', options: ['Allocates memory','Ensures mutual exclusion on shared resource','Schedules processes','Manages file I/O'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'os10', questionText: 'TLB stands for?', options: ['Transfer Layer Buffer','Translation Lookaside Buffer','Thread Load Balancer','Temporary Logic Block'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'os11', questionText: 'What is thrashing in OS?', options: ['High CPU usage','Excessive paging causing low CPU utilization','Deadlock state','Cache miss flood'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'os12', questionText: 'A context switch saves?', options: ['File data','Process state (registers, PC, etc.)','Network connections','Memory pages'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'os13', questionText: 'What is the kernel?', options: ['Application layer','Core of OS managing hardware','User-space library','A device driver'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'os14', questionText: 'What is a page fault?', options: ['A kernel crash','Accessing a page not in physical memory','A segmentation fault','A file system error'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'os15', questionText: 'What is a zombie process?', options: ['Crashed process','Process that completed but entry not removed from table','Sleeping process','A process with no parent'], correctIndex: 1, difficulty: 'hard', points: 100 },
  ],
  'networks': [
    { id: 'nw01', questionText: 'What does DNS do?', options: ['Encrypts data','Translates domain names to IP addresses','Routes packets','Manages TCP connections'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'nw02', questionText: 'TCP vs UDP: which is reliable?', options: ['UDP','TCP','Both','Neither'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'nw03', questionText: 'What layer does HTTP operate at?', options: ['Network','Transport','Application','Data Link'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'nw04', questionText: 'What is a subnet mask?', options: ['A type of firewall','Differentiates network and host portions of an IP','A routing protocol','A MAC address filter'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'nw05', questionText: 'What is the 3-way handshake in TCP?', options: ['SYN, SYN-ACK, ACK','ACK, SYN, FIN','CONNECT, ACK, START','SYN, ACK, FIN'], correctIndex: 0, difficulty: 'medium', points: 100 },
    { id: 'nw06', questionText: 'HTTPS uses which port by default?', options: ['80','21','443','8080'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'nw07', questionText: 'What is ARP?', options: ['A routing protocol','Maps IP address to MAC address','Encrypts packets','Manages DNS entries'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'nw08', questionText: 'What is the OSI model?', options: ['A network routing protocol','7-layer conceptual model for network communication','A physical cable standard','A wireless protocol'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'nw09', questionText: 'What does DHCP do?', options: ['Routes packets','Dynamically assigns IP addresses','Resolves domain names','Encrypts traffic'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'nw10', questionText: 'What is NAT?', options: ['Network Address Translation','Node Authentication Token','Network Access Technology','None'], correctIndex: 0, difficulty: 'medium', points: 100 },
    { id: 'nw11', questionText: 'Which protocol is used for email sending?', options: ['HTTP','FTP','SMTP','POP3'], correctIndex: 2, difficulty: 'easy', points: 100 },
    { id: 'nw12', questionText: 'BGP is used for?', options: ['LAN routing','Inter-autonomous system routing on the Internet','DNS resolution','Wireless connectivity'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'nw13', questionText: 'What does HTTP status 404 mean?', options: ['Server error','Resource not found','Redirect','Unauthorized'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'nw14', questionText: 'What is CDN?', options: ['Core DNS Node','Content Delivery Network distributing content geographically','Central Database Node','Circuit Delivery Network'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'nw15', questionText: 'WebSockets provide?', options: ['One-way communication','Full-duplex persistent connection over TCP','UDP-based streaming','FTP file transfer'], correctIndex: 1, difficulty: 'medium', points: 100 },
  ],
  'system-design': [
    { id: 'sd01', questionText: 'What is horizontal scaling?', options: ['Upgrading a single server','Adding more servers to distribute load','Increasing CPU on one machine','Removing old servers'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'sd02', questionText: 'What is a load balancer?', options: ['A database type','Distributes traffic across multiple servers','An encryption service','A file storage system'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'sd03', questionText: 'What is caching used for?', options: ['Long-term data storage','Reducing latency by storing frequently accessed data','Encrypting data','Routing network packets'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'sd04', questionText: 'What is a microservice?', options: ['A tiny physical server','An independently deployable service with single responsibility','A compressed file','A database view'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'sd05', questionText: 'What is eventual consistency?', options: ['Data is always consistent','System reaches consistency given no new updates','Transactions are atomic','Immediate consistency after write'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'sd06', questionText: 'CDN primarily improves?', options: ['Database performance','Content delivery speed by geographic proximity','Security','Server uptime'], correctIndex: 1, difficulty: 'easy', points: 100 },
    { id: 'sd07', questionText: 'What is a message queue?', options: ['A database table','Asynchronous communication buffer between services','A REST API endpoint','A synchronous RPC call'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'sd08', questionText: 'What is the CAP theorem?', options: ['A caching strategy','Trade-offs between Consistency, Availability, Partition Tolerance','A security protocol','A database index type'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'sd09', questionText: 'What is rate limiting?', options: ['Limiting database size','Controlling the rate of incoming requests','Restricting server CPU','A load balancing strategy'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'sd10', questionText: 'What is a reverse proxy?', options: ['A database proxy','Server that forwards client requests to backend servers','An encryption layer','A type of CDN'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'sd11', questionText: 'What is database sharding?', options: ['Encrypting database','Horizontally partitioning data across multiple databases','Creating database backups','A type of indexing'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'sd12', questionText: 'What is an API gateway?', options: ['A router','Entry point managing API routing, auth, rate limiting','A load balancer only','A caching layer'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'sd13', questionText: 'What is idempotency?', options: ['A type of API','Same operation can be applied multiple times with same result','A caching strategy','A database consistency model'], correctIndex: 1, difficulty: 'hard', points: 100 },
    { id: 'sd14', questionText: 'SQL vs NoSQL: which offers better horizontal scalability?', options: ['SQL','NoSQL','Both equally','Neither'], correctIndex: 1, difficulty: 'medium', points: 100 },
    { id: 'sd15', questionText: 'What is a circuit breaker pattern?', options: ['Electrical safety','Prevents cascading failures by stopping calls to failing service','A caching strategy','An auth pattern'], correctIndex: 1, difficulty: 'hard', points: 100 },
  ],
}

// Returns the static 15-question set for the subject.
// Falls back to data-structures if subject not found.
export function getSubjectQuestions(subjectSlug) {
  return SUBJECT_QUESTIONS[subjectSlug] || SUBJECT_QUESTIONS['data-structures']
}

// Legacy alias used by queue/challenge flows
export function getRandomQuestions(subjectSlug) {
  return getSubjectQuestions(subjectSlug)
}

// ── POST /api/fights/queue/join ───────────────────────────
export const joinQueue = async (req, res, next) => {
  try {
    const { subjectSlug } = req.body
    const userId   = req.user._id.toString()
    const user     = await User.findById(userId).select('username avatar level xp')
    const queue    = matchmakingQueues.get(subjectSlug) || []

    // Check if already in queue
    const alreadyIn = queue.find(e => e.userId === userId)
    if (alreadyIn) return res.status(200).json({ success: true, matched: false, message: 'Already in queue' })

    // Find opponent (first in queue for same subject)
    const opponentIdx = queue.findIndex(e => e.userId !== userId)

    if (opponentIdx >= 0) {
      // Match found — remove opponent from queue
      const opponent = queue.splice(opponentIdx, 1)[0]
      matchmakingQueues.set(subjectSlug, queue)

      // Create fight
      const questions = getRandomQuestions(subjectSlug)
      const fight = await Fight.create({
        player1: { user: userId,       score: 0, correctAnswers: 0, answers: [] },
        player2: { user: opponent.userId, score: 0, correctAnswers: 0, answers: [] },
        questions,
        subjectSlug,
        status: 'accepted',
        questionCount: questions.length,
      })

      return res.status(201).json({
        success: true, matched: true,
        data: {
          fightId:  fight._id,
          opponent: { username: opponent.username, avatar: opponent.avatar, level: opponent.level },
        },
      })
    }

    // No opponent — add to queue
    queue.push({ userId, username: user.username, avatar: user.avatar, level: user.level, xp: user.xp, joinedAt: Date.now() })
    matchmakingQueues.set(subjectSlug, queue)
    res.status(200).json({ success: true, matched: false, message: 'Joined queue, waiting for opponent' })
  } catch (err) { next(err) }
}

// ── POST /api/fights/queue/leave ─────────────────────────
// Changed to POST so body is reliably parsed
export const leaveQueue = async (req, res, next) => {
  try {
    const { subjectSlug } = req.body
    const userId = req.user._id.toString()

    // Remove from all queues if no subjectSlug provided (cleanup)
    if (subjectSlug) {
      const queue = matchmakingQueues.get(subjectSlug) || []
      matchmakingQueues.set(subjectSlug, queue.filter(e => e.userId !== userId))
    } else {
      // Remove from every subject queue
      for (const [slug, queue] of matchmakingQueues) {
        matchmakingQueues.set(slug, queue.filter(e => e.userId !== userId))
      }
    }

    res.status(200).json({ success: true })
  } catch (err) { next(err) }
}

// ── POST /api/fights/challenge ────────────────────────────
// Challenge a friend to a subject-specific fight
export const challengeFriend = async (req, res, next) => {
  try {
    const { friendId, subjectSlug } = req.body
    const userId = req.user._id
    if (friendId === userId.toString()) return res.status(400).json({ message: 'Cannot challenge yourself' })

    const [challenger, friend] = await Promise.all([
      User.findById(userId).select('username avatar level xp friends'),
      User.findById(friendId).select('username avatar level xp'),
    ])
    if (!friend) return res.status(404).json({ message: 'Friend not found' })

    // Verify friendship
    const isFriend = challenger.friends.map(f => f.toString()).includes(friendId)
    if (!isFriend) return res.status(403).json({ message: 'User is not your friend' })

    // Auto-expire stale invited fights older than 5 minutes before checking
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    await Fight.updateMany(
      {
        status: 'invited',
        createdAt: { $lt: fiveMinAgo },
        $or: [
          { 'player1.user': userId, 'player2.user': friendId },
          { 'player1.user': friendId, 'player2.user': userId },
        ],
      },
      { status: 'cancelled', finishedAt: new Date() }
    )

    // Check no truly active fight between them
    const existing = await Fight.findOne({
      status: { $in: ['invited','accepted','active','countdown'] },
      $or: [
        { 'player1.user': userId, 'player2.user': friendId },
        { 'player1.user': friendId, 'player2.user': userId },
      ],
    })
    if (existing) return res.status(409).json({ message: 'A challenge is already pending or in progress', fightId: existing._id })

    const questions = getRandomQuestions(subjectSlug)
    const fight = await Fight.create({
      player1: { user: userId,  score: 0, correctAnswers: 0, answers: [] },
      player2: { user: friendId, score: 0, correctAnswers: 0, answers: [] },
      questions,
      subjectSlug,
      status: 'invited',
      questionCount: questions.length,
    })

    res.status(201).json({
      success: true,
      data: {
        fightId:  fight._id,
        opponent: { username: friend.username, avatar: friend.avatar, level: friend.level },
      },
    })
  } catch (err) { next(err) }
}

// ── DELETE /api/fights/:id/cancel ─────────────────────────
// Sender cancels a pending fight challenge
export const cancelChallenge = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id.toString()

    const fight = await Fight.findById(id)
    if (!fight) return res.status(404).json({ message: 'Fight not found' })

    // Only player1 (the challenger) can cancel
    if (fight.player1.user.toString() !== userId) {
      return res.status(403).json({ message: 'Only the challenger can cancel' })
    }

    if (!['invited','accepted'].includes(fight.status)) {
      return res.status(400).json({ message: `Cannot cancel a ${fight.status} fight` })
    }

    await Fight.findByIdAndUpdate(id, { status: 'cancelled', finishedAt: new Date() })
    res.status(200).json({ success: true })
  } catch (err) { next(err) }
}

// ── POST /api/fights/:id/decline ──────────────────────────
// Invitee declines a pending fight challenge
export const declineChallenge = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id.toString()

    const fight = await Fight.findById(id)
    if (!fight) return res.status(404).json({ message: 'Fight not found' })

    // Only player2 (the invitee) can decline
    if (fight.player2.user.toString() !== userId) {
      return res.status(403).json({ message: 'Only the invitee can decline' })
    }

    if (fight.status !== 'invited') {
      return res.status(400).json({ message: `Cannot decline a ${fight.status} fight` })
    }

    await Fight.findByIdAndUpdate(id, { status: 'cancelled', finishedAt: new Date() })
    res.status(200).json({ success: true })
  } catch (err) { next(err) }
}

// ── POST /api/fights/cleanup-stale ────────────────────────
// Internal: clear any old active/invited fights for the current user
// Called proactively so stale state never blocks new challenges
export const cleanupStaleFights = async (req, res, next) => {
  try {
    const userId = req.user._id
    const cutoff = new Date(Date.now() - 30 * 60 * 1000) // 30 min old

    await Fight.updateMany(
      {
        $or: [{ 'player1.user': userId }, { 'player2.user': userId }],
        status: { $in: ['invited', 'accepted', 'countdown'] },
        createdAt: { $lt: cutoff },
      },
      { status: 'cancelled', finishedAt: new Date() }
    )

    res.status(200).json({ success: true })
  } catch (err) { next(err) }
}

// ── GET /api/fights/active ────────────────────────────────
// Returns the current user's active fight (invited/accepted/countdown/active)
// Used by frontend on mount to resume an ongoing match after refresh
export const getActiveFight = async (req, res, next) => {
  try {
    const userId = req.user._id

    const fight = await Fight.findOne({
      status: { $in: ['invited', 'accepted', 'countdown', 'active'] },
      $or: [{ 'player1.user': userId }, { 'player2.user': userId }],
    })
      .populate('player1.user', 'username avatar level xp')
      .populate('player2.user', 'username avatar level xp')
      .sort({ createdAt: -1 })

    if (!fight) {
      return res.status(200).json({ success: true, data: null })
    }

    // Auto-expire stale fights:
    // - 'active' fights older than 45 minutes are dead (socket disconnect, abandoned)
    // - 'invited'/'accepted'/'countdown' fights older than 30 minutes are stale
    const ageMs = Date.now() - new Date(fight.createdAt).getTime()
    const isStale =
      (fight.status === 'active'    && ageMs > 45 * 60 * 1000) ||
      (['invited','accepted','countdown'].includes(fight.status) && ageMs > 30 * 60 * 1000)

    if (isStale) {
      await Fight.findByIdAndUpdate(fight._id, { status: 'finished', finishedAt: new Date() })
      return res.status(200).json({ success: true, data: null })
    }

    // Return full fight including questions (needed to restore quiz state)
    const data = fight.toObject()
    res.status(200).json({ success: true, data })
  } catch (err) { next(err) }
}

// ── POST /api/fights/:id/ready ────────────────────────────
// Called by each player when they reach the lobby screen.
// When both players have called ready, server sets countdownStartedAt
// and transitions status to 'countdown'.
// Returns current fight state including countdownStartedAt.
export const readyUp = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id.toString()

    const fight = await Fight.findById(id)
      .populate('player1.user', 'username avatar')
      .populate('player2.user', 'username avatar')

    if (!fight) return res.status(404).json({ message: 'Fight not found' })

    const p1Id = fight.player1.user._id.toString()
    const p2Id = fight.player2.user._id.toString()

    if (userId !== p1Id && userId !== p2Id) {
      return res.status(403).json({ message: 'Not a participant' })
    }

    // Only valid for accepted/countdown status
    if (!['invited', 'accepted', 'countdown'].includes(fight.status)) {
      return res.status(200).json({ success: true, data: fight.toObject() })
    }

    // Mark this player as connected/ready
    const playerKey = userId === p1Id ? 'player1.connected' : 'player2.connected'
    await Fight.findByIdAndUpdate(id, { [playerKey]: true })

    // Re-fetch to get updated state
    const updated = await Fight.findById(id)
      .populate('player1.user', 'username avatar')
      .populate('player2.user', 'username avatar')

    const p1Ready = updated.player1.connected
    const p2Ready = updated.player2.connected

    // If both ready and not yet in countdown, start it
    if (p1Ready && p2Ready && updated.status === 'accepted') {
      const now = new Date()
      await Fight.findByIdAndUpdate(id, {
        status:             'countdown',
        countdownStartedAt: now,
      })
      const fresh = await Fight.findById(id)
        .populate('player1.user', 'username avatar')
        .populate('player2.user', 'username avatar')
      return res.status(200).json({ success: true, data: fresh.toObject() })
    }

    // Also handle: if invited, mark as accepted when player2 ready-ups (they already accepted)
    if (updated.status === 'invited' && userId === p2Id) {
      await Fight.findByIdAndUpdate(id, { status: 'accepted' })
    }

    return res.status(200).json({ success: true, data: updated.toObject() })
  } catch (err) { next(err) }
}

// ── POST /api/fights/:id/advance ─────────────────────────
// Safety valve: if countdownStartedAt is old enough, advance to active.
// Called by frontend as fallback if socket missed the start event.
export const advanceFight = async (req, res, next) => {
  try {
    const { id } = req.params
    const fight = await Fight.findById(id)
      .populate('player1.user', 'username avatar')
      .populate('player2.user', 'username avatar')

    if (!fight) return res.status(404).json({ message: 'Fight not found' })

    if (fight.status === 'countdown' && fight.countdownStartedAt) {
      const elapsed = Date.now() - new Date(fight.countdownStartedAt).getTime()
      // If countdown started more than 4s ago, advance to active
      if (elapsed >= 4000) {
        await Fight.findByIdAndUpdate(id, {
          status:    'active',
          startedAt: new Date(fight.countdownStartedAt.getTime() + 4000),
          currentQuestion: 0,
        })
        const fresh = await Fight.findById(id)
          .populate('player1.user', 'username avatar')
          .populate('player2.user', 'username avatar')
        return res.status(200).json({ success: true, data: fresh.toObject() })
      }
    }

    return res.status(200).json({ success: true, data: fight.toObject() })
  } catch (err) { next(err) }
}
