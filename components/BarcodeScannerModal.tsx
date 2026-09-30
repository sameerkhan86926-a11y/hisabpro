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
  const [isScriptReady, setIsScriptReady] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Html5Qrcode) {
      setIsScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !isScriptReady) return;

    let isMounted = true;
    setErrorMsg("");

    const startCamera = async () => {
      try {
        // Mobile camera explicit permission trigger
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
        }

        const Html5QrcodeClass = (window as any).Html5Qrcode;
        if (!Html5QrcodeClass) {
          setErrorMsg("Scanner load ho raha hai, kripya 2 second wait karein...");
          return;
        }

        const scannerId = "interactive-barcode-reader";
        const html5QrCode = new Html5QrcodeClass(scannerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            // Beep sound
            try {
              const ctx = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              osc.type = "sine";
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              osc.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.1);
            } catch {}

            html5QrCode
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
        );
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Camera start error:", err);

        if (
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost"
        ) {
          setErrorMsg(
            "Camera open karne ke liye HTTPS zaroori hai. Link https:// se shuru honi chahiye."
          );
        } else {
          setErrorMsg(
            "Camera access nahi mila. Kripya browser settings me Camera Permission allow karein."
          );
        }
      }
    };

    const timer = setTimeout(startCamera, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, [isOpen, isScriptReady]);

  const toggleTorch = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      }
    } catch {
      alert("Is device me flashlight support nahi hai.");
    }
  };

  return (
    <>
      <Script
        src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"
        strategy="beforeInteractive"
        onLoad={() => setIsScriptReady(true)}
      />

      {isOpen && (
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "600",
                  fontSize: "15px",
                }}
              >
                <span>Scan Product Barcode</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={toggleTorch}
                  style={{
                    background: torchOn
                      ? "#eab308"
                      : "rgba(255, 255, 255, 0.15)",
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

            <div
              style={{
                position: "relative",
                minHeight: "280px",
                backgroundColor: "#000",
              }}
            >
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

            <div
              style={{
                padding: "12px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "12px",
              }}
            >
              Barcode ko camera box ke samne rakhein
            </div>
          </div>
        </div>
      )}
    </>
  );
}
