"use client";

import { useState, useEffect } from "react";

export default function MorePage() {
  const [showSupport, setShowSupport] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Shop details auto-fill agar pehle se save ho
  useEffect(() => {
    try {
      const savedBusinesses = localStorage.getItem("hisabpro_businesses");
      const savedBusiness = localStorage.getItem("hisabpro_business");

      if (savedBusinesses) {
        const list = JSON.parse(savedBusinesses);
        if (Array.isArray(list) && list.length > 0) {
          if (list[0].businessName) setName(list[0].businessName);
          if (list[0].phone) setPhone(list[0].phone);
        }
      } else if (savedBusiness) {
        const single = JSON.parse(savedBusiness);
        if (single.businessName) setName(single.businessName);
        if (single.phone) setPhone(single.phone);
      }
    } catch (e) {}
  }, []);

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
      await fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setProblem("");

      setTimeout(() => {
        setIsSuccess(false);
        setShowSupport(false);
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      alert("Request bhejte waqt dikkat aayi. Kripya dobara try karein.");
    }
  };

  return (
    <main className="more-page">

      <header className="more-header">
        <a href="/hisabpro/">← Dashboard</a>
        <h1>More</h1>
        <span></span>
      </header>

      {/* HELP & SUPPORT (NATIVE APP STYLE) */}
      <section className="more-section">
        <h2>Help & Support</h2>

        <div className="more-grid">
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
            <div
              className="more-icon"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#102a56",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <span>Shop name, phone, address & GSTIN</span>
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

          <a href="/hisabpro/">
            🏠 Dashboard
          </a>

          <a href="/hisabpro/sales/">
            🧾 New Sale
          </a>

          <a href="/hisabpro/stock/">
            📦 Stock
          </a>

          <a href="/hisabpro/khata/">
            📒 Khata
          </a>

          <a href="/hisabpro/purchase/">
            🛒 Purchase
          </a>

          <a href="/hisabpro/suppliers/">
            🏭 Suppliers
          </a>

          <a href="/hisabpro/cashbook/">
            💰 Cashbook
          </a>

          <a href="/hisabpro/returns/">
            🔄 Returns
          </a>

          <a href="/hisabpro/reports/">
            📊 Reports
          </a>

          <a href="/hisabpro/settings/">
            🏪 Business Settings
          </a>

          <a href="/hisabpro/backup/">
            💾 Backup & Restore
          </a>

        </div>
      </section>

      {/* CUSTOM NATIVE SUPPORT MODAL */}
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
            {/* Header */}
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
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

            {/* Content Body */}
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
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
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
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
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
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        resize: "none",
                        boxSizing: "border-box",
                      }}
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
                      transition: "0.2s",
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

        <a
          href="/hisabpro/more/"
          className="active"
        >
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
