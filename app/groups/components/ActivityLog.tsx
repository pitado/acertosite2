import type { LogEntry } from "../types";

function formatDate(value?: string | Date) {
  if (!value) return "agora";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "agora";
  return d.toLocaleString();
}

export function ActivityLog({ logs }: { logs: LogEntry[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm text-white/60">Nenhuma atividade recente.</p>
        <p className="mt-2 text-xs text-white/40">
          Quando você criar grupo, convidar alguém ou adicionar despesa, aparece aqui.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-2">
      {logs.map((log) => (
        <li
          key={log.id}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3"
        >
          <span className="text-sm text-white/80">{log.message}</span>
          <span className="text-xs text-emerald-100/60 shrink-0">
            {formatDate(log.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
