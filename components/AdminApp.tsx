"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellOff, Plus, Printer, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatARS, formatOrderNumber, itemTotal } from "@/lib/format";
import type { CategoryId, Order, OrderMode, OrderStatus, PayMethod, Product } from "@/types";
import Logo from "./Logo";

const field = "w-full rounded-xl border border-line bg-surface2 p-3 text-sm outline-none focus:border-gold";
const btn = "rounded-lg border border-line bg-surface2 px-3 py-2 text-sm font-semibold transition active:scale-95";
const COLS: { id: OrderStatus; label: string; next?: OrderStatus; action?: string }[] = [
  { id: "new", label: "Nuevos", next: "preparing", action: "Preparar" },
  { id: "preparing", label: "En preparación", next: "ready", action: "Listo / En camino" },
  { id: "ready", label: "Listos / En camino", next: "delivered", action: "Marcar entregado" },
  { id: "delivered", label: "Entregados" },
];
const CATS: CategoryId[] = ["desmechados", "burgers", "milas", "lomitos", "papas", "bebidas"];
const hhmm = (iso: string) => new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-gold" : "bg-line"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-3" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-3xl">{title}</h2><button onClick={onClose} aria-label="Cerrar"><X /></button></div>
        {children}
      </div>
    </div>
  );
}

function Ticket({ o, width }: { o: Order; width: string }) {
  const hr = <hr style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />;
  return (
    <div id="ticket-print" className="hidden print:block" style={{ width }}>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 15 }}>CHIDO'S STREET FOOD</div>
      <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700 }}>{formatOrderNumber(o.number)}</div>
      <div style={{ textAlign: "center" }}>{hhmm(o.createdAt)}</div>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16 }}>{o.mode === "delivery" ? "DELIVERY" : "TAKE AWAY"}</div>
      {hr}
      <div>{o.customer.name} - {o.customer.phone}</div>
      {o.address && <div>{o.address.street} ({o.address.zoneName}){o.address.reference ? ` Ref: ${o.address.reference}` : ""}</div>}
      {hr}
      {o.items.map((i) => (
        <div key={i.uid} style={{ marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{i.qty}x {i.name}</div>
          {i.addons.map((a) => <div key={a.id}>&nbsp;+ {a.name}</div>)}
          {i.removed.length > 0 && <div style={{ fontWeight: 700 }}>&nbsp;** {i.removed.join(" / ").toUpperCase()} **</div>}
          {i.note && <div>&nbsp;NOTA: {i.note}</div>}
        </div>
      ))}
      {hr}
      {o.deliveryFee > 0 && <div>Envío: {formatARS(o.deliveryFee)}</div>}
      <div style={{ fontWeight: 700, fontSize: 16 }}>TOTAL: {formatARS(o.total)}</div>
      <div>Pago: {o.payment.method === "cash" ? "EFECTIVO" : "TRANSFERENCIA"}</div>
      {o.payment.method === "cash" && o.payment.cashGiven ? <div>Abona con {formatARS(o.payment.cashGiven)} - Vuelto {formatARS(o.payment.change ?? 0)}</div> : null}
    </div>
  );
}

