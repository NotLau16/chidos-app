"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { seedState } from "@/data/mockData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Addon, Order, OrderDraft, OrderStatus, Product, Settings, StoreState } from "@/types";

const KEY = "chidos:v2";
const CHANNEL = "chidos-sync";

type Action =
  | { type: "REPLACE"; state: StoreState }               // hidratación o cambio remoto (no sube rev)
  | { type: "ADD_ORDER"; order: Order }
  | { type: "SET_STATUS"; id: string; status: OrderStatus }
  | { type: "DELETE_ORDER"; id: string }
  | { type: "TOGGLE_PAUSE"; id: string }
  | { type: "SET_PRICE"; id: string; price: number }
  | { type: "UPSERT_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; id: string }
  | { type: "UPSERT_ADDON"; addon: Addon }
  | { type: "DELETE_ADDON"; id: string }
  | { type: "SET_SETTINGS"; patch: Partial<Settings> }
  | { type: "RESET" };

const bump = (s: StoreState) => Math.max(s.rev + 1, Date.now()); // rev monotónico: gana el cambio más reciente

function reducer(s: StoreState, a: Action): StoreState {
  switch (a.type) {
    case "REPLACE": return a.state;
    case "ADD_ORDER": {
      if (s.orders.some((o) => o.id === a.order.id)) return s;
      return { ...s, orders: [a.order, ...s.orders], orderCounter: Math.max(s.orderCounter, a.order.number), rev: bump(s) };
    }
    case "SET_STATUS": return { ...s, orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: a.status } : o)), rev: bump(s) };
    case "DELETE_ORDER": return { ...s, orders: s.orders.filter((o) => o.id !== a.id), rev: bump(s) };
    case "TOGGLE_PAUSE": return { ...s, products: s.products.map((p) => (p.id === a.id ? { ...p, paused: !p.paused } : p)), rev: bump(s) };
    case "SET_PRICE": return { ...s, products: s.products.map((p) => (p.id === a.id ? { ...p, price: a.price } : p)), rev: bump(s) };
    case "UPSERT_PRODUCT": {
      const exists = s.products.some((p) => p.id === a.product.id);
      const products = exists ? s.products.map((p) => (p.id === a.product.id ? a.product : p)) : [...s.products, a.product];
      return { ...s, products, rev: bump(s) };
    }
    case "DELETE_PRODUCT": return { ...s, products: s.products.filter((p) => p.id !== a.id), rev: bump(s) };
    case "UPSERT_ADDON": {
      const has = s.addons.some((x) => x.id === a.addon.id);
      return { ...s, addons: has ? s.addons.map((x) => (x.id === a.addon.id ? a.addon : x)) : [...s.addons, a.addon], rev: bump(s) };
    }
    case "DELETE_ADDON": return { ...s, addons: s.addons.filter((x) => x.id !== a.id), rev: bump(s) };
    case "SET_SETTINGS": return { ...s, settings: { ...s.settings, ...a.patch }, rev: bump(s) };
    case "RESET": return { ...seedState, rev: bump(s) };
  }
}

interface Ctx {
  state: StoreState;
  hydrated: boolean;      // false en SSR y primer render => mostrar skeleton y evitar mismatch
  isSupabase: boolean;
  addOrder: (draft: OrderDraft) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  togglePause: (id: string) => void;
  setPrice: (id: string, price: number) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  upsertAddon: (addon: Addon) => void;
  deleteAddon: (id: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
  reset: () => void;
}
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // El primer render usa SIEMPRE el seed (igual en servidor y cliente) => sin errores de hidratación.
  const [state, dispatch] = useReducer(reducer, seedState);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastRev = useRef(seedState.rev);
  const channel = useRef<BroadcastChannel | null>(null);

  const applyRemote = useCallback((incoming: StoreState) => {
    if (incoming.rev > lastRev.current) {
      lastRev.current = incoming.rev;
      dispatch({ type: "REPLACE", state: incoming });
    }
  }, []);

