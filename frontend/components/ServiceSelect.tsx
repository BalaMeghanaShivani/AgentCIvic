"use client";

type ServiceSelectProps = {
  services: string[];
  value: string;
  onChange: (value: string) => void;
};

export function ServiceSelect({ services, value, onChange }: ServiceSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Primary Dataset
      </label>
      <div className="relative">
        <select
          className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-lg transition-all hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {services.map((service) => (
            <option key={service} value={service} className="bg-white py-2">
              {service}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
