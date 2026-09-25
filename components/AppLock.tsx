"use client";

import {
  ReactNode,
  useEffect,
  useState
} from "react";

const LOCK_KEY = "hisabpro_app_lock";
const PIN_HASH_KEY = "hisabpro_app_lock_pin_hash";
const PIN_LENGTH_KEY = "hisabpro_app_lock_pin_length";
const AUTO_LOCK_KEY = "hisabpro_app_lock_auto";

const SESSION_KEY = "hisabpro_app_unlocked_at";

type AutoLockTime =
  | "immediately"
  | "1"
  | "5"
  | "15";

type AppLockProps = {
  children: ReactNode;
};

export default function AppLock({
  children
}: AppLockProps) {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState("");
  const [pinLength, setPinLength] = useState(4);

  const markUnlocked = () => {
    sessionStorage.setItem(
      SESSION_KEY,
      String(Date.now())
    );
  };

  const lockApp = () => {
    sessionStorage.removeItem(SESSION_KEY);

    setEnteredPin("");
    setError("");
    setLocked(true);
  };

  const startAutoLockTimer = () => {
    const enabled =
      localStorage.getItem(LOCK_KEY) === "true";

    const autoLock =
      (localStorage.getItem(
        AUTO_LOCK_KEY
      ) || "immediately") as AutoLockTime;

    if (!enabled) {
      return;
    }

    if (autoLock === "immediately") {
      return;
    }

    const minutes = Number(autoLock);

    if (!minutes || minutes <= 0) {
      return;
    }

    window.setTimeout(() => {
      lockApp();
    }, minutes * 60 * 1000);
  };

  const loadLockSettings = (
    keepUnlocked = false
  ) => {
    const enabled =
      localStorage.getItem(LOCK_KEY) === "true";

    const hash =
      localStorage.getItem(PIN_HASH_KEY);

    const savedPinLength =
      Number(
        localStorage.getItem(PIN_LENGTH_KEY)
      ) || 4;

    const autoLock =
      (localStorage.getItem(
        AUTO_LOCK_KEY
      ) || "immediately") as AutoLockTime;

    setPinLength(savedPinLength);

    if (!enabled || !hash) {
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

    const unlockedAt =
      sessionStorage.getItem(SESSION_KEY);

    if (autoLock === "immediately") {
      if (unlockedAt) {
        setLocked(false);
      } else {
        setLocked(true);
      }

      setReady(true);
      return;
    }

    const minutes = Number(autoLock);

    if (
      unlockedAt &&
      minutes > 0
    ) {
      const elapsed =
        Date.now() -
        Number(unlockedAt);

      const allowedTime =
        minutes * 60 * 1000;

      if (elapsed < allowedTime) {
        setLocked(false);
        startAutoLockTimer();
      } else {
        sessionStorage.removeItem(
          SESSION_KEY
        );

        setLocked(true);
      }
    } else {
      setLocked(true);
    }

    setReady(true);
  };

  useEffect(() => {
    loadLockSettings();

    const handleLockChange = () => {
      loadLockSettings(true);
    };

    window.addEventListener(
      "hisabpro-app-lock-changed",
      handleLockChange
    );

    return () => {
      window.removeEventListener(
        "hisabpro-app-lock-changed",
        handleLockChange
      );
    };
  }, []);

  useEffect(() => {
    if (!ready || locked) {
      return;
    }

    const handleActivity = () => {
      markUnlocked();
    };

    document.addEventListener(
      "click",
      handleActivity
    );

    document.addEventListener(
      "touchstart",
      handleActivity
    );

    document.addEventListener(
      "keydown",
      handleActivity
    );

    document.addEventListener(
      "scroll",
      handleActivity
    );

    return () => {
      document.removeEventListener(
        "click",
        handleActivity
      );

      document.removeEventListener(
        "touchstart",
        handleActivity
      );

      document.removeEventListener(
        "keydown",
        handleActivity
      );

      document.removeEventListener(
        "scroll",
        handleActivity
      );
    };
  }, [ready, locked]);

  const createHash = async (
    value: string
  ) => {
    const encoder =
      new TextEncoder();

    const data =
      encoder.encode(value);

    const hashBuffer =
      await crypto.subtle.digest(
        "SHA-256",
        data
      );

    const hashArray =
      Array.from(
        new Uint8Array(hashBuffer)
      );

    return hashArray
      .map((byte) =>
        byte
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  };

  const handleUnlock = async () => {
    setError("");

    if (
      enteredPin.length !== pinLength
    ) {
      setError(
        `Please enter ${pinLength} digit PIN.`
      );
      return;
    }

    try {
      const enteredHash =
        await createHash(enteredPin);

      const savedHash =
        localStorage.getItem(
          PIN_HASH_KEY
        );

      if (
        enteredHash !== savedHash
      ) {
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
      setError(
        "PIN verify nahi ho saka."
      );
    }
  };

  const handlePinChange = (
    value: string
  ) => {
    const numbersOnly =
      value.replace(/\D/g, "");

    if (
      numbersOnly.length <= pinLength
    ) {
      setEnteredPin(
        numbersOnly
      );
    }
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
          🔒
        </div>

        <h1>HisabPro Locked</h1>

        <p>
          Continue karne ke liye
          apna PIN enter karein.
        </p>

        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={enteredPin}
          onChange={(event) =>
            handlePinChange(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter"
            ) {
              handleUnlock();
            }
          }}
          maxLength={pinLength}
          placeholder={`${pinLength} digit PIN`}
          className="app-lock-pin-input"
          autoFocus
        />

        {error && (
          <div className="app-lock-error">
            {error}
          </div>
        )}

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
