/**
 * RankCircle — circular rank badge for leaderboard rows
 */
const RANK_STYLES = {
  1: { bg: 'rgba(255,184,0,0.15)',  border: 'rgba(255,184,0,0.4)',  color: '#FFB800' },
  2: { bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.3)', color: '#C0C0C0' },
  3: { bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)', color: '#CD7F32' },
}

export default function RankCircle({ rank, size = 34 }) {
  const style = RANK_STYLES[rank] || {
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.35)',
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: style.bg,
      border: `1px solid ${style.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Syne", sans-serif',
      fontWeight: 800,
      fontSize: size < 30 ? '0.68rem' : '0.78rem',
      color: style.color,
      flexShrink: 0,
    }}>
      #{rank}
    </div>
  )
}
