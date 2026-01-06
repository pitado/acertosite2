import { motion } from "framer-motion";

export function ConfirmDeleteModal({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.98, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.98, y: 8, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-emerald-800/60 bg-emerald-900/90 backdrop-blur p-5"
      >
        <h3 className="text-lg font-semibold text-emerald-50">Excluir grupo</h3>
        <p className="text-emerald-100/80 mt-2">
          Tem certeza que deseja excluir <span className="font-semibold">{name}</span>? Essa ação
          não pode ser desfeita.
        </p>
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-lg border border-emerald-800/60 text-emerald-100/90 hover:bg-emerald-800/40"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-emerald-950 font-semibold"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
