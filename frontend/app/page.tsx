"use client";

import React, { useState, useEffect, useRef } from "react";

type AgentType = "ORCHESTRATOR" | "PROPOSER" | "VERIFIER" | "REDTEAM";

interface AgentConfig {
  name: string;
  role: string;
  icon: string;
  color: string;
}

const AGENTS: Record<AgentType, AgentConfig> = {
  ORCHESTRATOR: {
    name: "Orchestrator",
    role: "Pipeline Lead",
    icon: "🌐",
    color: "#0066cc",
  },
  PROPOSER: {
    name: "Proposer",
    role: "Policy Generator",
    icon: "📋",
    color: "#10b981",
  },
  VERIFIER: {
    name: "Verifier",
    role: "Constitutional AI",
    icon: "✅",
    color: "#0891b2",
  },
  REDTEAM: {
    name: "Red Team",
    role: "Adversarial Analyst",
    icon: "🔴",
    color: "#dc2626",
  },
};

interface Message {
  agent: AgentType;
  text: string;
  timestamp: string;
  isFinal?: boolean;
}

const COMPLAINTS = [
  "11:57 Bulky Items — Boyle Heights",
  "11:56 Graffiti — Watts",
  "11:54 Illegal Dumping — South LA",
  "11:53 Pothole — East LA",
  "11:51 Street Light — Bel Air",
  "11:50 Abandoned Vehicle — Pacoima",
  "11:48 Tree Emergency — Hollywood",
  "11:45 Water Waste — Silver Lake",
  "11:42 Homeless Encampment — Venice",
  "11:40 Pothole — Downtown",
  "11:38 Illegal Dumping — Sun Valley",
  "11:35 Bulky Items — Mar Vista",
  "11:32 Graffiti — Echo Park",
  "11:30 Dead Animal — Northridge",
  "11:28 Sidewalk Repair — Crenshaw",
  "11:25 Metal/Household Appliances — Van Nuys",
  "11:22 Homeless Encampment — Skid Row",
  "11:20 Pothole — West Adams",
  "11:18 Street Sweeping — Koreatown",
  "11:15 Illegal Dumping — Sylmar",
];

