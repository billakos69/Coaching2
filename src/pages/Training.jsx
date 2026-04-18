import { useState } from 'react'
import { useStore } from '../store'
import { Plus, Trash2, Edit3, Download, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const TEMPLATES = [
  {
    title: 'High Press Session',
    warmUp: 'Dynamic stretching + rondo 4v2 (10 min)',
    technical: 'Passing lanes and pressing triggers (20 min)',
    tactical: 'High press shape 4-3-3 (25 min)',
    game: '8v8 pressing game (20 min)',
    duration: 75, exercises: ['Rondo 4v2', 'Shadow play', 'Position game'],
  },
  {
    title: 'Possession & Build-up',
    warmUp: 'Activation + 5v2 rondo (10 min)',
    technical: 'Short-long passing patterns (20 min)',
    tactical: 'Build-up vs mid block (25 min)',
    game: '11v11 position game (20 min)',
    duration: 75, exercises: ['5v2 rondo', 'Play out from back', 'Positional game'],
  },
  {
    title: 'Set Pieces',
    warmUp: 'Activation run + pass & move (10 min)',
    technical: 'Crossing and finishing (20 min)',
    tactical: 'Corner attack/defend routines (30 min)',
    game: '11v11 scrimmage (15 min)',
    duration: 75, exercises: ['Set piece rehearsal', 'Heading practice'],
  },
]

function TrainingForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '', date: '', warmUp: '', technical: '', tactical: '', game: '',
    notes: '', exercises: [], duration: 75, ...initial
  })
  const [ex, setEx] = useState('')
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="card space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{initial.id ? 'Edit Session' : 'New Training Session'}</h3>
        <div className="flex gap-1">
          {TEMPLATES.map((t, i) => (
            <button key={i} className="text-xs btn-secondary py-1 px-2" onClick={() => setForm(f => ({ ...f, ...t }))}>
              {t.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Session Title</label>
          <input className="input" value={form.title} onChange={e => s('title', e.target.value)} placeholder="High Press Session" />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={form.date} onChange={e => s('date', e.target.value)} />
        </div>
        <div>
          <label className="label">Duration (min)</label>
          <input className="input" type="number" value={form.duration} onChange={e => s('duration', +e.target.value)} />
        </div>
      </div>
      {[
        ['warmUp', '🔥 Warm-Up'],
        ['technical', '⚡ Technical'],
        ['tactical', '🧠 Tactical'],
        ['game', '⚽ Small-Sided Game'],
      ].map(([k, label]) => (
        <div key={k}>
          <label className="label">{label}</label>
          <textarea className="input" rows={2} value={form[k]} onChange={e => s(k, e.target.value)} placeholder={`Describe ${label.split(' ').slice(1).join(' ').toLowerCase()}...`} />
        </div>
      ))}
      <div>
        <label className="label">Exercises</label>
        <div className="flex gap-2 mb-2">
          <input className="input flex-1" value={ex} onChange={e => setEx(e.target.value)}
            placeholder="Add exercise" onKeyDown={e => { if(e.key === 'Enter' && ex) { s('exercises', [...(form.exercises||[]), ex]); setEx('') }}} />
          <button className="btn-secondary" onClick={() => { if(ex) { s('exercises', [...(form.exercises||[]), ex]); setEx('') }}}>
            <Plus size={15} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(form.exercises||[]).map((e, i) => (
            <span key={i} className="tag flex items-center gap-1">
              {e}
              <button className="text-carbon-500 hover:text-neon-red" onClick={() => s('exercises', form.exercises.filter((_, idx) => idx !== i))}>×</button>
            </span>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Coach Notes</label>
        <textarea className="input" rows={2} value={form.notes} onChange={e => s('notes', e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={() => { if(form.title && form.date) onSave(form) }}>Save Session</button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function SessionCard({ session, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const exportPDF = (e) => {
    e.stopPropagation()
    const doc = new jsPDF()
    doc.setFontSize(20); doc.setTextColor(57, 255, 110)
    doc.text('TACTIQ — Training Session', 20, 20)
    doc.setTextColor(0, 0, 0); doc.setFontSize(14)
    doc.text(session.title, 20, 35)
    doc.setFontSize(11)
    doc.text(`Date: ${session.date} · Duration: ${session.duration} min`, 20, 45)
    autoTable(doc, {
      startY: 55,
      head: [['Phase', 'Description']],
      body: [
        ['Warm-Up', session.warmUp || ''],
        ['Technical', session.technical || ''],
        ['Tactical', session.tactical || ''],
        ['Game', session.game || ''],
      ],
      theme: 'striped',
    })
    if (session.exercises?.length) {
      doc.setFontSize(11)
      doc.text('Exercises: ' + session.exercises.join(', '), 20, doc.lastAutoTable.finalY + 12, { maxWidth: 170 })
    }
    if (session.notes) {
      doc.text('Notes: ' + session.notes, 20, doc.lastAutoTable.finalY + 22, { maxWidth: 170 })
    }
    doc.save(`training_${session.title.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-carbon-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Dumbbell size={18} className="text-neon-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white">{session.title}</h3>
            <span className="badge bg-neon-blue/10 text-neon-blue">{session.duration}min</span>
          </div>
          <p className="text-xs text-carbon-400 mt-0.5">{session.date}</p>
          {session.exercises?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {session.exercises.map((e, i) => <span key={i} className="tag">{e}</span>)}
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button className="btn-secondary text-xs py-1 px-2" onClick={exportPDF}><Download size={13} /></button>
          <button className="btn-secondary text-xs py-1 px-2" onClick={() => onEdit(session)}><Edit3 size={13} /></button>
          <button className="btn-danger text-xs py-1 px-2" onClick={() => { if(confirm('Delete session?')) onDelete(session.id) }}><Trash2 size={13} /></button>
          <button className="btn-secondary text-xs py-1 px-2" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-carbon-600 space-y-3 animate-fade-in">
          {[['🔥 Warm-Up', session.warmUp], ['⚡ Technical', session.technical], ['🧠 Tactical', session.tactical], ['⚽ Game', session.game]].map(([l, v]) => v ? (
            <div key={l}>
              <p className="text-xs font-semibold text-carbon-300 mb-1">{l}</p>
              <p className="text-sm text-carbon-200 bg-carbon-700 rounded-lg px-3 py-2">{v}</p>
            </div>
          ) : null)}
          {session.notes && (
            <div>
              <p className="text-xs font-semibold text-carbon-300 mb-1">📋 Coach Notes</p>
              <p className="text-sm text-carbon-200 bg-carbon-700 rounded-lg px-3 py-2 italic">{session.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Training() {
  const { trainings, addTraining, updateTraining, deleteTraining } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const sorted = [...trainings].sort((a, b) => b.date.localeCompare(a.date))

  const handleSave = async (form) => {
    if (editing) { await updateTraining(editing.id, form); setEditing(null) }
    else { await addTraining(form); setShowForm(false) }
  }

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Training</h1>
          <p className="text-carbon-300 text-sm">{trainings.length} sessions · Quick templates available</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => { setShowForm(true); setEditing(null) }}>
          <Plus size={15} /> New Session
        </button>
      </div>

      {showForm && !editing && <TrainingForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {sorted.map(session =>
          editing?.id === session.id
            ? <TrainingForm key={session.id} initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
            : <SessionCard key={session.id} session={session} onEdit={setEditing} onDelete={deleteTraining} />
        )}
      </div>
      {trainings.length === 0 && (
        <div className="text-center py-16 text-carbon-400">
          <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
          <p>No training sessions yet</p>
        </div>
      )}
    </div>
  )
}
