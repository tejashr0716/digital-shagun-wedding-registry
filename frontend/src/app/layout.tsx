import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZOLA • Modern Wedding Registry & Cash Funds",
  description: "The modern wedding registry designed for real life. Register for experiential honeymoon cash funds, home down payment milestones, and thoughtful blessings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] antialiased selection:bg-[#284B43] selection:text-white font-sans">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