  // 1) Montaje en cliente: leer localStorage y suscribirse a cambios de otras pestañas y Supabase
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as StoreState;
        lastRev.current = saved.rev;
        dispatch({ type: "REPLACE", state: saved });
      }
    } catch { /* storage bloqueado o JSON inválido: seguimos con el seed */ }
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) { try { applyRemote(JSON.parse(e.newValue)); } catch {} }
    };
    window.addEventListener("storage", onStorage);
    if ("BroadcastChannel" in window) {
      channel.current = new BroadcastChannel(CHANNEL);
      channel.current.onmessage = (e) => applyRemote(e.data as StoreState);
    }

    // Suscripción Realtime a Supabase si las credenciales están configuradas
    let supaChannel: any = null;
    if (isSupabaseConfigured && supabase) {
      supaChannel = supabase
        .channel("orders-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const r = payload.new as any;
              const incoming: Order = {
                id: r.id,
                number: Number(r.number),
                createdAt: r.created_at,
                status: r.status,
                mode: r.mode,
                source: r.source ?? "web",
                customer: r.customer,
                address: r.address,
                items: r.items,
                subtotal: Number(r.subtotal),
                deliveryFee: Number(r.delivery_fee ?? 0),
                total: Number(r.total),
                payment: r.payment,
              };
              dispatch({ type: "ADD_ORDER", order: incoming });
            } else if (payload.eventType === "UPDATE") {
              const r = payload.new as any;
              dispatch({ type: "SET_STATUS", id: r.id, status: r.status });
            } else if (payload.eventType === "DELETE") {
              const r = payload.old as any;
              if (r?.id) dispatch({ type: "DELETE_ORDER", id: r.id });
            }
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      channel.current?.close();
      if (supaChannel && supabase) supabase.removeChannel(supaChannel);
    };
  }, [applyRemote]);

  // 2) Persistir y avisar a las demás pestañas solo cuando el cambio fue local
  useEffect(() => {
    if (!hydrated || state.rev === lastRev.current) return;
    lastRev.current = state.rev;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    channel.current?.postMessage(state);
  }, [state, hydrated]);

  const addOrder = useCallback((draft: OrderDraft): Order => {
    const order: Order = {
      ...draft,
      id: crypto.randomUUID(),
      number: stateRef.current.orderCounter + 1,
      createdAt: new Date().toISOString(),
      status: "new",
    };
    dispatch({ type: "ADD_ORDER", order });

    // Sincronizar con Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      supabase.from("orders").insert([{
        id: order.id,
        number: order.number,
        created_at: order.createdAt,
        status: order.status,
        mode: order.mode,
        source: order.source,
        customer: order.customer,
        address: order.address,
        items: order.items,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        total: order.total,
        payment: order.payment,
      }]).then(({ error }) => {
        if (error) console.warn("Supabase insert error:", error.message);
      });
    }

    return order;
  }, []);

  const setStatus = useCallback((id: string, status: OrderStatus) => {
    dispatch({ type: "SET_STATUS", id, status });
    if (isSupabaseConfigured && supabase) {
      supabase.from("orders").update({ status }).eq("id", id).then(({ error }) => {
        if (error) console.warn("Supabase update error:", error.message);
      });
    }
  }, []);

  const deleteOrder = useCallback((id: string) => {
    dispatch({ type: "DELETE_ORDER", id });
    if (isSupabaseConfigured && supabase) {
      supabase.from("orders").delete().eq("id", id).then(({ error }) => {
        if (error) console.warn("Supabase delete error:", error.message);
      });
    }
  }, []);

  const value = useMemo<Ctx>(() => ({
    state, hydrated, isSupabase: isSupabaseConfigured,
    addOrder,
    setStatus,
    deleteOrder,
    togglePause: (id) => dispatch({ type: "TOGGLE_PAUSE", id }),
    setPrice: (id, price) => dispatch({ type: "SET_PRICE", id, price }),
    upsertProduct: (product) => dispatch({ type: "UPSERT_PRODUCT", product }),
    deleteProduct: (id) => dispatch({ type: "DELETE_PRODUCT", id }),
    upsertAddon: (addon) => dispatch({ type: "UPSERT_ADDON", addon }),
    deleteAddon: (id) => dispatch({ type: "DELETE_ADDON", id }),
    setSettings: (patch) => dispatch({ type: "SET_SETTINGS", patch }),
    reset: () => dispatch({ type: "RESET" }),
  }), [state, hydrated, addOrder, setStatus, deleteOrder]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}
