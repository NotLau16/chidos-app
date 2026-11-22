"use client";
import { useEffect, useState } from "react";
import { Banknote, Check, Copy, Landmark, Minus, Plus, Store, Truck, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatARS, formatOrderNumber, itemTotal, waLink } from "@/lib/format";
import { WhatsAppIcon } from "./Icons";
import type { CartItem, Order, OrderMode, PayMethod } from "@/types";

const field = "w-full rounded-xl border border-line bg-surface2 p-3 text-sm outline-none focus:border-gold";

function Choice({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${active ? "border-gold bg-gold/10 text-gold" : "border-line bg-surface2 text-muted hover:border-gold/30"}`}>
      {icon}{label}
    </button>
  );
}

export default function CartDrawer({ open, onClose, cart, setCart, viewOrder }: {
  open: boolean; onClose: () => void; cart: CartItem[]; setCart: (c: CartItem[]) => void; viewOrder?: Order | null;
}) {
  const { state, addOrder } = useStore();
  const { settings } = state;
  const [mode, setMode] = useState<OrderMode>("delivery");
  const [zoneId, setZoneId] = useState("");
  const [street, setStreet] = useState("");
  const [reference, setReference] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pay, setPay] = useState<PayMethod>("cash");
  const [given, setGiven] = useState("");
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);
  const [done, setDone] = useState<Order | null>(viewOrder ?? null);

  useEffect(() => {
    if (viewOrder) setDone(viewOrder);
  }, [viewOrder]);

  if (!open) return null;

  const zone = settings.zones.find((z) => z.id === zoneId);
  const subtotal = cart.reduce((s, i) => s + itemTotal(i), 0);
  const fee = mode === "delivery" ? zone?.fee ?? 0 : 0;
  const total = subtotal + fee;
  const givenNum = Number(given.replace(/\D/g, "")) || 0;
  const change = pay === "cash" ? Math.max(0, givenNum - total) : 0;

  const problem =
    !settings.isOpen ? "El local está cerrado por ahora" :
    cart.length === 0 ? "Tu pedido está vacío" :
    !name.trim() || phone.replace(/\D/g, "").length < 8 ? "Completá tu nombre y WhatsApp" :
    mode === "delivery" && (!zone || !street.trim()) ? "Elegí tu zona y escribí la dirección exacta" :
    pay === "cash" && givenNum < total ? "Indicá con cuánto abonás (mínimo el total)" : "";

  const setQty = (uid: string, d: number) =>
    setCart(cart.map((i) => (i.uid === uid ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));

  const confirm = () => {
    if (problem) return;
    const order = addOrder({
      mode, source: "web", customer: { name: name.trim(), phone: phone.trim() },
      address: mode === "delivery" && zone ? { zoneId: zone.id, zoneName: zone.name, street: street.trim(), reference: reference.trim() || undefined } : undefined,
      items: cart, subtotal, deliveryFee: fee, total,
      payment: pay === "cash" ? { method: "cash", cashGiven: givenNum, change } : { method: "transfer" },
    });
    setDone(order);
    setCart([]);
    try { localStorage.setItem("chidos:last_order", order.id); } catch {}
  };

  const copyAlias = async () => {
    try { await navigator.clipboard.writeText(settings.transferAlias); setCopiedAlias(true); setTimeout(() => setCopiedAlias(false), 2000); } catch {}
  };

  const copyCbu = async () => {
    try { await navigator.clipboard.writeText(settings.transferCbu || ""); setCopiedCbu(true); setTimeout(() => setCopiedCbu(false), 2000); } catch {}
  };

  const waText = (o: Order) => [
    `Hola Chido's! Pedido ${formatOrderNumber(o.number)} (${o.mode === "delivery" ? "Delivery" : "Take Away"})`,
    ...o.items.map((i) => {
      const parts = [`• ${i.qty}x ${i.name}`];
      if (i.addons.length) parts.push(`+ ${i.addons.map((a) => a.name).join(", ")}`);
      if (i.sauces?.length) parts.push(`[Salsas: ${i.sauces.join(", ")}]`);
      if (i.removed.length) parts.push(`(${i.removed.join(", ")})`);
      if (i.note) parts.push(`"Nota: ${i.note}"`);
      return parts.join(" ");
    }),
    o.address ? `Dirección: ${o.address.street} (${o.address.zoneName})${o.address.reference ? ` - Ref: ${o.address.reference}` : ""}` : `Retiro: ${settings.address}`,
    `Total: ${formatARS(o.total)} - ${o.payment.method === "cash" ? "Efectivo" : "Transferencia"}`,
    `A nombre de: ${o.customer.name} (Tel: ${o.customer.phone})`,
  ].join("\n");

  const close = () => { setDone(null); onClose(); };

  return (
    <div className="fixed inset-0 z-50 bg-black/75" onClick={close}>
      <aside role="dialog" aria-modal="true" aria-label="Tu pedido" onClick={(e) => e.stopPropagation()}
        style={{ animation: "drawer .25s ease-out" }}
        className="ml-auto flex h-full w-full max-w-md sm:max-w-lg md:max-w-xl flex-col border-l border-line bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-line p-4 sm:p-5">
          <h2 className="font-display text-3xl">{done ? "¡Pedido recibido!" : "Tu pedido"}</h2>
          <button onClick={close} aria-label="Cerrar" className="rounded-full p-2 text-muted hover:bg-surface2 transition"><X size={20} /></button>
        </header>

        {done ? (
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center shadow-lg">
              <p className="text-sm text-muted">Tu número de comanda</p>
              <p className="font-display text-6xl text-gold">{formatOrderNumber(done.number)}</p>
              <p className="mt-1 font-semibold text-sm">{done.mode === "delivery" ? `Delivery estimado: ${settings.deliveryEta}` : `Retiro estimado: ${settings.takeawayEta}`}</p>
            </div>
            
            <ul className="space-y-2.5 text-sm">
              {done.items.map((i) => (
                <li key={i.uid} className="rounded-xl border border-line bg-surface2/60 p-3">
                  <div className="flex justify-between font-semibold">
                    <span>{i.qty}x {i.name}</span>
                    <span className="text-gold">{formatARS(itemTotal(i))}</span>
                  </div>
                  {i.addons.length > 0 && <p className="text-xs text-muted">+ {i.addons.map((a) => a.name).join(", ")}</p>}
                  {i.sauces && i.sauces.length > 0 && <p className="text-xs text-gold">Salsas: {i.sauces.join(", ")}</p>}
                  {i.removed.length > 0 && <p className="text-xs font-semibold text-fire">{i.removed.join(" · ")}</p>}
                  {i.note && <p className="text-xs italic text-muted">“{i.note}”</p>}
                </li>
              ))}
              {done.deliveryFee > 0 && (
                <li className="flex justify-between text-muted px-2"><span>Costo de envío</span><span>{formatARS(done.deliveryFee)}</span></li>
              )}
              <li className="flex justify-between border-t border-line pt-3 px-2 text-lg font-bold">
                <span>Total a pagar</span>
                <span className="text-gold">{formatARS(done.total)}</span>
              </li>
            </ul>

            {done.payment.method === "transfer" && (
              <div className="rounded-2xl border border-gold/30 bg-surface2 p-4 text-sm space-y-2">
                <p className="font-semibold text-gold">Datos para transferir:</p>
                <p className="text-xs text-muted">Titular: <b>{settings.transferHolder}</b> (CUIT: {settings.transferCuit})</p>
                <div className="flex items-center justify-between gap-2 border-t border-line/60 pt-2">
                  <div>
                    <p className="text-xs text-muted">Alias</p>
                    <p className="font-bold text-gold text-base">{settings.transferAlias}</p>
                  </div>
                  <button onClick={copyAlias} className="flex items-center gap-1.5 rounded-lg border border-gold px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10">
                    {copiedAlias ? <Check size={14} /> : <Copy size={14} />} {copiedAlias ? "Copiado" : "Copiar"}
                  </button>
                </div>
                {settings.transferCbu && (
                  <div className="flex items-center justify-between gap-2 border-t border-line/60 pt-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted">CBU</p>
                      <p className="font-mono text-xs truncate">{settings.transferCbu}</p>
                    </div>
                    <button onClick={copyCbu} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-white hover:border-gold">
                      {copiedCbu ? <Check size={14} /> : <Copy size={14} />} {copiedCbu ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted/80 pt-1">Por favor, enviá el comprobante al WhatsApp del local para iniciar la preparación.</p>
              </div>
            )}

            {done.payment.method === "cash" && !!done.payment.change && (
              <div className="rounded-xl border border-line bg-surface2 p-3 text-sm">
                <p className="text-muted">Abonás con: <b>{formatARS(done.payment.cashGiven ?? 0)}</b></p>
                <p className="text-gold font-bold">Vuelto a preparar: {formatARS(done.payment.change)}</p>
              </div>
            )}

            <a href={waLink(settings.whatsapp, waText(done))} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-bold text-black shadow-lg shadow-[#25D366]/20 transition hover:brightness-110 active:scale-95">
              <WhatsAppIcon /> Enviar resumen por WhatsApp al local
            </a>
            <button onClick={close} className="w-full rounded-xl bg-surface2 py-3 font-semibold text-white border border-line hover:border-gold">
              Volver al menú
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center text-muted">
            <div>
              <p className="text-5xl mb-3">🛒</p>
              <p className="text-base font-semibold text-white">Tu carrito está vacío</p>
              <p className="text-xs text-muted mt-1">Elegí tus desmechados, burgers o sándwiches favoritos del menú.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {/* Lista de ítems en carrito */}
              <ul className="space-y-3">
                {cart.map((i) => (
                  <li key={i.uid} className="rounded-xl border border-line bg-surface2 p-3.5">
                    <div className="flex justify-between gap-3">
                      <p className="font-semibold text-white">{i.name}</p>
                      <p className="font-semibold text-gold">{formatARS(itemTotal(i))}</p>
                    </div>
                    {i.addons.length > 0 && <p className="text-xs text-muted mt-0.5">+ {i.addons.map((a) => a.name).join(", ")}</p>}
                    {i.sauces && i.sauces.length > 0 && <p className="text-xs text-gold mt-0.5">Salsas: {i.sauces.join(", ")}</p>}
                    {i.removed.length > 0 && <p className="text-xs font-semibold text-fire mt-0.5">{i.removed.join(" · ")}</p>}
                    {i.note && <p className="text-xs italic text-muted mt-0.5">“{i.note}”</p>}
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-line bg-surface">
                        <button onClick={() => setQty(i.uid, -1)} aria-label="Menos" className="p-2 hover:text-gold transition"><Minus size={14} /></button>
                        <span className="w-7 text-center text-sm font-bold tabular-nums">{i.qty}</span>
                        <button onClick={() => setQty(i.uid, 1)} aria-label="Más" className="p-2 hover:text-gold transition"><Plus size={14} /></button>
                      </div>
                      <span className="text-xs text-muted">{formatARS(i.unitPrice)} c/u</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Modalidad: Delivery o Take Away */}
              <section className="space-y-3">
                <h3 className="font-semibold text-sm sm:text-base">¿Cómo querés recibir tu pedido?</h3>
                <div className="flex gap-2">
                  <Choice active={mode === "delivery"} onClick={() => setMode("delivery")} icon={<Truck size={18} />} label="Delivery" />
                  <Choice active={mode === "takeaway"} onClick={() => setMode("takeaway")} icon={<Store size={18} />} label="Take Away (Retiro)" />
                </div>
                {mode === "delivery" ? (
                  <div className="space-y-2 pt-1">
                    <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={field} aria-label="Zona de entrega">
                      <option value="">Elegí tu zona en Salta</option>
                      {settings.zones.map((z) => <option key={z.id} value={z.id}>{z.name} · {formatARS(z.fee)}</option>)}
                    </select>
                    <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Dirección exacta (calle, número, barrio/manzana)" className={field} />
                    <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Referencia (ej: portón negro, timbre 2B)" className={field} />
                  </div>
                ) : (
                  <div className="rounded-xl border border-line bg-surface2 p-3 text-xs sm:text-sm text-muted">
                    Retirás sin costo en: <b className="text-white">{settings.address}</b>.
                  </div>
                )}
              </section>

              {/* Datos del Cliente */}
              <section className="space-y-3">
                <h3 className="font-semibold text-sm sm:text-base">Tus datos de contacto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y Apellido" autoComplete="name" className={field} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono WhatsApp (ej: 387...)" inputMode="tel" autoComplete="tel" className={field} />
                </div>
              </section>

              {/* Medio de Pago */}
              <section className="space-y-3">
                <h3 className="font-semibold text-sm sm:text-base">Medio de pago</h3>
                <div className="flex gap-2">
                  <Choice active={pay === "cash"} onClick={() => setPay("cash")} icon={<Banknote size={18} />} label="Efectivo" />
                  <Choice active={pay === "transfer"} onClick={() => setPay("transfer")} icon={<Landmark size={18} />} label="Transferencia" />
                </div>
                {pay === "cash" ? (
                  <div className="space-y-1.5 pt-1">
                    <input value={given} onChange={(e) => setGiven(e.target.value)} inputMode="numeric" placeholder="¿Con cuánto abonás? (para calcular el vuelto)" className={field} />
                    {givenNum >= total && total > 0 && (
                      <p className="text-xs text-muted pl-1">Vuelto a preparar: <b className="text-gold font-bold">{formatARS(change)}</b></p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-line bg-surface2 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted">Alias bancario</p>
                        <p className="font-bold text-gold text-base">{settings.transferAlias}</p>
                      </div>
                      <button onClick={copyAlias} className="flex items-center gap-1 rounded-lg border border-gold px-3 py-1.5 font-semibold text-gold hover:bg-gold/10">
                        {copiedAlias ? <Check size={14} /> : <Copy size={14} />} {copiedAlias ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                    {settings.transferCbu && (
                      <div className="flex items-center justify-between border-t border-line/60 pt-2">
                        <div className="min-w-0">
                          <p className="text-muted">CBU</p>
                          <p className="font-mono truncate">{settings.transferCbu}</p>
                        </div>
                        <button onClick={copyCbu} className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-white hover:border-gold">
                          {copiedCbu ? <Check size={14} /> : <Copy size={14} />} {copiedCbu ? "Copiado" : "Copiar"}
                        </button>
                      </div>
                    )}
                    <p className="text-muted/80">Titular: {settings.transferHolder} · CUIT: {settings.transferCuit}</p>
                  </div>
                )}
              </section>
            </div>

            {/* Footer de confirmación */}
            <footer className="space-y-3 border-t border-line p-4 sm:p-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd>{formatARS(subtotal)}</dd></div>
                {mode === "delivery" && (
                  <div className="flex justify-between text-muted"><dt>Envío</dt><dd>{zone ? formatARS(fee) : "Elegí zona"}</dd></div>
                )}
                <div className="flex justify-between text-lg font-bold pt-1 border-t border-line/40">
                  <dt>Total a pagar</dt>
                  <dd className="text-gold">{formatARS(total)}</dd>
                </div>
              </dl>
              {problem && <p className="text-center text-xs font-semibold text-fire">{problem}</p>}
              <button onClick={confirm} disabled={!!problem} className="w-full rounded-2xl bg-gold py-4 font-bold text-bg transition hover:brightness-105 active:scale-[.98] disabled:bg-line disabled:text-muted">
                Confirmar pedido
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
