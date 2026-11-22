"use client";
import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { formatARS } from "@/lib/format";
import type { Addon, CartItem, Product } from "@/types";

function Option({ label, extra, checked, onChange }: { label: string; extra?: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface2 p-3 transition has-[:checked]:border-gold has-[:checked]:bg-gold/10">
      <span className="flex items-center gap-2.5 min-w-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 accent-[#F5B800]" />
        <span className="text-xs sm:text-sm truncate">{label}</span>
      </span>
      {extra && <span className="text-xs sm:text-sm font-semibold text-gold shrink-0">{extra}</span>}
    </label>
  );
}

export default function ProductModal({ product, addons, sauces = [], onClose, onAdd }: {
  product: Product; addons: Addon[]; sauces?: string[]; onClose: () => void; onAdd: (item: CartItem) => void;
}) {
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState<string[]>([]);
  const [chosenSauces, setChosenSauces] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const options = addons.filter((a) => product.addonIds.includes(a.id));
  const chosen = options.filter((a) => sel.includes(a.id));
  const total = (product.price + chosen.reduce((s, a) => s + a.price, 0)) * qty;
  const flip = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const add = () => {
    onAdd({
      uid: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      qty,
      addons: chosen,
      sauces: chosenSauces.length ? chosenSauces : undefined,
      removed,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={product.name} onClick={(e) => e.stopPropagation()}
        style={{ animation: "sheet .22s ease-out" }}
        className="flex max-h-[92dvh] w-full max-w-lg sm:max-w-xl md:max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl shadow-black sm:rounded-3xl">
        
        {/* Header del producto con foto/emoji */}
        <div className="relative flex items-center gap-4 border-b border-line p-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-surface2 text-5xl">
            {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : product.emoji}
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <h2 className="font-display text-3xl sm:text-4xl leading-none">{product.name}</h2>
            <p className="mt-1 text-sm text-muted">{product.description}</p>
            <p className="mt-1.5 font-bold text-lg text-gold">{formatARS(product.price)}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="absolute right-3 top-3 rounded-full p-2 text-muted hover:bg-surface2 transition"><X size={20} /></button>
        </div>

        <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
          {/* Adicionales Pagos */}
          {options.length > 0 && (
            <section>
              <h3 className="mb-2.5 font-semibold text-sm sm:text-base">Adicionales disponibles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((a) => <Option key={a.id} label={a.name} extra={`+ ${formatARS(a.price)}`} checked={sel.includes(a.id)} onChange={() => flip(sel, setSel, a.id)} />)}
              </div>
            </section>
          )}

          {/* Salsas y Aderezos sin cargo */}
          {product.hasSauces !== false && sauces.length > 0 && (
            <section>
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base">Salsas y aderezos <span className="font-normal text-muted">(sin cargo)</span></h3>
                <span className="text-xs text-gold">Elegí las que quieras</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sauces.map((s) => <Option key={s} label={s} checked={chosenSauces.includes(s)} onChange={() => flip(chosenSauces, setChosenSauces, s)} />)}
              </div>
            </section>
          )}

          {/* Quitar ingredientes */}
          {product.removables.length > 0 && (
            <section>
              <h3 className="mb-2.5 font-semibold text-sm sm:text-base">Quitar ingredientes <span className="font-normal text-muted">(sin cargo)</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.removables.map((r) => <Option key={r} label={r} checked={removed.includes(r)} onChange={() => flip(removed, setRemoved, r)} />)}
              </div>
            </section>
          )}

          {/* Aclaraciones */}
          <section>
            <h3 className="mb-2 font-semibold text-sm sm:text-base">Aclaraciones para la cocina</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={140} placeholder="Ej: bien cocida, cortala al medio…"
              className="w-full resize-none rounded-xl border border-line bg-surface2 p-3 text-sm outline-none focus:border-gold" />
          </section>
        </div>

        {/* Footer con cantidad y botón de agregar */}
        <div className="flex items-center gap-3 border-t border-line p-4">
          <div className="flex items-center rounded-xl border border-line bg-surface2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Menos" className="p-3 transition hover:text-gold"><Minus size={18} /></button>
            <span className="w-8 text-center font-bold tabular-nums">{qty}</span>
            <button onClick={() => setQty(qty + 1)} aria-label="Más" className="p-3 transition hover:text-gold"><Plus size={18} /></button>
          </div>
          <button onClick={add} disabled={product.paused}
            className="flex-1 rounded-xl bg-gold py-3.5 font-bold text-bg transition active:scale-[.98] disabled:bg-line disabled:text-muted">
            {product.paused ? "Sin stock" : `Agregar al pedido - ${formatARS(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
