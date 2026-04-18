import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Plus, Search, AlertTriangle, Edit3, Trash2, ChevronRight, Filter } from 'lucide-react'

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CM', 'DM', 'AM', 'LW', 'RW', 'ST']

function PlayerForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '', age: '', position: 'CM', number: '',
    goals: 0, assists: 0, minutes: 0, rating: 7.0,
    ...initial
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="card space-y-3 animate-fade-in">
      <h3 className="text-sm font-semibold text-white">{initial.id ? 'Edit Player' : 'New Player'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full Name</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Kostas Alexiou" />
        </div>
        <div>
          <label className="label">Age</label>
          <input className="input" type="number" value={form.age} onChange={e => set('age', e.target.value)} />
        </div>
        <div>
          <label className="label">Shirt Number</label>
          <input className="input" type="number" value={form.number} onChange={e => set('number', e.target.value)} />
        </div>
        <div>
          <label className="label">Position</label>
          <select className="input" value={form.position} onChange={e => set('position', e.target.value)}>
            {POSITIONS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Rating (0–10)</label>
          <input className="input" type="number" step="0.1" min="0" max="10" value={form.rating} onChange={e => set('rating', parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="label">Goals</label>
          <input className="input" type="number" value={form.goals} onChange={e => set('goals', +e.target.value)} />
        </div>
        <div>
          <label className="label">Assists</label>
          <input className="input" type="number" value={form.assists} onChange={e => set('assists', +e.target.value)} />
        </div>
        <div>
          <label className="label">Minutes Played</label>
          <input className="input" type="number" value={form.minutes} onChange={e => set('minutes', +e.target.value)} />
        </div>
        <div>
          <label className="label">Fatigue (0–10)</label>
          <input className="input" type="number" min="0" max="10" value={form.fatigue || 3} onChange={e => set('fatigue', +e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.injured || false} onChange={e => set('injured', e.target.checked)} className="accent-neon-green" />
          <span className="text-sm text-carbon-200">Mark as injured</span>
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <button className="btn-primary" onClick={() => onSave(form)}>Save Player</button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

const POS_COLOR = {
  GK: 'bg-neon-yellow/10 text-neon-yellow',
  CB: 'bg-neon-blue/10 text-neon-blue',
  LB: 'bg-neon-blue/10 text-neon-blue',
  RB: 'bg-neon-blue/10 text-neon-blue',
  CM: 'bg-pitch-500/10 text-pitch-400',
  DM: 'bg-pitch-500/10 text-pitch-400',
  AM: 'bg-pitch-500/10 text-pitch-400',
  LW: 'bg-neon-green/10 text-neon-green',
  RW: 'bg-neon-green/10 text-neon-green',
  ST: 'bg-neon-red/10 text-neon-red',
}

export default function Players() {
  const { players, addPlayer, updatePlayer, deletePlayer } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filterPos, setFilterPos] = useState('All')

  const filtered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchPos = filterPos === 'All' || p.position === filterPos
    return matchSearch && matchPos
  })

  const handleSave = async (form) => {
    if (editing) {
      await updatePlayer(editing.id, form)
      setEditing(null)
    } else {
      await addPlayer(form)
      setShowForm(false)
    }
  }

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Players</h1>
          <p className="text-carbon-300 text-sm">{players.length} registered · {players.filter(p => p.injured).length} injured</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => { setShowForm(true); setEditing(null) }}>
          <Plus size={15} /> Add Player
        </button>
      </div>

      {(showForm && !editing) && (
        <PlayerForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-carbon-400" />
          <input
            className="input pl-8"
            placeholder="Search player..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={filterPos} onChange={e => setFilterPos(e.target.value)}>
          <option>All</option>
          {POSITIONS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(player => (
          <div key={player.id}>
            {editing?.id === player.id ? (
              <PlayerForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
            ) : (
              <div className="card hover:border-carbon-400 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-carbon-600 flex items-center justify-center font-display text-lg text-neon-green">
                      {player.number}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm leading-tight">{player.name}</p>
                      <p className="text-carbon-400 text-xs">{player.age} yrs</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge ${POS_COLOR[player.position] || 'bg-carbon-600 text-carbon-200'}`}>{player.position}</span>
                    {player.injured && <span className="badge bg-neon-red/10 text-neon-red text-xs">Injured</span>}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[['Goals', player.goals], ['Assists', player.assists], ['Min', player.minutes], ['Rtg', player.rating?.toFixed(1)]].map(([l, v]) => (
                    <div key={l} className="bg-carbon-700 rounded-lg p-2 text-center">
                      <p className="text-xs text-carbon-400">{l}</p>
                      <p className="text-sm font-semibold text-white font-mono">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Fatigue bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-carbon-400 mb-1">
                    <span>Fatigue</span><span>{player.fatigue || 0}/10</span>
                  </div>
                  <div className="bg-carbon-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${((player.fatigue || 0) / 10) * 100}%`,
                        background: (player.fatigue || 0) > 7 ? '#ff3b5c' : (player.fatigue || 0) > 5 ? '#f5e642' : '#39ff6e'
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/players/${player.id}`} className="flex-1 btn-secondary text-center text-xs py-1.5">
                    Profile <ChevronRight size={12} className="inline" />
                  </Link>
                  <button className="btn-secondary text-xs py-1.5 px-2" onClick={() => setEditing(player)}>
                    <Edit3 size={13} />
                  </button>
                  <button className="btn-danger text-xs py-1.5 px-2" onClick={() => { if(confirm('Delete player?')) deletePlayer(player.id) }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-carbon-400">
          <Users size={32} className="mx-auto mb-2 opacity-30" />
          <p>No players found</p>
        </div>
      )}
    </div>
  )
}
