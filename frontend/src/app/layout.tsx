import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShagunRegistry | Goal-Based Wedding Gift & Crowdfunding Platform",
  description: "Modernizing traditional wedding gifting and shagun via goal-based milestone crowdfunding, dynamic QR invitation kits, and venue reception tickers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#faf8f6]`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
