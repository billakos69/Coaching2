import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Plus, Trash2, Trophy, ChevronRight, Calendar } from 'lucide-react'

function MatchForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    opponent: '', date: '', home: true,
    scoreUs: '', scoreThem: '',
    possession: 50, shots: 0, xG: 0,
    wellNotes: '', wrongNotes: '',
    goalTypes: { setPiece: 0, counter: 0, buildUp: 0 },
    weaknesses: [],
    moments: [],
    playerRatings: {},
  })
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="card space-y-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-white">New Match</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Opponent</label>
          <input className="input" value={form.opponent} onChange={e => s('opponent', e.target.value)} placeholder="PAOK FC" />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={form.date} onChange={e => s('date', e.target.value)} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.home} onChange={e => s('home', e.target.checked)} className="accent-neon-green" />
            <span className="text-sm text-carbon-200">Home game</span>
          </label>
        </div>
        <div>
          <label className="label">Our Score</label>
          <input className="input" type="number" min="0" value={form.scoreUs} onChange={e => s('scoreUs', +e.target.value)} />
        </div>
        <div>
          <label className="label">Their Score</label>
          <input className="input" type="number" min="0" value={form.scoreThem} onChange={e => s('scoreThem', +e.target.value)} />
        </div>
        <div>
          <label className="label">Possession %</label>
          <input className="input" type="number" min="0" max="100" value={form.possession} onChange={e => s('possession', +e.target.value)} />
        </div>
        <div>
          <label className="label">Shots on Goal</label>
          <input className="input" type="number" value={form.shots} onChange={e => s('shots', +e.target.value)} />
        </div>
        <div>
          <label className="label">xG</label>
          <input className="input" type="number" step="0.1" value={form.xG} onChange={e => s('xG', +e.target.value)} />
        </div>
        <div>
          <label className="label">Set Piece Goals</label>
          <input className="input" type="number" value={form.goalTypes.setPiece} onChange={e => s('goalTypes', { ...form.goalTypes, setPiece: +e.target.value })} />
        </div>
        <div>
          <label className="label">Counter Goals</label>
          <input className="input" type="number" value={form.goalTypes.counter} onChange={e => s('goalTypes', { ...form.goalTypes, counter: +e.target.value })} />
        </div>
        <div>
          <label className="label">Build-up Goals</label>
          <input className="input" type="number" value={form.goalTypes.buildUp} onChange={e => s('goalTypes', { ...form.goalTypes, buildUp: +e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="label">What Went Well</label>
          <textarea className="input" rows={2} value={form.wellNotes} onChange={e => s('wellNotes', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">What Went Wrong</label>
          <textarea className="input" rows={2} value={form.wrongNotes} onChange={e => s('wrongNotes', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={() => { if(form.opponent && form.date) onSave(form) }}>Save Match</button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function ResultBadge({ us, them }) {
  if (us > them) return <span className="badge bg-neon-green/10 text-neon-green font-mono">{us}–{them} W</span>
  if (us === them) return <span className="badge bg-neon-yellow/10 text-neon-yellow font-mono">{us}–{them} D</span>
  return <span className="badge bg-neon-red/10 text-neon-red font-mono">{us}–{them} L</span>
}

export default function Matches() {
  const { matches, addMatch, deleteMatch } = useStore()
  const [showForm, setShowForm] = useState(false)

  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Matches</h1>
          <p className="text-carbon-300 text-sm">{matches.length} matches recorded</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowForm(true)}>
          <Plus size={15} /> New Match
        </button>
      </div>

      {showForm && <MatchForm onSave={async (m) => { await addMatch(m); setShowForm(false) }} onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {sorted.map(match => (
          <div key={match.id} className="card hover:border-carbon-400 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-carbon-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy size={18} className="text-neon-yellow" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{match.opponent}</span>
                  <span className="badge bg-carbon-600 text-carbon-300">{match.home ? 'H' : 'A'}</span>
                  <ResultBadge us={match.scoreUs} them={match.scoreThem} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-carbon-400">
                  <span className="flex items-center gap-1"><Calendar size={11} />{match.date}</span>
                  <span>⚡ {match.possession}% poss</span>
                  <span>🎯 {match.shots} shots</span>
                  <span>xG: {match.xG}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/matches/${match.id}`} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                  Detail <ChevronRight size={12} />
                </Link>
                <button className="btn-danger text-xs py-1.5 px-2" onClick={() => { if(confirm('Delete match?')) deleteMatch(match.id) }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {matches.length === 0 && (
        <div className="text-center py-16 text-carbon-400">
          <Trophy size={32} className="mx-auto mb-2 opacity-30" />
          <p>No matches yet</p>
        </div>
      )}
    </div>
  )
}
