import React from "react";
import { Sparkles, ExternalLink, Plane, Home, ShieldCheck } from "lucide-react";

export default function VendorBanners() {
  const vendors = [
    {
      title: "Luxury Honeymoon Escapes — Amalfi & Bali",
      discount: "Flat 15% OFF for ShagunRegistry Couples",
      tag: "Verified Travel Partner",
      icon: Plane,
      color: "from-blue-500 to-indigo-600",
      cta: "Explore Packages",
      link: "https://example.com/affiliate/honeymoon?ref=shagunregistry",
    },
    {
      title: "Smart Living Furniture & Interior Design",
      discount: "Exclusive ₹25,000 Voucher on First Home",
      tag: "Home Décor Partner",
      icon: Home,
      color: "from-amber-500 to-rose-600",
      cta: "Claim Voucher",
      link: "https://example.com/affiliate/home?ref=shagunregistry",
    },
    {
      title: "Razorpay Trusted Payouts & Escrow Security",
      discount: "0% Setup Fee on Linked Bank Disbursements",
      tag: "Banking Infrastructure",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-700",
      cta: "Learn More",
      link: "https://razorpay.com",
    },
  ];

  return (
    <div className="space-y-4 my-8">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        Curated Partner Perks & Affiliate Discounts
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vendors.map((v, idx) => {
          const Icon = v.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {v.tag}
                  </span>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${v.color} text-white shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  {v.title}
                </h4>

                <p className="text-xs font-medium text-emerald-600">
                  {v.discount}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-400 text-[11px]">Affiliate Sponsor</span>
                <a
                  href={v.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"
                >
                  {v.cta}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
