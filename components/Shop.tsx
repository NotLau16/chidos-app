"use client";
import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Search, ShoppingBag, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatARS, formatOrderNumber, itemTotal } from "@/lib/format";
import type { CartItem, CategoryId, Order, OrderStatus, Product } from "@/types";
import Logo from "./Logo";
import ProductModal from "./ProductModal";
import CartDrawer from "./CartDrawer";
import { InstagramIcon, WhatsAppIcon } from "./Icons";

const STATUS_INFO: Record<OrderStatus, { label: string; badge: string }> = {
  new: { label: "Recibido en cocina ⏱️", badge: "bg-gold/20 text-gold border-gold/40" },
  preparing: { label: "En preparación 👨‍🍳", badge: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
  ready: { label: "¡Listo / En camino! 🛵", badge: "bg-green-500/20 text-green-400 border-green-500/40" },
  delivered: { label: "Entregado 😋", badge: "bg-line text-muted border-line" },
  cancelled: { label: "Cancelado", badge: "bg-fire/20 text-fire border-fire/40" },
};

const CATS: { id: CategoryId; label: string }[] = [
  { id: "desmechados", label: "Desmechados 🤤" },
  { id: "burgers", label: "Burgers 😋" },
  { id: "milas", label: "Milas 🥰" },
  { id: "lomitos", label: "Lomitos 😍" },
  { id: "papas", label: "Papas 🍟" },
  { id: "bebidas", label: "Bebidas 🥤" },
];

export default function Shop() {
  const { state } = useStore();
  const { settings, products, promos, addons, sauces } = state;
  const [cat, setCat] = useState<CategoryId>("desmechados");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chidos:last_order");
      if (saved) setLastOrderId(saved);
    } catch {}
  }, [state.orders]);

  const activeOrder = useMemo(() => {
    if (!lastOrderId) return null;
    return state.orders.find((o) => o.id === lastOrderId) ?? null;
  }, [lastOrderId, state.orders]);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + itemTotal(i), 0);
  const term = q.trim().toLowerCase();

  const list = useMemo(
    () => products.filter((p) => (term ? `${p.name} ${p.description}`.toLowerCase().includes(term) : p.category === cat)),
    [products, term, cat],
  );

  return (
    <div className="min-h-dvh text-white pb-32">
      {/* Top Banner Operativo */}
      <div className="border-b border-line/60 bg-surface/90 text-xs text-muted backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gold" />
              <span>{settings.address}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-gold" />
              <span>Horarios: <b>{settings.hours}</b> · Delivery: <b>{settings.deliveryEta}</b> · Retiro: <b>{settings.takeawayEta}</b></span>
            </span>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-gold">
              <WhatsAppIcon />
              <span>+54 9 387 313-9696</span>
            </a>
            <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-gold">
              <InstagramIcon />
              <span>@{settings.instagram}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Header Sticky con Marca, Categorías y Carrito */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-3">
              <Logo size={46} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl tracking-wide sm:text-3xl lg:text-4xl">Chido's Street Food</h1>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${settings.isOpen ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-fire/15 text-fire border border-fire/30"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${settings.isOpen ? "bg-green-400" : "bg-fire"}`} />
                    {settings.isOpen ? "ABIERTO AHORA" : "CERRADO"}
                  </span>
                </div>
                <p className="hidden text-xs text-muted sm:block">Sandwichería & Hamburguesería · Salta Capital</p>
              </div>
            </div>

            {/* Carrito en Header (Visible y optimizado para móvil, tablet y PC) */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrito, ${count} productos`}
              className="group relative flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-3 transition hover:border-gold hover:bg-surface2 active:scale-95 sm:px-4 sm:py-2.5">
              <div className="relative">
                <ShoppingBag size={22} className="text-gold transition group-hover:scale-110" />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-fire px-1 text-[11px] font-bold text-white shadow">
                    {count}
                  </span>
                )}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs text-muted">Mi pedido</p>
                <p className="text-sm font-bold text-gold">{count > 0 ? formatARS(subtotal) : "Vacío"}</p>
              </div>
            </button>
          </div>

          {/* Navegación por Categorías */}
          <nav className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap" aria-label="Categorías">
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCat(c.id); setQ(""); }}
                aria-current={!term && cat === c.id}
                className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition active:scale-95 ${!term && cat === c.id ? "bg-gold text-bg shadow-md shadow-gold/20 font-bold" : "border border-line bg-surface text-muted hover:border-gold/40 hover:text-white"}`}>
                {c.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido Principal Adaptativo */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Aviso de Local Cerrado */}
        {!settings.isOpen && (
          <div className="mt-4 rounded-2xl border border-fire/40 bg-fire/10 p-4 text-center text-sm font-medium text-fire shadow-sm">
            Estamos cerrados por el momento. Podés recorrer nuestro menú y volver cuando abramos para hacer tu pedido.
          </div>
        )}

        {/* Banner de Seguimiento en Vivo del Pedido del Cliente */}
        {activeOrder && activeOrder.status !== "delivered" && activeOrder.status !== "cancelled" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 shadow-lg shadow-black/40">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-gold"></span>
              </span>
              <div>
                <p className="text-xs text-muted">
                  Seguimiento de tu pedido: <b className="text-white">{formatOrderNumber(activeOrder.number)}</b> ({activeOrder.mode === "delivery" ? "Delivery" : "Take Away"})
                </p>
                <p className="text-sm font-bold text-gold">{STATUS_INFO[activeOrder.status]?.label}</p>
              </div>
            </div>
            <button
              onClick={() => { setViewOrder(activeOrder); setCartOpen(true); }}
              className="rounded-xl border border-gold bg-gold/10 px-4 py-2 text-xs font-bold text-gold transition hover:bg-gold hover:text-bg active:scale-95">
              Ver comanda en vivo
            </button>
          </div>
        )}

        {/* Carrusel / Grilla de Promociones Destacadas */}
        <section className="pt-6" aria-label="Promociones">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl text-gold sm:text-3xl">Promociones del Día</h2>
            <span className="text-xs text-muted">Aprovechá antes de que se agoten</span>
          </div>

          <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {promos.map((pr) => {
              const prod = products.find((p) => p.id === pr.productId);
              return (
                <button
                  key={pr.id}
                  disabled={!prod || prod.paused}
                  onClick={() => prod && setSelected(prod)}
                  className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-surface2 via-surface to-surface p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/10 active:scale-[.99] disabled:opacity-50 md:w-auto md:shrink">
                  <span className="absolute right-4 top-4 rounded-lg bg-fire px-2.5 py-1 text-xs font-bold text-white shadow">
                    {pr.badge}
                  </span>
                  <p className="font-display text-3xl leading-none text-gold transition group-hover:text-gold-soft">{pr.title}</p>
                  <p className="mt-2 text-sm text-muted">{pr.subtitle}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3">
                    {prod && <p className="text-xl font-bold text-white">{formatARS(prod.price)}</p>}
                    <span className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold transition group-hover:bg-gold group-hover:text-bg">
                      Pedir promo →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Buscador de Menú */}
        <div className="pt-6">
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-1 transition focus-within:border-gold focus-within:shadow-md focus-within:shadow-gold/10">
            <Search size={20} className="text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar hamburguesa, sándwich, papas, bebidas..."
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="Limpiar búsqueda"
                className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-white transition">
                <X size={18} />
              </button>
            )}
          </label>
        </div>

        {/* Catálogo Adaptativo en Grilla (1 col en móvil, 2 en tablet, 3 en desktop) */}
        <main className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl capitalize text-white sm:text-3xl">
              {term ? `Resultados para “${q}”` : CATS.find((c) => c.id === cat)?.label}
            </h2>
            <span className="text-xs text-muted">{list.length} {list.length === 1 ? "producto" : "productos"}</span>
          </div>

          {list.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface py-16 text-center text-muted">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 text-base">No encontramos productos coincidentes con “<b>{q}</b>”.</p>
              <button onClick={() => setQ("")} className="mt-3 text-sm font-semibold text-gold underline">
                Ver todo el menú
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <button
                  key={p.id}
                  disabled={p.paused}
                  onClick={() => setSelected(p)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-4 text-left transition-all duration-200 hover:border-gold/60 hover:bg-surface2/60 hover:shadow-xl hover:shadow-black/50 active:scale-[.99] ${p.paused ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                  
                  {/* Encabezado del producto: Foto/Emoji + Info */}
                  <div className="flex gap-4 items-start">
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-[#141414] transition-transform duration-200 group-hover:scale-105 border border-line/60 shadow-inner">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{
                            objectPosition: p.category === "bebidas" ? "center center" : "center 65%",
                          }}
                          className={`absolute inset-0 h-full w-full ${
                            p.category === "bebidas"
                              ? "object-contain p-2.5 bg-white/5"
                              : "object-cover"
                          }`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl">
                          {p.emoji}
                        </div>
                      )}
                      {p.paused && (
                        <span className="absolute inset-x-0 bottom-0 z-10 bg-fire py-0.5 text-center text-[10px] font-bold text-white uppercase tracking-wider">
                          Sin stock
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg transition-colors group-hover:text-gold line-clamp-1">{p.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted">{p.description}</p>
                      {p.hasSauces && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold">
                          🍟 Con papas sazonadas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pie de tarjeta: Precio y Botón CTA */}
                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                    <p className="font-bold text-lg text-gold">{formatARS(p.price)}</p>
                    <span className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold transition-colors group-hover:bg-gold group-hover:text-bg">
                      {p.paused ? "Agotado" : "Pedir +"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>

        {/* Footer Responsivo Completo */}
        <footer className="mt-16 border-t border-line pt-10 text-muted">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <Logo size={40} />
                <span className="font-display text-2xl text-gold">Chido's Street Food</span>
              </div>
              <p className="mt-2 text-sm">"Sabor que te eleva" · Las mejores hamburguesas y sándwiches de Salta Capital.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white">Ubicación & Horarios</h4>
              <p className="mt-2 text-sm">{settings.address}</p>
              <p className="mt-1 text-sm">Delivery: {settings.deliveryEta} · Take Away: {settings.takeawayEta}</p>
            </div>

            <div>
              <h4 className="font-semibold text-white">Contacto Directo</h4>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
                  <WhatsAppIcon /> +54 9 387 313-9696
                </a>
                <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
                  <InstagramIcon /> @{settings.instagram}
                </a>
                <a href="/admin" className="mt-2 text-xs text-muted/70 hover:text-gold underline">
                  Acceso Administración / Cocina →
                </a>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-line/40 py-6 text-center text-xs text-muted/60">
            © {new Date().getFullYear()} Chido's Street Food. Todos los derechos reservados.
          </p>
        </footer>
      </div>

      {/* Botón Flotante de Carrito en Móvil */}
      {count > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4 sm:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-gold px-5 py-4 font-bold text-bg shadow-2xl shadow-black transition active:scale-[.98]">
            <span>Ver pedido ({count})</span>
            <span>{formatARS(subtotal)}</span>
          </button>
        </div>
      )}

      {/* Botón Flotante de Carrito en Tablet / Escritorio */}
      {count > 0 && !cartOpen && (
        <div className="fixed bottom-6 right-6 z-30 hidden sm:block">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 rounded-2xl bg-gold px-6 py-4 font-bold text-bg shadow-2xl shadow-black/80 transition hover:scale-105 active:scale-95">
            <ShoppingBag size={22} />
            <span>Ver pedido ({count})</span>
            <span className="border-l border-bg/30 pl-3">{formatARS(subtotal)}</span>
          </button>
        </div>
      )}

      {/* Modales y Drawers Responsivos */}
      {selected && (
        <ProductModal
          key={selected.id}
          product={selected}
          addons={addons}
          sauces={sauces}
          onClose={() => setSelected(null)}
          onAdd={(item) => setCart([...cart, item])}
        />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => { setCartOpen(false); setViewOrder(null); }}
        cart={cart}
        setCart={setCart}
        viewOrder={viewOrder}
      />
    </div>
  );
}
