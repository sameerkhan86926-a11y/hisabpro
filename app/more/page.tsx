"use client";

import { useState } from "react";

export default function MorePage() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <main className="more-page">

      <header className="more-header">
        <a href="/hisabpro/">← Dashboard</a>
        <h1>More</h1>
        <span></span>
      </header>

      {/* HELP & SUPPORT (NEW SECTION) */}
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
              fontFamily: "inherit"
            }}
          >
            <div className="more-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              <span>Problem report karein ya contact karein</span>
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

      {/* SUPPORT MODAL POPUP */}
      {showSupport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "#1e293b", fontSize: "15px" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                <span>HisabPro Help & Support</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSupport(false)}
                style={{
                  border: "none",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#475569"
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Google Form Embed */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSeEfgh1laeARcWSzZExLZijSHb4n1nrRCvy9PIWRJCla4-idg/viewform?embedded=true"
                width="100%"
                height="650"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                style={{ border: "none", display: "block" }}
              >
                Loading…
              </iframe>
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
