"use client";

import {
  ReactNode,
  useEffect,
  useRef,
  useState
} from "react";

const LOCK_KEY = "hisabpro_app_lock";
const PIN_HASH_KEY = "hisabpro_app_lock_pin_hash";
const PIN_LENGTH_KEY = "hisabpro_app_lock_pin_length";
const AUTO_LOCK_KEY = "hisabpro_app_lock_auto";
const SESSION_KEY = "hisabpro_app_unlocked_at";

type AutoLockTime = "immediately" | "1" | "5" | "15";

type AppLockProps = {
  children: ReactNode;
};

export default function AppLock({ children }: AppLockProps) {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState("");
  const [pinLength, setPinLength] = useState(4);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoLockTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const markUnlocked = () => {
    sessionStorage.setItem(SESSION_KEY, String(Date.now()));
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

  const loadLockSettings = (keepUnlocked = false) => {
    const enabled = localStorage.getItem(LOCK_KEY) === "true";
    const hash = localStorage.getItem(PIN_HASH_KEY);
    const savedPinLength = Number(localStorage.getItem(PIN_LENGTH_KEY)) || 4;
    const autoLock = (localStorage.getItem(AUTO_LOCK_KEY) || "immediately") as AutoLockTime;

    setPinLength(savedPinLength);

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

  // Common verification logic: Auto aur Manual dono se use hoti hai
  const verifyAndUnlock = async (pinToVerify: string) => {
    setError("");

    if (pinToVerify.length !== pinLength) {
      setError(`Please enter ${pinLength} digit PIN.`);
      return;
    }

    try {
      const enteredHash = await createHash(pinToVerify);
      const savedHash = localStorage.getItem(PIN_HASH_KEY);

      if (enteredHash !== savedHash) {
        setError("Incorrect PIN.");
        setEnteredPin("");
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

  const handleUnlock = () => {
    verifyAndUnlock(enteredPin);
  };

  const handlePinChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");

    if (numbersOnly.length <= pinLength) {
      setEnteredPin(numbersOnly);
      setError("");

      // Keyboard input par exact digits poore hote hi auto-unlock
      if (numbersOnly.length === pinLength) {
        verifyAndUnlock(numbersOnly);
      }
    }
  };

  const addDigit = (digit: string) => {
    if (enteredPin.length >= pinLength) return;

    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);
    setError("");

    // Keypad press par exact digits poore hote hi auto-unlock
    if (nextPin.length === pinLength) {
      verifyAndUnlock(nextPin);
    }
  };

  const removeDigit = () => {
    setEnteredPin((current) => current.slice(0, -1));
    setError("");
  };

  const clearPin = () => {
    setEnteredPin("");
    setError("");
  };

  if (!ready) {
    return (
      <div className="app-lock-loading">
        Loading...
      </div>
    );
  }

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="app-lock-screen">
      <div className="app-lock-card">
        <div className="app-lock-icon">
  <img
    src="/hisabpro/icon-192.png"
    alt="HisabPro"
    className="app-lock-logo"
  />
</div>

        <h1>HisabPro Locked</h1>
        <p>Continue karne ke liye apna PIN enter karein.</p>

        <div className="app-lock-pin-dots">
          {Array.from({ length: pinLength }).map((_, index) => (
            <span
              key={index}
              className={index < enteredPin.length ? "filled" : ""}
            />
          ))}
        </div>

        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={enteredPin}
          onChange={(event) => handlePinChange(event.target.value)}
          maxLength={pinLength}
          className="app-lock-hidden-input"
          aria-label="PIN"
          autoFocus
        />

        <div className="app-lock-keypad">
          <button type="button" onClick={() => addDigit("1")}>1</button>
          <button type="button" onClick={() => addDigit("2")}>2</button>
          <button type="button" onClick={() => addDigit("3")}>3</button>
          <button type="button" onClick={() => addDigit("4")}>4</button>
          <button type="button" onClick={() => addDigit("5")}>5</button>
          <button type="button" onClick={() => addDigit("6")}>6</button>
          <button type="button" onClick={() => addDigit("7")}>7</button>
          <button type="button" onClick={() => addDigit("8")}>8</button>
          <button type="button" onClick={() => addDigit("9")}>9</button>
          <button type="button" className="app-lock-keypad-action" onClick={clearPin}>
            Clear
          </button>
          <button type="button" onClick={() => addDigit("0")}>0</button>
          <button
            type="button"
            className="app-lock-keypad-action"
            onClick={removeDigit}
            aria-label="Delete last digit"
          >
            Back
          </button>
        </div>

        {error && <div className="app-lock-error">{error}</div>}

        <button
          type="button"
          onClick={handleUnlock}
          className="app-lock-button"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
