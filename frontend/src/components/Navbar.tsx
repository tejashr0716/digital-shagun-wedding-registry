"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Heart, LayoutDashboard, MonitorPlay, LogIn, LogOut, Menu, X, Gift } from "lucide-react";
import { getAuthToken, removeAuthToken } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
  }, [pathname]);

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#ECEAE5]">
      {/* Top micro-announcement bar (Zola signature) */}
      <div className="bg-[#284B43] text-white text-[11px] font-medium tracking-wide py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <span>✨ The 0% Cash Fund Fee Guarantee: Couples receive 100% of their wedding blessings.</span>
        <span className="hidden sm:inline opacity-60">•</span>
        <span className="hidden sm:inline opacity-90 underline cursor-pointer">Learn How</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.08em] text-[#1A1A1A] group-hover:opacity-80 transition-opacity">
                ZOLA
              </span>
              <span className="text-rose-500 font-serif text-xl tracking-tight">♡♡</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#4A4A4A]">
              <Link
                href="/w/priya-and-rohit"
                className={`hover:text-[#1A1A1A] transition-colors pb-1 border-b-2 ${
                  pathname.startsWith("/w/priya-and-rohit") && !pathname.includes("/live")
                    ? "border-[#1A1A1A] text-[#1A1A1A]"
                    : "border-transparent"
                }`}
              >
                Couple Registry
              </Link>

              <Link
                href="/w/priya-and-rohit/live"
                className={`hover:text-[#1A1A1A] transition-colors pb-1 border-b-2 ${
                  pathname.includes("/live") ? "border-[#1A1A1A] text-[#1A1A1A]" : "border-transparent"
                }`}
              >
                Venue Kiosk
              </Link>

              <Link
                href="/setup"
                className="hover:text-[#1A1A1A] transition-colors pb-1 border-b-2 border-transparent"
              >
                Create Registry
              </Link>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              href="/w/priya-and-rohit"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#595959] hover:text-[#1A1A1A] transition-colors px-3 py-2 rounded-full hover:bg-gray-50"
            >
              <Search className="w-3.5 h-3.5" />
              Find a Couple
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black shadow-xs transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Organizer Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[#757575] hover:text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Couple Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#ECEAE5] bg-white px-5 py-5 space-y-3">
          <Link
            href="/w/priya-and-rohit"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2 text-sm font-semibold text-[#1A1A1A]"
          >
            <Gift className="w-4 h-4 text-[#284B43]" />
            Priya &amp; Rohit Registry
          </Link>

          <Link
            href="/w/priya-and-rohit/live"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2 text-sm font-semibold text-[#1A1A1A]"
          >
            <MonitorPlay className="w-4 h-4 text-amber-600" />
            Live Reception Stream
          </Link>

          <Link
            href="/setup"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2 text-sm font-semibold text-[#1A1A1A]"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            Create Your Registry
          </Link>

          <div className="pt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-3 text-center text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] rounded-full"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full py-2 text-center text-xs font-bold text-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 text-center text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] rounded-full"
              >
                Couple Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
