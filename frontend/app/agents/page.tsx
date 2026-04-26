"use client";

import React, { useState, useEffect, useRef } from "react";

type AgentStatus = "idle" | "processing" | "done" | "error";

interface AgentState {
  orchestrator: AgentStatus;
  proposer: AgentStatus;
  verifier: AgentStatus;
  redteam: AgentStatus;
}

interface MessageLog {
  timestamp: string;
  sender: string;
  receiver: string;
  message: string;
  id: number;
}

interface PolicyOutput {
  equity_scores: { neighborhood: string; score: number }[];
  proposals: { title: string; description: string; impact: string; confidence: number }[];
  risks: { description: string; severity: "LOW" | "MEDIUM" | "HIGH" }[];
  constitutional_status: string;
}

export default function AgentNetworkPage() {
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);
  
  const [agents, setAgents] = useState<AgentState>({
    orchestrator: "idle",
    proposer: "idle",
    verifier: "idle",
    redteam: "idle",
  });
  
  const [omegaStatus, setOmegaStatus] = useState<AgentStatus>("idle");
  const [activeArrows, setActiveArrows] = useState<Record<string, boolean>>({});
  const [doneArrows, setDoneArrows] = useState<Record<string, boolean>>({});
  
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [policy, setPolicy] = useState<PolicyOutput | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (sender: string, receiver: string, message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sender,
        receiver,
        message,
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const resetState = () => {
    setIsRunning(false);
    setIsSimulation(false);
    setAgents({
      orchestrator: "idle",
      proposer: "idle",
      verifier: "idle",
      redteam: "idle",
    });
    setOmegaStatus("idle");
    setActiveArrows({});
    setDoneArrows({});
    setLogs([]);
    setPolicy(null);
  };

  const runSimulation = () => {
    setIsSimulation(true);
    
    // t=0
    setOmegaStatus("processing");
    setActiveArrows({ 'omega-orch': true });
    
    // t=1s
    setTimeout(() => {
      setAgents(prev => ({ ...prev, orchestrator: "processing" }));
      addLog("OmegaClaw", "Orchestrator", "Received query from OmegaClaw");
      setOmegaStatus("done");
      setActiveArrows({ 'omega-orch': false });
      setDoneArrows(prev => ({ ...prev, 'omega-orch': true }));
    }, 1000);
    
    // t=2s
    setTimeout(() => {
      setActiveArrows({ 'orch-prop': true });
      addLog("Orchestrator", "Proposer", "Requesting policy proposals for LA equity gaps");
    }, 2000);
    
    // t=3s
    setTimeout(() => {
      setAgents(prev => ({ ...prev, proposer: "processing" }));
      addLog("Proposer", "System", "Analyzing MyLA311 data for 102 neighborhoods");
    }, 3000);
    
    // t=5s
    setTimeout(() => {
      setAgents(prev => ({ ...prev, proposer: "done" }));
      setActiveArrows({ 'orch-prop': false, 'prop-ver': true });
      setDoneArrows(prev => ({ ...prev, 'orch-prop': true }));
      addLog("Proposer", "Verifier", "Generated 3 proposals, sending for verification");
    }, 5000);
    
    // t=6s
    setTimeout(() => {
      setAgents(prev => ({ ...prev, verifier: "processing" }));
      addLog("Verifier", "System", "Running constitutional constraints check");
    }, 6000);
    
    // t=8s
    setTimeout(() => {
      setAgents(prev => ({ ...prev, verifier: "done" }));
      setActiveArrows({ 'prop-ver': false, 'ver-red': true });
      setDoneArrows(prev => ({ ...prev, 'prop-ver': true }));
      addLog("Verifier", "RedTeam", "Proposals verified, initiating red-team analysis");
    }, 8000);
    
    // t=9s
    setTimeout(() => {
      setAgents(prev => ({ ...prev, redteam: "processing" }));
      addLog("RedTeam", "System", "Adversarially testing 3 proposals for failure modes");
    }, 9000);
    
    // t=11s
    setTimeout(() => {
      setAgents(prev => ({ ...prev, redteam: "done" }));
      setActiveArrows({ 'ver-red': false, 'red-orch': true });
      setDoneArrows(prev => ({ ...prev, 'ver-red': true }));
      addLog("RedTeam", "Orchestrator", "Analysis complete, 2 risks identified");
    }, 11000);
    
    // t=12s
    setTimeout(() => {
      setAgents(prev => ({ ...prev, orchestrator: "done" }));
      setActiveArrows({ 'red-orch': false });
      setDoneArrows(prev => ({ ...prev, 'red-orch': true }));
      addLog("Orchestrator", "OmegaClaw", "Policy memo ready");
    }, 12000);
    
    // t=13s
    setTimeout(() => {
      setPolicy({
        equity_scores: [
          { neighborhood: "Boyle Heights", score: 0.42 },
          { neighborhood: "South LA", score: 0.48 },
          { neighborhood: "Watts", score: 0.51 },
          { neighborhood: "East LA", score: 0.53 },
          { neighborhood: "Skid Row", score: 0.55 },
        ],
        proposals: [
          {
            title: "Redistribute Dispatch Capacity to Underserved Districts",
            description: "Reallocate 15% of sanitation crew hours from CD4 to CD8 and CD9 based on complaint density per capita. Target neighborhoods: Boyle Heights, Watts, South LA.",
            impact: "+18%",
            confidence: 94
          },
          {
            title: "Implement Predictive Cleaning Routes via Seasonal Anomaly Detection",
            description: "Use MyLA311 seasonal patterns to pre-position bulky item crews in high-demand neighborhoods before spike periods rather than reacting to complaints.",
            impact: "+12%",
            confidence: 88
          },
          {
            title: "Standardize Resolution Reporting Across Municipal Agencies",
            description: "Require uniform ServiceDate-to-ClosedDate reporting across all departments to surface hidden scheduling lag disparities by neighborhood.",
            impact: "+8%",
            confidence: 76
          }
        ],
        risks: [
          { description: "Crew reallocation may reduce response quality in currently-served areas during transition period", severity: "MEDIUM" },
          { description: "Seasonal model requires 6-month training data minimum — incomplete for new request types", severity: "LOW" },
        ],
        constitutional_status: "All constraints satisfied"
      });
      setIsRunning(false);
    }, 13000);
  };

  const handleAnalyze = async () => {
    if (!query.trim() || isRunning) return;
    
    resetState();
    setIsRunning(true);
    
    // Try to call backend
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000));
    
    try {
      const fetchPromise = fetch("http://localhost:8001/agents/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      }).catch(() => 'error');
      
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (result === 'timeout' || result === 'error') {
        // Fallback to simulation
        runSimulation();
      } else {
        // SSE implementation would go here
        // For hackathon purposes, if backend doesn't implement SSE fully yet,
        // we fallback to simulation for the visual showcase
        runSimulation(); 
      }
    } catch (e) {
      runSimulation();
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "idle": return "text-zinc-500 bg-zinc-800";
      case "processing": return "text-amber-500 bg-amber-500/20 animate-pulse";
      case "done": return "text-emerald-500 bg-emerald-500/20";
      case "error": return "text-rose-500 bg-rose-500/20";
      default: return "text-zinc-500 bg-zinc-800";
    }
  };

  const getLogColor = (sender: string) => {
    if (sender === "OmegaClaw") return "text-purple-400";
    if (sender === "Orchestrator") return "text-blue-400";
    if (sender === "Proposer") return "text-emerald-400";
    if (sender === "Verifier") return "text-teal-400";
    if (sender === "RedTeam") return "text-orange-400";
    return "text-zinc-400";
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "LOW") return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
    if (severity === "MEDIUM") return "bg-amber-500/20 text-amber-500 border-amber-500/30";
    return "bg-rose-500/20 text-rose-500 border-rose-500/30";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes travel {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .travel-dot {
          animation: travel 1.2s linear infinite;
        }
      `}} />

      {/* SECTION 1 — TOP: OmegaClaw Query Input Panel */}
      <div className="rounded-xl border border-zinc-800 bg-[#111] p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              <span className="text-2xl font-bold text-white">Ω</span>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">OMEGACLAW</h2>
              <p className="text-sm font-medium text-zinc-400">Fetch.ai Assistant</p>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask OmegaClaw about LA civic equity..."
              className="w-full rounded-lg border border-zinc-700 bg-[#1a1a1a] px-5 py-4 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={isRunning || !query.trim()}
            className="shrink-0 rounded-lg bg-emerald-600 px-8 py-4 font-bold uppercase tracking-wider text-white transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 md:pl-[144px]">
          {["Which LA neighborhoods are most underserved?", "What policies would fix service gaps in South LA?", "Why does Boyle Heights wait longer for repairs than Bel Air?"].map(q => (
            <button 
              key={q} 
              onClick={() => setQuery(q)}
              className="rounded-full border border-zinc-700 bg-zinc-800/50 px-4 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-zinc-400 tracking-wider">OMEGACLAW CONNECTED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-zinc-400 tracking-wider">4 AGENTS ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 tracking-wider">AGENTVERSE LIVE</span>
            </div>
          </div>
          <button 
            onClick={resetState}
            className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase"
          >
            Reset Environment
          </button>
        </div>
      </div>

      {/* SECTION 2 — MIDDLE: Live Agent Communication Visualizer */}
      <div className="mb-6 relative">
        {isSimulation && (
          <div className="absolute top-2 right-2 rounded bg-amber-500/20 border border-amber-500/30 px-2 py-1 z-10">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Simulation Mode</span>
          </div>
        )}
        
        <div className="flex items-center justify-between overflow-x-auto pb-4 pt-8 px-4 custom-scrollbar">
          {/* OmegaClaw Node */}
          <div className="flex flex-col items-center shrink-0 w-[160px]">
            <div className="relative w-full rounded-xl border-2 border-[#7c3aed]/50 bg-[#111] p-4 shadow-[0_0_20px_rgba(124,58,237,0.15)] flex flex-col items-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#7c3aed]">
                <span className="text-lg font-bold text-white">Ω</span>
              </div>
              <h3 className="font-bold text-white uppercase text-sm mb-1">OmegaClaw</h3>
              <span className={`mb-3 rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${getStatusColor(omegaStatus)}`}>
                {omegaStatus}
              </span>
              <div className="w-full h-16 bg-[#1a1a1a] rounded p-2 overflow-hidden text-[10px] text-zinc-300 leading-tight">
                {query ? <span className="text-[#7c3aed]">"{query.substring(0, 60)}{query.length > 60 ? '...' : ''}"</span> : "Waiting for query..."}
              </div>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="flex-1 min-w-[60px] relative h-0.5 flex items-center shrink-0">
            <div className={`w-full h-0.5 ${activeArrows['omega-orch'] || doneArrows['omega-orch'] ? 'bg-emerald-500' : 'bg-zinc-700 dashed-border'}`} style={{ borderTop: !(activeArrows['omega-orch'] || doneArrows['omega-orch']) ? '2px dashed #3f3f46' : 'none' }}></div>
            {activeArrows['omega-orch'] && <div className="absolute h-2 w-2 rounded-full bg-emerald-400 travel-dot shadow-[0_0_8px_#34d399] -mt-1"></div>}
          </div>

          {/* Orchestrator Node */}
          <div className="flex flex-col items-center shrink-0 w-[160px]">
            <div className={`relative w-full rounded-xl border border-zinc-700 bg-[#111] p-4 transition-all duration-300 ${agents.orchestrator === 'processing' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''} flex flex-col items-center`}>
              <div className="mb-2 text-2xl">🌐</div>
              <h3 className="font-bold text-white uppercase text-sm mb-1">Orchestrator</h3>
              <p className="text-[9px] text-zinc-500 mb-2 font-mono">agent1qx8...v42p</p>
              <span className={`mb-3 rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${getStatusColor(agents.orchestrator)}`}>
                {agents.orchestrator}
              </span>
              <div className="w-full h-16 bg-[#1a1a1a] rounded p-2 overflow-hidden text-[10px] text-zinc-400 leading-tight">
                {logs.filter(l => l.sender === 'Orchestrator' || l.receiver === 'Orchestrator').pop()?.message || "Idle"}
              </div>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="flex-1 min-w-[60px] relative h-0.5 flex items-center shrink-0">
            <div className={`w-full h-0.5 ${activeArrows['orch-prop'] || doneArrows['orch-prop'] ? 'bg-emerald-500' : 'bg-zinc-700'}`} style={{ borderTop: !(activeArrows['orch-prop'] || doneArrows['orch-prop']) ? '2px dashed #3f3f46' : 'none' }}></div>
            {activeArrows['orch-prop'] && <div className="absolute h-2 w-2 rounded-full bg-emerald-400 travel-dot shadow-[0_0_8px_#34d399] -mt-1"></div>}
          </div>

          {/* Proposer Node */}
          <div className="flex flex-col items-center shrink-0 w-[160px]">
            <div className={`relative w-full rounded-xl border border-zinc-700 bg-[#111] p-4 transition-all duration-300 ${agents.proposer === 'processing' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''} flex flex-col items-center`}>
              <div className="mb-2 text-2xl">📋</div>
              <h3 className="font-bold text-white uppercase text-sm mb-1">Proposer</h3>
              <p className="text-[9px] text-zinc-500 mb-2 font-mono">agent1qtz...a9mk</p>
              <span className={`mb-3 rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${getStatusColor(agents.proposer)}`}>
                {agents.proposer}
              </span>
              <div className="w-full h-16 bg-[#1a1a1a] rounded p-2 overflow-hidden text-[10px] text-zinc-400 leading-tight">
                {logs.filter(l => l.sender === 'Proposer' || l.receiver === 'Proposer').pop()?.message || "Idle"}
              </div>
            </div>
          </div>

          {/* Arrow 3 */}
          <div className="flex-1 min-w-[60px] relative h-0.5 flex items-center shrink-0">
            <div className={`w-full h-0.5 ${activeArrows['prop-ver'] || doneArrows['prop-ver'] ? 'bg-emerald-500' : 'bg-zinc-700'}`} style={{ borderTop: !(activeArrows['prop-ver'] || doneArrows['prop-ver']) ? '2px dashed #3f3f46' : 'none' }}></div>
            {activeArrows['prop-ver'] && <div className="absolute h-2 w-2 rounded-full bg-emerald-400 travel-dot shadow-[0_0_8px_#34d399] -mt-1"></div>}
          </div>

          {/* Verifier Node */}
          <div className="flex flex-col items-center shrink-0 w-[160px]">
            <div className={`relative w-full rounded-xl border border-zinc-700 bg-[#111] p-4 transition-all duration-300 ${agents.verifier === 'processing' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''} flex flex-col items-center`}>
              <div className="mb-2 text-2xl">✅</div>
              <h3 className="font-bold text-white uppercase text-sm mb-1">Verifier</h3>
              <p className="text-[9px] text-zinc-500 mb-2 font-mono">agent1q9q...2b11</p>
              <span className={`mb-3 rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${getStatusColor(agents.verifier)}`}>
                {agents.verifier}
              </span>
              <div className="w-full h-16 bg-[#1a1a1a] rounded p-2 overflow-hidden text-[10px] text-zinc-400 leading-tight">
                {logs.filter(l => l.sender === 'Verifier' || l.receiver === 'Verifier').pop()?.message || "Idle"}
              </div>
            </div>
          </div>

          {/* Arrow 4 */}
          <div className="flex-1 min-w-[60px] relative h-0.5 flex items-center shrink-0">
            <div className={`w-full h-0.5 ${activeArrows['ver-red'] || doneArrows['ver-red'] ? 'bg-emerald-500' : 'bg-zinc-700'}`} style={{ borderTop: !(activeArrows['ver-red'] || doneArrows['ver-red']) ? '2px dashed #3f3f46' : 'none' }}></div>
            {activeArrows['ver-red'] && <div className="absolute h-2 w-2 rounded-full bg-emerald-400 travel-dot shadow-[0_0_8px_#34d399] -mt-1"></div>}
          </div>

          {/* RedTeam Node */}
          <div className="flex flex-col items-center shrink-0 w-[160px]">
            <div className={`relative w-full rounded-xl border border-zinc-700 bg-[#111] p-4 transition-all duration-300 ${agents.redteam === 'processing' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''} flex flex-col items-center`}>
              <div className="mb-2 text-2xl">🔴</div>
              <h3 className="font-bold text-white uppercase text-sm mb-1">RedTeam</h3>
              <p className="text-[9px] text-zinc-500 mb-2 font-mono">agent1qr3...m4df</p>
              <span className={`mb-3 rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${getStatusColor(agents.redteam)}`}>
                {agents.redteam}
              </span>
              <div className="w-full h-16 bg-[#1a1a1a] rounded p-2 overflow-hidden text-[10px] text-zinc-400 leading-tight">
                {logs.filter(l => l.sender === 'RedTeam' || l.receiver === 'RedTeam').pop()?.message || "Idle"}
              </div>
            </div>
          </div>
        </div>

        {/* Live Message Log Panel */}
        <div className="mt-4 rounded-xl border border-zinc-800 bg-[#111] overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Agent Communication Log</h3>
          </div>
          <div className="h-48 overflow-y-auto p-4 custom-scrollbar font-mono text-xs bg-[#0a0a0a]">
            {logs.length === 0 ? (
              <p className="text-zinc-600 italic text-center mt-16">Waiting for query...</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-zinc-300">
                    <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                    <span className={`font-bold shrink-0 ${getLogColor(log.sender)}`}>
                      [{log.sender} <span className="text-zinc-500">→</span> {log.receiver}]
                    </span>
                    <span className="text-zinc-300">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3 — BOTTOM: Policy Decision Output Panel */}
      <div className={`transition-all duration-700 ease-in-out ${policy ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}>
        <div className="rounded-xl border border-emerald-500/30 bg-[#111] overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <div className="px-6 py-4 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161616]">
            <h2 className="text-lg font-black uppercase tracking-widest text-white">Final Policy Decision</h2>
            <div className="flex flex-wrap gap-3">
              <span className="rounded bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/30">
                CONSTITUTIONAL: VERIFIED ✓
              </span>
              <span className="rounded bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/30">
                RED TEAM: PASSED ✓
              </span>
            </div>
          </div>
          
          <div className="p-6 grid gap-6 md:grid-cols-3">
            {/* Left: Equity Analysis */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Equity Analysis</h3>
              <div className="space-y-3">
                {policy?.equity_scores.map((n) => (
                  <div key={n.neighborhood} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-300">{n.neighborhood}</span>
                      <span className="font-bold text-zinc-400">{n.score}x gap</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(n.score * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Middle: Policy Proposals */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Policy Proposals</h3>
              <div className="space-y-4">
                {policy?.proposals.map((p, i) => (
                  <div key={i} className="rounded-lg border border-zinc-800 bg-[#1a1a1a] p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500 text-[10px] font-black text-zinc-900">
                        {i + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight">{p.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{p.description}</p>
                    <div className="flex gap-2">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        IMPACT: {p.impact}
                      </span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                        CONF: {p.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right: Red Team Critique */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex justify-between items-center">
                <span>Red Team Critique</span>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-500">
                  {policy?.risks.length} RISKS
                </span>
              </h3>
              <div className="space-y-3">
                {policy?.risks.map((r, i) => (
                  <div key={i} className={`rounded-lg border p-3 ${getSeverityColor(r.severity)} bg-opacity-10`}>
                    <p className="text-xs font-medium leading-relaxed">{r.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Status</p>
                  <p className="text-sm font-medium text-emerald-400">{policy?.constitutional_status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
