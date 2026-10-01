"use client";

import { useState } from "react";
import { playClickSound } from "../../utils/sound";

type UserRole = "admin" | "staff";

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>("admin");
  const [pin, setPin] = useState("");
  const [staffName, setStaffName] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    playClickSound();
    const nextPin = pin + digit;
    setPin(nextPin);
    setError("");

    if (nextPin.length === 4) {
      validateLogin(nextPin, role, staffName);
    }
  }

  function handleBackspace() {
    playClickSound();
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }

  function handleClear() {
    playClickSound();
    setPin("");
    setError("");
  }

  function validateLogin(enteredPin: string, selectedRole: UserRole, name: string) {
    // 1. Admin Verification
    if (selectedRole === "admin") {
      // Admin PIN saved in localStorage (Default: "1234")
      const savedAdminPin = localStorage.getItem("hisabpro_admin_pin") || "1234";

      if (enteredPin === savedAdminPin) {
        const sessionData = {
          role: "admin",
          name: "Admin / Owner",
          loggedInAt: Date.now(),
        };
        sessionStorage.setItem("hisabpro_user_session", JSON.stringify(sessionData));
        window.location.href = "/hisabpro/";
      } else {
        triggerError("Galat Admin PIN! Dobara try karein.");
      }
    } 
    // 2. Staff Verification
    else {
      // Staff PIN saved in localStorage (Default: "0000")
      const savedStaffPin = localStorage.getItem("hisabpro_staff_pin") || "0000";

      if (enteredPin === savedStaffPin) {
        const sessionData = {
          role: "staff",
          name: name.trim() || "Cashier Staff",
          loggedInAt: Date.now(),
        };
        sessionStorage.setItem("hisabpro_user_session", JSON.stringify(sessionData));
        window.location.href = "/hisabpro/sales/"; // Staff seedha billing counter par jayega
      } else {
        triggerError("Galat Staff PIN! Dobara try karein.");
      }
    }
  }

  function triggerError(msg: string) {
    setError(msg);
    setShake(true);
    setPin("");
    setTimeout(() => setShake(false), 500);
    try {
      if ("vibrate" in navigator) navigator.vibrate([40, 60, 40]);
    } catch {}
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at center, #102a56 0%, #071224 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        userSelect: "none",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pinShake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-10px); }
              40%, 80% { transform: translateX(10px); }
            }
            .shake-anim {
              animation: pinShake 0.4s ease-in-out;
            }
            .key-press:active {
              transform: scale(0.92);
              background: rgba(255, 255, 255, 0.22) !important;
            }
          `,
        }}
      />

      {/* BRAND LOGO & TITLE */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "20px",
            background: "#ffffff",
            margin: "0 auto 12px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}
        >
          <img src="/hisabpro/icon-192.png" alt="HisabPro" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "900", margin: "0 0 4px 0" }}>
          Hisab<span style={{ color: "#38bdf8" }}>Pro</span> POS
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
          Counter Login • Secure Terminal
        </p>
      </div>

      {/* ROLE SWITCHER TABS (ADMIN vs STAFF) */}
      <div
        style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.08)",
          padding: "4px",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "280px",
          marginBottom: "16px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setRole("admin");
            setPin("");
            setError("");
          }}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "10px",
            border: "none",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            background: role === "admin" ? "#38bdf8" : "transparent",
            color: role === "admin" ? "#071224" : "#94a3b8",
            transition: "all 0.2s ease",
          }}
        >
          👑 Owner (Admin)
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("staff");
            setPin("");
            setError("");
          }}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "10px",
            border: "none",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            background: role === "staff" ? "#38bdf8" : "transparent",
            color: role === "staff" ? "#071224" : "#94a3b8",
            transition: "all 0.2s ease",
          }}
        >
          🧑‍💼 Staff / Cashier
        </button>
      </div>

      {/* STAFF NAME INPUT (ONLY WHEN STAFF ROLE IS SELECTED) */}
      {role === "staff" && (
        <input
          type="text"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          placeholder="Cashier ka naam likhein..."
          style={{
            width: "100%",
            maxWidth: "280px",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.06)",
            color: "#ffffff",
            fontSize: "13px",
            marginBottom: "16px",
            outline: "none",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        />
      )}

      {/* PIN DOTS DISPLAY */}
      <div
        className={shake ? "shake-anim" : ""}
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "18px",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2, 3].map((idx) => {
          const isFilled = idx < pin.length;
          return (
            <div
              key={idx}
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: isFilled ? (error ? "#ef4444" : "#38bdf8") : "rgba(255, 255, 255, 0.15)",
                border: isFilled ? "none" : "2px solid rgba(255, 255, 255, 0.3)",
                transform: isFilled ? "scale(1.2)" : "scale(1)",
                transition: "all 0.15s ease",
                boxShadow: isFilled ? (error ? "0 0 10px #ef4444" : "0 0 10px #38bdf8") : "none",
              }}
            />
          );
        })}
      </div>

      {/* ERROR MESSAGE */}
      <div
        style={{
          color: "#f87171",
          fontSize: "12px",
          fontWeight: "700",
          marginBottom: "14px",
          minHeight: "18px",
          textAlign: "center",
        }}
      >
        {error}
      </div>

      {/* NUMERIC DIALER KEYPAD */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
          maxWidth: "270px",
        }}
      >
        {[
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
        ].map((row, rIdx) => (
          <div key={rIdx} style={{ display: "flex", justifyContent: "space-between" }}>
            {row.map((num) => (
              <button
                key={num}
                type="button"
                className="key-press"
                onClick={() => handleDigit(num)}
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontSize: "22px",
                  fontWeight: "700",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {num}
              </button>
            ))}
          </div>
        ))}

        {/* BOTTOM ROW: CLEAR, 0, BACKSPACE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="key-press"
            onClick={handleClear}
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              outline: "none",
            }}
          >
            Clear
          </button>

          <button
            type="button"
            className="key-press"
            onClick={() => handleDigit("0")}
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: "700",
              cursor: "pointer",
              outline: "none",
            }}
          >
            0
          </button>

          <button
            type="button"
            className="key-press"
            onClick={handleBackspace}
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "transparent",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* DEFAULT PIN HINT */}
      <div style={{ marginTop: "24px", color: "rgba(255,255,255,0.35)", fontSize: "11px", textAlign: "center" }}>
        Default Admin PIN: <strong>1234</strong> • Staff PIN: <strong>0000</strong>
      </div>
    </main>
  );
}
