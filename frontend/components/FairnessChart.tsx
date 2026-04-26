"use client";

type Metric = {
    neighborhood: string;
    p90_hr: number;
};

export function FairnessChart({ metrics, cityAvg }: { metrics: Metric[], cityAvg: number }) {
    const maxVal = Math.max(...metrics.map(m => m.p90_hr), cityAvg) * 1.1;
    const displayMetrics = metrics.slice(0, 12); // Limit for clarity

    return (
        <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">System Equity Scan</h3>
            </div>

            <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1 relative flex items-end gap-2 px-2">
                    {/* Grid Lines */}
                    <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none">
                        {[0, 25, 50, 75, 100].map(p => (
                            <div key={p} className="border-t border-zinc-100 dark:border-zinc-800/50 w-full" />
                        ))}
                    </div>

                    {/* City Average Line */}
                    <div
                        className="absolute inset-x-0 border-t-2 border-dashed border-zinc-400/50 z-10 pointer-events-none flex items-center justify-end"
                        style={{ bottom: `${(cityAvg / maxVal) * 100}%` }}
                    >
                        <span className="mr-2 -mt-4 text-[9px] font-black uppercase text-zinc-500 bg-white dark:bg-zinc-900 px-1">City Avg</span>
                    </div>

                    {/* Bars */}
                    {displayMetrics.map((m) => (
                        <div key={m.neighborhood} className="flex-1 flex flex-col items-center group relative gap-2">
                            <div
                                className={`w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80 ${m.p90_hr > cityAvg * 1.5 ? "bg-rose-500" : m.p90_hr > cityAvg ? "bg-amber-500" : "bg-emerald-500"
                                    }`}
                                style={{ height: `${(m.p90_hr / maxVal) * 100}%` }}
                            >
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900 text-white text-[10px] py-1 px-2 rounded z-20 font-bold tabular-nums">
                                    {m.neighborhood}: {m.p90_hr?.toFixed(1) || "0.0"}h
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* X-Axis Labels */}
                <div className="flex gap-2 mt-4 px-2">
                    {displayMetrics.map((m) => (
                        <div key={m.neighborhood} className="flex-1">
                            <p className="text-[8px] font-bold text-zinc-400 uppercase rotate-45 origin-left whitespace-nowrap truncate max-w-[40px]">
                                {m.neighborhood}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
