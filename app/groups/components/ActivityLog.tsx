import type { LogEntry } from "../types";

export function ActivityLog({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-4">
      <div className="text-sm font-semibold text-emerald-50 mb-3">Atividades recentes</div>
      {logs.length === 0 ? (
        <div className="text-sm text-emerald-100/70">Nenhuma atividade recente.</div>
      ) : (
        <ul className="space-y-2 text-sm text-emerald-100/80">
          {logs.map((log) => (
            <li key={log.id} className="flex flex-col">
              <span>{log.message}</span>
              <span className="text-xs text-emerald-100/60">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
