"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Metric {
  label: string;
  value: string;
  color: string;
}

interface ComplaintType {
  label: string;
  percent: number;
}

interface Neighborhood {
  name: string;
  cd: string;
  score: number;
  status: "green" | "yellow" | "red";
  narrative: string;
  metrics: Metric[];
  complaints: ComplaintType[];
  isTopPercent?: number;
  waitMultiplier?: string;
}

const NEIGHBORHOODS: Neighborhood[] = [
  // ROW 1
  {
    name: "Bel Air",
    cd: "CD 5",
    score: 91,
    status: "green",
    narrative: "Bel Air maintains the highest equity score in Los Angeles, characterized by extremely low response times and high institutional trust. Resource allocation per capita exceeds the city average despite lower complaint density.",
    metrics: [
      { label: "Response Time", value: "2.1 days", color: "text-emerald-500" },
      { label: "Complaint Vol", value: "Low", color: "text-zinc-400" },
      { label: "Anon Rate", value: "12%", color: "text-emerald-500" },
      { label: "Gap Ratio", value: "0.9x", color: "text-emerald-500" },
    ],
    complaints: [
      { label: "Bulky Items", percent: 45 },
      { label: "Graffiti", percent: 25 },
      { label: "Tree Trimming", percent: 15 },
    ],
    isTopPercent: 5,
  },
  {
    name: "Hollywood Hills",
    cd: "CD 4",
    score: 85,
    status: "green",
    narrative: "Hollywood Hills benefits from efficient dispatch protocols and high request resolution rates. Public service trust is robust, with most filings originating from verified accounts.",
    metrics: [
      { label: "Response Time", value: "2.4 days", color: "text-emerald-500" },
      { label: "Complaint Vol", value: "Med-Low", color: "text-zinc-400" },
      { label: "Anon Rate", value: "15%", color: "text-emerald-500" },
      { label: "Gap Ratio", value: "1.1x", color: "text-emerald-500" },
    ],
    complaints: [
      { label: "Illegal Dumping", percent: 35 },
      { label: "Potholes", percent: 30 },
      { label: "Street Light", percent: 20 },
    ],
    isTopPercent: 12,
  },
  {
    name: "Los Feliz",
    cd: "CD 4",
    score: 74,
    status: "green",
    narrative: "Los Feliz shows consistent service quality across major categories. While complaint volume is higher than the hills, resolution times remain within the city's green threshold.",
    metrics: [
      { label: "Response Time", value: "2.8 days", color: "text-emerald-500" },
      { label: "Complaint Vol", value: "Medium", color: "text-zinc-400" },
      { label: "Anon Rate", value: "18%", color: "text-emerald-500" },
      { label: "Gap Ratio", value: "1.3x", color: "text-zinc-400" },
    ],
    complaints: [
      { label: "Graffiti", percent: 40 },
      { label: "Bulky Items", percent: 35 },
      { label: "Potholes", percent: 15 },
    ],
    isTopPercent: 22,
  },
  {
    name: "West Hollywood",
    cd: "CD 5",
    score: 77,
    status: "green",
    narrative: "West Hollywood adjacent zones receive rapid municipal attention, particularly for high-visibility infrastructure issues. Public engagement is high with efficient digital tool adoption.",
    metrics: [
      { label: "Response Time", value: "2.7 days", color: "text-emerald-500" },
      { label: "Complaint Vol", value: "Medium", color: "text-zinc-400" },
      { label: "Anon Rate", value: "16%", color: "text-emerald-500" },
      { label: "Gap Ratio", value: "1.2x", color: "text-emerald-500" },
    ],
    complaints: [
      { label: "Sidewalk Repair", percent: 38 },
      { label: "Bulky Items", percent: 32 },
      { label: "Graffiti", percent: 20 },
    ],
    isTopPercent: 18,
  },
  {
    name: "Santa Monica Adj",
    cd: "CD 11",
    score: 81,
    status: "green",
    narrative: "Coastal zones demonstrate superior service stability. Response lag is minimal for sanitation requests, reflecting strong operational coverage in Westside districts.",
    metrics: [
      { label: "Response Time", value: "2.5 days", color: "text-emerald-500" },
      { label: "Complaint Vol", value: "Low-Med", color: "text-zinc-400" },
      { label: "Anon Rate", value: "14%", color: "text-emerald-500" },
      { label: "Gap Ratio", value: "1.0x", color: "text-emerald-500" },
    ],
    complaints: [
      { label: "Bulky Items", percent: 50 },
      { label: "Potholes", percent: 25 },
      { label: "Graffiti", percent: 10 },
    ],
    isTopPercent: 15,
  },
  // ROW 2
  {
    name: "Van Nuys",
    cd: "CD 6",
    score: 62,
    status: "yellow",
    narrative: "Van Nuys presents a moderate equity gap, with response times beginning to lag behind Westside benchmarks. Public trust is neutral but showing signs of digital divide friction.",
    metrics: [
      { label: "Response Time", value: "3.4 days", color: "text-yellow-500" },
      { label: "Complaint Vol", value: "High", color: "text-zinc-400" },
      { label: "Anon Rate", value: "24%", color: "text-yellow-500" },
      { label: "Gap Ratio", value: "1.8x", color: "text-yellow-500" },
    ],
    complaints: [
      { label: "Illegal Dumping", percent: 42 },
      { label: "Abandoned Vehicle", percent: 28 },
      { label: "Graffiti", percent: 18 },
    ],
  },
  {
    name: "North Hollywood",
    cd: "CD 2",
    score: 65,
    status: "yellow",
    narrative: "NoHo serves as a transit hub with high infrastructure wear. Service response is adequate but struggles with bulky item backlogs during peak seasonal shifts.",
    metrics: [
      { label: "Response Time", value: "3.2 days", color: "text-yellow-500" },
      { label: "Complaint Vol", value: "Med-High", color: "text-zinc-400" },
      { label: "Anon Rate", value: "21%", color: "text-yellow-500" },
      { label: "Gap Ratio", value: "1.6x", color: "text-yellow-500" },
    ],
    complaints: [
      { label: "Bulky Items", percent: 48 },
      { label: "Graffiti", percent: 22 },
      { label: "Potholes", percent: 15 },
    ],
  },
  {
    name: "Koreatown",
    cd: "CD 10",
    score: 67,
    status: "yellow",
    narrative: "Koreatown's high density places immense pressure on sanitation services. While volume is extreme, crews maintain a C-grade service level despite the lack of per-capita resource parity.",
    metrics: [
      { label: "Response Time", value: "3.1 days", color: "text-yellow-500" },
      { label: "Complaint Vol", value: "Extreme", color: "text-rose-500" },
      { label: "Anon Rate", value: "19%", color: "text-emerald-500" },
      { label: "Gap Ratio", value: "1.5x", color: "text-yellow-500" },
    ],
    complaints: [
      { label: "Bulky Items", percent: 55 },
      { label: "Illegal Dumping", percent: 30 },
      { label: "Sidewalk Repair", percent: 10 },
    ],
  },
  {
    name: "Silver Lake",
    cd: "CD 13",
    score: 71,
    status: "green",
    narrative: "Silver Lake occupies the lower bound of the green tier. Active community engagement ensures that most 311 tickets are resolved within standard windows, though some backlog is emerging.",
    metrics: [
      { label: "Response Time", value: "2.9 days", color: "text-emerald-500" },
      { label: "Complaint Vol", value: "Medium", color: "text-zinc-400" },
      { label: "Anon Rate", value: "17%", color: "text-emerald-500" },
      { label: "Gap Ratio", value: "1.4x", color: "text-zinc-400" },
    ],
    complaints: [
      { label: "Graffiti", percent: 45 },
      { label: "Bulky Items", percent: 25 },
      { label: "Potholes", percent: 15 },
    ],
    isTopPercent: 28,
  },
  {
    name: "Eagle Rock",
    cd: "CD 14",
    score: 68,
    status: "yellow",
    narrative: "Eagle Rock is a transitional zone where service response varies significantly by request type. Infrastructure repairs are prioritized, while sanitation tasks show longer tail resolutions.",
    metrics: [
      { label: "Response Time", value: "3.0 days", color: "text-yellow-500" },
      { label: "Complaint Vol", value: "Med-Low", color: "text-zinc-400" },
      { label: "Anon Rate", value: "18%", color: "text-emerald-500" },
      { label: "Gap Ratio", value: "1.4x", color: "text-zinc-400" },
    ],
    complaints: [
      { label: "Bulky Items", percent: 40 },
      { label: "Tree Trimming", percent: 25 },
      { label: "Street Light", percent: 20 },
    ],
  },
  // ROW 3
  {
    name: "South LA",
    cd: "CD 8",
    score: 51,
    status: "red",
    narrative: "South LA faces a systemic service deficit. Complaint volume is high, but resolution times lag by nearly two days compared to the city baseline, indicating a severe resource mismatch.",
    metrics: [
      { label: "Response Time", value: "3.9 days", color: "text-rose-500" },
      { label: "Complaint Vol", value: "High", color: "text-rose-500" },
      { label: "Anon Rate", value: "29%", color: "text-rose-500" },
      { label: "Gap Ratio", value: "2.1x", color: "text-rose-500" },
    ],
    complaints: [
      { label: "Illegal Dumping", percent: 52 },
      { label: "Bulky Items", percent: 30 },
      { label: "Potholes", percent: 10 },
    ],
    waitMultiplier: "1.8x",
  },
  {
    name: "Watts",
    cd: "CD 15",
    score: 48,
    status: "red",
    narrative: "Watts exhibits critical equity gaps. High anonymous filing rates (34%) reveal deep institutional distrust, while response times for illegal dumping exceed city standards by over 70%.",
    metrics: [
      { label: "Response Time", value: "4.1 days", color: "text-rose-500" },
      { label: "Complaint Vol", value: "Med-High", color: "text-zinc-400" },
      { label: "Anon Rate", value: "34%", color: "text-rose-500" },
      { label: "Gap Ratio", value: "2.4x", color: "text-rose-500" },
    ],
    complaints: [
      { label: "Illegal Dumping", percent: 58 },
      { label: "Potholes", percent: 15 },
      { label: "Graffiti", percent: 12 },
    ],
    waitMultiplier: "2.0x",
  },
  {
    name: "Boyle Heights",
    cd: "CD 14",
    score: 42,
    status: "red",
    narrative: "Boyle Heights residents file 10x more complaints than Bel Air but receive comparable crew hours. Average response time of 4.2 days is 62% above city standard. Anonymous filing rate of 34% signals deep institutional distrust in city services.",
    metrics: [
      { label: "Response Time", value: "4.2 days", color: "text-rose-500" },
      { label: "Complaint Vol", value: "Extreme", color: "text-rose-500" },
      { label: "Anon Rate", value: "34%", color: "text-rose-500" },
      { label: "Gap Ratio", value: "2.8x", color: "text-rose-500" },
    ],
    complaints: [
      { label: "Illegal Dumping", percent: 65 },
      { label: "Bulky Items", percent: 20 },
      { label: "Graffiti", percent: 10 },
    ],
    waitMultiplier: "2.1x",
  },
  {
    name: "East LA",
    cd: "CD 14",
    score: 53,
    status: "red",
    narrative: "East LA suffers from infrastructure neglect despite high reporting volume. Road-related repairs (potholes/sidewalks) stay open nearly 3x longer than in Westside districts.",
    metrics: [
      { label: "Response Time", value: "3.7 days", color: "text-rose-500" },
      { label: "Complaint Vol", value: "High", color: "text-zinc-400" },
      { label: "Anon Rate", value: "27%", color: "text-rose-500" },
      { label: "Gap Ratio", value: "1.9x", color: "text-rose-500" },
    ],
    complaints: [
      { label: "Potholes", percent: 42 },
      { label: "Illegal Dumping", percent: 35 },
      { label: "Graffiti", percent: 15 },
    ],
    waitMultiplier: "1.7x",
  },
  {
    name: "Skid Row",
    cd: "CD 14",
    score: 55,
    status: "red",
    narrative: "Skid Row represents the intersection of social service gaps and sanitation failure. High volume for illegal dumping and homeless encampments remains unresolved far past the city's target SLA.",
    metrics: [
      { label: "Response Time", value: "3.6 days", color: "text-rose-500" },
      { label: "Complaint Vol", value: "Extreme", color: "text-rose-500" },
      { label: "Anon Rate", value: "31%", color: "text-rose-500" },
      { label: "Gap Ratio", value: "1.8x", color: "text-rose-500" },
    ],
    complaints: [
      { label: "Homeless Encampment", percent: 45 },
      { label: "Illegal Dumping", percent: 40 },
      { label: "Dead Animal", percent: 10 },
    ],
    waitMultiplier: "1.6x",
  },
];