function ManualOrder({ onClose }: { onClose: () => void }) {
  const { state, addOrder } = useStore();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<OrderMode>("takeaway");
  const [pay, setPay] = useState<PayMethod>("cash");
  const [zoneId, setZoneId] = useState("");
  const [street, setStreet] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const zone = state.settings.zones.find((z) => z.id === zoneId);
  const chosen = state.products.filter((p) => qty[p.id] > 0);
  const subtotal = chosen.reduce((s, p) => s + p.price * qty[p.id], 0);
  const fee = mode === "delivery" ? zone?.fee ?? 0 : 0;
  const ok = chosen.length > 0 && name.trim() && (mode === "takeaway" || (zone && street.trim()));
  const save = () => {
    addOrder({
      mode, source: "manual", customer: { name: name.trim(), phone: phone.trim() || "-" },
      address: mode === "delivery" && zone ? { zoneId: zone.id, zoneName: zone.name, street: street.trim() } : undefined,
      items: chosen.map((p, idx) => ({ uid: crypto.randomUUID(), productId: p.id, name: p.name, unitPrice: p.price, qty: qty[p.id], addons: [], removed: [], note: idx === 0 && note.trim() ? note.trim() : undefined })),
      subtotal, deliveryFee: fee, total: subtotal + fee, payment: { method: pay },
    });
    onClose();
  };
  return (
    <Modal title="Nuevo pedido manual" onClose={onClose}>
      <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
        {state.products.filter((p) => !p.paused).map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate">{p.emoji} {p.name} <span className="text-gold">{formatARS(p.price)}</span></span>
            <span className="flex items-center gap-2">
              <button className={btn} onClick={() => setQty({ ...qty, [p.id]: Math.max(0, (qty[p.id] || 0) - 1) })}>−</button>
              <b className="w-5 text-center">{qty[p.id] || 0}</b>
              <button className={btn} onClick={() => setQty({ ...qty, [p.id]: (qty[p.id] || 0) + 1 })}>+</button>
            </span>
          </div>
        ))}
      </div>
      <input className={field} placeholder="Aclaración para la cocina (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2">
        {(["takeaway", "delivery"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`${btn} flex-1 ${mode === m ? "border-gold text-gold" : ""}`}>{m === "delivery" ? "Delivery" : "Take Away"}</button>)}
      </div>
      {mode === "delivery" && (
        <>
          <select className={field} value={zoneId} onChange={(e) => setZoneId(e.target.value)}><option value="">Zona</option>{state.settings.zones.map((z) => <option key={z.id} value={z.id}>{z.name} · {formatARS(z.fee)}</option>)}</select>
          <input className={field} placeholder="Dirección" value={street} onChange={(e) => setStreet(e.target.value)} />
        </>
      )}
      <div className="grid grid-cols-2 gap-2"><input className={field} placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} /><input className={field} placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="flex gap-2">
        {(["cash", "transfer"] as const).map((m) => <button key={m} onClick={() => setPay(m)} className={`${btn} flex-1 ${pay === m ? "border-gold text-gold" : ""}`}>{m === "cash" ? "Efectivo" : "Transferencia"}</button>)}
      </div>
      <button disabled={!ok} onClick={save} className="w-full rounded-xl bg-gold py-3 font-bold text-bg disabled:bg-line disabled:text-muted">Cargar pedido - {formatARS(subtotal + fee)}</button>
    </Modal>
  );
}

