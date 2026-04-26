import { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
};

export function KpiCard({ label, value, helper, icon, trend }: KpiCardProps) {
  return (
    <div className="glass-card glow-emerald rounded-2xl p-6 transition-all hover:scale-[1.02] hover:border-emerald-500/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {value}
          </p>
        </div>
        {icon && (
          <div className="rounded-lg bg-zinc-100 p-2 text-emerald-600 ring-1 ring-zinc-200">
            {icon}
          </div>
        )}
      </div>
      {helper && (
        <div className="mt-4 flex items-center gap-2">
          {trend === "up" && <span className="text-xs text-emerald-500">↑</span>}
          {trend === "down" && <span className="text-xs text-rose-500">↓</span>}
          <p className="text-xs font-medium text-zinc-600">{helper}</p>
        </div>
      )}
    </div>
  );
}
