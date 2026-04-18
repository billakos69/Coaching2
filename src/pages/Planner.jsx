import { useState } from 'react'
import { useStore } from '../store'
import { ChevronLeft, ChevronRight, Calendar, Trophy, Dumbbell } from 'lucide-react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Planner() {
  const { matches, trainings } = useStore()
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getEvents = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const matchEvents = matches
      .filter(m => m.date === dateStr)
      .map(m => ({ type: 'match', label: `vs ${m.opponent}`, sub: `${m.scoreUs ?? '?'}–${m.scoreThem ?? '?'}`, id: m.id }))
    const trainEvents = trainings
      .filter(t => t.date === dateStr)
      .map(t => ({ type: 'training', label: t.title, sub: `${t.duration}min`, id: t.id }))
    return [...matchEvents, ...trainEvents]
  }

  const today = new Date()

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Weekly Planner</h1>
          <p className="text-carbon-300 text-sm">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary p-2" onClick={() => setWeekStart(w => subWeeks(w, 1))}>
            <ChevronLeft size={16} />
          </button>
          <button className="btn-secondary text-xs px-3" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Today
          </button>
          <button className="btn-secondary p-2" onClick={() => setWeekStart(w => addWeeks(w, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const events = getEvents(day)
          const isToday = isSameDay(day, today)
          return (
            <div key={i} className={`card min-h-32 flex flex-col ${isToday ? 'border-neon-green/50 bg-neon-green/5' : ''}`}>
              <div className={`text-center mb-2 pb-2 border-b border-carbon-600`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-neon-green' : 'text-carbon-400'}`}>{DAYS[i]}</p>
                <p className={`text-xl font-display ${isToday ? 'text-neon-green' : 'text-white'}`}>{format(day, 'd')}</p>
              </div>
              <div className="space-y-1.5 flex-1">
                {events.map((ev, j) => (
                  <div key={j} className={`rounded-md px-2 py-1.5 text-xs ${ev.type === 'match' ? 'bg-neon-green/10 border border-neon-green/20' : 'bg-neon-blue/10 border border-neon-blue/20'}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      {ev.type === 'match' ? <Trophy size={10} className="text-neon-green" /> : <Dumbbell size={10} className="text-neon-blue" />}
                      <span className={`font-semibold truncate ${ev.type === 'match' ? 'text-neon-green' : 'text-neon-blue'}`}>{ev.label}</span>
                    </div>
                    <p className="text-carbon-400 pl-3.5">{ev.sub}</p>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-carbon-600 text-xs text-center pt-2">—</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile list */}
      <div className="lg:hidden space-y-3">
        {days.map((day, i) => {
          const events = getEvents(day)
          const isToday = isSameDay(day, today)
          return (
            <div key={i} className={`card ${isToday ? 'border-neon-green/50' : ''}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${isToday ? 'bg-neon-green text-carbon-900' : 'bg-carbon-700 text-white'}`}>
                  <span className="text-xs font-semibold uppercase">{DAYS[i]}</span>
                  <span className="text-lg font-display leading-none">{format(day, 'd')}</span>
                </div>
                <span className={`text-sm ${isToday ? 'text-neon-green font-semibold' : 'text-carbon-300'}`}>
                  {format(day, 'MMMM d')}
                  {isToday && ' · Today'}
                </span>
              </div>
              {events.length === 0 ? (
                <p className="text-carbon-600 text-xs pl-13 ml-13">Rest day</p>
              ) : (
                <div className="space-y-1.5 ml-1">
                  {events.map((ev, j) => (
                    <div key={j} className={`rounded-lg px-3 py-2 flex items-center gap-2 ${ev.type === 'match' ? 'bg-neon-green/10' : 'bg-neon-blue/10'}`}>
                      {ev.type === 'match' ? <Trophy size={13} className="text-neon-green shrink-0" /> : <Dumbbell size={13} className="text-neon-blue shrink-0" />}
                      <span className={`text-sm font-medium ${ev.type === 'match' ? 'text-neon-green' : 'text-neon-blue'}`}>{ev.label}</span>
                      <span className="text-xs text-carbon-400 ml-auto">{ev.sub}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-carbon-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-neon-green/20 border border-neon-green/30" />
          Match
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-neon-blue/20 border border-neon-blue/30" />
          Training
        </div>
      </div>
    </div>
  )
}
