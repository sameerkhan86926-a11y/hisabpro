"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const LOCK_KEY =
  "hisabpro_app_lock";

const PIN_HASH_KEY =
  "hisabpro_app_lock_pin_hash";

const PIN_LENGTH_KEY =
  "hisabpro_app_lock_pin_length";

const AUTO_LOCK_KEY =
  "hisabpro_app_lock_auto";

const SESSION_KEY =
  "hisabpro_app_unlocked_at";

const LOCK_CHANGE_EVENT =
  "hisabpro-app-lock-changed";

async function hashPin(
  value: string
) {
  const data =
    new TextEncoder().encode(value);

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return Array.from(
    new Uint8Array(hashBuffer)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

export default function AppLock({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] =
    useState(false);

  const [locked, setLocked] =
    useState(false);

  const [pinLength, setPinLength] =
    useState(4);

  const [enteredPin, setEnteredPin] =
    useState("");

  const [error, setError] =
    useState("");

  const timerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(
        timerRef.current
      );

      timerRef.current = null;
    }
  }

  function lockApp() {
    clearTimer();

    sessionStorage.removeItem(
      SESSION_KEY
    );

    setEnteredPin("");
    setError("");
    setLocked(true);
  }

  function markUnlocked() {
    sessionStorage.setItem(
      SESSION_KEY,
      String(Date.now())
    );
  }

  function startAutoLockTimer() {
    clearTimer();

    const enabled =
      localStorage.getItem(
        LOCK_KEY
      ) === "true";

    if (!enabled) {
      return;
    }

    const autoLock =
      localStorage.getItem(
        AUTO_LOCK_KEY
      ) || "immediately";

    if (
      autoLock === "immediately"
    ) {
      return;
    }

    const minutes =
      Number(autoLock);

    if (!minutes || minutes <= 0) {
      return;
    }

    timerRef.current =
      setTimeout(() => {
        lockApp();
      }, minutes * 60 * 1000);
  }

  function loadLockSettings(
    keepUnlocked = false
  ) {
    const enabled =
      localStorage.getItem(
        LOCK_KEY
      ) === "true";

    const savedHash =
      localStorage.getItem(
        PIN_HASH_KEY
      );

    const savedLength =
      Number(
        localStorage.getItem(
          PIN_LENGTH_KEY
        ) || "4"
      );

    const autoLock =
      localStorage.getItem(
        AUTO_LOCK_KEY
      ) || "immediately";

    setPinLength(
      savedLength === 6
        ? 6
        : 4
    );

    if (!enabled || !savedHash) {
      clearTimer();
      setLocked(false);
      setReady(true);
      return;
    }

    /*
     * When Settings has just enabled
     * App Lock, keep the user inside
     * the app instead of locking
     * them immediately.
     */
    if (keepUnlocked) {
      markUnlocked();
      setLocked(false);
      setReady(true);
      startAutoLockTimer();
      return;
    }

    /*
     * Immediately means lock when
     * the app/page is opened.
     */
    if (autoLock === "immediately") {
  const lastUnlocked =
    Number(
      sessionStorage.getItem(
        SESSION_KEY
      ) || "0"
    );

  if (lastUnlocked > 0) {
    setLocked(false);
    setReady(true);
    return;
  }

  setLocked(true);
  setReady(true);
  return;
}

    /*
     * Check whether the previous
     * unlocked session is still valid.
     */
    const lastUnlocked =
      Number(
        sessionStorage.getItem(
          SESSION_KEY
        ) || "0"
      );

    const minutes =
      Number(autoLock);

    const validFor =
      minutes *
      60 *
      1000;

    const stillValid =
      lastUnlocked > 0 &&
      Date.now() -
        lastUnlocked <
        validFor;

    if (stillValid) {
      setLocked(false);
      setReady(true);
      startAutoLockTimer();
    } else {
      sessionStorage.removeItem(
        SESSION_KEY
      );

      setLocked(true);
      setReady(true);
    }
  }

  useEffect(() => {
    loadLockSettings();

    function handleLockChange() {
      loadLockSettings(true);
    }

    window.addEventListener(
      LOCK_CHANGE_EVENT,
      handleLockChange
    );

    return () => {
      window.removeEventListener(
        LOCK_CHANGE_EVENT,
        handleLockChange
      );

      clearTimer();
    };
  }, []);

  useEffect(() => {
    if (
      !ready ||
      locked
    ) {
      return;
    }

    const handleActivity = () => {
      markUnlocked();
      startAutoLockTimer();
    };

    const events = [
      "click",
      "touchstart",
      "keydown",
      "scroll",
    ];

    events.forEach(
      (event) => {
        window.addEventListener(
          event,
          handleActivity,
          {
            passive: true,
          }
        );
      }
    );

    return () => {
      events.forEach(
        (event) => {
          window.removeEventListener(
            event,
            handleActivity
          );
        }
      );
    };
  }, [
    ready,
    locked,
  ]);

  async function unlockApp() {
    if (
      enteredPin.length !==
      pinLength
    ) {
      setError(
        `Enter your ${pinLength} digit PIN.`
      );

      return;
    }

    const savedHash =
      localStorage.getItem(
        PIN_HASH_KEY
      );

    if (!savedHash) {
      setError(
        "PIN setup is incomplete."
      );

      return;
    }

    try {
      const enteredHash =
        await hashPin(
          enteredPin
        );

      if (
        enteredHash ===
        savedHash
      ) {
        markUnlocked();

        setLocked(false);

        setEnteredPin("");

        setError("");

        startAutoLockTimer();
      } else {
        setError(
          "Incorrect PIN."
        );

        setEnteredPin("");
      }
    } catch {
      setError(
        "Unable to verify PIN."
      );

      setEnteredPin("");
    }
  }

  function addNumber(
    number: string
  ) {
    if (
      enteredPin.length >=
      pinLength
    ) {
      return;
    }

    setEnteredPin(
      (previous) =>
        previous + number
    );

    setError("");
  }

  function removeNumber() {
    setEnteredPin(
      (previous) =>
        previous.slice(
          0,
          -1
        )
    );

    setError("");
  }

  if (!ready) {
    return null;
  }

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <main className="app-lock-screen">

      <div className="app-lock-box">

        <div className="app-lock-icon">
          🔒
        </div>

        <h1>
          HisabPro
        </h1>

        <p>
          App Locked
        </p>

        <div className="app-lock-dots">

          {Array.from({
            length: pinLength,
          }).map(
            (_, index) => (
              <span
                key={index}
                className={
                  index <
                  enteredPin.length
                    ? "filled"
                    : ""
                }
              />
            )
          )}

        </div>

        {error && (
          <div className="app-lock-error">
            {error}
          </div>
        )}

        <div className="app-lock-keypad">

          {[
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
          ].map(
            (number) => (
              <button
                key={number}
                type="button"
                onClick={() =>
                  addNumber(
                    number
                  )
                }
              >
                {number}
              </button>
            )
          )}

          <button
            type="button"
            className="empty-key"
            disabled
          />

          <button
            type="button"
            onClick={() =>
              addNumber("0")
            }
          >
            0
          </button>

          <button
            type="button"
            className="delete-key"
            onClick={
              removeNumber
            }
          >
            ⌫
          </button>

        </div>

        <button
          type="button"
          className="app-lock-unlock"
          onClick={
            unlockApp
          }
          disabled={
            enteredPin.length !==
            pinLength
          }
        >
          Unlock
        </button>

      </div>

    </main>
  );
}
