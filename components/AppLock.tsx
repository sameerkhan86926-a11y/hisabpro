"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { playClickSound } from "../utils/sound";

const LOCK_KEY = "hisabpro_app_lock";
const PIN_HASH_KEY = "hisabpro_app_lock_pin_hash";
const PIN_LENGTH_KEY = "hisabpro_app_lock_pin_length";
const AUTO_LOCK_KEY = "hisabpro_app_lock_auto";
const SESSION_KEY = "hisabpro_app_unlocked_at";
const ATTEMPTS_KEY = "hisabpro_lock_failed_attempts";
const LOCKOUT_KEY = "hisabpro_lock_cooldown_until";

type AutoLockTime = "immediately" | "1" | "5" | "15";

type AppLockProps = {
  children: ReactNode;
  isSplashActive?: boolean;
};

export default function AppLock({ children, isSplashActive = false }: AppLockProps) {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState("");
  const [pinLength, setPinLength] = useState(4);
  const [shake, setShake] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerHaptic = () => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(20);
      }
    } catch {}
  };

  const triggerErrorHaptic = () => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([40, 60, 40]);
      }
    } catch {}
  };

  const clearAutoLockTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const markUnlocked = () => {
    sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  };

  const lockApp = () => {
    clearAutoLockTimer();
    sessionStorage.removeItem(SESSION_KEY);
    setEnteredPin("");
    setError("");
    setLocked(true);
  };

  const startAutoLockTimer = () => {
    clearAutoLockTimer();
    const enabled = localStorage.getItem(LOCK_KEY) === "true";
    if (!enabled) return;

    const autoLock = (localStorage.getItem(AUTO_LOCK_KEY) || "immediately") as AutoLockTime;
    if (autoLock === "immediately") return;

    const minutes = Number(autoLock);
    if (!minutes || minutes <= 0) return;

    timerRef.current = setTimeout(() => {
      lockApp();
    }, minutes * 60 * 1000);
  };

  const checkCooldown = () => {
    const lockedUntil = Number(localStorage.getItem(LOCKOUT_KEY)) || 0;
    const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);

    if (remaining > 0) {
      setCooldown(remaining);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current!);
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCooldown(0);
    }
  };

  const loadLockSettings = (keepUnlocked = false) => {
    const enabled = localStorage.getItem(LOCK_KEY) === "true";
    const hash = localStorage.getItem(PIN_HASH_KEY);
    const savedPinLength = Number(localStorage.getItem(PIN_LENGTH_KEY)) || 4;
    const autoLock = (localStorage.getItem(AUTO_LOCK_KEY) || "immediately") as AutoLockTime;

    setPinLength(savedPinLength);
    checkCooldown();

    if (!enabled || !hash) {
      clearAutoLockTimer();
      setLocked(false);
      setReady(true);
      return;
    }

    if (keepUnlocked) {
      markUnlocked();
      setLocked(false);
      setReady(true);
      startAutoLockTimer();
      return;
    }

    const unlockedAt = sessionStorage.getItem(SESSION_KEY);
    if (unlockedAt) {
      if (autoLock === "immediately") {
        setLocked(false);
        setReady(true);
        return;
      }

      const minutes = Number(autoLock);
      if (minutes > 0) {
        const elapsed = Date.now() - Number(unlockedAt);
        const allowedTime = minutes * 60 * 1000;
        if (elapsed < allowedTime) {
          setLocked(false);
          setReady(true);
          startAutoLockTimer();
          return;
        }
      }
    }

    clearAutoLockTimer();
    sessionStorage.removeItem(SESSION_KEY);
    setLocked(true);
    setReady(true);
  };

  useEffect(() => {
    loadLockSettings();

    const handleLockChange = () => {
      loadLockSettings(true);
    };

    window.addEventListener("hisabpro-app-lock-changed", handleLockChange);

    return () => {
      window.removeEventListener("hisabpro-app-lock-changed", handleLockChange);
      clearAutoLockTimer();
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ready || locked) return;

    const handleActivity = () => {
      markUnlocked();
      const enabled = localStorage.getItem(LOCK_KEY) === "true";
      if (enabled) {
        startAutoLockTimer();
      }
    };

    document.addEventListener("click", handleActivity);
    document.addEventListener("touchstart", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("scroll", handleActivity);

    return () => {
      document.removeEventListener("click", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("scroll", handleActivity);
    };
  }, [ready, locked]);

  const createHash = async (value: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const handleIncorrectPin = () => {
    triggerErrorHaptic();
    setShake(true);
    setTimeout(() => setShake(false), 500);

    const currentAttempts = (Number(localStorage.getItem(ATTEMPTS_KEY)) || 0) + 1;
    localStorage.setItem(ATTEMPTS_KEY, String(currentAttempts));

    if (currentAttempts >= 5) {
      const lockDuration = 30;
      const lockoutTime = Date.now() + lockDuration * 1000;
      localStorage.setItem(LOCKOUT_KEY, String(lockoutTime));
      setError(`Too many attempts. Wait ${lockDuration}s.`);
      checkCooldown();
    } else {
      setError(`Incorrect PIN (${5 - currentAttempts} attempts left)`);
    }

    setEnteredPin("");
  };

  const verifyAndUnlock = async (pinToVerify: string) => {
    if (cooldown > 0) return;
    setError("");

    if (pinToVerify.length !== pinLength) {
      setError(`Please enter ${pinLength} digit PIN.`);
      return;
    }

    try {
      const enteredHash = await createHash(pinToVerify);
      const savedHash = localStorage.getItem(PIN_HASH_KEY);

      if (enteredHash !== savedHash) {
        handleIncorrectPin();
        return;
      }

      markUnlocked();
      setEnteredPin("");
      setError("");
      setLocked(false);
      startAutoLockTimer();
    } catch {
      setError("PIN verify nahi ho saka.");
    }
  };

  const handlePinChange = (value: string) => {
    if (cooldown > 0) return;
    const numbersOnly = value.replace(/\D/g, "");

    if (numbersOnly.length <= pinLength) {
      setEnteredPin(numbersOnly);
      setError("");

      if (numbersOnly.length === pinLength) {
        verifyAndUnlock(numbersOnly);
      }
    }
  };

  const addDigit = (digit: string) => {
    if (cooldown > 0) return;
    if (enteredPin.length >= pinLength) return;

    playClickSound();
    triggerHaptic();

    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);
    setError("");

    if (nextPin.length === pinLength) {
      verifyAndUnlock(nextPin);
    }
  };

  const removeDigit = () => {
    if (cooldown > 0) return;
    playClickSound();
    triggerHaptic();
    setEnteredPin((current) => current.slice(0, -1));
    setError("");
  };

  const clearPin = () => {
    if (cooldown > 0) return;
    playClickSound();
    setEnteredPin("");
    setError("");
  };

  if (!ready || isSplashActive) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#071224" }} />
    );
  }

  if (!locked) {
    return <>{children}</>;
  }

  const keypadRows = [
    [
      { digit: "1", sub: "" },
      { digit: "2", sub: "ABC" },
      { digit: "3", sub: "DEF" },
    ],
    [
      { digit: "4", sub: "GHI" },
      { digit: "5", sub: "JKL" },
      { digit: "6", sub: "MNO" },
    ],
    [
      { digit: "7", sub: "PQRS" },
      { digit: "8", sub: "TUV" },
      { digit: "9", sub: "WXYZ" },
    ],
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
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
              20%, 60% { transform: translateX(-12px); }
              40%, 80% { transform: translateX(12px); }
            }
            .shake-animation {
              animation: pinShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
            }
            .keypad-btn:active {
              transform: scale(0.92);
              background: rgba(255, 255, 255, 0.22) !important;
            }
          `,
        }}
      />

      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        value={enteredPin}
        onChange={(event) => handlePinChange(event.target.value)}
        maxLength={pinLength}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
        autoFocus
      />

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "#ffffff",
            margin: "0 auto 14px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}
        >
          <img src="/hisabpro/icon-192.png" alt="HisabPro" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", margin: "0 0 6px 0" }}>
          Hisab<span style={{ color: "#38bdf8" }}>Pro</span> Security
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0, fontWeight: "500" }}>
          {cooldown > 0 ? `Security locked. Try in ${cooldown}s` : "Apna security PIN enter karein"}
        </p>
      </div>

      <div
        className={shake ? "shake-animation" : ""}
        style={{
          display: "flex",
          gap: "18px",
          marginBottom: "28px",
          justifyContent: "center",
        }}
      >
        {Array.from({ length: pinLength }).map((_, index) => {
          const isFilled = index < enteredPin.length;
          return (
            <div
              key={index}
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: isFilled ? (error ? "#ef4444" : "#38bdf8") : "rgba(255, 255, 255, 0.15)",
                border: isFilled ? "none" : "2px solid rgba(255, 255, 255, 0.3)",
                transform: isFilled ? "scale(1.15)" : "scale(1)",
                transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isFilled ? (error ? "0 0 12px #ef4444" : "0 0 12px rgba(56, 189, 248, 0.6)") : "none",
              }}
            />
          );
        })}
      </div>

      {error && (
        <div
          style={{
            color: "#f87171",
            fontSize: "13px",
            fontWeight: "700",
            marginBottom: "16px",
            textAlign: "center",
            minHeight: "20px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          maxWidth: "280px",
        }}
      >
        {keypadRows.map((row, rIdx) => (
          <div key={rIdx} style={{ display: "flex", justifyContent: "space-between" }}>
            {row.map(({ digit, sub }) => (
              <button
                key={digit}
                type="button"
                className="keypad-btn"
                disabled={cooldown > 0}
                onClick={() => addDigit(digit)}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: cooldown > 0 ? "not-allowed" : "pointer",
                  transition: "background 0.1s ease",
                  outline: "none",
                }}
              >
                <span style={{ fontSize: "24px", fontWeight: "700", lineHeight: "1" }}>{digit}</span>
                {sub && (
                  <span style={{ fontSize: "9px", letterSpacing: "1px", color: "#94a3b8", fontWeight: "700", marginTop: "3px" }}>
                    {sub}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="keypad-btn"
            disabled={cooldown > 0}
            onClick={clearPin}
            style={{
              width: "72px",
              height: "72px",
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
            className="keypad-btn"
            disabled={cooldown > 0}
            onClick={() => addDigit("0")}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "700",
              cursor: cooldown > 0 ? "not-allowed" : "pointer",
              outline: "none",
            }}
          >
            0
          </button>

          <button
            type="button"
            className="keypad-btn"
            disabled={cooldown > 0}
            onClick={removeDigit}
            style={{
              width: "72px",
              height: "72px",
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
