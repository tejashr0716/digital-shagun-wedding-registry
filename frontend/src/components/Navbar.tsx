"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Announcement Bar – Joy Royal Indigo */}
      <div className="bg-[#5331C6] text-white text-[11px] font-medium py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Product switcher */}
          <div className="hidden sm:flex items-center gap-5 text-white/80">
            <span className="text-white font-semibold cursor-pointer hover:text-white transition-colors">Joy Wedding</span>
            <span className="cursor-pointer hover:text-white transition-colors">Joy Baby</span>
            <span className="cursor-pointer hover:text-white transition-colors">Joy Events</span>
            <span className="cursor-pointer hover:text-white transition-colors">Joy Pro</span>
          </div>
          <div className="sm:hidden text-white/90 font-semibold">Joy Wedding</div>
          {/* Right side */}
          <div className="flex items-center gap-4 text-white/80">
            <span className="cursor-pointer hover:text-white underline underline-offset-2 transition-colors hidden sm:inline">Find an Event</span>
            <span className="bg-white/20 text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide">0% Cash Fund Fees</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <span className="text-2xl">💍</span>
              <span className="font-serif text-lg font-bold tracking-tight text-[#212121]">
                Wedding <span className="text-[#5331C6]">Gift</span> Registry
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#444444]">
              <button className="flex items-center gap-1 hover:text-[#5331C6] transition-colors">
                Plan & Invite <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button className="flex items-center gap-1 hover:text-[#5331C6] transition-colors">
                Registry <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <Link href="/w/priya-and-rohit" className={`hover:text-[#5331C6] transition-colors ${pathname.startsWith("/w/") ? "text-[#5331C6] font-semibold" : ""}`}>
                Cash Funds
              </Link>
              <button className="flex items-center gap-1 hover:text-[#5331C6] transition-colors">
                Expert Advice <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right CTAs */}
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/auth" className="px-5 py-2 text-sm font-semibold text-[#5331C6] border border-[#5331C6] rounded-full hover:bg-[#5331C6]/5 transition-colors">
                Log in
              </Link>
              <Link href="/setup" className="px-5 py-2 text-sm font-semibold text-white bg-[#5331C6] rounded-full hover:bg-[#4225a8] transition-colors shadow-sm">
                Get Started
              </Link>
            </div>

            {/* Mobile burger */}
            <button className="sm:hidden p-2 rounded-lg text-[#444444]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-3">
            {["Plan & Invite", "Registry", "Cash Funds", "Expert Advice"].map((item) => (
              <div key={item} className="py-2 text-sm font-medium text-[#444444] border-b border-gray-50 cursor-pointer hover:text-[#5331C6]">
                {item}
              </div>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center text-sm font-semibold text-[#5331C6] border border-[#5331C6] rounded-full">
                Log in
              </Link>
              <Link href="/setup" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#5331C6] rounded-full">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
