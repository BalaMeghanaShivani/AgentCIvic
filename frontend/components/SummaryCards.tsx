"use client";

import { ReactNode } from "react";

type CardProps = {
    label: string;
    value: string | number;
    status?: "good" | "warning" | "critical";
    helper?: string;
    icon?: ReactNode;
};

function Card({ label, value, status, helper, icon }: CardProps) {
    const statusColors = {
        good: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        critical: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    };

    return (
        <div className="glass-card rounded-2xl p-5 hover:border-zinc-400/30 transition-all">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold tracking-tight text-zinc-900">{value}</h3>
                        {status && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase border ${statusColors[status]}`}>
                                {status}
                            </span>
                        )}
                    </div>
                </div>
                {icon && <div className="text-zinc-600">{icon}</div>}
            </div>
            {helper && <p className="mt-4 text-xs font-medium text-zinc-600">{helper}</p>}
        </div>
    );
}

export function SummaryCards({ data }: { data: any }) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card
                label="Fairness Score"
                value={data.fairnessScore || "92%"}
                status={data.fairnessScore > 90 ? "good" : "warning"}
                helper="Across 40 neighborhoods"
            />
            <Card
                label="Avg Response"
                value={data.avgResponse || "14.2h"}
                helper="-12% from last week"
            />
            <Card
                label="Total Requests"
                value={data.totalRequests || "1,240"}
                helper="Last 24 hours"
            />
            <Card
                label="Underserved"
                value={data.underservedPct || "8%"}
                status={data.underservedPct < 10 ? "good" : "warning"}
                helper="Priority areas"
            />
        </div>
    );
}
