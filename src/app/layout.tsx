import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { getShop, getCart } from "@/lib/shopify/client";
import { TAGS } from "@/lib/shopify/cache-tags";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import HydrationMarker from "@/components/layout/HydrationMarker";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShop();
  return {
    title: { template: `%s | ${shop.name}`, default: shop.name },
    description: shop.description ?? undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const initialCart = cartId ? await getCart(cartId, [TAGS.cart]) : null;
  const annDismissed = cookieStore.get("ann-dismissed")?.value === "1";

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <HydrationMarker />
        <CartProvider initialCart={initialCart}>
          <AnnouncementBar dismissed={annDismissed} />
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
