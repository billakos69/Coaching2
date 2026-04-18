import { useStore } from '../store'
import { Link } from 'react-router-dom'
import {
  Users, Trophy, Dumbbell, TrendingUp, TrendingDown, Minus,
  AlertTriangle, Star, Activity, ChevronRight, Target
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid
} from 'recharts'
import { format, parseISO } from 'date-fns'

const COLORS = ['#39ff6e', '#3b9eff', '#f5e642', '#ff3b5c']

function StatCard({ label, value, sub, icon: Icon, color = 'text-neon-green' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg bg-carbon-700 flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-display tracking-wider text-white">{value}</p>
        <p className="text-xs text-carbon-300">{label}</p>
        {sub && <p className="text-xs text-neon-green mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function FormBadge({ match }) {
  const won = match.scoreUs > match.scoreThem
  const drew = match.scoreUs === match.scoreThem
  if (won) return <span className="w-6 h-6 rounded-full bg-neon-green/20 text-neon-green text-xs flex items-center justify-center font-bold">W</span>
  if (drew) return <span className="w-6 h-6 rounded-full bg-neon-yellow/20 text-neon-yellow text-xs flex items-center justify-center font-bold">D</span>
  return <span className="w-6 h-6 rounded-full bg-neon-red/20 text-neon-red text-xs flex items-center justify-center font-bold">L</span>
}

export default function Dashboard() {
  const { players, matches, trainings, coachProfile } = useStore()

  const wins = matches.filter(m => m.scoreUs > m.scoreThem).length
  const draws = matches.filter(m => m.scoreUs === m.scoreThem).length
  const losses = matches.filter(m => m.scoreUs < m.scoreThem).length
  const totalGoals = matches.reduce((a, m) => a + m.scoreUs, 0)
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0
  const injured = players.filter(p => p.injured).length

  const last5 = [...matches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).reverse()

  const goalData = [...matches]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(m => ({ name: m.opponent.split(' ')[0], gf: m.scoreUs, ga: m.scoreThem }))

  const resultPie = [
    { name: 'Wins', value: wins },
    { name: 'Draws', value: draws },
    { name: 'Losses', value: losses },
  ].filter(d => d.value > 0)

  const positionDist = ['GK', 'CB', 'LB', 'RB', 'CM', 'LW', 'RW', 'ST'].map(pos => ({
    pos, count: players.filter(p => p.position === pos).length
  })).filter(d => d.count > 0)

  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5)

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="card text-xs py-2 px-3 !border-carbon-400">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Dashboard</h1>
        <p className="text-carbon-300 text-sm mt-0.5">{coachProfile.team} · Season Overview</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Players" value={players.length} sub={`${injured} injured`} icon={Users} />
        <StatCard label="Matches Played" value={matches.length} sub={`${winRate}% win rate`} icon={Trophy} color="text-neon-blue" />
        <StatCard label="Training Sessions" value={trainings.length} icon={Dumbbell} color="text-neon-yellow" />
        <StatCard label="Goals Scored" value={totalGoals} icon={Target} color="text-neon-red" />
      </div>

      {/* Form + Win pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Last 5 form */}
        <div className="card lg:col-span-1">
          <h2 className="text-sm font-semibold text-carbon-200 mb-3">Last 5 Results</h2>
          <div className="flex gap-2 mb-4">
            {last5.map(m => <FormBadge key={m.id} match={m} />)}
            {last5.length === 0 && <p className="text-carbon-400 text-xs">No matches yet</p>}
          </div>
          <div className="space-y-2">
            {last5.reverse().map(m => (
              <Link key={m.id} to={`/matches/${m.id}`} className="flex items-center justify-between text-xs hover:bg-carbon-700 px-2 py-1.5 rounded transition-colors">
                <span className="text-carbon-200 truncate flex-1">{m.opponent}</span>
                <span className="font-mono font-semibold text-white ml-2">{m.scoreUs}–{m.scoreThem}</span>
                <FormBadge match={m} />
              </Link>
            ))}
          </div>
        </div>

        {/* Result Pie */}
        <div className="card flex flex-col items-center">
          <h2 className="text-sm font-semibold text-carbon-200 mb-2 self-start">Win / Draw / Loss</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={resultPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {resultPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-xs">
            {resultPie.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-carbon-300">{d.name}: <strong className="text-white">{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals chart */}
        <div className="card">
          <h2 className="text-sm font-semibold text-carbon-200 mb-3">Goals For / Against</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={goalData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e38" />
              <XAxis dataKey="name" tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <YAxis tick={{ fill: '#5a5a6e', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="gf" fill="#39ff6e" radius={[3, 3, 0, 0]} name="GF" />
              <Bar dataKey="ga" fill="#ff3b5c" radius={[3, 3, 0, 0]} name="GA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top scorers + Injured */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
            <Star size={14} className="text-neon-yellow" /> Top Scorers
          </h2>
          <div className="space-y-2">
            {topScorers.map((p, i) => (
              <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-3 hover:bg-carbon-700 px-2 py-1.5 rounded transition-colors">
                <span className="text-carbon-400 text-xs font-mono w-4">{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-carbon-600 flex items-center justify-center text-xs font-bold text-neon-green">
                  {p.number}
                </div>
                <span className="flex-1 text-sm text-white truncate">{p.name}</span>
                <span className="badge bg-neon-green/10 text-neon-green">{p.goals}G {p.assists}A</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-neon-red" /> Injured Players
          </h2>
          {players.filter(p => p.injured).length === 0 ? (
            <p className="text-carbon-400 text-sm">✓ All players fit</p>
          ) : (
            <div className="space-y-2">
              {players.filter(p => p.injured).map(p => (
                <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-3 hover:bg-carbon-700 px-2 py-1.5 rounded transition-colors">
                  <div className="w-7 h-7 rounded-full bg-neon-red/10 flex items-center justify-center text-xs font-bold text-neon-red">
                    {p.number}
                  </div>
                  <span className="flex-1 text-sm text-white">{p.name}</span>
                  <span className="badge bg-neon-red/10 text-neon-red">{p.position}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-carbon-600">
            <h3 className="text-xs text-carbon-300 mb-2 uppercase tracking-wider">Squad Fatigue</h3>
            <div className="space-y-1.5">
              {players.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-xs text-carbon-300 w-24 truncate">{p.name.split(' ')[0]}</span>
                  <div className="flex-1 bg-carbon-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(p.fatigue / 10) * 100}%`,
                        background: p.fatigue > 7 ? '#ff3b5c' : p.fatigue > 5 ? '#f5e642' : '#39ff6e'
                      }}
                    />
                  </div>
                  <span className="text-xs text-carbon-400 font-mono">{p.fatigue}/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <h2 className="text-sm font-semibold text-carbon-200 mb-3 flex items-center gap-2">
          <Activity size={14} className="text-neon-blue" /> Recent Activity
        </h2>
        <div className="space-y-2">
          {[...matches, ...trainings]
            .sort((a, b) => b.date?.localeCompare(a.date))
            .slice(0, 5)
            .map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${item.opponent ? 'bg-neon-green' : 'bg-neon-blue'}`} />
                <span className="text-carbon-300 text-xs w-20 shrink-0">{item.date}</span>
                <span className="text-white truncate">
                  {item.opponent
                    ? `Match vs ${item.opponent} (${item.scoreUs}–${item.scoreThem})`
                    : `Training: ${item.title}`
                  }
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
