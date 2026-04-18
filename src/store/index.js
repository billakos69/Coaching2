import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_PLAYERS = [
  { id: '1', name: 'Nikos Papadopoulos', age: 24, position: 'GK', number: 1, goals: 0, assists: 1, minutes: 1620, rating: 7.2, injured: false, fatigue: 3, touches: [] },
  { id: '2', name: 'Kostas Alexiou', age: 28, position: 'CB', number: 4, goals: 2, assists: 0, minutes: 1530, rating: 7.5, injured: false, fatigue: 4, touches: [] },
  { id: '3', name: 'Dimitris Lemos', age: 22, position: 'LB', number: 3, goals: 1, assists: 4, minutes: 1440, rating: 7.8, injured: true, fatigue: 2, touches: [] },
  { id: '4', name: 'Yannis Petros', age: 26, position: 'CM', number: 8, goals: 5, assists: 7, minutes: 1580, rating: 8.1, injured: false, fatigue: 5, touches: [] },
  { id: '5', name: 'Stavros Kritis', age: 30, position: 'ST', number: 9, goals: 14, assists: 3, minutes: 1350, rating: 8.6, injured: false, fatigue: 6, touches: [] },
  { id: '6', name: 'Makis Drakos', age: 21, position: 'RW', number: 11, goals: 8, assists: 9, minutes: 1200, rating: 8.3, injured: false, fatigue: 4, touches: [] },
]

const DEMO_MATCHES = [
  {
    id: 'm1', opponent: 'Olympiacos FC', date: '2024-03-10', home: true,
    scoreUs: 3, scoreThem: 1, possession: 58, shots: 14, xG: 2.8,
    wellNotes: 'Great pressing, clinical finishing in the second half.',
    wrongNotes: 'Poor set piece defending early in the game.',
    moments: [{ time: 23, label: 'Goal - Stavros header', type: 'goal' }, { time: 67, label: 'Red card threat averted', type: 'key' }],
    playerRatings: { '5': 9.0, '4': 8.0, '6': 8.5 },
    goalTypes: { setPiece: 1, counter: 1, buildUp: 1 },
    weaknesses: ['Set piece defense', 'Second ball recovery'],
  },
  {
    id: 'm2', opponent: 'Panathinaikos', date: '2024-03-17', home: false,
    scoreUs: 1, scoreThem: 2, possession: 44, shots: 9, xG: 1.1,
    wellNotes: 'Solid defensive shape for 60 minutes.',
    wrongNotes: 'Lost concentration after their equalizer. No plan B.',
    moments: [{ time: 78, label: 'Defensive collapse', type: 'mistake' }],
    playerRatings: { '5': 6.5, '4': 6.0, '6': 7.0 },
    goalTypes: { setPiece: 0, counter: 1, buildUp: 0 },
    weaknesses: ['Mental resilience', 'Pressing triggers'],
  },
  {
    id: 'm3', opponent: 'PAOK FC', date: '2024-03-24', home: true,
    scoreUs: 2, scoreThem: 2, possession: 51, shots: 11, xG: 1.9,
    wellNotes: 'Good ball circulation through midfield.',
    wrongNotes: 'Gave away penalty needlessly.',
    moments: [{ time: 45, label: 'Penalty conceded', type: 'mistake' }, { time: 90, label: 'Last-minute equalizer', type: 'goal' }],
    playerRatings: { '5': 7.5, '4': 7.0, '6': 7.5 },
    goalTypes: { setPiece: 1, counter: 0, buildUp: 1 },
    weaknesses: ['Penalty discipline'],
  },
]

const DEMO_TRAININGS = [
  {
    id: 't1', date: '2024-03-12', title: 'High Press Session',
    warmUp: 'Dynamic stretching, rondo 4v2 (10 min)',
    technical: 'Passing lanes and triggers (20 min)',
    tactical: 'High press shape 4-3-3 (25 min)',
    game: '8v8 pressing game (20 min)',
    notes: 'Players were sharp. Focus on triggers next session.',
    exercises: ['Rondo', 'Shadow play', 'Position game'],
    duration: 75,
  },
  {
    id: 't2', date: '2024-03-19', title: 'Set Pieces',
    warmUp: 'Activation run, pass and move (10 min)',
    technical: 'Crossing and finishing (20 min)',
    tactical: 'Corner attack/defend routines (30 min)',
    game: '11v11 scrimmage (15 min)',
    notes: 'Improved corner routines. Need more repetitions.',
    exercises: ['Set piece rehearsal', 'Heading practice'],
    duration: 75,
  },
]

