"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ComplaintBreakdown {
  type: string;
  pct: number;
  avgDays: number;
}

interface NeighborhoodReport {
  name: string;
  cd: string;
  score: number;
  grade: string;
  complaints: number;
  responseTime: number;
  anonRate: number;
  gapVsTop: number;
  verdict: string;
  topComplaints: ComplaintBreakdown[];
  proposerRec: string;
  proposerImpact: string;
  verifierStatus: string;
  redteamRisk: string;
}

const REPORTS: NeighborhoodReport[] = [
  {
    name: "Boyle Heights", cd: "CD 14", score: 42, 
    grade: "F", complaints: 1240, responseTime: 4.2,
    anonRate: 34, gapVsTop: 2.0,
    verdict: "Severely underserved — immediate intervention required",
    topComplaints: [
      {type: "Bulky Items", pct: 34, avgDays: 3.8},
      {type: "Illegal Dumping", pct: 28, avgDays: 4.1},
      {type: "Graffiti", pct: 18, avgDays: 2.9}
    ],
    proposerRec: "Redistribute 15% crew capacity from CD4 to CD14",
    proposerImpact: "+18%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "2 risks — transition coverage gap (MEDIUM)"
  },
  {
    name: "Watts", cd: "CD 15", score: 48, grade: "F",
    complaints: 980, responseTime: 3.8, anonRate: 31,
    gapVsTop: 1.8,
    verdict: "Severely underserved — immediate intervention required",
    topComplaints: [
      {type: "Illegal Dumping", pct: 38, avgDays: 4.3},
      {type: "Bulky Items", pct: 29, avgDays: 3.6},
      {type: "Homeless Encampment", pct: 21, avgDays: 5.1}
    ],
    proposerRec: "Priority deployment of dedicated Watts sanitation unit",
    proposerImpact: "+15%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "1 risk — political opposition from adjacent districts (LOW)"
  },
  {
    name: "South LA", cd: "CD 8", score: 51, grade: "D",
    complaints: 1100, responseTime: 3.5, anonRate: 28,
    gapVsTop: 1.6,
    verdict: "Significantly below city standard",
    topComplaints: [
      {type: "Bulky Items", pct: 32, avgDays: 3.5},
      {type: "Graffiti Removal", pct: 26, avgDays: 3.1},
      {type: "Pothole Repair", pct: 22, avgDays: 4.8}
    ],
    proposerRec: "Increase CD8/CD9 crew allocation by 20% with seasonal adjustment",
    proposerImpact: "+14%",
    verifierStatus: "PASSED 6/7 — P90 concern",
    redteamRisk: "2 risks — data quality and transition lag (MEDIUM)"
  },
  {
    name: "East LA", cd: "CD 14", score: 53, grade: "D",
    complaints: 890, responseTime: 3.3, anonRate: 26,
    gapVsTop: 1.5,
    verdict: "Significantly below city standard",
    topComplaints: [
      {type: "Graffiti Removal", pct: 35, avgDays: 2.8},
      {type: "Bulky Items", pct: 28, avgDays: 3.4},
      {type: "Street Light", pct: 19, avgDays: 4.2}
    ],
    proposerRec: "Graffiti rapid response team dedicated to CD14 corridor",
    proposerImpact: "+12%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "1 risk — crew fatigue during high-volume periods (LOW)"
  },
  {
    name: "Skid Row", cd: "CD 14", score: 55, grade: "D",
    complaints: 760, responseTime: 3.1, anonRate: 22,
    gapVsTop: 1.4,
    verdict: "Below average — improvement needed",
    topComplaints: [
      {type: "Homeless Encampment", pct: 45, avgDays: 5.8},
      {type: "Illegal Dumping", pct: 31, avgDays: 3.9},
      {type: "Bulky Items", pct: 14, avgDays: 3.2}
    ],
    proposerRec: "Specialized homeless services coordination with LAHSA",
    proposerImpact: "+10%",
    verifierStatus: "PASSED 5/7 — legal and backlog concerns",
    redteamRisk: "3 risks — high complexity deployment (MEDIUM/HIGH)"
  },
  {
    name: "Van Nuys", cd: "CD 6", score: 62, grade: "C",
    complaints: 540, responseTime: 2.7, anonRate: 16,
    gapVsTop: 1.2,
    verdict: "Below average — improvement needed",
    topComplaints: [
      {type: "Pothole Repair", pct: 31, avgDays: 4.5},
      {type: "Bulky Items", pct: 27, avgDays: 3.1},
      {type: "Graffiti Removal", pct: 22, avgDays: 2.7}
    ],
    proposerRec: "Infrastructure repair prioritization for Valley corridor",
    proposerImpact: "+9%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "1 risk — budget reallocation timing (LOW)"
  },
  {
    name: "North Hollywood", cd: "CD 2", score: 65, grade: "C",
    complaints: 480, responseTime: 2.5, anonRate: 14,
    gapVsTop: 1.1,
    verdict: "Below average — improvement needed",
    topComplaints: [
      {type: "Bulky Items", pct: 33, avgDays: 2.9},
      {type: "Street Light", pct: 24, avgDays: 3.8},
      {type: "Graffiti Removal", pct: 20, avgDays: 2.5}
    ],
    proposerRec: "Street lighting upgrade program for NoHo Arts District",
    proposerImpact: "+8%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "0 risks — low complexity policy"
  },
  {
    name: "Koreatown", cd: "CD 10", score: 67, grade: "C",
    complaints: 420, responseTime: 2.4, anonRate: 13,
    gapVsTop: 1.1,
    verdict: "Below average — improvement needed",
    topComplaints: [
      {type: "Graffiti Removal", pct: 36, avgDays: 2.6},
      {type: "Illegal Dumping", pct: 28, avgDays: 3.3},
      {type: "Bulky Items", pct: 21, avgDays: 2.8}
    ],
    proposerRec: "Multilingual reporting enhancement for Korean-speaking residents",
    proposerImpact: "+7%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "1 risk — language barrier data gap (LOW)"
  },
  {
    name: "Silver Lake", cd: "CD 13", score: 71, grade: "B",
    complaints: 380, responseTime: 2.2, anonRate: 11,
    gapVsTop: 1.0,
    verdict: "Above average — minor gaps remain",
    topComplaints: [
      {type: "Graffiti Removal", pct: 38, avgDays: 2.3},
      {type: "Bulky Items", pct: 29, avgDays: 2.6},
      {type: "Pothole Repair", pct: 18, avgDays: 3.9}
    ],
    proposerRec: "Maintain current service levels with graffiti prevention focus",
    proposerImpact: "+4%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "0 risks"
  },
  {
    name: "Los Feliz", cd: "CD 4", score: 74, grade: "B",
    complaints: 310, responseTime: 2.0, anonRate: 9,
    gapVsTop: 0.9,
    verdict: "Above average — minor gaps remain",
    topComplaints: [
      {type: "Tree Trimming", pct: 34, avgDays: 3.1},
      {type: "Graffiti Removal", pct: 26, avgDays: 2.1},
      {type: "Bulky Items", pct: 22, avgDays: 2.4}
    ],
    proposerRec: "Tree maintenance scheduling optimization for hillside areas",
    proposerImpact: "+3%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "0 risks"
  },
  {
    name: "West Hollywood", cd: "CD 4", score: 77, grade: "B",
    complaints: 260, responseTime: 1.9, anonRate: 8,
    gapVsTop: 0.8,
    verdict: "Above average — minor gaps remain",
    topComplaints: [
      {type: "Graffiti Removal", pct: 41, avgDays: 1.9},
      {type: "Bulky Items", pct: 31, avgDays: 2.1},
      {type: "Street Light", pct: 16, avgDays: 2.8}
    ],
    proposerRec: "Preventive graffiti coating program for high-traffic corridors",
    proposerImpact: "+3%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "0 risks"
  },
  {
    name: "Santa Monica Adj", cd: "CD 11", score: 81, grade: "A",
    complaints: 210, responseTime: 1.7, anonRate: 6,
    gapVsTop: 0.7,
    verdict: "Well served — model for other districts",
    topComplaints: [
      {type: "Bulky Items", pct: 35, avgDays: 1.8},
      {type: "Tree Trimming", pct: 28, avgDays: 2.9},
      {type: "Graffiti Removal", pct: 19, avgDays: 1.7}
    ],
    proposerRec: "Export service delivery model to underserved districts",
    proposerImpact: "+2%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "0 risks"
  },
  {
    name: "Hollywood Hills", cd: "CD 4", score: 85, grade: "A",
    complaints: 180, responseTime: 1.6, anonRate: 5,
    gapVsTop: 0.6,
    verdict: "Well served — model for other districts",
    topComplaints: [
      {type: "Tree Trimming", pct: 42, avgDays: 2.7},
      {type: "Bulky Items", pct: 28, avgDays: 1.7},
      {type: "Pothole Repair", pct: 16, avgDays: 3.2}
    ],
    proposerRec: "Seasonal wildfire prevention coordination with LAFD",
    proposerImpact: "+2%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "0 risks"
  },
  {
    name: "Bel Air", cd: "CD 5", score: 91, grade: "A",
    complaints: 120, responseTime: 2.1, anonRate: 4,
    gapVsTop: 0.5,
    verdict: "Well served — model for other districts",
    topComplaints: [
      {type: "Tree Trimming", pct: 48, avgDays: 2.6},
      {type: "Street Light", pct: 27, avgDays: 2.2},
      {type: "Bulky Items", pct: 15, avgDays: 1.9}
    ],
    proposerRec: "Maintain excellence — share model with CD8/CD9/CD14",
    proposerImpact: "+1%",
    verifierStatus: "PASSED 7/7",
    redteamRisk: "0 risks"
  }
];

