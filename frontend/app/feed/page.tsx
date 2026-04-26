"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Complaint {
  id: string;
  time: string;
  type: string;
  neighborhood: string;
  cd: string;
  priority: "HIGH" | "MED" | "LOW";
}

const COMPLAINT_POOL = [
  {type:"Bulky Items", neighborhood:"Boyle Heights", cd:"CD14", priority:"HIGH"},
  {type:"Illegal Dumping", neighborhood:"Watts", cd:"CD15", priority:"HIGH"},
  {type:"Graffiti Removal", neighborhood:"NoHo", cd:"CD2", priority:"MED"},
  {type:"Homeless Encampment", neighborhood:"Tarzana", cd:"CD3", priority:"HIGH"},
  {type:"Pothole Repair", neighborhood:"East LA", cd:"CD14", priority:"MED"},
  {type:"Street Light Out", neighborhood:"South LA", cd:"CD8", priority:"MED"},
  {type:"Bulky Items", neighborhood:"Mar Vista", cd:"CD11", priority:"LOW"},
  {type:"Graffiti Removal", neighborhood:"Silver Lake", cd:"CD13", priority:"LOW"},
  {type:"Illegal Dumping", neighborhood:"Van Nuys", cd:"CD6", priority:"MED"},
  {type:"Homeless Encampment", neighborhood:"Skid Row", cd:"CD14", priority:"HIGH"},
  {type:"Bulky Items", neighborhood:"North Hollywood", cd:"CD2", priority:"LOW"},
  {type:"Metal/Household", neighborhood:"Foothill Trails", cd:"CD12", priority:"MED"},
  {type:"Single Streetlight", neighborhood:"Eagle Rock", cd:"CD14", priority:"LOW"},
  {type:"Pothole Repair", neighborhood:"Koreatown", cd:"CD10", priority:"MED"},
  {type:"Bulky Items", neighborhood:"Empowerment Cong SE", cd:"CD8", priority:"HIGH"},
  {type:"Graffiti Removal", neighborhood:"Los Feliz", cd:"CD4", priority:"LOW"},
  {type:"Illegal Dumping", neighborhood:"South LA", cd:"CD9", priority:"HIGH"},
  {type:"Street Light Out", neighborhood:"Hollywood Hills", cd:"CD4", priority:"LOW"},
  {type:"Bulky Items", neighborhood:"Bel Air", cd:"CD5", priority:"LOW"},
  {type:"Homeless Encampment", neighborhood:"Downtown", cd:"CD14", priority:"HIGH"},
];

const RECENT_COMPLAINTS_TICKER = [
  "Bulky Items — Boyle Heights 11:57",
  "Illegal Dumping — Watts 11:56",
  "Graffiti — NoHo 11:54",
  "Homeless Encampment — Tarzana 11:48",
  "Bulky Items — Mar Vista 11:47",
  "Pothole — East LA 11:45",
  "Abandoned Car — Pacoima 11:42",
  "Street Light — South LA 11:40",
  "Illegal Dumping — Sylmar 11:38",
  "Graffiti — Koreatown 11:35"
];

const PIPELINE_CYCLES = [
  { target: "Boyle Heights", cd: "CD14", policy: "Crew reallocation", impact: "+18%" },
  { target: "Watts", cd: "CD15", policy: "Sanitation unit deployment", impact: "+15%" },
  { target: "South LA", cd: "CD8", policy: "Graffiti prevention", impact: "+14%" },
  { target: "East LA", cd: "CD14", policy: "Streetlight program", impact: "+12%" },
];