export default function CouncilChamber() {
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingAgent, setTypingAgent] = useState<AgentType | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const debateEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    debateEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingAgent]);

  const conveneCouncil = () => {
    if (!query.trim()) return;
    setIsRunning(true);
    setMessages([]);
    setShowResults(false);

    // Sequence timing
    const sequence = [
      { t: 0, type: "typing", agent: "ORCHESTRATOR" },
      { t: 1500, type: "message", agent: "ORCHESTRATOR", text: `Council convened. Analyzing: ${query}\nI am routing this to our specialist agents. \nProposer — please generate policy proposals based on current MyLA311 equity data.` },
      
      { t: 3000, type: "typing", agent: "PROPOSER" },
      { t: 4500, type: "message", agent: "PROPOSER", text: `📋 Policy Analysis Complete\n\nBased on MyLA311 data, I have generated 3 proposals:\n\n1. PRIORITY REALLOCATION\nRedirect 15% of sanitation crew hours from CD4 to CD8/CD14.\nTarget: Boyle Heights, Watts, South LA.\nEst. Impact: +18% equity improvement | Confidence: 94%\n\n2. PREDICTIVE DEPLOYMENT  \nPre-position crews using seasonal anomaly patterns.\nEst. Impact: +12% response time | Confidence: 88%\n\n3. REPORTING STANDARDIZATION\nUniform ServiceDate-to-ClosedDate tracking citywide.\nEst. Impact: +8% transparency | Confidence: 76%\n\nForwarding to Verifier for constitutional review.` },
      
      { t: 6500, type: "typing", agent: "VERIFIER" },
      { t: 8000, type: "message", agent: "VERIFIER", text: `✅ Constitutional Review — 7 Constraints Checked\n\n✅ Disparate Impact Test — PASS\n✅ Resource Equity Requirement — PASS  \n✅ Legal Compliance (City Charter) — PASS\n✅ Min Worst-K Improvement (18% > 15% threshold) — PASS\n✅ Max Neighborhood Harm (0.03 < 0.05 limit) — PASS\n✅ Backlog Growth Constraint — PASS\n⚠️ Citywide P90 Protection — CONDITIONAL PASS\n   P90 response time increases by 2.1% during transition.\n   Acceptable if phased over 60 days.\n\nVERDICT: PASSED 7/7 ✅\nForwarding to Red Team for stress testing.` },
      
      { t: 10500, type: "typing", agent: "REDTEAM" },
      { t: 12000, type: "message", agent: "REDTEAM", text: `🔴 Adversarial Analysis — 2 Risks Identified\n\n🟡 MEDIUM: Transition Coverage Gap\nDuring crew reallocation, CD4 residents may experience\n8-12% service degradation over 30 days.\nMitigation: Phase reallocation over 60-day window.\n\n🟢 LOW: Seasonal Model Training Gap  \nPredictive model needs 6-month minimum training data\nfor new request types added post-2020.\nMitigation: Flag new categories for manual review.\n\nNo HIGH risks detected. No gaming vectors found.\nVERDICT: APPROVE WITH CONDITIONS ✅\nReturning to Orchestrator.` },
      
      { t: 14500, type: "typing", agent: "ORCHESTRATOR" },
      { t: 16000, type: "message", agent: "ORCHESTRATOR", isFinal: true, text: `🏛️ FINAL COUNCIL VERDICT\n\nPolicy: ${query}\nConstitutional Status: ✅ VERIFIED (7/7 constraints)\nRed Team Status: ✅ APPROVED WITH CONDITIONS\n\nRECOMMENDED ACTION:\nImplement Priority Reallocation policy with 60-day phase-in.\nExpected equity improvement: +18% for underserved districts.\n\nIMPLEMENTATION TIMELINE:\nPhase 1 (Days 1-30): Planning and crew briefing\nPhase 2 (Days 31-60): Gradual reallocation with monitoring\nPhase 3 (Day 61+): Full deployment with quarterly review\n\nThis policy has passed AgentCivic constitutional AI review and is ready for city council consideration.\n\nPowered by 4 agents on Fetch.ai Agentverse + ASI:One` },
      
      { t: 17000, type: "complete" }
    ];

    sequence.forEach(step => {
      setTimeout(() => {
        if (step.type === "typing") {
          setTypingAgent(step.agent as AgentType);
        } else if (step.type === "message") {
          setTypingAgent(null);
          setMessages(prev => [...prev, {
            agent: step.agent as AgentType,
            text: step.text!,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            isFinal: step.isFinal
          }]);
        } else if (step.type === "complete") {
          setTypingAgent(null);
          setShowResults(true);
        }
      }, step.t);
    });
  };

  const copyMemo = () => {
    const memo = messages.map(m => `${AGENTS[m.agent].name} (${AGENTS[m.agent].role}):\n${m.text}\n`).join("\n---\n\n");
    navigator.clipboard.writeText(memo);
    alert("Policy Memo copied to clipboard.");
  };

  const resetSession = () => {
    setQuery("");
    setIsRunning(false);
    setMessages([]);
    setTypingAgent(null);
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      
      {/* TOP BAR */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none">AGENTCIVIC</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">City Council Chamber</p>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-[8px] font-black text-zinc-400 text-center leading-tight mb-1">
            LOS<br/>ANGELES
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Agents Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Agentverse Live</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 flex flex-col items-center overflow-hidden">
        
        {/* INPUT SECTION */}
        <section className={`w-full max-w-4xl px-6 transition-all duration-700 ease-in-out ${isRunning ? 'py-4 opacity-100' : 'py-20'}`}>
          <div className={`bg-[#111] rounded-2xl border border-zinc-800 p-6 shadow-2xl transition-all duration-500 ${isRunning ? 'scale-95 opacity-80' : 'scale-100'}`}>
            <div className="flex gap-4 mb-4">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && conveneCouncil()}
                placeholder="Describe a civic issue or policy question for LA..."
                className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all text-lg placeholder:text-zinc-600"
                disabled={isRunning}
              />
              {!isRunning && (
                <button 
                  onClick={conveneCouncil}
                  className="bg-[#10b981] hover:bg-[#059669] text-black font-black uppercase tracking-widest px-8 rounded-xl transition-all transform active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Convene Council
                </button>
              )}
            </div>
            
            {!isRunning && (
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: "🗑️", text: "Illegal dumping in Boyle Heights" },
                  { icon: "🚧", text: "Pothole repair equity in South LA" },
                  { icon: "🏠", text: "Homeless encampment response gaps" }
                ].map((chip) => (
                  <button 
                    key={chip.text}
                    onClick={() => setQuery(chip.text)}
                    className="bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-full px-4 py-1.5 text-xs text-zinc-300 transition-all flex items-center gap-2"
                  >
                    <span>{chip.icon}</span>
                    {chip.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* DEBATE SECTION */}
        {isRunning && (
          <section className="flex-1 w-full max-w-4xl px-6 pb-20 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-12">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 p-5 rounded-2xl bg-[#111] border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.isFinal ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : ''}`}
                     style={{ borderLeft: `4px solid ${AGENTS[msg.agent].color}` }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0" 
                       style={{ backgroundColor: `${AGENTS[msg.agent].color}20` }}>
                    {AGENTS[msg.agent].icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-black text-xs uppercase tracking-widest mr-2" style={{ color: AGENTS[msg.agent].color }}>
                          {AGENTS[msg.agent].name}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                          {AGENTS[msg.agent].role}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-700 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className={`whitespace-pre-wrap leading-relaxed text-zinc-200 ${msg.isFinal ? 'text-lg font-medium' : 'text-sm'}`}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}

              {typingAgent && (
                <div className="flex gap-4 p-5 rounded-2xl bg-[#111] border border-zinc-800 animate-pulse"
                     style={{ borderLeft: `4px solid ${AGENTS[typingAgent].color}` }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0" 
                       style={{ backgroundColor: `${AGENTS[typingAgent].color}20` }}>
                    {AGENTS[typingAgent].icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-black text-xs uppercase tracking-widest mr-2" style={{ color: AGENTS[typingAgent].color }}>
                        {AGENTS[typingAgent].name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase italic">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              {showResults && (
                <div className="flex justify-center gap-4 py-8 animate-in fade-in zoom-in duration-1000">
                  <button 
                    onClick={resetSession}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-black uppercase tracking-widest transition-all"
                  >
                    <span>🔄</span> New Session
                  </button>
                  <button 
                    onClick={copyMemo}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black uppercase tracking-widest transition-all"
                  >
                    <span>📄</span> Copy Policy Memo
                  </button>
                </div>
              )}
              
              <div ref={debateEndRef} />
            </div>
          </section>
        )}
      </main>

      {/* TICKER FOOTER */}
      <footer className="relative z-10 w-full h-10 border-t border-zinc-800 bg-[#0a0a0a] flex items-center overflow-hidden">
        <div className="whitespace-nowrap flex animate-ticker">
          {[...COMPLAINTS, ...COMPLAINTS].map((item, i) => (
            <span key={i} className="inline-flex items-center mx-8 text-[10px] font-mono text-zinc-500">
              <span className="text-emerald-500 mr-2">●</span> {item}
            </span>
          ))}
        </div>
      </footer>

      {/* CUSTOM CSS FOR ANIMATIONS */}
      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
