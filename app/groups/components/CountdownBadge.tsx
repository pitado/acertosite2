import { useMemo } from "react";

export function CountdownBadge({ dateISO }: { dateISO: string }) {
  const diffDays = useMemo(() => {
    const now = new Date();
    const d = new Date(dateISO);
    const ms = d.getTime() - now.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }, [dateISO]);

  return (
    <span className="text-xs bg-emerald-700/50 border border-emerald-600/60 rounded px-2 py-0.5">
      {diffDays >= 0 ? `Faltam ${diffDays} dia(s)` : `${Math.abs(diffDays)} dia(s) atrás`}
    </span>
  );
}
