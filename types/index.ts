export type CategoryId = "desmechados" | "burgers" | "milas" | "lomitos" | "papas" | "bebidas";
export type OrderMode = "delivery" | "takeaway";
export type PayMethod = "cash" | "transfer";
export type OrderStatus = "new" | "preparing" | "ready" | "delivered" | "cancelled";

export interface Addon { id: string; name: string; price: number }

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  emoji: string;
  image?: string;          // URL de imagen real (S3 o local)
  paused: boolean;         // true => "Sin stock"
  addonIds: string[];      // adicionales pagos disponibles
  removables: string[];    // "Sin cargo": sin cebolla, sin tomate...
  hasSauces?: boolean;     // si permite elegir aderezos/salsas sin cargo
}

export interface Promo { id: string; title: string; subtitle: string; badge: string; productId: string }
export interface DeliveryZone { id: string; name: string; fee: number }

export interface CartItem {
  uid: string;
  productId: string;
  name: string;
  unitPrice: number;       // precio base del producto
  qty: number;
  addons: Addon[];
  sauces?: string[];       // salsas sin cargo elegidas
  removed: string[];
  note?: string;
}

export interface Order {
  id: string;
  number: number;          // se muestra como #001 con formatOrderNumber()
  createdAt: string;       // ISO
  status: OrderStatus;
  mode: OrderMode;
  source: "web" | "manual";
  customer: { name: string; phone: string };
  address?: { zoneId: string; zoneName: string; street: string; reference?: string };
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: { method: PayMethod; cashGiven?: number; change?: number };
}
export type OrderDraft = Omit<Order, "id" | "number" | "createdAt" | "status">;

export interface Settings {
  isOpen: boolean;
  transferAlias: string;
  transferCbu: string;
  transferCuit: string;
  transferHolder: string;
  zones: DeliveryZone[];
  deliveryEta: string;
  takeawayEta: string;
  address: string;
  whatsapp: string;        // solo dígitos, formato wa.me
  instagram: string;
  adminPin: string;
  hours: string;
}

export interface StoreState {
  products: Product[];
  addons: Addon[];
  sauces: string[];
  promos: Promo[];
  orders: Order[];
  settings: Settings;
  orderCounter: number;
  rev: number;             // versión para sincronizar entre pestañas
}
