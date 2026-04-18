import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store'
import { ArrowLeft, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Football pitch SVG heatmap
function PitchHeatmap({ touches = [], onAddTouch }) {
  const cells = []
  const cols = 10, rows = 8
  const w = 100 / cols, h = 100 / rows

  // Build heatmap grid counts
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(0))
  touches.forEach(t => {
    const col = Math.min(Math.floor(t.x / w), cols - 1)
    const row = Math.min(Math.floor(t.y / h), rows - 1)
    grid[row][col]++
  })
  const max = Math.max(1, ...grid.flat())

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-carbon-200">Touch Heatmap</h3>
        <p className="text-xs text-carbon-400">{touches.length} touches logged · Click pitch to add</p>
      </div>
      <svg
        viewBox="0 0 100 65"
        className="w-full rounded-lg border border-carbon-600 cursor-crosshair"
        style={{ background: '#1a3a1a' }}
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 100
          const y = ((e.clientY - rect.top) / rect.height) * 100
          onAddTouch({ x, y })
        }}
      >
        {/* Heatmap cells */}
        {grid.map((row, ri) => row.map((count, ci) => {
          if (count === 0) return null
          const intensity = count / max
          return (
            <rect
              key={`${ri}-${ci}`}
              x={ci * w} y={ri * h} width={w} height={h}
              fill={`rgba(57, 255, 110, ${intensity * 0.7})`}
            />
          )
        }))}
        {/* Pitch markings */}
        <rect x="0" y="0" width="100" height="65" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <line x1="50" y1="0" x2="50" y2="65" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <circle cx="50" cy="32.5" r="9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <circle cx="50" cy="32.5" r="0.5" fill="rgba(255,255,255,0.4)" />
        {/* Left penalty box */}
        <rect x="0" y="15" width="16" height="35" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <rect x="0" y="23" width="5.5" height="19" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        {/* Right penalty box */}
        <rect x="84" y="15" width="16" height="35" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <rect x="94.5" y="23" width="5.5" height="19" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        {/* Touch dots */}
        {touches.map((t, i) => (
          <circle key={i} cx={t.x} cy={t.y} r="1.2" fill="rgba(57,255,110,0.8)" />
        ))}
      </svg>
      <p className="text-xs text-carbon-400 mt-2">Click anywhere on the pitch to log a touch position</p>
    </div>
  )
}

export default function PlayerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { players, matches, updatePlayer, addTouchToPlayer } = useStore()
  const player = players.find(p => p.id === id)

  if (!player) return (
    <div className="text-center py-20 text-carbon-400">
      <p>Player not found</p>
      <Link to="/players" className="text-neon-green text-sm mt-2 block">← Back to Players</Link>
    </div>
  )

  const playerMatches = matches.filter(m => m.playerRatings?.[player.id])
  const ratingHistory = playerMatches.map(m => ({
    name: m.opponent.split(' ')[0],
    rating: m.playerRatings[player.id]
  }))

  const radarData = [
    { stat: 'Goals', value: Math.min(player.goals * 10, 100) },
    { stat: 'Assists', value: Math.min(player.assists * 10, 100) },
    { stat: 'Rating', value: player.rating * 10 },
    { stat: 'Minutes', value: Math.min(player.minutes / 20, 100) },
    { stat: 'Fitness', value: Math.max(0, (10 - (player.fatigue || 0)) * 10) },
  ]

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(57, 255, 110)
    doc.text('TACTIQ — Player Report', 20, 20)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text(`${player.name} · #${player.number} · ${player.position}`, 20, 35)
    doc.setFontSize(11)
    doc.text(`Age: ${player.age} | Status: ${player.injured ? 'INJURED' : 'FIT'} | Fatigue: ${player.fatigue}/10`, 20, 45)
    autoTable(doc, {
      startY: 55,
      head: [['Goals', 'Assists', 'Minutes', 'Rating']],
      body: [[player.goals, player.assists, player.minutes, player.rating]],
      theme: 'grid',
    })
    if (ratingHistory.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Match', 'Rating']],
        body: ratingHistory.map(r => [r.name, r.rating]),
        theme: 'grid',
      })
    }
    doc.save(`${player.name.replace(' ', '_')}_report.pdf`)
  }

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-carbon-300 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="section-title">{player.name}</h1>
          <p className="text-carbon-300 text-sm">#{player.number} · {player.position} · {player.age} years old</p>
        </div>
        <button className="btn-primary text-xs" onClick={exportPDF}>Export PDF</button>
      </div>

      {/* Status bar */}
      <div className="flex gap-3 flex-wrap">
        <span className={`badge py-1 px-3 ${player.injured ? 'bg-neon-red/15 text-neon-red' : 'bg-neon-green/15 text-neon-green'}`}>
          {player.injured ? '⚠ Injured' : '✓ Fit'}
        </span>
        <span className="badge py-1 px-3 bg-carbon-600 text-carbon-200">
          Fatigue: {player.fatigue || 0}/10
        </span>
        <button
          className="badge py-1 px-3 bg-carbon-700 text-carbon-300 hover:bg-carbon-600 cursor-pointer"
          onClick={() => updatePlayer(player.id, { injured: !player.injured })}
        >
          Toggle Injury
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[['Goals', player.goals], ['Assists', player.assists], ['Minutes', player.minutes], ['Avg Rating', player.rating?.toFixed(1)]].map(([l, v]) => (
          <div key={l} className="card text-center">
            <p className="text-2xl font-display tracking-wider text-neon-green">{v}</p>
            <p className="text-xs text-carbon-400">{l}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-carbon-200 mb-3">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2e2e38" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: '#5a5a6e', fontSize: 11 }} />
              <Radar dataKey="value" fill="rgba(57,255,110,0.2)" stroke="#39ff6e" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-carbon-200 mb-3">Rating Per Match</h3>
          {ratingHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingHistory} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e38" />
                <XAxis dataKey="name" tick={{ fill: '#5a5a6e', fontSize: 10 }} />
                <YAxis domain={[5, 10]} tick={{ fill: '#5a5a6e', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#18181c', border: '1px solid #3d3d4a', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rating" fill="#39ff6e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-carbon-400 text-sm py-10 text-center">No ratings yet</p>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <PitchHeatmap
        touches={player.touches || []}
        onAddTouch={(t) => addTouchToPlayer(player.id, t)}
      />

      {/* Recent matches */}
      {playerMatches.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-carbon-200 mb-3">Recent Matches</h3>
          <div className="space-y-2">
            {playerMatches.slice(-5).reverse().map(m => (
              <Link key={m.id} to={`/matches/${m.id}`} className="flex items-center justify-between hover:bg-carbon-700 px-3 py-2 rounded-lg transition-colors">
                <span className="text-sm text-carbon-200">{m.opponent}</span>
                <span className="text-xs text-carbon-400">{m.date}</span>
                <span className="badge bg-neon-green/10 text-neon-green font-mono">
                  {m.playerRatings[player.id]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
