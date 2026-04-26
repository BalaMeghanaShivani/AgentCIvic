"use client";

import { useEffect, useMemo, useState } from "react";
import { zone2 } from "@/lib/store/zone2";
import { SummaryCards } from "@/components/SummaryCards";
import { LiveFeed } from "@/components/LiveFeed";
import { TopAreas } from "@/components/TopAreas";
import { Recommendations } from "@/components/Recommendations";
import { ServiceSelect } from "@/components/ServiceSelect";

type Incident = {
  incident_id: string;
  service_type: string;
  neighborhood: string;
  opened_at: string;
  status: string;
  severity?: "low" | "medium" | "high";
};

type FairnessRow = {
  neighborhood: string;
  service_type: string;
  p90_hr: number;
  ratio_p90: number;
  worst_k_flag: boolean;
};

export default function CommandHub() {
  const [services, setServices] = useState<string[]>([]);
  const [service, setService] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [fairnessRows, setFairnessRows] = useState<FairnessRow[]>([]);
  const [simResult, setSimResult] = useState<any>(null);
  const [verdict, setVerdict] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    zone2.fairnessMetrics().then((data) => {
      const list = Array.from(new Set((data.metrics || []).map((row: any) => row.service_type))).filter(Boolean) as string[];
      setServices(list);
      if (list.length > 0) setService(list[0]);
      setFairnessRows(data.metrics || []);
    });
  }, []);

  // Poll Live Data
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const r = await fetch("/api/zone1/live?limit=20&minutes_back=60", { cache: "no-store" });
        const data = await r.json();
        setIncidents(data.data || []);
      } catch (e) { console.error(e); }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredFairness = useMemo(() =>
    service ? fairnessRows.filter(r => r.service_type === service) : fairnessRows
    , [fairnessRows, service]);

  const stats = useMemo(() => {
    if (filteredFairness.length === 0) return { fairnessScore: "0%", avgResponse: "0h", totalRequests: 0, underservedPct: "0%" };

    const avgRatio = filteredFairness.reduce((acc, r) => acc + r.ratio_p90, 0) / filteredFairness.length;
    const fairnessScore = Math.max(0, Math.min(100, Math.round((2 - avgRatio) * 100)));
    const avgP90 = filteredFairness.reduce((acc, r) => acc + (r.p90_hr || 0), 0) / filteredFairness.length;
    const underserved = filteredFairness.filter(r => r.worst_k_flag).length;
    const underservedPct = Math.round((underserved / filteredFairness.length) * 100);

    return {
      fairnessScore: `${fairnessScore}%`,
      avgResponse: `${avgP90.toFixed(1)}h`,
      totalRequests: incidents.filter(i => i.service_type === service).length || incidents.length,
      underservedPct: `${underservedPct}%`
    };
  }, [filteredFairness, incidents, service]);

  const alerts = useMemo(() =>
    incidents.map(i => ({
      id: i.incident_id,
      neighborhood: i.neighborhood || "Unknown",
      type: i.service_type,
      timestamp: i.opened_at,
      severity: (i.status === "open" ? "high" : "low") as "high" | "low"
    }))
    , [incidents]);

  const cityAvg = useMemo(() =>
    filteredFairness.length > 0 ? filteredFairness[0].p90_hr / filteredFairness[0].ratio_p90 : 0
    , [filteredFairness]);

  const mockRecommendations = [
    { id: "1", text: `Redistribute dispatch capacity to ${filteredFairness.find(f => f.worst_k_flag)?.neighborhood || "underserved"} districts.`, confidence: 94, impact: "+12%", category: "resource" as const },
    { id: "2", text: "Implement predictive cleaning routes based on seasonal anomaly detection.", confidence: 88, impact: "+8%", category: "efficiency" as const },
    { id: "3", text: "Standardize resolution reporting across municipal agencies.", confidence: 76, category: "policy" as const },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">City Operations Command</h1>
          <p className="text-sm font-medium text-zinc-500">Real-time equity monitoring and policy orchestration</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-3 border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Focus Area</span>
            <ServiceSelect services={services} value={service} onChange={setService} />
          </div>
        </div>
      </header>

      {/* Hero: Summary Cards */}
      <SummaryCards data={stats} />

      {/* Main Grid: Signals, Priority, Recommendations */}
      <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
        <LiveFeed alerts={alerts} />
        <TopAreas areas={filteredFairness} />
        <Recommendations items={mockRecommendations} />
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <div className="flex gap-6 items-center">
          <span className="text-emerald-800 dark:text-emerald-500 text-base font-black tracking-widest">LA OPEN DATA</span>
          <span>System Latency: 42ms</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-800 dark:bg-emerald-500" />
          <span className="text-emerald-800 dark:text-zinc-400">Operational</span>
        </div>
      </footer>
    </div>
  );
}
