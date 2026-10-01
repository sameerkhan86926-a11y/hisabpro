"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type Business = {
  id: number;
  businessName: string;
  ownerName: string;
  phone: string;
};

export default function MorePage() {
  const { language, setLanguage } = useLanguage();

  // Support State
  const [showSupport, setShowSupport] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Quick Business State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<number | null>(null);

  // Security / App Lock Modal State
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [appPin, setAppPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinLength, setPinLength] = useState("4");
  const [autoLock, setAutoLock] = useState("immediately");
  const [securityMessage, setSecurityMessage] = useState("");

  useEffect(() => {
    loadSettingsData();
  }, []);

  function loadSettingsData() {
    try {
      const saved = localStorage.getItem("hisabpro_businesses");
      const activeId = localStorage.getItem("hisabpro_active_business");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBusinesses(parsed);
          if (activeId) {
            setActiveBusinessId(Number(activeId));
            const current = parsed.find((b) => b.id === Number(activeId));
            if (current) {
              if (current.businessName) setName(current.businessName);
              if (current.phone) setPhone(current.phone);
            }
          } else if (parsed.length > 0) {
            setActiveBusinessId(parsed[0].id);
            if (parsed[0].businessName) setName(parsed[0].businessName);
            if (parsed[0].phone) setPhone(parsed[0].phone);
          }
        }
      }

      const savedLock = localStorage.getItem("hisabpro_app_lock") === "true";
      const savedPin = localStorage.getItem("hisabpro_app_lock_pin_hash");
      const savedPinLen = localStorage.getItem("hisabpro_app_lock_pin_length") || "4";
      const savedAuto = localStorage.getItem("hisabpro_app_lock_auto") || "immediately";

      setAppLockEnabled(savedLock);
      setAppPin(savedPin ? "******" : "");
      setPinLength(savedPinLen);
      setAutoLock(savedAuto);
    } catch {}
  }

  function handleLanguageSwitch(lang: "en" | "hi") {
    setLanguage(lang);
  }

  function switchActiveBusiness(id: number) {
    const selected = businesses.find((b) => b.id === id);
    if (!selected) return;

    setActiveBusinessId(id);
    localStorage.setItem("hisabpro_active_business", String(id));
    localStorage.setItem("hisabpro_business", JSON.stringify(selected));
    if (selected.businessName) setName(selected.businessName);
    if (selected.phone) setPhone(selected.phone);
  }

  async function hashPin(value: string) {
    const data = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function handleSaveSecurity() {
    setSecurityMessage("");

    if (!appLockEnabled) {
      localStorage.setItem("hisabpro_app_lock", "false");
      localStorage.removeItem("hisabpro_app_lock_pin_hash");
      localStorage.removeItem("hisabpro_app_lock_pin_length");
      localStorage.removeItem("hisabpro_app_lock_auto");
      window.dispatchEvent(new CustomEvent("hisabpro-app-lock-changed"));
      setAppPin("");
      setConfirmPin("");
      setSecurityMessage("App Lock band ho gaya.");
      setTimeout(() => setShowSecurityModal(false), 1200);
      return;
    }

    if (appPin === "******") {
      localStorage.setItem("hisabpro_app_lock", "true");
      localStorage.setItem("hisabpro_app_lock_pin_length", pinLength);
      localStorage.setItem("hisabpro_app_lock_auto", autoLock);
      window.dispatchEvent(new CustomEvent("hisabpro-app-lock-changed"));
      setSecurityMessage("Security settings update ho gayi.");
      setTimeout(() => setShowSecurityModal(false), 1200);
      return;
    }

    if (!/^\d+$/.test(appPin)) {
      setSecurityMessage("PIN sirf numbers me hona chahiye.");
      return;
    }

    if (appPin.length !== Number(pinLength)) {
      setSecurityMessage(`PIN exact ${pinLength} digit ka hona chahiye.`);
      return;
    }

    if (appPin !== confirmPin) {
      setSecurityMessage("PIN aur Confirm PIN match nahi hue.");
      return;
    }

    const hashedPin = await hashPin(appPin);
    localStorage.setItem("hisabpro_app_lock_pin_hash", hashedPin);
    localStorage.setItem("hisabpro_app_lock", "true");
    localStorage.setItem("hisabpro_app_lock_pin_length", pinLength);
    localStorage.setItem("hisabpro_app_lock_auto", autoLock);

    window.dispatchEvent(new CustomEvent("hisabpro-app-lock-changed"));
    setAppPin("******");
    setConfirmPin("");
    setSecurityMessage("App Lock activate ho gaya!");
    setTimeout(() => setShowSecurityModal(false), 1200);
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !problem.trim()) {
      alert("Kripya saari details bharein.");
      return;
    }

    setIsSubmitting(true);
    const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSeEfgh1laeARcWSzZExLZijSHb4n1nrRCvy9PIWRJCla4-idg/formResponse?entry.1227657136=${encodeURIComponent(
      name
    )}&entry.1740240324=${encodeURIComponent(
      phone
    )}&entry.1595797954=${encodeURIComponent(problem)}&submit=Submit`;

    try {
      await fetch(formUrl, { method: "POST", mode: "no-cors" });
      setIsSubmitting(false);
      setIsSuccess(true);
      setProblem("");
      setTimeout(() => {
        setIsSuccess(false);
        setShowSupport(false);
      }, 2000);
    } catch {
      setIsSubmitting(false);
      alert("Request bhejte waqt problem aayi. Try again.");
    }
  };

  return (
    <main className="more-page">
      <header className="more-header">
        <a href="/hisabpro/">← Dashboard</a>
        <h1>More</h1>
        <span></span>
      </header>

      {/* QUICK PREFERENCES */}
      <section className="more-section">
        <h2>App Preferences</h2>

        <div style={{ background: "#fff", borderRadius: "14px", padding: "14px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>App Language</span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{language === "hi" ? "हिन्दी" : "English"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              type="button"
              onClick={() => handleLanguageSwitch("en")}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: language === "en" ? "2px solid #102a56" : "1px solid #cbd5e1",
                background: language === "en" ? "#102a56" : "#ffffff",
                color: language === "en" ? "#ffffff" : "#102a56",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch("hi")}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: language === "hi" ? "2px solid #102a56" : "1px solid #cbd5e1",
                background: language === "hi" ? "#102a56" : "#ffffff",
                color: language === "hi" ? "#ffffff" : "#102a56",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              हिन्दी
            </button>
          </div>

          {businesses.length > 1 && (
            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed #e2e8f0" }}>
              <span style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Active Dukan Select Karein
              </span>
              <select
                value={activeBusinessId ?? ""}
                onChange={(e) => switchActiveBusiness(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "#f8fafc",
                  color: "#1e293b",
                  fontWeight: "600",
                }}
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    🏪 {b.businessName || "Unnamed Business"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="more-grid">
          <button
            type="button"
            onClick={() => setShowSecurityModal(true)}
            className="more-card"
            style={{
              textAlign: "left",
              background: "#fff",
              border: "none",
              cursor: "pointer",
              width: "100%",
              fontFamily: "inherit",
            }}
          >
            <div className="more-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#102a56" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <strong>App Lock & Security</strong>
              <span>Status: <strong style={{ color: appLockEnabled ? "#16a34a" : "#dc2626" }}>{appLockEnabled ? "ON (Protected)" : "OFF"}</strong></span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowSupport(true)}
            className="more-card"
            style={{
              textAlign: "left",
              background: "#fff",
              border: "none",
              cursor: "pointer",
              width: "100%",
              fontFamily: "inherit",
            }}
          >
            <div className="more-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#102a56" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div>
              <strong>Help & Support</strong>
              <span>Problem report karein ya helpline se judein</span>
            </div>
          </button>
        </div>
      </section>

      {/* PRINT & HARDWARE TOOLS */}
      <section className="more-section">
        <h2>Print & Hardware Tools</h2>
        <div className="more-grid">
          <a href="/hisabpro/barcode/" className="more-card">
            <div className="more-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#102a56" }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <line x1="7" y1="8" x2="7" y2="16" />
                <line x1="10" y1="8" x2="10" y2="16" />
                <line x1="13" y1="8" x2="13" y2="16" />
                <line x1="17" y1="8" x2="17" y2="16" />
              </svg>
            </div>
            <div>
              <strong>Barcode Generator & Print</strong>
              <span>Create & print product barcode stickers</span>
            </div>
          </a>
        </div>
      </section>

      {/* BUSINESS */}
      <section className="more-section">
        <h2>Business</h2>
        <div className="more-grid">
          <a href="/hisabpro/reports/" className="more-card">
            <div className="more-icon">📊</div>
            <div>
              <strong>Reports</strong>
              <span>Sales, profit & business reports</span>
            </div>
          </a>
          <a href="/hisabpro/expenses/" className="more-card">
            <div className="more-icon">💰</div>
            <div>
              <strong>Expenses</strong>
              <span>Manage business expenses</span>
            </div>
          </a>
          <a href="/hisabpro/stock/" className="more-card">
            <div className="more-icon">📦</div>
            <div>
              <strong>Stock</strong>
              <span>Products & inventory</span>
            </div>
          </a>
          <a href="/hisabpro/khata/" className="more-card">
            <div className="more-icon">👤</div>
            <div>
              <strong>Khata</strong>
              <span>Customers & outstanding dues</span>
            </div>
          </a>
          <a href="/hisabpro/settings/" className="more-card">
            <div className="more-icon">🏪</div>
            <div>
              <strong>Business Settings</strong>
              <span>Edit profile, UPI QR & GSTIN</span>
            </div>
          </a>
          <a href="/hisabpro/cashbook/" className="more-card">
            <div className="more-icon">💵</div>
            <div>
              <strong>Cashbook</strong>
              <span>Cash balance, cash in & cash out</span>
            </div>
          </a>
        </div>
      </section>

      {/* SALES */}
      <section className="more-section">
        <h2>Sales</h2>
        <div className="more-grid">
          <a href="/hisabpro/sales/" className="more-card">
            <div className="more-icon">🧾</div>
            <div>
              <strong>New Sale</strong>
              <span>Create a new bill</span>
            </div>
          </a>
          <a href="/hisabpro/sales/history/" className="more-card">
            <div className="more-icon">📋</div>
            <div>
              <strong>Sales History</strong>
              <span>View previous sales</span>
            </div>
          </a>
          <a href="/hisabpro/returns/sales/" className="more-card">
            <div className="more-icon">↩️</div>
            <div>
              <strong>Sales Return</strong>
              <span>Return products from customers</span>
            </div>
          </a>
        </div>
      </section>

      {/* PURCHASE */}
      <section className="more-section">
        <h2>Purchase</h2>
        <div className="more-grid">
          <a href="/hisabpro/purchase/" className="more-card">
            <div className="more-icon">🛒</div>
            <div>
              <strong>New Purchase</strong>
              <span>Add stock from suppliers</span>
            </div>
          </a>
          <a href="/hisabpro/purchase/history/" className="more-card">
            <div className="more-icon">📋</div>
            <div>
              <strong>Purchase History</strong>
              <span>View previous purchases</span>
            </div>
          </a>
          <a href="/hisabpro/returns/purchase/" className="more-card">
            <div className="more-icon">↪️</div>
            <div>
              <strong>Purchase Return</strong>
              <span>Return products to suppliers</span>
            </div>
          </a>
        </div>
      </section>

      {/* SUPPLIERS */}
      <section className="more-section">
        <h2>Suppliers</h2>
        <div className="more-grid">
          <a href="/hisabpro/suppliers/" className="more-card">
            <div className="more-icon">🏭</div>
            <div>
              <strong>Suppliers</strong>
              <span>Manage suppliers & payable</span>
            </div>
          </a>
          <a href="/hisabpro/suppliers/payments/" className="more-card">
            <div className="more-icon">💳</div>
            <div>
              <strong>Supplier Payment</strong>
              <span>Record supplier payments</span>
            </div>
          </a>
          <a href="/hisabpro/suppliers/ledger/" className="more-card">
            <div className="more-icon">📒</div>
            <div>
              <strong>Supplier Ledger</strong>
              <span>Purchases, payments & payable</span>
            </div>
          </a>
        </div>
      </section>

      {/* RETURNS */}
      <section className="more-section">
        <h2>Returns</h2>
        <div className="more-grid">
          <a href="/hisabpro/returns/" className="more-card">
            <div className="more-icon">🔄</div>
            <div>
              <strong>Returns Center</strong>
              <span>Sales & purchase returns</span>
            </div>
          </a>
          <a href="/hisabpro/returns/history/" className="more-card">
            <div className="more-icon">📑</div>
            <div>
              <strong>Return History</strong>
              <span>View all return transactions</span>
            </div>
          </a>
        </div>
      </section>

      {/* CASHBOOK */}
      <section className="more-section">
        <h2>Cashbook</h2>
        <div className="more-grid">
          <a href="/hisabpro/cashbook/" className="more-card">
            <div className="more-icon">💰</div>
            <div>
              <strong>Cashbook</strong>
              <span>Current cash balance</span>
            </div>
          </a>
          <a href="/hisabpro/cashbook/in/" className="more-card">
            <div className="more-icon">⬇️</div>
            <div>
              <strong>Cash In</strong>
              <span>Record received cash</span>
            </div>
          </a>
          <a href="/hisabpro/cashbook/out/" className="more-card">
            <div className="more-icon">⬆️</div>
            <div>
              <strong>Cash Out</strong>
              <span>Record paid cash</span>
            </div>
          </a>
          <a href="/hisabpro/cashbook/history/" className="more-card">
            <div className="more-icon">📜</div>
            <div>
              <strong>Cashbook History</strong>
              <span>View all cash transactions</span>
            </div>
          </a>
        </div>
      </section>

      {/* BACKUP & RESTORE */}
      <section className="more-section">
        <h2>Backup & Restore</h2>
        <div className="more-grid">
          <a href="/hisabpro/backup/" className="more-card">
            <div className="more-icon">💾</div>
            <div>
              <strong>Backup & Restore</strong>
              <span>Save and restore your business data</span>
            </div>
          </a>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="more-section">
        <h2>Quick Links</h2>
        <div className="more-links">
          <a href="/hisabpro/">🏠 Dashboard</a>
          <a href="/hisabpro/sales/">🧾 New Sale</a>
          <a href="/hisabpro/stock/">📦 Stock</a>
          <a href="/hisabpro/khata/">📒 Khata</a>
          <a href="/hisabpro/purchase/">🛒 Purchase</a>
          <a href="/hisabpro/suppliers/">🏭 Suppliers</a>
          <a href="/hisabpro/cashbook/">💰 Cashbook</a>
          <a href="/hisabpro/returns/">🔄 Returns</a>
          <a href="/hisabpro/reports/">📊 Reports</a>
          <a href="/hisabpro/settings/">🏪 Business Settings</a>
          <a href="/hisabpro/backup/">💾 Backup & Restore</a>
        </div>
      </section>

      {/* SECURITY / APP LOCK MODAL */}
      {showSecurityModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(3px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "420px",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#102a56",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "16px" }}>
                <span>🔐</span>
                <span>App Lock Security</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSecurityModal(false);
                  setSecurityMessage("");
                }}
                style={{
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "14px", color: "#1e293b" }}>App Lock Protection</strong>
                  <small style={{ color: "#64748b", fontSize: "12px" }}>App open hone par PIN maangega</small>
                </div>
                <button
                  type="button"
                  onClick={() => setAppLockEnabled(!appLockEnabled)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                    backgroundColor: appLockEnabled ? "#16a34a" : "#cbd5e1",
                    color: appLockEnabled ? "#ffffff" : "#475569",
                  }}
                >
                  {appLockEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {appLockEnabled && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                      PIN Length
                    </label>
                    <select
                      value={pinLength}
                      onChange={(e) => {
                        setPinLength(e.target.value);
                        setAppPin("");
                        setConfirmPin("");
                      }}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    >
                      <option value="4">4 Digit PIN</option>
                      <option value="6">6 Digit PIN</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                      {appPin === "******" ? "Change PIN" : "New PIN"}
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={Number(pinLength)}
                      placeholder={`Enter ${pinLength} digit PIN`}
                      value={appPin === "******" ? "" : appPin}
                      onChange={(e) => setAppPin(e.target.value.replace(/\D/g, ""))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={Number(pinLength)}
                      placeholder="Confirm PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                      Auto Lock
                    </label>
                    <select
                      value={autoLock}
                      onChange={(e) => setAutoLock(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    >
                      <option value="immediately">Immediately</option>
                      <option value="1">After 1 minute</option>
                      <option value="5">After 5 minutes</option>
                      <option value="15">After 15 minutes</option>
                    </select>
                  </div>
                </div>
              )}

              {securityMessage && (
                <p style={{ fontSize: "12px", color: securityMessage.includes("nahi") || securityMessage.includes("must") ? "#dc2626" : "#16a34a", marginBottom: "12px" }}>
                  {securityMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleSaveSecurity}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#102a56",
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Security Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SUPPORT MODAL */}
      {showSupport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(3px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "460px",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#102a56",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "16px" }}>
                <span>🎧</span>
                <span>Help & Support</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSupport(false);
                  setIsSuccess(false);
                }}
                style={{
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {isSuccess ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      backgroundColor: "#dcfce7",
                      color: "#16a34a",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px auto",
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: "0 0 6px 0" }}>
                    Request Bhej Di Gayi!
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    Humari team aapse jald hi WhatsApp ya call par contact karegi.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      Vyapari / Dukan ka Naam
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunil General Store"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      Aapko kya dikkat aa rahi hai?
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Apni problem ya suggestion likhein..."
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", resize: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      marginTop: "6px",
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: "#102a56",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "14px",
                      border: "none",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? "Bheja ja raha hai..." : "Submit Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <a href="/hisabpro/">
          <svg viewBox="0 0 24 24">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9v11h14V9" />
          </svg>
          <span>Home</span>
        </a>
        <a href="/hisabpro/sales/">
          <svg viewBox="0 0 24 24">
            <path d="M6 2h12v20H6z" />
            <path d="M9 6h6" />
            <path d="M9 10h6" />
            <path d="M9 14h6" />
          </svg>
          <span>Sales</span>
        </a>
        <a href="/hisabpro/stock/">
          <svg viewBox="0 0 24 24">
            <path d="M3 9l9-5 9 5-9 5-9-5z" />
            <path d="M3 9v10l9 5 9-5V9" />
          </svg>
          <span>Stock</span>
        </a>
        <a href="/hisabpro/khata/">
          <svg viewBox="0 0 24 24">
            <circle cx="9" cy="8" r="4" />
            <path d="M3 21a6 6 0 0 1 12 0" />
            <path d="M16 11a4 4 0 0 1 5 4" />
          </svg>
          <span>Khata</span>
        </a>
        <a href="/hisabpro/more/" className="active">
          <svg viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
          <span>More</span>
        </a>
      </nav>
    </main>
  );
}
