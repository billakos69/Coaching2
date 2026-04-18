import { useState } from 'react'
import { useStore } from '../store'
import { TrendingUp, BarChart3, Users, AlertTriangle } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, ScatterChart, Scatter
} from 'recharts'

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card text-xs py-2 px-3 !border-carbon-400 space-y-1">
      {label && <p className="font-semibold text-white mb-1">{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { players, matches } = useStore()
  const [compareA, setCompareA] = useState(players[4]?.id || '')
  const [compareB, setCompareB] = useState(players[5]?.id || '')

  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date))

  // Team trends over matches
  const trendData = sorted.map((m, i) => ({
    name: m.opponent.split(' ')[0],
    Goals: m.scoreUs,
    Conceded: m.scoreThem,
    Possession: m.possession,
    xG: m.xG,
  }))

  // Running win rate
  const winRateData = sorted.map((m, i) => {
    const slice = sorted.slice(0, i + 1)
    const wins = slice.filter(x => x.scoreUs > x.scoreThem).length
    return { name: m.opponent.split(' ')[0], WinRate: Math.round((wins / slice.length) * 100) }
  })

  // Last 5 form
  const last5 = [...matches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const formPoints = last5.map(m => m.scoreUs > m.scoreThem ? 3 : m.scoreUs === m.scoreThem ? 1 : 0)
  const formTotal = formPoints.reduce((a, b) => a + b, 0)

  // Goal types breakdown
  const goalTypes = matches.reduce((acc, m) => {
    acc.setPiece += m.goalTypes?.setPiece || 0
    acc.counter += m.goalTypes?.counter || 0
    acc.buildUp += m.goalTypes?.buildUp || 0
    return acc
  }, { setPiece: 0, counter: 0, buildUp: 0 })

  const goalTypeData = [
    { name: 'Set Piece', value: goalTypes.setPiece },
    { name: 'Counter', value: goalTypes.counter },
    { name: 'Build-up', value: goalTypes.buildUp },
  ]

  // Player comparison
  const pA = players.find(p => p.id === compareA)
  const pB = players.find(p => p.id === compareB)

  const compareData = pA && pB ? [
    { stat: 'Goals', [pA.name.split(' ')[0]]: pA.goals, [pB.name.split(' ')[0]]: pB.goals },
    { stat: 'Assists', [pA.name.split(' ')[0]]: pA.assists, [pB.name.split(' ')[0]]: pB.assists },
    { stat: 'Rating', [pA.name.split(' ')[0]]: pA.rating, [pB.name.split(' ')[0]]: pB.rating },
    { stat: 'Minutes/90', [pA.name.split(' ')[0]]: Math.round(pA.minutes / 90), [pB.name.split(' ')[0]]: Math.round(pB.minutes / 90) },
    { stat: 'Fatigue', [pA.name.split(' ')[0]]: pA.fatigue || 0, [pB.name.split(' ')[0]]: pB.fatigue || 0 },
  ] : []

  // Weaknesses aggregated
  const allWeaknesses = matches.flatMap(m => m.weaknesses || [])
  const weaknessCounts = allWeaknesses.reduce((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc }, {})
  const topWeaknesses = Object.entries(weaknessCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  // Match comparison tool — pick 2 matches
  const [matchA, setMatchA] = useState(matches[0]?.id || '')
  const [matchB, setMatchB] = useState(matches[1]?.id || '')
  const mA = matches.find(m => m.id === matchA)
  const mB = matches.find(m => m.id === matchB)

  const matchCompareData = mA && mB ? [
    { stat: 'Possession', A: mA.possession, B: mB.possession },
    { stat: 'Shots', A: mA.shots, B: mB.shots },
    { stat: 'xG', A: mA.xG, B: mB.xG },
    { stat: 'Goals', A: mA.scoreUs, B: mB.scoreUs },
  ] : []

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="section-title">Analytics</h1>
        <p className="text-carbon-300 text-sm">Team trends, player comparisons, tactical insights</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Last 5 Pts', value: `${formTotal}/15`, color: 'text-neon-green' },
          { label: 'Avg Goals/Match', value: matches.length ? (matches.reduce((a, m) => a + m.scoreUs, 0) / matches.length).toFixed(1) : '–', color: 'text-neon-blue' },
          { label: 'Avg xG', value: matches.length ? (matches.reduce((a, m) => a + m.xG, 0) / matches.length).toFixed(2) : '–', color: 'text-neon-yellow' },
          { label: 'Clean Sheets', value: matches.filter(m => m.scoreThem === 0).length, color: 'text-neon-green' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-display ${color}`}>{value}</p>
            <p className="text-xs text-carbon-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Last 5 form */}
      <div className="card">
        <h2 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-neon-green" /> Last 5 Form
        </h2>
        <div className="flex gap-2">
          {last5.reverse().map((m, i) => {
            const w = m.scoreUs > m.scoreThem, d = m.scoreUs === m.scoreThem
            return (
              <div key={m.id} className={`flex-1 rounded-lg p-2 text-center border ${w ? 'bg-neon-green/10 border-neon-green/30' : d ? 'bg-neon-yellow/10 border-neon-yellow/30' : 'bg-neon-red/10 border-neon-red/30'}`}>
                <p className={`text-sm font-display ${w ? 'text-neon-green' : d ? 'text-neon-yellow' : 'text-neon-red'}`}>
                  {w ? 'W' : d ? 'D' : 'L'}
                </p>
                <p className="text-xs text-carbon-400 font-mono">{m.scoreUs}–{m.scoreThem}</p>
                <p className="text-xs text-carbon-500 truncate">{m.opponent.split(' ')[0]}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Team trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-carbon-200 mb-3">Goals For vs Against</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e38" />
              <XAxis dataKey="name" tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <YAxis tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#5a5a6e' }} />
              <Line type="monotone" dataKey="Goals" stroke="#39ff6e" strokeWidth={2} dot={{ fill: '#39ff6e', r: 3 }} />
              <Line type="monotone" dataKey="Conceded" stroke="#ff3b5c" strokeWidth={2} dot={{ fill: '#ff3b5c', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-carbon-200 mb-3">Win Rate Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={winRateData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e38" />
              <XAxis dataKey="name" tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <Tooltip content={<TT />} />
              <Line type="monotone" dataKey="WinRate" stroke="#3b9eff" strokeWidth={2} dot={{ fill: '#3b9eff', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goal classification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-carbon-200 mb-3">Goal Types Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={goalTypeData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e38" />
              <XAxis dataKey="name" tick={{ fill: '#5a5a6e', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <Tooltip content={<TT />} />
              <Bar dataKey="value" fill="#39ff6e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weakness tracker */}
        <div className="card">
          <h2 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-neon-red" /> Recurring Weaknesses
          </h2>
          {topWeaknesses.length === 0 ? (
            <p className="text-carbon-400 text-sm">No weaknesses tagged yet — add them in match details.</p>
          ) : (
            <div className="space-y-2">
              {topWeaknesses.map(([w, count]) => (
                <div key={w} className="flex items-center gap-3">
                  <span className="text-sm text-carbon-200 flex-1 truncate">{w}</span>
                  <div className="w-24 bg-carbon-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-neon-red"
                      style={{ width: `${(count / (topWeaknesses[0]?.[1] || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-neon-red w-6 text-right">{count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player Comparison */}
      <div className="card">
        <h2 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
          <Users size={14} className="text-neon-blue" /> Player Comparison
        </h2>
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-32">
            <label className="label">Player A</label>
            <select className="input" value={compareA} onChange={e => setCompareA(e.target.value)}>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-32">
            <label className="label">Player B</label>
            <select className="input" value={compareB} onChange={e => setCompareB(e.target.value)}>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        {compareData.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compareData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e38" />
              <XAxis dataKey="stat" tick={{ fill: '#5a5a6e', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey={pA?.name.split(' ')[0]} fill="#39ff6e" radius={[3, 3, 0, 0]} />
              <Bar dataKey={pB?.name.split(' ')[0]} fill="#3b9eff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Match Comparison Tool */}
      <div className="card">
        <h2 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-neon-yellow" /> Match Comparison
        </h2>
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-32">
            <label className="label">Match A</label>
            <select className="input" value={matchA} onChange={e => setMatchA(e.target.value)}>
              {matches.map(m => <option key={m.id} value={m.id}>vs {m.opponent} ({m.date})</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-32">
            <label className="label">Match B</label>
            <select className="input" value={matchB} onChange={e => setMatchB(e.target.value)}>
              {matches.map(m => <option key={m.id} value={m.id}>vs {m.opponent} ({m.date})</option>)}
            </select>
          </div>
        </div>
        {matchCompareData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={matchCompareData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e38" />
              <XAxis dataKey="stat" tick={{ fill: '#5a5a6e', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="A" name={`vs ${mA?.opponent}`} fill="#f5e642" radius={[3, 3, 0, 0]} />
              <Bar dataKey="B" name={`vs ${mB?.opponent}`} fill="#ff3b5c" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* xG trend */}
      <div className="card">
        <h2 className="text-sm font-semibold text-carbon-200 mb-3">xG Trend</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e38" />
            <XAxis dataKey="name" tick={{ fill: '#5a5a6e', fontSize: 10 }} />
            <YAxis tick={{ fill: '#5a5a6e', fontSize: 10 }} />
            <Tooltip content={<TT />} />
            <Line type="monotone" dataKey="xG" stroke="#f5e642" strokeWidth={2} dot={{ fill: '#f5e642', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
