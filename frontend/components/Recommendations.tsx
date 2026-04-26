"use client";

type Recommendation = {
    id: string;
    text: string;
    confidence: number;
    impact?: string;
    category: "resource" | "policy" | "efficiency";
};

export function Recommendations({ items }: { items: Recommendation[] }) {
    const icons = {
        resource: "📦",
        policy: "📜",
        efficiency: "⚡",
    };

    return (
        <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] bg-zinc-900/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">AI Recommendations</h3>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-auto custom-scrollbar">
                {items.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/30 transition-colors group">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg">
                                {icons[item.category]}
                            </div>
                            <div className="flex-1 space-y-2">
                                <p className="text-sm font-medium text-zinc-800 leading-snug">
                                    {item.text}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${item.confidence}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-500 tabular-nums">{item.confidence}% Confidence</span>
                                    </div>
                                    {item.impact && (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                                            {item.impact} Est. Impact
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="animate-pulse flex flex-col items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                            <p className="text-[10px] font-bold text-zinc-600 uppercase">Analyzing Policy Scenario...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