function OrdersTab() {
  const { state, hydrated, setStatus, deleteOrder } = useStore();
  const [sound, setSound] = useState(false);
  const [manual, setManual] = useState(false);
  const [printing, setPrinting] = useState<Order | null>(null);
  const [width, setWidth] = useState("80mm");
  const audio = useRef<AudioContext | null>(null);
  const prev = useRef<number | null>(null);

  const beep = () => {
    const ctx = (audio.current ??= new AudioContext());
    [880, 1175].forEach((f, i) => {
      const t = ctx.currentTime + i * 0.2, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.2);
    });
  };
  useEffect(() => {
    if (!hydrated) return;
    const n = state.orders.length;
    if (prev.current !== null && n > prev.current && sound) beep();
    prev.current = n;
  }, [state.orders.length, hydrated, sound]);

  useEffect(() => {
    if (printing) {
      const handleAfterPrint = () => setPrinting(null);
      window.addEventListener("afterprint", handleAfterPrint);
      const t = setTimeout(() => {
        window.print();
        setTimeout(() => setPrinting(null), 500);
      }, 100);
      return () => {
        clearTimeout(t);
        window.removeEventListener("afterprint", handleAfterPrint);
      };
    }
  }, [printing]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => { setSound(!sound); if (!sound) beep(); }} className={`${btn} flex items-center gap-2 ${sound ? "border-gold text-gold" : ""}`}>
          {sound ? <Bell size={16} /> : <BellOff size={16} />}{sound ? "Alerta sonora activa" : "Activar alerta sonora"}
        </button>
        <select value={width} onChange={(e) => setWidth(e.target.value)} className={btn} aria-label="Ancho del ticket"><option value="80mm">Ticket 80mm</option><option value="58mm">Ticket 58mm</option></select>
        <button onClick={() => setManual(true)} className="ml-auto flex items-center gap-1 rounded-lg bg-gold px-3 py-2 text-sm font-bold text-bg"><Plus size={16} />Nuevo pedido manual</button>
      </div>
      <div className="grid auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto pb-2 md:grid-flow-row md:auto-cols-auto md:grid-cols-2 lg:grid-cols-4">
        {COLS.map((c) => {
          const list = state.orders.filter((o) => o.status === c.id).slice(0, c.id === "delivered" ? 15 : 99);
          return (
            <section key={c.id} className="min-h-40 space-y-3 rounded-2xl border border-line bg-surface p-3">
              <h2 className="flex items-center justify-between font-semibold">{c.label}<span className={`rounded-full px-2 text-xs ${c.id === "new" && list.length ? "bg-fire" : "bg-line"}`}>{list.length}</span></h2>
              {list.length === 0 && <p className="text-sm text-muted">Sin pedidos.</p>}
              {list.map((o) => (
                <article key={o.id} className="space-y-2 rounded-xl border border-line bg-surface2 p-3 text-sm">
                  <div className="flex items-center justify-between"><b className="font-display text-2xl text-gold">{formatOrderNumber(o.number)}</b><span className="text-xs text-muted">{hhmm(o.createdAt)}</span></div>
                  <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                    <span className={`rounded px-1.5 py-0.5 ${o.mode === "delivery" ? "bg-gold text-bg" : "bg-white text-bg"}`}>{o.mode === "delivery" ? "DELIVERY" : "TAKE AWAY"}</span>
                    <span className="rounded bg-line px-1.5 py-0.5">{o.payment.method === "cash" ? "EFECTIVO" : "TRANSFER."}</span>
                    {o.source === "manual" && <span className="rounded bg-line px-1.5 py-0.5">MANUAL</span>}
                  </div>
                  <p>{o.customer.name} · <span className="text-muted">{o.customer.phone}</span></p>
                  {o.address && <p className="text-muted">{o.address.street} ({o.address.zoneName})</p>}
                  <ul className="space-y-1">
                    {o.items.map((i) => (
                      <li key={i.uid}><b>{i.qty}x {i.name}</b>
                        {i.addons.length > 0 && <div className="text-xs text-gold">+ {i.addons.map((a) => a.name).join(", ")}</div>}
                        {i.removed.length > 0 && <div className="text-xs font-bold text-fire">{i.removed.join(" · ")}</div>}
                        {i.note && <div className="text-xs italic text-muted">“{i.note}”</div>}
                      </li>
                    ))}
                  </ul>
                  <p className="font-bold">{formatARS(o.total)}{o.payment.method === "cash" && o.payment.cashGiven ? <span className="font-normal text-muted"> · abona {formatARS(o.payment.cashGiven)}, vuelto {formatARS(o.payment.change ?? 0)}</span> : null}</p>
                  <div className="flex gap-2">
                    {c.next && <button onClick={() => setStatus(o.id, c.next!)} className="flex-1 rounded-lg bg-gold py-2 text-xs font-bold text-bg">{c.action}</button>}
                    <button onClick={() => setPrinting(o)} className={`${btn} flex items-center gap-1`}><Printer size={14} />Imprimir Ticket</button>
                    <button
                      onClick={() => confirm(`¿Cancelar pedido #${formatOrderNumber(o.number)}?`) && setStatus(o.id, "cancelled")}
                      className="rounded-lg border border-line bg-surface2 px-2 py-1 text-xs text-muted hover:text-fire"
                      title="Cancelar pedido">
                      <X size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </section>
          );
        })}
      </div>
      {manual && <ManualOrder onClose={() => setManual(false)} />}
      {printing && <Ticket o={printing} width={width} />}
    </div>
  );
}

function ProductForm({ product, onClose }: { product?: Product; onClose: () => void }) {
  const { state, upsertProduct, deleteProduct } = useStore();
  const [f, setF] = useState<Product>(product ?? { id: `p-${Date.now()}`, name: "", description: "", price: 0, category: "desmechados", emoji: "🥪", paused: false, addonIds: [], removables: [] });
  const [rem, setRem] = useState(f.removables.join(", "));
  const toggleAddon = (id: string) => setF({ ...f, addonIds: f.addonIds.includes(id) ? f.addonIds.filter((x) => x !== id) : [...f.addonIds, id] });
  return (
    <Modal title={product ? "Editar producto" : "Nuevo producto"} onClose={onClose}>
      <input className={field} placeholder="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <textarea className={field} rows={2} placeholder="Descripción" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      <div className="grid grid-cols-3 gap-2">
        <input className={field} inputMode="numeric" placeholder="Precio" value={f.price || ""} onChange={(e) => setF({ ...f, price: Number(e.target.value.replace(/\D/g, "")) })} />
        <input className={field} placeholder="Emoji" value={f.emoji} onChange={(e) => setF({ ...f, emoji: e.target.value })} />
        <select className={field} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as CategoryId })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <input className={field} placeholder="URL de imagen (opcional)" value={f.image ?? ""} onChange={(e) => setF({ ...f, image: e.target.value || undefined })} />
      <div><p className="mb-1 text-sm font-semibold">Adicionales disponibles</p><div className="flex flex-wrap gap-2">
        {state.addons.map((a) => <button key={a.id} onClick={() => toggleAddon(a.id)} className={`${btn} ${f.addonIds.includes(a.id) ? "border-gold text-gold" : ""}`}>{a.name}</button>)}</div></div>
      <input className={field} placeholder="Sin cargo (separados por coma): Sin cebolla, Sin tomate" value={rem} onChange={(e) => setRem(e.target.value)} />
      <div className="flex gap-2">
        {product && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`¿Eliminar producto "${product.name}"?`)) {
                deleteProduct(product.id);
                onClose();
              }
            }}
            className="rounded-xl border border-fire/40 bg-fire/10 px-4 py-3 font-semibold text-fire hover:bg-fire/20">
            Eliminar
          </button>
        )}
        <button disabled={!f.name.trim() || f.price <= 0} onClick={() => { upsertProduct({ ...f, name: f.name.trim(), removables: rem.split(",").map((x) => x.trim()).filter(Boolean) }); onClose(); }}
          className="flex-1 rounded-xl bg-gold py-3 font-bold text-bg disabled:bg-line disabled:text-muted">Guardar producto</button>
      </div>
    </Modal>
  );
}

