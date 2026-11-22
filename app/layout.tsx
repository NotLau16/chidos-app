import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "Chido's Street Food | Sabor que te eleva",
  description: "Sandwichería & Hamburguesería en Salta. Pedí online para delivery o take away.",
};
export const viewport: Viewport = { themeColor: "#0A0A0A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${body.variable} ${display.variable}`}>
      <body className="bg-bg text-white antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