export default function MapPage() {
  const [selected, setSelected] = useState<Neighborhood>(NEIGHBORHOODS.find(n => n.name === "Boyle Heights")!);
  const [filter, setFilter] = useState<"all" | "critical">("all");

  const getGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 55) return "D";
    return "F";
  };

  const getStatusColor = (status: string) => {
    if (status === "green") return "emerald";
    if (status === "yellow") return "yellow";
    return "rose";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col p-6 font-sans">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">LA Equity Map</h1>
          <div className="flex gap-2 mt-3">
            <button 
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-[10px] font-bold rounded border uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
            >
              All Neighborhoods
            </button>
            <button 
              onClick={() => setFilter("critical")}
              className={`px-3 py-1 text-[10px] font-bold rounded border uppercase tracking-wider transition-all ${filter === 'critical' ? 'bg-rose-500/20 border-rose-500/40 text-rose-500' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
            >
              Critical Only
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">847 complaints today</span>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-[1fr_400px] gap-8">
        {/* LEFT COLUMN: Map Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-fr">
          {NEIGHBORHOODS.map((n) => {
            const isDimmed = filter === "critical" && n.status !== "red";
            const color = getStatusColor(n.status);
            const isSelected = selected.name === n.name;
            
            return (
              <button
                key={n.name}
                onClick={() => setSelected(n)}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 group
                  ${isDimmed ? 'opacity-30' : 'opacity-100'}
                  ${isSelected ? `border-emerald-500 bg-[#151515] shadow-[0_0_20px_rgba(16,185,129,0.1)]` : `border-${color}-500/20 bg-[#111] hover:brightness-110`}
                `}
                style={{
                  borderColor: isSelected ? '#10b981' : undefined
                }}
              >
                <div className="flex justify-between w-full items-start mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-500`}>
                    {n.status === 'green' ? '🟢' : n.status === 'yellow' ? '🟡' : '🔴'}
                  </span>
                  <span className={`text-lg font-black text-${color}-500`}>{n.score}</span>
                </div>
                <h3 className="font-bold text-sm text-left leading-tight group-hover:text-white transition-colors">{n.name}</h3>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Detail Panel */}
        <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 h-fit sticky top-6 shadow-2xl animate-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight">{selected.name}</h2>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{selected.cd}</p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 border-${getStatusColor(selected.status)}-500 bg-${getStatusColor(selected.status)}-500/10`}>
              <span className={`text-xl font-black text-${getStatusColor(selected.status)}-500`}>{getGrade(selected.score)}</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-l-4 border-${getStatusColor(selected.status)}-500 bg-[#161616] mb-8`}>
            <p className="text-xs text-zinc-300 leading-relaxed italic">"{selected.narrative}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {selected.metrics.map((m) => (
              <div key={m.label} className="bg-[#1a1a1a] p-3 rounded-lg border border-zinc-800">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter mb-1">{m.label}</p>
                <p className={`text-sm font-black ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Top Complaint Types</h3>
            {selected.complaints.map((c) => (
              <div key={c.label} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-zinc-400">{c.label}</span>
                  <span className="text-zinc-500">{c.percent}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${getStatusColor(selected.status)}-500`} 
                    style={{ width: `${c.percent}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          {selected.status === 'red' && (
            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">Response Lag Gap</p>
                  <p className="text-sm font-medium text-zinc-300">Residents wait <span className="text-yellow-500 font-bold">{selected.waitMultiplier}</span> longer than Bel Air</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-zinc-500 font-bold">BEL AIR</p>
                  <p className="text-xs font-black text-emerald-500">2.1d</p>
                </div>
              </div>
            </div>
          )}

          {selected.status === 'green' && selected.isTopPercent && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-8">
              <p className="text-xs font-medium text-emerald-500">
                ★ Among the top <span className="font-bold">{selected.isTopPercent}%</span> of served neighborhoods in LA
              </p>
            </div>
          )}

          <Link 
            href={`/?q=${selected.name} equity analysis`}
            className="flex items-center justify-center w-full bg-[#10b981] hover:bg-[#059669] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] text-xs"
          >
            Ask Agents About {selected.name} →
          </Link>
        </div>
      </div>

      {/* LEGEND */}
      <div className="fixed bottom-6 left-6 flex gap-4 bg-[#111] border border-zinc-800 px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider z-50">
        <div className="flex items-center gap-1.5"><span className="text-emerald-500">🟢</span> Well Served</div>
        <div className="flex items-center gap-1.5"><span className="text-yellow-500">🟡</span> At Risk</div>
        <div className="flex items-center gap-1.5"><span className="text-rose-500">🔴</span> Critical</div>
      </div>

      <style jsx global>{`
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
      `}</style>
    </div>
  );
}
