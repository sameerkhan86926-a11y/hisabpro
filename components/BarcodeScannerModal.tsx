"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
};

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: Props) {
  const [torchOn, setTorchOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const scannerId = "interactive-barcode-reader";
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    // Mobile back camera start karein
    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 15, // Smooth detection
          qrbox: { width: 260, height: 160 }, // Horizontal box barcodes ke liye
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success sound beep (optional)
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
          } catch {}

          // Stop scanner & return result
          html5QrCode.stop().then(() => {
            onScanSuccess(decodedText);
            onClose();
          });
        },
        () => {
          // Frame scan failures silent rahenge
        }
      )
      .catch((err) => {
        setErrorMsg("Camera permission allow karein ya camera dusri app me use ho raha hai.");
      });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  const toggleTorch = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn } as any],
        });
        setTorchOn(!torchOn);
      }
    } catch {
      alert("Is device me flashlight support nahi hai.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#102a56",
          borderRadius: "18px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "15px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
            </svg>
            <span>Scan Product Barcode</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Flashlight Button */}
            <button
              type="button"
              onClick={toggleTorch}
              style={{
                background: torchOn ? "#eab308" : "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: torchOn ? "#000" : "#fff",
                cursor: "pointer",
              }}
            >
              ⚡
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div style={{ position: "relative", minHeight: "300px", backgroundColor: "#000" }}>
          <div id="interactive-barcode-reader" style={{ width: "100%" }}></div>

          {errorMsg && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#f87171",
                fontSize: "13px",
                backgroundColor: "#000",
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
          Barcode ko red line ya center box ke samne rakhein
        </div>
      </div>
    </div>
  );
}
