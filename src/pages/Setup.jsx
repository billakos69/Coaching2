import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Database, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react'

const SQL_SCHEMA = `-- Run this in your Supabase SQL Editor

create table players (
  id text primary key,
  name text not null,
  age int,
  position text,
  number int,
  goals int default 0,
  assists int default 0,
  minutes int default 0,
  rating float default 7.0,
  injured boolean default false,
  fatigue int default 3,
  touches jsonb default '[]'
);

create table matches (
  id text primary key,
  opponent text not null,
  date text not null,
  home boolean default true,
  "scoreUs" int default 0,
  "scoreThem" int default 0,
  possession int default 50,
  shots int default 0,
  "xG" float default 0,
  "wellNotes" text,
  "wrongNotes" text,
  moments jsonb default '[]',
  "playerRatings" jsonb default '{}',
  "goalTypes" jsonb default '{}',
  weaknesses jsonb default '[]'
);

create table trainings (
  id text primary key,
  date text not null,
  title text not null,
  "warmUp" text,
  technical text,
  tactical text,
  game text,
  notes text,
  exercises jsonb default '[]',
  duration int default 75
);

-- Enable Row Level Security (optional for solo use)
-- alter table players enable row level security;
-- alter table matches enable row level security;
-- alter table trainings enable row level security;
`

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="flex items-center gap-1.5 text-xs btn-secondary py-1 px-2"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
    >
      {copied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function Setup() {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(false)

  const save = () => {
    if (url && key) {
      localStorage.setItem('VITE_SUPABASE_URL', url)
      localStorage.setItem('VITE_SUPABASE_ANON_KEY', key)
      setSaved(true)
      setTimeout(() => window.location.href = '/', 1500)
    }
  }

  const steps = [
    { n: 1, title: 'Create Supabase project', desc: 'Go to supabase.com → New Project. Free tier is enough.', link: 'https://supabase.com' },
    { n: 2, title: 'Run the SQL schema', desc: 'Open SQL Editor in Supabase, paste the schema below, and Run.' },
    { n: 3, title: 'Get your API keys', desc: 'Project Settings → API → copy Project URL and anon key.' },
    { n: 4, title: 'Add to .env file', desc: 'Create .env in the project root (or paste below for quick setup).' },
    { n: 5, title: 'Deploy on Vercel', desc: 'Push to GitHub → import on vercel.com → add env variables → Deploy.' },
  ]

  return (
    <div className="min-h-screen bg-carbon-900 text-white font-body p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-neon-green rounded-xl flex items-center justify-center">
          <Zap size={20} className="text-carbon-900" />
        </div>
        <div>
          <h1 className="font-display text-3xl tracking-widest">TACTIQ</h1>
          <p className="text-carbon-300 text-sm">Setup & Supabase Connection</p>
        </div>
      </div>

      <div className="card mb-6 bg-neon-green/5 border-neon-green/20">
        <p className="text-sm text-carbon-200">
          Tactiq works <strong className="text-neon-green">out of the box with demo data</strong> — no setup needed. Connect Supabase only if you want your data to persist across devices and sessions.
        </p>
        <Link to="/" className="btn-primary inline-block mt-3 text-xs">→ Skip & Use Demo Mode</Link>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {steps.map(step => (
          <div key={step.n} className="card flex gap-4">
            <div className="w-7 h-7 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green font-display text-sm shrink-0">
              {step.n}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{step.title}</p>
              <p className="text-carbon-300 text-xs mt-0.5">{step.desc}</p>
              {step.link && (
                <a href={step.link} target="_blank" rel="noreferrer" className="text-neon-blue text-xs flex items-center gap-1 mt-1 hover:underline">
                  {step.link} <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SQL Schema */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Database size={14} className="text-neon-blue" /> SQL Schema
          </h2>
          <CopyButton text={SQL_SCHEMA} />
        </div>
        <pre className="text-xs text-carbon-300 bg-carbon-900 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed max-h-60 overflow-y-auto">
          {SQL_SCHEMA}
        </pre>
      </div>

      {/* .env content */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">.env file content</h2>
          <CopyButton text={`VITE_SUPABASE_URL=your_url_here\nVITE_SUPABASE_ANON_KEY=your_key_here`} />
        </div>
        <pre className="text-xs text-neon-green bg-carbon-900 rounded-lg p-3 font-mono">
{`VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
        </pre>
      </div>

      {/* Quick connect */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-carbon-200">Quick Connect (session only)</h2>
        <p className="text-xs text-carbon-400">Paste your keys here to connect without editing files. Resets on clear.</p>
        <div>
          <label className="label">Supabase Project URL</label>
          <input className="input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
        </div>
        <div>
          <label className="label">Anon Key</label>
          <input className="input" value={key} onChange={e => setKey(e.target.value)} placeholder="eyJhbGci..." />
        </div>
        <button
          className={`btn-primary flex items-center gap-2 ${saved ? 'bg-pitch-600' : ''}`}
          onClick={save}
          disabled={!url || !key}
        >
          {saved ? <><CheckCircle size={15} /> Connected! Redirecting...</> : <><Database size={15} /> Connect Supabase</>}
        </button>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-carbon-400 text-sm hover:text-white">← Back to App</Link>
      </div>
    </div>
  )
}