const DEMO_FORMATION = {
  name: '4-3-3',
  positions: [
    { id: '1', x: 50, y: 88, label: 'GK' },
    { id: '2', x: 20, y: 70, label: 'LB' },
    { id: '3', x: 38, y: 72, label: 'CB' },
    { id: '4', x: 62, y: 72, label: 'CB' },
    { id: '5', x: 80, y: 70, label: 'RB' },
    { id: '6', x: 28, y: 52, label: 'CM' },
    { id: '7', x: 50, y: 46, label: 'CM' },
    { id: '8', x: 72, y: 52, label: 'CM' },
    { id: '9', x: 22, y: 28, label: 'LW' },
    { id: '10', x: 50, y: 22, label: 'ST' },
    { id: '11', x: 78, y: 28, label: 'RW' },
  ]
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // UI
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // Coach profile
      coachProfile: {
        name: 'Coach Makis',
        team: 'FC Tactiq',
        philosophy: 'We play aggressive, high-energy football that suffocates the opponent. Our identity is built on relentless pressing, vertical passing, and collective intelligence. Every player understands their role in both phases.',
        formation: '4-3-3',
      },
      setCoachProfile: (profile) => set({ coachProfile: profile }),

      // Players
      players: DEMO_PLAYERS,
      addPlayer: async (player) => {
        const newP = { ...player, id: Date.now().toString(), touches: [], fatigue: 3, injured: false }
        if (isSupabaseConfigured()) {
          const { data } = await supabase.from('players').insert([newP]).select()
          if (data) { set((s) => ({ players: [...s.players, data[0]] })); return }
        }
        set((s) => ({ players: [...s.players, newP] }))
      },
      updatePlayer: async (id, updates) => {
        if (isSupabaseConfigured()) await supabase.from('players').update(updates).eq('id', id)
        set((s) => ({ players: s.players.map(p => p.id === id ? { ...p, ...updates } : p) }))
      },
      deletePlayer: async (id) => {
        if (isSupabaseConfigured()) await supabase.from('players').delete().eq('id', id)
        set((s) => ({ players: s.players.filter(p => p.id !== id) }))
      },
      addTouchToPlayer: (id, touch) => {
        set((s) => ({ players: s.players.map(p => p.id === id ? { ...p, touches: [...(p.touches || []), touch] } : p) }))
      },

      // Matches
      matches: DEMO_MATCHES,
      addMatch: async (match) => {
        const newM = { ...match, id: Date.now().toString() }
        if (isSupabaseConfigured()) {
          const { data } = await supabase.from('matches').insert([newM]).select()
          if (data) { set((s) => ({ matches: [...s.matches, data[0]] })); return }
        }
        set((s) => ({ matches: [...s.matches, newM] }))
      },
      updateMatch: async (id, updates) => {
        if (isSupabaseConfigured()) await supabase.from('matches').update(updates).eq('id', id)
        set((s) => ({ matches: s.matches.map(m => m.id === id ? { ...m, ...updates } : m) }))
      },
      deleteMatch: async (id) => {
        if (isSupabaseConfigured()) await supabase.from('matches').delete().eq('id', id)
        set((s) => ({ matches: s.matches.filter(m => m.id !== id) }))
      },

      // Trainings
      trainings: DEMO_TRAININGS,
      addTraining: async (training) => {
        const newT = { ...training, id: Date.now().toString() }
        if (isSupabaseConfigured()) {
          const { data } = await supabase.from('trainings').insert([newT]).select()
          if (data) { set((s) => ({ trainings: [...s.trainings, data[0]] })); return }
        }
        set((s) => ({ trainings: [...s.trainings, newT] }))
      },
      updateTraining: async (id, updates) => {
        if (isSupabaseConfigured()) await supabase.from('trainings').update(updates).eq('id', id)
        set((s) => ({ trainings: s.trainings.map(t => t.id === id ? { ...t, ...updates } : t) }))
      },
      deleteTraining: async (id) => {
        if (isSupabaseConfigured()) await supabase.from('trainings').delete().eq('id', id)
        set((s) => ({ trainings: s.trainings.filter(t => t.id !== id) }))
      },

      // Tactical Board
      formation: DEMO_FORMATION,
      setFormation: (formation) => set({ formation }),
      savedFormations: [],
      saveFormation: (formation) => set((s) => ({
        savedFormations: [...s.savedFormations.filter(f => f.name !== formation.name), formation]
      })),
    }),
    { name: 'tactiq-store' }
  )
)
