import { useState } from 'react'
import { useStore } from '../store'
import { Save, UserCircle, BookOpen, Target, Shield } from 'lucide-react'

export default function CoachProfile() {
  const { coachProfile, setCoachProfile } = useStore()
  const [form, setForm] = useState({ ...coachProfile })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setCoachProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-enter space-y-5 max-w-2xl">
      <div>
        <h1 className="section-title">Coach Profile</h1>
        <p className="text-carbon-300 text-sm">Your identity, philosophy, and team details</p>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-carbon-600 flex items-center justify-center border-2 border-neon-green/30">
          <UserCircle size={36} className="text-neon-green" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-lg">{form.name || 'Your Name'}</h2>
          <p className="text-neon-green text-sm">{form.team || 'Your Team'}</p>
          <p className="text-carbon-400 text-xs mt-0.5">Head Coach · {form.formation || '4-3-3'}</p>
        </div>
      </div>

      {/* Basic info */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-carbon-200 flex items-center gap-2">
          <Shield size={14} className="text-neon-blue" /> Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Coach Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Team Name</label>
            <input className="input" value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))} placeholder="FC Example" />
          </div>
          <div>
            <label className="label">Preferred Formation</label>
            <select className="input" value={form.formation} onChange={e => setForm(f => ({ ...f, formation: e.target.value }))}>
              {['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Playing Style</label>
            <select className="input" value={form.style || ''} onChange={e => setForm(f => ({ ...f, style: e.target.value }))}>
              <option value="">Select style</option>
              <option>High Pressing</option>
              <option>Possession-Based</option>
              <option>Counter-Attacking</option>
              <option>Direct Play</option>
              <option>Gegenpressing</option>
              <option>Tiki-Taka</option>
              <option>Low Block</option>
            </select>
          </div>
        </div>
      </div>

      {/* Philosophy */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-carbon-200 flex items-center gap-2">
          <BookOpen size={14} className="text-neon-yellow" /> Coaching Philosophy
        </h2>
        <p className="text-xs text-carbon-400">Describe your football identity — how you want your team to play and what you stand for as a coach.</p>
        <textarea
          className="input"
          rows={5}
          value={form.philosophy}
          onChange={e => setForm(f => ({ ...f, philosophy: e.target.value }))}
          placeholder="We play aggressive, high-energy football that suffocates the opponent..."
        />
      </div>

      {/* Principles */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-carbon-200 flex items-center gap-2">
          <Target size={14} className="text-neon-green" /> Key Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['In Possession', 'inPossession', 'How we play with the ball...'],
            ['Out of Possession', 'outPossession', 'How we defend / press...'],
            ['Transitions Attacking', 'transitionAttack', 'How we transition to attack...'],
            ['Transitions Defending', 'transitionDefend', 'How we transition to defend...'],
          ].map(([label, key, placeholder]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea
                className="input"
                rows={3}
                value={form[key] || ''}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Season goals */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-carbon-200">Season Goals</h2>
        <textarea
          className="input"
          rows={3}
          value={form.seasonGoals || ''}
          onChange={e => setForm(f => ({ ...f, seasonGoals: e.target.value }))}
          placeholder="Top 3 finish, develop young talent, implement high press..."
        />
      </div>

      <button
        className={`btn-primary flex items-center gap-2 transition-all ${saved ? 'bg-pitch-600' : ''}`}
        onClick={handleSave}
      >
        <Save size={15} />
        {saved ? '✓ Saved!' : 'Save Profile'}
      </button>
    </div>
  )
}
