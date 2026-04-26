"use client";

type Area = {
    neighborhood: string;
    p90_hr: number;
    ratio_p90: number;
    requests?: number;
};

export function TopAreas({ areas }: { areas: Area[] }) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-[var(--border)] bg-zinc-50">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Resource Priority</h3>
            </div>

            <div className="flex-1 p-5 space-y-6">
                {areas.slice(0, 5).map((area, idx) => (
                    <div key={area.neighborhood} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-[10px] font-black text-zinc-600 uppercase">#{idx + 1}</span>
                                <p className="text-sm font-bold text-zinc-900">{area.neighborhood}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-zinc-900">{area.p90_hr?.toFixed(1) || "0.0"}h</p>
                                <p className="text-[10px] font-medium text-zinc-500 uppercase">P90 Response</p>
                            </div>
                        </div>

                        <div className="relative h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${area.ratio_p90 > 2.0 ? "bg-rose-500" : area.ratio_p90 > 1.5 ? "bg-amber-500" : "bg-emerald-500"
                                    }`}
                                style={{ width: `${Math.min(area.ratio_p90 * 25, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight text-zinc-600">
                            <span>Gap Ratio: {area.ratio_p90?.toFixed(2) || "1.00"}x</span>
                            {area.ratio_p90 > 2.0 && <span className="text-rose-500">Critical Priority</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
