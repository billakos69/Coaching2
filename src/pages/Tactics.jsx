import { useState, useRef } from 'react'
import { useStore } from '../store'
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react'

const FORMATION_PRESETS = {
  '4-3-3': [
    { id: '1', x: 50, y: 88, label: 'GK' },
    { id: '2', x: 20, y: 70, label: 'LB' },
    { id: '3', x: 38, y: 72, label: 'CB' },
    { id: '4', x: 62, y: 72, label: 'CB' },
    { id: '5', x: 80, y: 70, label: 'RB' },
    { id: '6', x: 28, y: 52, label: 'CM' },
    { id: '7', x: 50, y: 46, label: 'CM' },
    { id: '8', x: 72, y: 52, label: 'CM' },
    { id: '9', x: 22, y: 28, label: 'LW' },
    { id: '10', x: 50, y: 22, label: 'ST' },
    { id: '11', x: 78, y: 28, label: 'RW' },
  ],
  '4-4-2': [
    { id: '1', x: 50, y: 88, label: 'GK' },
    { id: '2', x: 20, y: 70, label: 'LB' },
    { id: '3', x: 38, y: 72, label: 'CB' },
    { id: '4', x: 62, y: 72, label: 'CB' },
    { id: '5', x: 80, y: 70, label: 'RB' },
    { id: '6', x: 20, y: 50, label: 'LM' },
    { id: '7', x: 38, y: 50, label: 'CM' },
    { id: '8', x: 62, y: 50, label: 'CM' },
    { id: '9', x: 80, y: 50, label: 'RM' },
    { id: '10', x: 38, y: 25, label: 'ST' },
    { id: '11', x: 62, y: 25, label: 'ST' },
  ],
  '3-5-2': [
    { id: '1', x: 50, y: 88, label: 'GK' },
    { id: '2', x: 28, y: 72, label: 'CB' },
    { id: '3', x: 50, y: 74, label: 'CB' },
    { id: '4', x: 72, y: 72, label: 'CB' },
    { id: '5', x: 14, y: 52, label: 'LWB' },
    { id: '6', x: 32, y: 50, label: 'CM' },
    { id: '7', x: 50, y: 44, label: 'DM' },
    { id: '8', x: 68, y: 50, label: 'CM' },
    { id: '9', x: 86, y: 52, label: 'RWB' },
    { id: '10', x: 38, y: 24, label: 'ST' },
    { id: '11', x: 62, y: 24, label: 'ST' },
  ],
  '4-2-3-1': [
    { id: '1', x: 50, y: 88, label: 'GK' },
    { id: '2', x: 20, y: 70, label: 'LB' },
    { id: '3', x: 38, y: 72, label: 'CB' },
    { id: '4', x: 62, y: 72, label: 'CB' },
    { id: '5', x: 80, y: 70, label: 'RB' },
    { id: '6', x: 36, y: 55, label: 'DM' },
    { id: '7', x: 64, y: 55, label: 'DM' },
    { id: '8', x: 20, y: 38, label: 'LW' },
    { id: '9', x: 50, y: 36, label: 'AM' },
    { id: '10', x: 80, y: 38, label: 'RW' },
    { id: '11', x: 50, y: 20, label: 'ST' },
  ],
}

