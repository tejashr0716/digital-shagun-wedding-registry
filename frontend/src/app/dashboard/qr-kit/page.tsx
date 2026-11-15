"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Share2, Copy, Check, Printer, Sparkles, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

export default function QRKitPage() {
  const [wedding, setWedding] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const w = await api.getMyWedding();
        setWedding(w);
      } catch {
        // Fallback to default demo wedding details
      }
    };
    fetchWedding();
  }, []);

  const slug = wedding ? wedding.slug : "priya-and-rohit";
  const bride = wedding ? wedding.bride_name : "Priya";
  const groom = wedding ? wedding.groom_name : "Rohit";
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/w/${slug}` : `https://shagunregistry.in/w/${slug}`;

  const whatsappMessage = `Namaste! We are overjoyed to celebrate our wedding milestones with you. In lieu of traditional physical gifts, your presence and heartfelt blessings are our greatest joy. If you wish to bless our journey, you can visit our digital registry here: ${fullUrl}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 80;
      canvas.height = img.height + 80;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `wedding_qr_${slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-rose-600 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span className="text-xs uppercase tracking-widest font-bold text-rose-500 block">
          Window 5: Physical &amp; Digital Distribution
        </span>
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Invitation QR &amp; Digital Share Kit
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          High-resolution vector QR code engineered for print invitations, venue stands, and WhatsApp sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Printable Invitation Stand Mockup */}
        <div className="bg-gradient-to-b from-rose-50 via-white to-amber-50/40 p-8 rounded-3xl border border-rose-200 shadow-xl flex flex-col items-center text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest uppercase font-bold text-rose-600">
              Reception Table Stand / Invitation Insert
            </span>
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              {bride} &amp; {groom}
            </h2>
            <p className="text-xs text-gray-500 italic">
              Scan to send your blessings &amp; contribute to our milestones
            </p>
          </div>

          <div
            ref={qrRef}
            className="p-6 bg-white rounded-2xl shadow-md border border-rose-100 flex flex-col items-center space-y-3"
          >
            <QRCodeSVG
              id="qr-code-svg"
              value={fullUrl}
              size={220}
              level="H"
              includeMargin={true}
              fgColor="#1f2937"
            />
            <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Scan via UPI, GPay or PhonePe
            </span>
          </div>

          <p className="text-xs font-mono text-gray-600 break-all max-w-sm">
            {fullUrl}
          </p>

          <div className="flex flex-wrap justify-center gap-3 w-full">
            <button
              onClick={downloadQR}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-200 transition-all"
            >
              <Download className="w-4 h-4" /> Download Print PNG
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-white transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Stand Card
            </button>
          </div>
        </div>

        {/* WhatsApp & Digital Share Options */}
        <div className="space-y-6">
          {/* Quick Copy Link */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">Direct Vanity Link</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-gray-50 border border-gray-200 text-gray-800"
              />
              <button
                onClick={copyUrl}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* WhatsApp Pre-composed Invite */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Pre-Composed WhatsApp Invite
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                1-Click Dispatch
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed font-sans">
              {whatsappMessage}
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyWhatsApp}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedMsg ? "Copied Message" : "Copy Template"}
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share on WhatsApp
              </a>
            </div>
          </div>

          {/* Tips Card */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Pro Tip for Indian Weddings:
            </div>
            <p className="leading-relaxed">
              Include the QR code on a small 3x3 inch gold-foil card inserted into your physical wedding invite box, or place acrylic stands at the dinner reception tables next to the live venue projector!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
