"use client";

import { useState } from "react";

export function MapView() {
    const [view, setView] = useState("disparity");

    return (
        <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Geographic Heatmap</h3>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg gap-1 border border-[var(--border)]">
                    {["disparity", "delays", "volume"].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-2 py-1 text-[9px] font-black uppercase rounded transition-all ${view === v ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 relative bg-zinc-50 dark:bg-[#0c0c0e] flex items-center justify-center p-8">
                {/* Simplified SF Map SVG */}
                <svg viewBox="0 0 400 400" className="w-[85%] h-auto drop-shadow-2xl">
                    <path
                        d="M 120,40 L 280,40 L 320,80 L 340,150 L 350,280 L 300,340 L 100,340 L 60,280 L 50,150 L 80,80 Z"
                        fill="currentColor"
                        className="text-zinc-200 dark:text-zinc-800/50"
                    />

                    {/* Heatmap Blobs (Animated) */}
                    <circle cx="150" cy="180" r="40" fill="url(#heat-red)" className="animate-pulse opacity-60" />
                    <circle cx="250" cy="220" r="30" fill="url(#heat-amber)" className="animate-pulse opacity-40" />
                    <circle cx="200" cy="280" r="25" fill="url(#heat-red)" className="animate-pulse opacity-50" />

                    <defs>
                        <radialGradient id="heat-red">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#ef444400" />
                        </radialGradient>
                        <radialGradient id="heat-amber">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#f59e0b00" />
                        </radialGradient>
                    </defs>

                    {/* District Outline */}
                    <path
                        d="M 120,40 L 280,40 L 320,80 L 340,150 L 350,280 L 300,340 L 100,340 L 60,280 L 50,150 L 80,80 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-zinc-300 dark:text-zinc-700"
                    />
                </svg>

                {/* Legend */}
                <div className="absolute bottom-6 left-6 space-y-2 glass-card p-3 rounded-xl border border-zinc-200/50 bg-white/80 dark:bg-zinc-900/80">
                    <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Severity Legend</p>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">Critical Disparity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">Warning Marker</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
