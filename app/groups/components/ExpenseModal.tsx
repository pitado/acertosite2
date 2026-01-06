import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { CATEGORY_LIST, CATEGORY_MAP, formatBRL } from "../constants";
import type { Expense, SplitMode } from "../types";

export function ExpenseModal({
  open,
  onClose,
  members,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  members: string[];
  onSave: (e: Omit<Expense, "id" | "group_id" | "created_at">) => void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("0");
  const [buyer, setBuyer] = useState(members[0] || "");
  const [payer, setPayer] = useState(members[0] || "");
  const [pixKey, setPixKey] = useState("");
  const [location, setLocation] = useState("");
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(CATEGORY_LIST[0]);
  const [subcategory, setSubcategory] = useState(CATEGORY_MAP[CATEGORY_LIST[0]][0]);
  const [split, setSplit] = useState<SplitMode>("equal_all");
  const [selected, setSelected] = useState<string[]>(members);

  useEffect(() => {
    setSubcategory(CATEGORY_MAP[category]?.[0] || "Outros");
  }, [category]);

  const effective = split === "equal_all" ? members : selected;
  const perHead = useMemo(() => {
    const v = Number(String(amount).replace(",", "."));
    return isFinite(v) && effective.length > 0 ? Number((v / effective.length).toFixed(2)) : 0;
  }, [amount, effective]);

  function submit() {
    const v = Number(String(amount).replace(",", "."));
    if (!title.trim()) return alert("Informe o título");
    if (!isFinite(v) || v <= 0) return alert("Valor inválido");
    onSave({
      title: title.trim(),
      amount: Number(v.toFixed(2)),
      buyer,
      payer,
      split,
      participants: effective,
      category,
      subcategory,
      pix_key: pixKey || null,
      location: location || null,
      date_iso: new Date(dateISO).toISOString(),
      proof_url: null,
      paid: false,
      created_at: new Date().toISOString(),
      group_id: "",
      id: "",
    } as any);
  }

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
        className="relative w-full max-w-lg rounded-2xl border border-emerald-800/60 bg-emerald-900/90 backdrop-blur p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-emerald-50">Nova despesa</h3>
          <button onClick={onClose} className="hover:bg-emerald-800/40 rounded-lg p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <input
            className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
              placeholder="Valor (R$)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              type="date"
              className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_LIST.map((c) => (
                <option key={c} value={c} className="bg-emerald-900">
                  {c}
                </option>
              ))}
            </select>
            <select
              className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              {(CATEGORY_MAP[category] || ["Outros"]).map((s) => (
                <option key={s} value={s} className="bg-emerald-900">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm">Quem comprou</label>
            <select
              className="w-full rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
            >
              {members.map((m) => (
                <option className="bg-emerald-900" key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <label className="text-sm mt-2 block">Quem pagou</label>
            <select
              className="w-full rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
            >
              {members.map((m) => (
                <option className="bg-emerald-900" key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <select
              className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
              value={split}
              onChange={(e) => setSplit(e.target.value as SplitMode)}
            >
              <option value="equal_all" className="bg-emerald-900">
                Igual entre TODOS
              </option>
              <option value="equal_selected" className="bg-emerald-900">
                Igual entre SELECIONADOS
              </option>
            </select>
            <input
              className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
              placeholder="Chave PIX (opcional)"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
          </div>

          {split === "equal_selected" && (
            <div className="mt-1">
              <div className="text-xs text-emerald-100/70 mb-1">Marque quem divide:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.includes(m)}
                      onChange={() =>
                        setSelected((prev) =>
                          prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                        )
                      }
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-emerald-800/60 bg-emerald-900/40 p-3">
            <div className="text-sm font-semibold text-emerald-50">Prévia</div>
            <div className="text-xs text-emerald-100/80">
              {effective.length} participante(s) •{" "}
              {perHead > 0 ? `≈ ${formatBRL(perHead)} por pessoa` : "valor/participantes pendentes"}
            </div>
          </div>

          <input
            className="rounded-md bg-emerald-950/40 border border-emerald-800/70 p-2"
            placeholder="Local (opcional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2">
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
              Salvar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