function MenuTab() {
  const { state, togglePause, setPrice, upsertAddon, deleteAddon } = useStore();
  const [edit, setEdit] = useState<Product | "new" | null>(null);
  const [an, setAn] = useState(""), [ap, setAp] = useState("");
  return (
    <div className="space-y-6">
      <div className="flex justify-end"><button onClick={() => setEdit("new")} className="flex items-center gap-1 rounded-lg bg-gold px-3 py-2 text-sm font-bold text-bg"><Plus size={16} />Nuevo producto</button></div>
      <ul className="space-y-2">
        {state.products.map((p) => (
          <li key={p.id} className={`flex items-center gap-3 rounded-xl border border-line bg-surface p-3 ${p.paused ? "opacity-60" : ""}`}>
            <span className="text-3xl">{p.emoji}</span>
            <button onClick={() => setEdit(p)} className="min-w-0 flex-1 text-left"><p className="truncate font-semibold">{p.name}</p><p className="text-xs text-muted">{p.category}{p.paused ? " · Sin stock" : ""}</p></button>
            <input key={p.price} defaultValue={p.price} inputMode="numeric" aria-label={`Precio de ${p.name}`}
              onBlur={(e) => { const v = Number(e.target.value.replace(/\D/g, "")); if (v > 0 && v !== p.price) setPrice(p.id, v); else e.target.value = String(p.price); }}
              className="w-24 rounded-lg border border-line bg-surface2 p-2 text-right text-sm text-gold outline-none focus:border-gold" />
            <Switch on={!p.paused} onChange={() => togglePause(p.id)} label={`Stock de ${p.name}`} />
          </li>
        ))}
      </ul>
      <section className="space-y-2">
        <h2 className="font-semibold">Adicionales</h2>
        {state.addons.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
            <span>{a.name}</span>
            <div className="flex items-center gap-2">
              <input key={a.price} defaultValue={a.price} inputMode="numeric" aria-label={`Precio de ${a.name}`} onBlur={(e) => { const v = Number(e.target.value.replace(/\D/g, "")); if (v >= 0) upsertAddon({ ...a, price: v }); }}
                className="w-24 rounded-lg border border-line bg-surface2 p-2 text-right text-gold outline-none focus:border-gold" />
              <button
                onClick={() => confirm(`¿Eliminar adicional "${a.name}"?`) && deleteAddon(a.id)}
                className="rounded-lg p-2 text-muted hover:text-fire"
                title="Eliminar adicional">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2"><input className={field} placeholder="Nuevo adicional" value={an} onChange={(e) => setAn(e.target.value)} /><input className={`${field} w-28`} inputMode="numeric" placeholder="Precio" value={ap} onChange={(e) => setAp(e.target.value)} />
          <button disabled={!an.trim()} onClick={() => { upsertAddon({ id: `a-${Date.now()}`, name: an.trim(), price: Number(ap.replace(/\D/g, "")) || 0 }); setAn(""); setAp(""); }} className={btn}>Agregar</button></div>
      </section>
      {edit && <ProductForm product={edit === "new" ? undefined : edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function ConfigTab() {
  const { state, setSettings, reset } = useStore();
  const s = state.settings;
  const today = state.orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const sum = (arr: Order[]) => arr.reduce((t, o) => t + o.total, 0);
  const cards = [
    { l: "Total vendido hoy", v: formatARS(sum(today)) }, { l: "Pedidos", v: String(today.length) },
    { l: "En efectivo", v: formatARS(sum(today.filter((o) => o.payment.method === "cash"))) },
    { l: "En transferencias", v: formatARS(sum(today.filter((o) => o.payment.method === "transfer"))) },
  ];
  const setZone = (id: string, patch: object) => setSettings({ zones: s.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) });
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => <div key={c.l} className="rounded-2xl border border-line bg-surface p-4"><p className="text-xs text-muted">{c.l}</p><p className="mt-1 font-display text-3xl text-gold">{c.v}</p></div>)}
      </section>
      <section className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4">
        <div><p className="font-semibold">Local {s.isOpen ? "abierto" : "cerrado"}</p><p className="text-xs text-muted">Se refleja al instante en la tienda.</p></div>
        <Switch on={s.isOpen} onChange={() => setSettings({ isOpen: !s.isOpen })} label="Abrir o cerrar el local" />
      </section>
      <section className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <h2 className="font-semibold text-white">Datos de Pago y Horarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="block text-sm font-semibold">Alias de transferencia
            <input key={s.transferAlias} className={`${field} mt-1`} defaultValue={s.transferAlias} onBlur={(e) => e.target.value.trim() && setSettings({ transferAlias: e.target.value.trim() })} />
          </label>
          <label className="block text-sm font-semibold">CBU Bancario
            <input key={s.transferCbu} className={`${field} mt-1`} defaultValue={s.transferCbu} onBlur={(e) => setSettings({ transferCbu: e.target.value.trim() })} />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="text-sm font-semibold">Titular de la cuenta
            <input key={s.transferHolder} className={`${field} mt-1`} defaultValue={s.transferHolder} onBlur={(e) => setSettings({ transferHolder: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">CUIT
            <input key={s.transferCuit} className={`${field} mt-1`} defaultValue={s.transferCuit} onBlur={(e) => setSettings({ transferCuit: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Horarios de atención
            <input key={s.hours} className={`${field} mt-1`} defaultValue={s.hours} onBlur={(e) => setSettings({ hours: e.target.value })} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line/60">
          <label className="text-sm font-semibold">Demora Delivery
            <input key={s.deliveryEta} className={`${field} mt-1`} defaultValue={s.deliveryEta} onBlur={(e) => setSettings({ deliveryEta: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Demora Take Away
            <input key={s.takeawayEta} className={`${field} mt-1`} defaultValue={s.takeawayEta} onBlur={(e) => setSettings({ takeawayEta: e.target.value })} />
          </label>
        </div>
      </section>
      <section className="space-y-2 rounded-2xl border border-line bg-surface p-4">
        <h2 className="font-semibold">Zonas de delivery</h2>
        {s.zones.map((z) => (
          <div key={z.id + z.fee + z.name} className="flex gap-2">
            <input className={field} defaultValue={z.name} aria-label="Nombre de zona" onBlur={(e) => setZone(z.id, { name: e.target.value })} />
            <input className={`${field} w-28`} defaultValue={z.fee} inputMode="numeric" aria-label="Tarifa" onBlur={(e) => setZone(z.id, { fee: Number(e.target.value.replace(/\D/g, "")) })} />
            <button className={btn} aria-label="Quitar zona" onClick={() => setSettings({ zones: s.zones.filter((x) => x.id !== z.id) })}><X size={16} /></button>
          </div>
        ))}
        <button className={btn} onClick={() => setSettings({ zones: [...s.zones, { id: `z${Date.now()}`, name: "Nueva zona", fee: 2000 }] })}>+ Agregar zona</button>
      </section>
      <button onClick={() => confirm("¿Borrar pedidos y volver a los datos de demo?") && reset()} className="text-xs text-muted underline">Reiniciar datos de demo</button>
    </div>
  );
}

export default function AdminApp() {
  const { state, isSupabase } = useStore();
  const [authed, setAuthed] = useState<boolean | null>(null); // null = sin montar (evita mismatch)
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);
  const [tab, setTab] = useState<"orders" | "menu" | "config">("orders");
  useEffect(() => { setAuthed(sessionStorage.getItem("chidos:admin") === "1"); }, []);
  const tabs = useMemo(() => [["orders", "Pedidos en vivo"], ["menu", "Menú y stock"], ["config", "Configuración y caja"]] as const, []);

  if (authed === null) return null;
  if (!authed) {
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); if (pin === state.settings.adminPin) { sessionStorage.setItem("chidos:admin", "1"); setAuthed(true); } else setBad(true); }} className="w-full max-w-xs space-y-4 text-center">
          <div className="flex justify-center"><Logo size={72} /></div>
          <h1 className="font-display text-3xl">Panel de Chido's</h1>
          <input type="password" inputMode="numeric" autoFocus value={pin} onChange={(e) => { setPin(e.target.value); setBad(false); }} placeholder="PIN" aria-label="PIN" className={`${field} text-center text-lg tracking-widest`} />
          {bad && <p className="text-sm text-fire">PIN incorrecto.</p>}
          <button className="w-full rounded-xl bg-gold py-3 font-bold text-bg">Ingresar</button>
        </form>
      </main>
    );
  }
  return (
    <div className="mx-auto max-w-7xl p-4">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <Logo size={40} /><h1 className="font-display text-3xl">Admin</h1>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isSupabase ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>
          <span className={`h-2 w-2 rounded-full ${isSupabase ? "bg-green-400" : "bg-amber-400"}`} />
          {isSupabase ? "Supabase Conectado" : "Modo Local (Listo para Supabase)"}
        </span>
        <nav className="flex gap-2 overflow-x-auto" aria-label="Secciones">
          {tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} aria-current={tab === id} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? "bg-gold text-bg" : "bg-surface text-muted"}`}>{label}</button>)}
        </nav>
        <button className="ml-auto text-sm text-muted underline" onClick={() => { sessionStorage.removeItem("chidos:admin"); setAuthed(false); setPin(""); }}>Salir</button>
      </header>
      {tab === "orders" && <OrdersTab />}{tab === "menu" && <MenuTab />}{tab === "config" && <ConfigTab />}
    </div>
  );
}
