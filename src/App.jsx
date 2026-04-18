import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import PlayerProfile from './pages/PlayerProfile'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Training from './pages/Training'
import Tactics from './pages/Tactics'
import Planner from './pages/Planner'
import Analytics from './pages/Analytics'
import CoachProfile from './pages/CoachProfile'
import Setup from './pages/Setup'

export default function App() {
  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="players" element={<Players />} />
        <Route path="players/:id" element={<PlayerProfile />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/:id" element={<MatchDetail />} />
        <Route path="training" element={<Training />} />
        <Route path="tactics" element={<Tactics />} />
        <Route path="planner" element={<Planner />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<CoachProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
