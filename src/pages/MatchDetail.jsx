import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../store'
import { ArrowLeft, Plus, Trash2, Clock, Target, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { matches, players, updateMatch, deleteMatch } = useStore()
  const match = matches.find(m => m.id === id)
  const [newMoment, setNewMoment] = useState({ time: '', label: '', type: 'goal' })
  const [newWeakness, setNewWeakness] = useState('')

  if (!match) return (
    <div className="text-center py-20">
      <p className="text-carbon-400">Match not found</p>
      <Link to="/matches" className="text-neon-green text-sm">← Back</Link>
    </div>
  )

  const addMoment = () => {
    if (!newMoment.time || !newMoment.label) return
    const updated = [...(match.moments || []), { ...newMoment, time: +newMoment.time }]
    updateMatch(id, { moments: updated })
    setNewMoment({ time: '', label: '', type: 'goal' })
  }

  const removeMoment = (i) => {
    const updated = match.moments.filter((_, idx) => idx !== i)
    updateMatch(id, { moments: updated })
  }

  const addWeakness = () => {
    if (!newWeakness) return
    updateMatch(id, { weaknesses: [...(match.weaknesses || []), newWeakness] })
    setNewWeakness('')
  }

  const setPlayerRating = (playerId, rating) => {
    updateMatch(id, { playerRatings: { ...match.playerRatings, [playerId]: +rating } })
  }

  const statsBar = [
    { label: 'Possession', us: match.possession, them: 100 - match.possession },
    { label: 'Shots', us: match.shots, them: match.shots ? Math.round(match.shots * 0.7) : 0 },
  ]

  const goalPie = [
    { name: 'Set Piece', value: match.goalTypes?.setPiece || 0 },
    { name: 'Counter', value: match.goalTypes?.counter || 0 },
    { name: 'Build-up', value: match.goalTypes?.buildUp || 0 },
  ].filter(d => d.value > 0)

  const result = match.scoreUs > match.scoreThem ? 'W' : match.scoreUs === match.scoreThem ? 'D' : 'L'
  const resultColor = { W: 'text-neon-green', D: 'text-neon-yellow', L: 'text-neon-red' }[result]

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20); doc.setTextColor(57, 255, 110)
    doc.text('TACTIQ — Match Report', 20, 20)
    doc.setTextColor(0, 0, 0); doc.setFontSize(14)
    doc.text(`vs ${match.opponent} · ${match.date} · ${match.home ? 'HOME' : 'AWAY'}`, 20, 35)
    doc.setFontSize(18)
    doc.text(`${match.scoreUs} – ${match.scoreThem}`, 20, 50)
    autoTable(doc, {
      startY: 60,
      head: [['Stat', 'Value']],
      body: [
        ['Possession', `${match.possession}%`],
        ['Shots', match.shots],
        ['xG', match.xG],
        ['Set Piece Goals', match.goalTypes?.setPiece || 0],
        ['Counter Goals', match.goalTypes?.counter || 0],
        ['Build-up Goals', match.goalTypes?.buildUp || 0],
      ],
    })
    if (match.wellNotes) {
      doc.setFontSize(12)
      doc.text('What Went Well:', 20, doc.lastAutoTable.finalY + 12)
      doc.setFontSize(10)
      doc.text(match.wellNotes, 20, doc.lastAutoTable.finalY + 20, { maxWidth: 170 })
    }
    doc.save(`match_${match.opponent}_${match.date}.pdf`)
  }

  const MOMENT_COLORS = { goal: 'text-neon-green', key: 'text-neon-blue', mistake: 'text-neon-red' }

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-carbon-300 hover:text-white"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="section-title">vs {match.opponent}</h1>
            <span className={`font-display text-2xl ${resultColor}`}>{match.scoreUs}–{match.scoreThem}</span>
          </div>
          <p className="text-carbon-300 text-sm">{match.date} · {match.home ? 'Home' : 'Away'}</p>
        </div>
        <button className="btn-primary text-xs" onClick={exportPDF}>Export PDF</button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[['Possession', `${match.possession}%`], ['Shots', match.shots], ['xG', match.xG]].map(([l, v]) => (
          <div key={l} className="card text-center">
            <p className="text-xl font-display text-neon-green">{v}</p>
            <p className="text-xs text-carbon-400">{l}</p>
          </div>
        ))}
      </div>

      {/* Goal types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-carbon-200 mb-3">Goal Classification</h3>
          {goalPie.length > 0 ? (
            <div className="flex gap-3 flex-wrap">
              {goalPie.map(g => (
                <div key={g.name} className="card flex-1 text-center !bg-carbon-700">
                  <p className="text-2xl font-display text-neon-green">{g.value}</p>
                  <p className="text-xs text-carbon-400">{g.name}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-carbon-400 text-sm">No goals classified</p>}
        </div>

        {/* Stat bars */}
        <div className="card">
          <h3 className="text-sm font-semibold text-carbon-200 mb-3">Match Stats</h3>
          {statsBar.map(s => (
            <div key={s.label} className="mb-3">
              <div className="flex justify-between text-xs text-carbon-400 mb-1">
                <span>{s.label}</span>
                <span className="font-mono">{s.us} vs {s.them}</span>
              </div>
              <div className="flex gap-0.5 h-3">
                <div className="bg-neon-green rounded-l" style={{ width: `${(s.us / (s.us + s.them)) * 100}%` }} />
                <div className="bg-neon-red rounded-r flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-neon-green mb-2">✓ What Went Well</h3>
          <textarea
            className="input text-sm"
            rows={3}
            value={match.wellNotes || ''}
            onChange={e => updateMatch(id, { wellNotes: e.target.value })}
            placeholder="Describe positives..."
          />
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-neon-red mb-2">✗ What Went Wrong</h3>
          <textarea
            className="input text-sm"
            rows={3}
            value={match.wrongNotes || ''}
            onChange={e => updateMatch(id, { wrongNotes: e.target.value })}
            placeholder="Areas to improve..."
          />
        </div>
      </div>

      {/* Weaknesses */}
      <div className="card">
        <h3 className="text-sm font-semibold text-carbon-200 mb-3">Tagged Weaknesses</h3>
        <div className="flex gap-2 mb-3">
          <input className="input flex-1" value={newWeakness} onChange={e => setNewWeakness(e.target.value)}
            placeholder="e.g. High press resistance" onKeyDown={e => e.key === 'Enter' && addWeakness()} />
          <button className="btn-secondary" onClick={addWeakness}><Plus size={15} /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(match.weaknesses || []).map((w, i) => (
            <span key={i} className="tag flex items-center gap-1.5 group">
              {w}
              <button className="text-carbon-500 hover:text-neon-red" onClick={() => {
                updateMatch(id, { weaknesses: match.weaknesses.filter((_, idx) => idx !== i) })
              }}>×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
          <Clock size={14} /> Match Timeline
        </h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          <input className="input w-20" type="number" placeholder="Min" value={newMoment.time}
            onChange={e => setNewMoment(m => ({ ...m, time: e.target.value }))} />
          <input className="input flex-1" placeholder="Event description" value={newMoment.label}
            onChange={e => setNewMoment(m => ({ ...m, label: e.target.value }))} />
          <select className="input w-auto" value={newMoment.type} onChange={e => setNewMoment(m => ({ ...m, type: e.target.value }))}>
            <option value="goal">Goal</option>
            <option value="key">Key Moment</option>
            <option value="mistake">Mistake</option>
          </select>
          <button className="btn-primary" onClick={addMoment}><Plus size={15} /></button>
        </div>
        <div className="relative border-l-2 border-carbon-600 ml-4 space-y-3">
          {(match.moments || []).sort((a, b) => a.time - b.time).map((m, i) => (
            <div key={i} className="relative pl-5">
              <div className="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-carbon-700 border-2 border-carbon-400" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-carbon-400 w-8">{m.time}'</span>
                <span className={`text-sm ${MOMENT_COLORS[m.type] || 'text-white'}`}>{m.label}</span>
                <span className="badge bg-carbon-700 text-carbon-400 capitalize">{m.type}</span>
                <button className="ml-auto text-carbon-500 hover:text-neon-red" onClick={() => removeMoment(i)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {(!match.moments || match.moments.length === 0) && (
            <p className="pl-5 text-carbon-400 text-sm">No moments tagged yet</p>
          )}
        </div>
      </div>

      {/* Player ratings */}
      <div className="card">
        <h3 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
          <Star size={14} className="text-neon-yellow" /> Player Ratings
        </h3>
        <div className="space-y-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-xs font-mono text-neon-green w-6">{p.number}</span>
              <span className="text-sm text-carbon-200 flex-1 truncate">{p.name}</span>
              <span className="badge bg-carbon-600 text-carbon-300">{p.position}</span>
              <input
                type="number" min="1" max="10" step="0.5"
                className="input w-16 text-center text-xs"
                value={match.playerRatings?.[p.id] || ''}
                placeholder="—"
                onChange={e => setPlayerRating(p.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
