const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
export const formatARS = (n: number) => ars.format(n);
export const formatOrderNumber = (n: number) => `#${String(n).padStart(3, "0")}`;
export const itemTotal = (i: { unitPrice: number; qty: number; addons: { price: number }[] }) =>
  (i.unitPrice + i.addons.reduce((s, a) => s + a.price, 0)) * i.qty;
export const waLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
