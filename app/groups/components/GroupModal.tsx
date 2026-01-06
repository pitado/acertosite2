import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import type { Group } from "../types";

export function GroupModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Group | null;
  onSave: (p: {
    name: string;
    description?: string;
    emails: string[];
    roleDateISO?: string;
  }) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [roleDateISO, setRoleDateISO] = useState(
    initial?.role_date ? initial.role_date.slice(0, 10) : ""
  );
  const [emailsStr, setEmailsStr] = useState("");

  useEffect(() => {
    setName(initial?.name || "");
    setDescription(initial?.description || "");
    setRoleDateISO(initial?.role_date ? initial.role_date.slice(0, 10) : "");
    setEmailsStr("");
  }, [initial]);

  const submit = () => {
    const emails = emailsStr
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!name.trim()) {
      alert("Informe o nome do grupo");
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      roleDateISO: roleDateISO ? new Date(roleDateISO).toISOString() : undefined,
      emails,
    });
  };

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.98, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.98, y: 8, opacity: 0 }}
        className="relative w-full max-w-xl rounded-2xl border border-emerald-800/60 bg-emerald-900/90 backdrop-blur p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-emerald-50">
            {initial ? "Editar grupo" : "Novo grupo"}
          </h3>
          <button onClick={onClose} className="hover:bg-emerald-800/40 rounded-lg p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3">
          <input
            className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
            placeholder="Nome do grupo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2 min-h-[90px]"
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="date"
            className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
            value={roleDateISO}
            onChange={(e) => setRoleDateISO(e.target.value)}
          />
          <input
            className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
            placeholder="E-mails dos membros (separados por vírgula)"
            value={emailsStr}
            onChange={(e) => setEmailsStr(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-emerald-800/60 text-emerald-100/90 hover:bg-emerald-800/40"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold"
            >
              {initial ? "Salvar alterações" : "Criar grupo"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
