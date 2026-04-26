import { ReactNode } from "react";

type Column = {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
};

type DataTableProps = {
  columns: Column[];
  rows: Array<Record<string, any>>;
  onRowClick?: (row: any) => void;
  selectedId?: string;
  idKey?: string;
};

export function DataTable({ columns, rows, onRowClick, selectedId, idKey = "id" }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.map((row, idx) => {
              const isSelected = selectedId && row[idKey] === selectedId;
              return (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-colors hover:bg-emerald-500/[0.03] ${onRowClick ? "cursor-pointer" : ""
                    } ${isSelected ? "bg-emerald-500/[0.08]" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-zinc-700 group-hover:text-zinc-900 transition-colors">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="px-6 py-12 text-center text-sm text-zinc-500" colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-dashed border-zinc-300"></div>
                    <span>No data signals detected</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
