"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, Gift, QrCode, LayoutDashboard, MonitorPlay, LogIn, LogOut, Menu, X } from "lucide-react";
import { getAuthToken, removeAuthToken } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-gray-900 group-hover:text-rose-600 transition-colors">
                  ShagunRegistry
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-rose-500">
                  Modern Wedding Gifts
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-4">
            <Link
              href="/w/priya-and-rohit"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Gift className="w-4 h-4 text-rose-500" />
              Demo Registry
            </Link>

            <Link
              href="/w/priya-and-rohit/live"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <MonitorPlay className="w-4 h-4 text-amber-600" />
              Reception Kiosk
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-rose-500" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/qr-kit"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-rose-500" />
                  QR Kit
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 hover:shadow-lg transition-all"
              >
                <LogIn className="w-4 h-4" />
                Couple Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-rose-600 hover:bg-rose-50 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rose-100 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/w/priya-and-rohit"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-rose-50"
          >
            <Gift className="w-5 h-5 text-rose-500" />
            Live Demo Registry
          </Link>
          <Link
            href="/w/priya-and-rohit/live"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-amber-700 bg-amber-50"
          >
            <MonitorPlay className="w-5 h-5 text-amber-600" />
            Venue Kiosk Mode
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-rose-50"
              >
                <LayoutDashboard className="w-5 h-5 text-rose-500" />
                Couple Dashboard
              </Link>
              <Link
                href="/dashboard/qr-kit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-rose-50"
              >
                <QrCode className="w-5 h-5 text-rose-500" />
                Invitation QR Kit
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-base font-semibold text-white bg-rose-600"
            >
              <LogIn className="w-5 h-5" />
              Couple Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
