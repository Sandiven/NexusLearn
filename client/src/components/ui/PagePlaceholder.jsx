import { motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export default function PagePlaceholder({ title, description, accent = '#00F5FF' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}
      className="flex items-center justify-center"
    >
      <div className="glass-card p-12 text-center max-w-md mx-4">
        <div
          className="w-3 h-3 rounded-full mx-auto mb-6"
          style={{ background: accent, boxShadow: `0 0 20px ${accent}` }}
        />
        <h1
          className="heading-display text-3xl mb-3"
          style={{ color: accent }}
        >
          {title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{description}</p>
      </div>
    </motion.div>
  )
}