export default function FeedPage() {
  const [now, setNow] = useState(new Date());
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [hourStats, setHourStats] = useState({ total: 142, high: 28 });
  
  // Pipeline State
  const [cycleIndex, setCycleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  
  // Counters
  const [reviewed, setReviewed] = useState(47);
  const [passed, setPassed] = useState(39);
  const [risks, setRisks] = useState(23);
  
  // Recent Verdicts
  const [verdicts, setVerdicts] = useState([
    { status: "✅ APPROVED", title: "Crew realloc CD14", time: "just now" },
    { status: "✅ APPROVED", title: "Sanitation CD15", time: "2m ago" },
    { status: "⚠️ CONDITIONS", title: "CD8 graffiti prog", time: "5m ago" },
    { status: "✅ APPROVED", title: "Street light CD2", time: "8m ago" },
    { status: "❌ REJECTED", title: "Budget realloc CD4", time: "12m ago" },
  ]);

  useEffect(() => {
    // 1. Clock
    const clockInt = setInterval(() => setNow(new Date()), 1000);
    
    // 2. Incoming Complaints (every 4s)
    const complaintInt = setInterval(() => {
      const rand = COMPLAINT_POOL[Math.floor(Math.random() * COMPLAINT_POOL.length)];
      const newTime = new Date(Date.now() - Math.floor(Math.random() * 60) * 60000);
      const newC: Complaint = {
        id: Math.random().toString(36).substr(2, 9),
        time: newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...rand as any
      };
      setComplaints(prev => [newC, ...prev].slice(0, 12));
      setHourStats(prev => ({
        total: prev.total + 1,
        high: prev.high + (newC.priority === 'HIGH' ? 1 : 0)
      }));
    }, 4000);

    // 3. Pipeline Stepper (every 4s)
    const pipelineInt = setInterval(() => {
      setStepIndex(prev => {
        if (prev === 4) {
          setCycleIndex(c => (c + 1) % PIPELINE_CYCLES.length);
          return 0;
        }
        return prev + 1;
      });
    }, 4000);

    // 4. Global Counters
    const reviewedInt = setInterval(() => setReviewed(v => v + 1), 45000);
    const passedInt = setInterval(() => setPassed(v => v + 1), 50000);
    const risksInt = setInterval(() => setRisks(v => v + 1), 60000);

    return () => {
      clearInterval(clockInt);
      clearInterval(complaintInt);
      clearInterval(pipelineInt);
      clearInterval(reviewedInt);
      clearInterval(passedInt);
      clearInterval(risksInt);
    };
  }, []);

  const getPriorityColor = (p: string) => {
    if (p === 'HIGH') return 'text-rose-500';
    if (p === 'MED') return 'text-yellow-500';
    return 'text-emerald-500';
  };

  const currentCycle = PIPELINE_CYCLES[cycleIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-mono overflow-hidden">
      
      {/* TOP BAR */}
      <header className="h-14 border-b border-zinc-800 bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-emerald-500 font-black tracking-widest text-xs">AGENTCIVIC INTELLIGENCE FEED</h1>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-zinc-400 text-xs tabular-nums">{now.toLocaleTimeString()}</span>
        </div>
        
        <div className="flex gap-6">
          {[ "FEED ACTIVE", "AGENTS ONLINE", "ASI:ONE", "AGENTVERSE" ].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_#10b981]" />
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest">{s}</span>
            </div>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-x divide-zinc-800 overflow-hidden">
        
        {/* COLUMN 1: LIVE FEED */}
        <section className="flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Live MyLA311 Feed <span className="text-emerald-500 ml-1">●</span></h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {complaints.map((c) => (
              <div key={c.id} className="bg-[#111] border border-zinc-800 p-3 rounded-lg animate-in slide-in-from-top-2 duration-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-zinc-600 font-bold">{c.time}</span>
                  <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded border border-current ${getPriorityColor(c.priority)}`}>
                    {c.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-black">{c.cd}</span>
                  <h3 className="text-xs font-bold text-zinc-200">{c.neighborhood}</h3>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{c.type}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-zinc-800 bg-[#0a0a0a]">
            <p className="text-[10px] text-zinc-600 font-bold tracking-wider uppercase">
              {hourStats.total} complaints in last hour | <span className="text-rose-500">{hourStats.high} HIGH</span> priority
            </p>
          </div>
        </section>

        {/* COLUMN 2: AGENT PIPELINE */}
        <section className="flex flex-col overflow-hidden bg-zinc-900/5">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Agent Decisions <span className="text-emerald-500 ml-1">●</span></h2>
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-center space-y-8">
            <div className="space-y-3 opacity-60">
              <div className={`text-[10px] ${stepIndex >= 0 ? 'text-emerald-500' : 'text-zinc-700'}`}>[ORCHESTRATOR: {stepIndex > 0 ? 'ROUTING ✓' : 'STANDBY'}]</div>
              <div className={`text-[10px] ${stepIndex >= 1 ? 'text-emerald-500' : 'text-zinc-700'}`}>[PROPOSER: {stepIndex > 1 ? 'COMPLETE ✓' : 'STANDBY'}]</div>
              <div className={`text-[10px] ${stepIndex >= 2 ? 'text-emerald-500' : 'text-zinc-700'}`}>[VERIFIER: {stepIndex > 2 ? 'PASSED 7/7 ✓' : 'STANDBY'}]</div>
              <div className={`text-[10px] ${stepIndex >= 3 ? 'text-emerald-500' : 'text-zinc-700'}`}>[RED TEAM: {stepIndex > 3 ? 'APPROVED ✓' : 'STANDBY'}]</div>
            </div>

            <div className="relative min-h-[160px]">
              {stepIndex === 0 && (
                <div className="border border-[#0066cc] rounded-lg p-5 bg-[#0066cc]/5 animate-pulse">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-[#0066cc]">🌐 ORCHESTRATOR</span>
                    <span className="text-[10px] font-black text-[#0066cc] animate-pulse">ANALYZING ●</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed uppercase">Processing HIGH priority<br/>complaint batch from {currentCycle.cd}<br/>3 complaints queued</p>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="border border-[#10b981] rounded-lg p-5 bg-[#10b981]/5 animate-in zoom-in duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-[#10b981]">📋 PROPOSER</span>
                    <span className="text-[10px] font-black text-[#10b981] animate-pulse">GENERATING ●</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed uppercase">Analyzing MyLA311 signals<br/>for {currentCycle.target} {currentCycle.cd}...<br/>Draft: {currentCycle.policy}</p>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="border border-[#0891b2] rounded-lg p-5 bg-[#0891b2]/5 animate-in zoom-in duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-[#0891b2]">✅ VERIFIER</span>
                    <span className="text-[10px] font-black text-[#0891b2] animate-pulse">CHECKING ●</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed uppercase mb-3">Running 7 constitutional<br/>constraints...</p>
                  <div className="flex gap-1">
                    <div className="flex-1 h-1.5 bg-[#0891b2] rounded-full" />
                    <div className="flex-1 h-1.5 bg-[#0891b2] rounded-full" />
                    <div className="flex-1 h-1.5 bg-[#0891b2] rounded-full" />
                    <div className="flex-1 h-1.5 bg-[#0891b2] rounded-full" />
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full" />
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full" />
                  </div>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="border border-rose-600 rounded-lg p-5 bg-rose-600/5 animate-in zoom-in duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-rose-600">🔴 RED TEAM</span>
                    <span className="text-[10px] font-black text-rose-600 animate-pulse">STRESS TEST ●</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed uppercase">Testing for gaming vectors<br/>and bias amplification...<br/>Risks found: 1 MEDIUM</p>
                </div>
              )}

              {stepIndex === 4 && (
                <div className="border-2 border-emerald-500 rounded-lg p-5 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] animate-in scale-105 duration-500">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-black text-emerald-500 tracking-tighter">🏛️ LATEST VERDICT</span>
                    <span className="text-[10px] font-black text-emerald-500">✅ APPROVED</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">POLICY:</span> <span className="text-zinc-200">{currentCycle.policy}</span></div>
                    <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">TARGET:</span> <span className="text-zinc-200">{currentCycle.target}</span></div>
                    <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">IMPACT:</span> <span className="text-emerald-500">{currentCycle.impact} equity</span></div>
                    <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">RISKS:</span> <span className="text-yellow-500">1 MEDIUM</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* COLUMN 3: IMPACT TRACKER */}
        <section className="flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Running Totals <span className="text-emerald-500 ml-1">●</span></h2>
          </div>
          
          <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Top Counters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[28px] font-black tabular-nums">{reviewed}</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Policies Reviewed</p>
              </div>
              <div className="space-y-1">
                <p className="text-[28px] font-black tabular-nums text-emerald-500">{passed}</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Passed Verify</p>
              </div>
              <div className="space-y-1">
                <p className="text-[28px] font-black tabular-nums text-rose-600">{risks}</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Risks Flagged</p>
              </div>
              <div className="space-y-1">
                <p className="text-[28px] font-black tabular-nums text-yellow-500">67/100</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Equity Improv</p>
              </div>
            </div>

            {/* City Score */}
            <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <p className="text-5xl font-black mb-2">67<span className="text-lg text-zinc-600">/100</span></p>
              <p className="text-[10px] font-black text-zinc-400 tracking-[0.3em] uppercase mb-1">City-Wide Equity Score</p>
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">🟡 FAIR</p>
              <p className="text-[10px] text-emerald-500 font-bold">↑ Trending up — +3 pts this week</p>
            </div>

            {/* Needs Attention */}
            <div className="bg-[#111] border-l-4 border-rose-600 p-4 rounded-r-lg space-y-2">
              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Needs Attention</p>
              <h3 className="text-sm font-black uppercase tracking-tight">Boyle Heights</h3>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">1,240 complaints this month</p>
                <p className="text-[10px] text-zinc-500">Fairness score: <span className="text-rose-500 font-bold">42/100 🔴</span></p>
              </div>
              <Link href="/map" className="inline-block mt-2 text-[10px] font-bold text-zinc-400 hover:text-white border-b border-zinc-700">ANALYZE →</Link>
            </div>

            {/* Recent Verdicts */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Recent Verdicts</h3>
              <div className="space-y-3">
                {verdicts.map((v, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] border-b border-zinc-900 pb-2">
                    <span className={`font-bold ${v.status.includes('✅') ? 'text-emerald-500' : v.status.includes('⚠️') ? 'text-yellow-500' : 'text-rose-600'}`}>{v.status} — {v.title}</span>
                    <span className="text-zinc-700">{v.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER TICKER */}
      <footer className="h-10 border-t border-zinc-800 bg-[#0a0a0a] flex items-center overflow-hidden shrink-0">
        <div className="whitespace-nowrap flex animate-ticker">
          {[...RECENT_COMPLAINTS_TICKER, ...RECENT_COMPLAINTS_TICKER].map((item, i) => (
            <span key={i} className="inline-flex items-center mx-8 text-[10px] font-mono text-zinc-600 font-bold">
              <span className="text-emerald-500 mr-2">●</span> {item}
            </span>
          ))}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
        }
      `}</style>
    </div>
  );
}
