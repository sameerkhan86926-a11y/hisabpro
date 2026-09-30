"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

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
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isScanning = true;
    setErrorMsg("");

    const initScanner = () => {
      const Html5Qrcode = (window as any).Html5Qrcode;

      if (!Html5Qrcode) {
        setErrorMsg("Scanner script load ho rahi hai, 2 second ruk kar dubara try karein.");
        return;
      }

      try {
        const scanner = new Html5Qrcode("interactive-barcode-reader");
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
        };

        scanner
          .start(
            { facingMode: "environment" },
            config,
            (decodedText: string) => {
              if (!isScanning) return;
              isScanning = false;

              scanner
                .stop()
                .then(() => {
                  onScanSuccess(decodedText);
                  onClose();
                })
                .catch(() => {
                  onScanSuccess(decodedText);
                  onClose();
                });
            },
            () => {}
          )
          .catch((err: any) => {
            console.error("Camera open error:", err);
            setErrorMsg(
              "Camera chalu nahi hua. Phone Settings > Apps > HisabPro > Permissions me Camera ko ALLOW karein."
            );
          });
      } catch (e) {
        setErrorMsg("Camera initialize nahi ho paya. Refresh karein.");
      }
    };

    const timer = setTimeout(initScanner, 400);

    return () => {
      isScanning = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {}
      }
    };
  }, [isOpen]);

  const toggleTorch = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      }
    } catch {
      alert("Flashlight support nahi mila.");
    }
  };

  return (
    <>
      <Script
        src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"
        strategy="lazyOnload"
      />

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 99999,
            display: "flex",
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
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              <span style={{ fontWeight: 600 }}>Scan Barcode</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={toggleTorch}
                  style={{
                    background: torchOn ? "#eab308" : "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    color: torchOn ? "#000" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  ⚡
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ position: "relative", minHeight: "260px", background: "#000" }}>
              <div id="interactive-barcode-reader" style={{ width: "100%" }}></div>

              {errorMsg && (
                <div
                  style={{
                    padding: "20px",
                    color: "#f87171",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  {errorMsg}
                </div>
              )}
            </div>

            <div style={{ padding: "10px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
              Barcode ko box ke beech me rakhein
            </div>
          </div>
        </div>
      )}
    </>
  );
}
