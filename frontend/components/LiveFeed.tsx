"use client";

type Alert = {
    id: string;
    neighborhood: string;
    type: string;
    timestamp: string;
    severity: "low" | "medium" | "high";
};

export function LiveFeed({ alerts }: { alerts: Alert[] }) {
    const sevColors = {
        low: "bg-emerald-500",
        medium: "bg-amber-500",
        high: "bg-rose-500",
    };

    return (
        <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex justify-between items-center bg-zinc-50">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Live Signals</h3>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Live</span>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-2 custom-scrollbar">
                <div className="space-y-1">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group cursor-default">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${sevColors[alert.severity]}`} />
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 leading-none">{alert.type}</p>
                                        <p className="mt-1 text-xs font-medium text-zinc-600">{alert.neighborhood}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight tabular-nums">
                                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {alerts.length === 0 && (
                        <div className="py-20 text-center space-y-2">
                            <p className="text-xs font-bold text-zinc-600 uppercase">No active signals</p>
                            <p className="text-[10px] text-zinc-500">System scanning for disparities...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
