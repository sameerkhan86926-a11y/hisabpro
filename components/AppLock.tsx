"use client";

import { useEffect, useState } from "react";

const PIN_KEY = "hisabpro_app_pin";
const LOCK_KEY = "hisabpro_app_lock";
const AUTO_LOCK_KEY = "hisabpro_auto_lock";

export default function AppLock({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const lockEnabled =
      localStorage.getItem(LOCK_KEY) === "true";

    const savedPin =
      localStorage.getItem(PIN_KEY);

    setPin(savedPin || "");

    if (lockEnabled && savedPin) {
      setLocked(true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        localStorage.getItem(LOCK_KEY) === "true" &&
        localStorage.getItem(PIN_KEY)
      ) {
        const autoLock =
          localStorage.getItem(AUTO_LOCK_KEY) ||
          "immediately";

        if (autoLock === "immediately") {
          setLocked(true);
          setEnteredPin("");
          setError("");
        }
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [loading]);

  function unlockApp() {
    if (enteredPin === pin) {
      setLocked(false);
      setEnteredPin("");
      setError("");
    } else {
      setError("Incorrect PIN.");
      setEnteredPin("");
    }
  }

  function handleNumber(value: string) {
    if (enteredPin.length >= 6) return;

    setEnteredPin((prev) => prev + value);
    setError("");
  }

  function removeNumber() {
    setEnteredPin((prev) =>
      prev.slice(0, -1)
    );
    setError("");
  }

  if (loading) {
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

        <h1>HisabPro</h1>

        <p>App Locked</p>

        <div className="app-lock-dots">
          {[0, 1, 2, 3, 4, 5].map(
            (index) => (
              <span
                key={index}
                className={
                  index < enteredPin.length
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
          ].map((number) => (
            <button
              key={number}
              onClick={() =>
                handleNumber(number)
              }
            >
              {number}
            </button>
          ))}

          <button
            className="empty-key"
            disabled
          />

          <button
            onClick={() =>
              handleNumber("0")
            }
          >
            0
          </button>

          <button
            onClick={removeNumber}
            className="delete-key"
          >
            ⌫
          </button>
        </div>

        <button
          className="app-lock-unlock"
          onClick={unlockApp}
          disabled={enteredPin.length < 4}
        >
          Unlock
        </button>
      </div>
    </main>
  );
}