export default function ReportPage() {
  const [index, setIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const current = REPORTS[index];

  const changeIndex = (newIndex: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setIndex(newIndex);
      setTransitioning(false);
    }, 300);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "#10b981"; // green
      case "B": return "#84cc16"; // lime
      case "C": return "#f59e0b"; // yellow
      case "D": return "#f97316"; // orange
      case "F": return "#dc2626"; // red
      default: return "#ffffff";
    }
  };

  const cityAvg = {
    complaints: 650,
    responseTime: 2.8,
    anonRate: 18
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-6 font-sans">
      <style jsx global>{`
        .circular-progress {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .circular-progress::before {
          content: "";
          position: absolute;
          width: 84px;
          height: 84px;
          background: #111;
          border-radius: 50%;
        }
      `}</style>

      {/* SEARCH BAR */}
      <div className="w-full max-w-4xl mb-12">
        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Search any LA neighborhood..."
            className="w-full bg-[#111] border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all text-lg shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {["Boyle Heights", "South LA", "Watts", "Bel Air", "Hollywood Hills"].map(name => (
            <button 
              key={name}
              onClick={() => changeIndex(REPORTS.findIndex(r => r.name === name))}
              className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${current.name === name ? 'bg-[#10b981] text-black border-[#10b981]' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN REPORT CONTENT */}
      <div className={`w-full max-w-4xl space-y-12 transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        
        {/* SECTION 1: GRADE CARD */}
        <section className="relative flex justify-center">
          <div className="w-full rounded-[40px] p-[2px]" style={{ background: `linear-gradient(135deg, ${getGradeColor(current.grade)}, transparent)` }}>
            <div className="w-full bg-[#111] rounded-[38px] p-12 text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32" />
              <h2 className="text-5xl font-black tracking-tighter mb-2">{current.name}</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-sm mb-10">{current.cd} • LA NEIGHBORHOOD COUNCIL</p>
              
              <div className="flex flex-col items-center mb-8">
                <span className="text-[120px] font-black leading-none drop-shadow-2xl" style={{ color: getGradeColor(current.grade) }}>
                  {current.grade}
                </span>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 mt-2">Equity Grade</span>
              </div>
              
              <p className="text-xl font-medium text-zinc-300 max-w-md mx-auto leading-relaxed">
                {current.verdict}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: STATS CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: current.complaints, label: "Total Complaints Filed", avg: cityAvg.complaints, unit: "" },
            { value: current.responseTime, label: "Avg Response Time (Days)", avg: cityAvg.responseTime, unit: "d" },
            { value: current.anonRate, label: "Anonymous Filing Rate", avg: cityAvg.anonRate, unit: "%" }
          ].map((stat, i) => (
            <div key={i} className="bg-[#111] border border-zinc-800 rounded-3xl p-8 text-center">
              <p className="text-4xl font-black mb-2">{stat.value}{stat.unit}</p>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 leading-tight">{stat.label}</p>
              <p className="text-[10px] text-zinc-600 font-mono">
                vs city avg: {stat.avg}{stat.unit}
              </p>
            </div>
          ))}
        </section>

        {/* SECTION 3: THE GAP / LEADER */}
        {(current.grade === "F" || current.grade === "D") ? (
          <section className="bg-[#111] border-l-[8px] border-rose-600 rounded-3xl p-8 overflow-hidden">
            <h3 className="text-rose-600 font-black uppercase tracking-widest text-sm mb-8">The Equity Gap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex justify-between border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500 font-bold uppercase text-xs">{current.name}</span>
                  <span className="text-zinc-500 font-bold uppercase text-xs">Bel Air</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-zinc-600 uppercase mb-1">Response</p>
                    <p className="text-2xl font-bold">{current.responseTime} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-600 uppercase mb-1">Response</p>
                    <p className="text-2xl font-bold text-emerald-500">2.1 days</p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-zinc-600 uppercase mb-1">Volume</p>
                    <p className="text-2xl font-bold">{current.complaints} requests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-600 uppercase mb-1">Volume</p>
                    <p className="text-2xl font-bold text-zinc-400">120 requests</p>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-left border-t md:border-t-0 md:border-l border-zinc-800 pt-8 md:pt-0 md:pl-12">
                <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">Wait Gap</p>
                <p className="text-6xl font-black text-rose-600 leading-none mb-2">{current.gapVsTop}x</p>
                <p className="text-xl font-bold text-rose-600 uppercase">Longer</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-[#111] border-l-[8px] border-[#10b981] rounded-3xl p-8 overflow-hidden">
            <h3 className="text-[#10b981] font-black uppercase tracking-widest text-sm mb-6">Equity Leader</h3>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <p className="text-2xl font-bold mb-2">Among the top <span className="text-[#10b981]">{Math.round((index / REPORTS.length) * 100)}%</span> of served neighborhoods in LA</p>
                <p className="text-zinc-400">This neighborhood council consistently outperforms city-wide benchmarks for response stability and public trust engagement.</p>
              </div>
              <div className="shrink-0 text-center bg-[#10b981]/10 border border-[#10b981]/20 rounded-2xl p-6">
                <p className="text-4xl font-black text-[#10b981]">{Math.abs(Math.round(current.responseTime - cityAvg.responseTime * 10) / 10)}d</p>
                <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mt-1">Faster than city avg</p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: COMPLAINT BREAKDOWN */}
        <section className="space-y-8">
          <h3 className="text-center text-xs font-black uppercase tracking-[0.3em] text-zinc-600">What residents need most</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {current.topComplaints.map((c, i) => (
              <div key={i} className="bg-[#111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div 
                  className="circular-progress mb-6"
                  style={{ background: `conic-gradient(${getGradeColor(current.grade)} ${c.pct * 3.6}deg, #1f1f1f 0deg)` }}
                >
                  <span className="relative z-10 text-xl font-black">{c.pct}%</span>
                </div>
                <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tight">{c.type}</h4>
                <div className="h-px w-8 bg-zinc-800 mb-2" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avg {c.avgDays} days to resolve</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: AGENT RECOMMENDATIONS */}
        <section className="bg-[#111] border border-zinc-800 rounded-[40px] p-8 space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">What Agents Recommend</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Automated Civic Equity Audit</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500" /> Proposer Says
              </p>
              <p className="text-xs font-bold text-white leading-relaxed">{current.proposerRec}</p>
              <p className="text-xs font-black text-emerald-500">{current.proposerImpact} equity improvement</p>
            </div>
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0891b2] flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#0891b2]" /> Verifier Says
              </p>
              <p className="text-xs font-bold text-white leading-relaxed">Constitutional: {current.verifierStatus}</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Verified against 7 city charter rules</p>
            </div>
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-rose-500" /> Red Team Says
              </p>
              <p className="text-xs font-bold text-white leading-relaxed">{current.redteamRisk}</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Adversarial stress-test results</p>
            </div>
          </div>

          <Link 
            href={`/?q=${current.name} equity analysis`}
            className="flex items-center justify-center w-full bg-[#10b981] hover:bg-[#059669] text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl text-xs mt-4"
          >
            Generate Complete Policy Analysis →
          </Link>
        </section>

        {/* NAVIGATION */}
        <div className="flex items-center justify-center gap-12 pb-20">
          <button 
            disabled={index === 0}
            onClick={() => changeIndex(index - 1)}
            className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            ←
          </button>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Neighborhood</p>
            <p className="text-sm font-bold text-white">{index + 1} of {REPORTS.length}</p>
          </div>
          <button 
            disabled={index === REPORTS.length - 1}
            onClick={() => changeIndex(index + 1)}
            className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            →
          </button>
        </div>

      </div>
    </div>
  );
}