export default function Tactics() {
  const { formation, setFormation, savedFormations, saveFormation, players } = useStore()
  const [positions, setPositions] = useState(formation.positions || FORMATION_PRESETS['4-3-3'])
  const [dragging, setDragging] = useState(null)
  const [formName, setFormName] = useState(formation.name || '4-3-3')
  const [selectedPreset, setSelectedPreset] = useState('4-3-3')
  const svgRef = useRef(null)

  const getSvgCoords = (e) => {
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(4, Math.min(96, ((clientY - rect.top) / rect.height) * 100)),
    }
  }

  const onMouseDown = (e, id) => {
    e.preventDefault()
    setDragging(id)
  }

  const onMouseMove = (e) => {
    if (!dragging) return
    const { x, y } = getSvgCoords(e)
    setPositions(ps => ps.map(p => p.id === dragging ? { ...p, x, y } : p))
  }

  const onMouseUp = () => setDragging(null)

  const loadPreset = (preset) => {
    setSelectedPreset(preset)
    setFormName(preset)
    setPositions(FORMATION_PRESETS[preset].map((p, i) => ({
      ...p,
      playerName: players[i]?.name?.split(' ')[0] || p.label
    })))
  }

  const save = () => {
    const f = { name: formName, positions }
    setFormation(f)
    saveFormation(f)
    alert('Formation saved!')
  }

  // Map players to positions
  const posWithPlayers = positions.map((pos, i) => ({
    ...pos,
    playerName: players[i]?.name?.split(' ')[0] || '',
    playerNum: players[i]?.number || '',
  }))

  return (
    <div className="page-enter space-y-5">
      <div>
        <h1 className="section-title">Tactical Board</h1>
        <p className="text-carbon-300 text-sm">Drag players to set positions · Save formations</p>
      </div>

      {/* Controls */}
      <div className="card flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 flex-wrap">
          {Object.keys(FORMATION_PRESETS).map(f => (
            <button
              key={f}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono ${selectedPreset === f ? 'bg-neon-green text-carbon-900 font-bold' : 'btn-secondary'}`}
              onClick={() => loadPreset(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          className="input w-40"
          value={formName}
          onChange={e => setFormName(e.target.value)}
          placeholder="Formation name"
        />
        <button className="btn-primary flex items-center gap-1.5" onClick={save}>
          <Save size={14} /> Save
        </button>
        <button className="btn-secondary flex items-center gap-1.5" onClick={() => loadPreset(selectedPreset)}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Pitch */}
      <div className="card !p-0 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="w-full select-none touch-none"
          style={{ background: '#0e2a0e', maxHeight: '70vh' }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
        >
          {/* Pitch markings */}
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          <circle cx="50" cy="50" r="0.6" fill="rgba(255,255,255,0.3)" />
          {/* Top penalty box */}
          <rect x="20" y="2" width="60" height="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          <rect x="33" y="2" width="34" height="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          {/* Bottom penalty box */}
          <rect x="20" y="78" width="60" height="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          <rect x="33" y="92" width="34" height="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          {/* Goals */}
          <rect x="42" y="0.5" width="16" height="2" fill="rgba(255,255,255,0.3)" strokeWidth="0.3" stroke="white" />
          <rect x="42" y="97.5" width="16" height="2" fill="rgba(255,255,255,0.3)" strokeWidth="0.3" stroke="white" />
          {/* Corner arcs */}
          {[[2,2],[98,2],[2,98],[98,98]].map(([cx,cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          ))}

          {/* Players */}
          {posWithPlayers.map(pos => (
            <g
              key={pos.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="draggable-player"
              onMouseDown={e => onMouseDown(e, pos.id)}
              onTouchStart={e => { e.preventDefault(); setDragging(pos.id) }}
              style={{ cursor: dragging === pos.id ? 'grabbing' : 'grab' }}
            >
              <circle r="4" fill="#39ff6e" stroke="white" strokeWidth="0.5" />
              <text textAnchor="middle" y="1.5" fontSize="3.2" fontWeight="bold" fill="#0a0a0b" fontFamily="DM Sans, sans-serif">
                {pos.label}
              </text>
              {pos.playerNum && (
                <text textAnchor="middle" y="-5.5" fontSize="2.5" fill="rgba(255,255,255,0.8)" fontFamily="JetBrains Mono">
                  {pos.playerNum}
                </text>
              )}
              {pos.playerName && (
                <text textAnchor="middle" y="8.5" fontSize="2.3" fill="rgba(255,255,255,0.7)" fontFamily="DM Sans">
                  {pos.playerName}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Saved formations */}
      {savedFormations.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-carbon-200 mb-3">Saved Formations</h3>
          <div className="flex gap-2 flex-wrap">
            {savedFormations.map(f => (
              <button
                key={f.name}
                className="btn-secondary text-xs"
                onClick={() => { setPositions(f.positions); setFormName(f.name) }}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card bg-carbon-700/50">
        <p className="text-xs text-carbon-400">
          💡 Drag player tokens on the pitch. Use presets to load standard formations. Player names are auto-mapped from your squad.
          Touch/drag works on mobile too.
        </p>
      </div>
    </div>
  )
}
