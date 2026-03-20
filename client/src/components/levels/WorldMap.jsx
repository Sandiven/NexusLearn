import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import LevelNode from './LevelNode'
import LevelPath, { CELL_W, CELL_H, NODE_SIZE } from './LevelPath'

const PADDING = 60

/**
 * WorldMap
 * @param {array}    levels       — array of level objects from levelData.js
 * @param {string}   accentColor  — subject accent colour
 * @param {function} onSelectLevel — callback when a node is clicked
 * @param {number}   selectedId    — currently selected level id
 */
export default function WorldMap({ levels, accentColor, onSelectLevel, selectedId }) {

  // Compute SVG canvas size from grid extents
  const { svgW, svgH } = useMemo(() => {
    const maxCol = Math.max(...levels.map(l => l.col))
    const maxRow = Math.max(...levels.map(l => l.row))
    return {
      svgW: (maxCol + 1) * CELL_W + PADDING * 2,
      svgH: (maxRow + 1) * CELL_H + PADDING * 2 + 60, // extra for labels
    }
  }, [levels])

  // Build a map of id → level for fast lookup
  const levelMap = useMemo(() => {
    const m = {}
    levels.forEach(l => (m[l.id] = l))
    return m
  }, [levels])

  // Collect all edges (avoid duplicates)
  const edges = useMemo(() => {
    const result = []
    levels.forEach(from => {
      from.connections.forEach(toId => {
        const to = levelMap[toId]
        if (to) result.push({ from, to })
      })
    })
    return result
  }, [levels, levelMap])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        overflowX: 'auto',
        overflowY: 'auto',
        flex: 1,
        padding: '20px 0',
        position: 'relative',
      }}
    >
      {/* Faint dot-grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        opacity: 0.5,
      }} />

      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', minWidth: svgW, overflow: 'visible' }}
      >
        {/* Offset group for padding */}
        <g transform={`translate(${PADDING}, ${PADDING})`}>

          {/* ── Paths (rendered below nodes) ─── */}
          {edges.map(({ from, to }) => (
            <LevelPath
              key={`${from.id}-${to.id}`}
              from={from}
              to={to}
              accentColor={accentColor}
            />
          ))}

          {/* ── Nodes ─── */}
          {levels.map((level, i) => (
            <LevelNode
              key={level.id}
              level={level}
              accentColor={accentColor}
              isSelected={level.id === selectedId}
              onClick={onSelectLevel}
              animDelay={i * 0.06}
            />
          ))}
        </g>
      </svg>
    </motion.div>
  )
}
