"use client";

import Link from "next/link";

export default function MorePage() {
  return (
    <main className="more-page">
      <header className="more-header">
        <Link href="/hisabpro/">← Dashboard</Link>
        <h1>More</h1>
        <span></span>
      </header>

      {/* BUSINESS */}
      <section className="more-section">
        <h2>Business</h2>

        <div className="more-grid">
          <Link href="/hisabpro/reports/" className="more-card">
            <div className="more-icon">📊</div>
            <div>
              <strong>Reports</strong>
              <span>Sales, profit & business reports</span>
            </div>
          </Link>

          <Link href="/hisabpro/expenses/" className="more-card">
            <div className="more-icon">💰</div>
            <div>
              <strong>Expenses</strong>
              <span>Manage business expenses</span>
            </div>
          </Link>

          <Link href="/hisabpro/stock/" className="more-card">
            <div className="more-icon">📦</div>
            <div>
              <strong>Stock</strong>
              <span>Products & inventory</span>
            </div>
          </Link>

          <Link href="/hisabpro/khata/" className="more-card">
            <div className="more-icon">👤</div>
            <div>
              <strong>Khata</strong>
              <span>Customers & outstanding dues</span>
            </div>
          </Link>

          <Link href="/hisabpro/settings/" className="more-card">
            <div className="more-icon">🏪</div>
            <div>
              <strong>Business Settings</strong>
              <span>Shop name, phone, address & GSTIN</span>
            </div>
          </Link>

          <Link href="/hisabpro/cashbook/" className="more-card">
            <div className="more-icon">💵</div>
            <div>
              <strong>Cashbook</strong>
              <span>Cash balance, cash in & cash out</span>
            </div>
          </Link>
        </div>
      </section>

      {/* SALES */}
      <section className="more-section">
        <h2>Sales</h2>

        <div className="more-grid">
          <Link href="/hisabpro/sales/" className="more-card">
            <div className="more-icon">🧾</div>
            <div>
              <strong>New Sale</strong>
              <span>Create a new bill</span>
            </div>
          </Link>

          <Link href="/hisabpro/sales/history/" className="more-card">
            <div className="more-icon">📋</div>
            <div>
              <strong>Sales History</strong>
              <span>View previous sales</span>
            </div>
          </Link>

          <Link href="/hisabpro/returns/sales/" className="more-card">
            <div className="more-icon">↩️</div>
            <div>
              <strong>Sales Return</strong>
              <span>Return products from customers</span>
            </div>
          </Link>
        </div>
      </section>

      {/* PURCHASE */}
      <section className="more-section">
        <h2>Purchase</h2>

        <div className="more-grid">
          <Link href="/hisabpro/purchase/" className="more-card">
            <div className="more-icon">🛒</div>
            <div>
              <strong>New Purchase</strong>
              <span>Add stock from suppliers</span>
            </div>
          </Link>

          <Link href="/hisabpro/purchase/history/" className="more-card">
            <div className="more-icon">📋</div>
            <div>
              <strong>Purchase History</strong>
              <span>View previous purchases</span>
            </div>
          </Link>

          <Link href="/hisabpro/returns/purchase/" className="more-card">
            <div className="more-icon">↪️</div>
            <div>
              <strong>Purchase Return</strong>
              <span>Return products to suppliers</span>
            </div>
          </Link>
        </div>
      </section>

      {/* SUPPLIERS */}
      <section className="more-section">
        <h2>Suppliers</h2>

        <div className="more-grid">
          <Link href="/hisabpro/suppliers/" className="more-card">
            <div className="more-icon">🏭</div>
            <div>
              <strong>Suppliers</strong>
              <span>Manage suppliers & payable</span>
            </div>
          </Link>

          <Link href="/hisabpro/suppliers/payments/" className="more-card">
            <div className="more-icon">💳</div>
            <div>
              <strong>Supplier Payment</strong>
              <span>Record supplier payments</span>
            </div>
          </Link>

          <Link href="/hisabpro/suppliers/ledger/" className="more-card">
            <div className="more-icon">📒</div>
            <div>
              <strong>Supplier Ledger</strong>
              <span>Purchases, payments & payable</span>
            </div>
          </Link>
        </div>
      </section>

      {/* RETURNS */}
      <section className="more-section">
        <h2>Returns</h2>

        <div className="more-grid">
          <Link href="/hisabpro/returns/" className="more-card">
            <div className="more-icon">🔄</div>
            <div>
              <strong>Returns Center</strong>
              <span>Sales & purchase returns</span>
            </div>
          </Link>

          <Link href="/hisabpro/returns/history/" className="more-card">
            <div className="more-icon">📑</div>
            <div>
              <strong>Return History</strong>
              <span>View all return transactions</span>
            </div>
          </Link>
        </div>
      </section>

      {/* CASHBOOK */}
      <section className="more-section">
        <h2>Cashbook</h2>

        <div className="more-grid">
          <Link href="/hisabpro/cashbook/" className="more-card">
            <div className="more-icon">💰</div>
            <div>
              <strong>Cashbook</strong>
              <span>Current cash balance</span>
            </div>
          </Link>

          <Link href="/hisabpro/cashbook/in/" className="more-card">
            <div className="more-icon">⬇️</div>
            <div>
              <strong>Cash In</strong>
              <span>Record received cash</span>
            </div>
          </Link>

          <Link href="/hisabpro/cashbook/out/" className="more-card">
            <div className="more-icon">⬆️</div>
            <div>
              <strong>Cash Out</strong>
              <span>Record paid cash</span>
            </div>
          </Link>

          <Link href="/hisabpro/cashbook/history/" className="more-card">
            <div className="more-icon">📜</div>
            <div>
              <strong>Cashbook History</strong>
              <span>View all cash transactions</span>
            </div>
          </Link>
        </div>
      </section>

      {/* DATA & BACKUP */}
      <section className="more-section">
        <h2>Data & Security</h2>

        <div className="more-grid">
          <Link href="/hisabpro/backup/" className="more-card">
            <div className="more-icon">💾</div>
            <div>
              <strong>Backup & Restore</strong>
              <span>Save and restore your business data</span>
            </div>
          </Link>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="more-section">
        <h2>Quick Links</h2>

        <div className="more-links">
          <Link href="/hisabpro/">🏠 Dashboard</Link>
          <Link href="/hisabpro/sales/">🧾 New Sale</Link>
          <Link href="/hisabpro/stock/">📦 Stock</Link>
          <Link href="/hisabpro/khata/">📒 Khata</Link>
          <Link href="/hisabpro/purchase/">🛒 Purchase</Link>
          <Link href="/hisabpro/suppliers/">🏭 Suppliers</Link>
          <Link href="/hisabpro/cashbook/">💰 Cashbook</Link>
          <Link href="/hisabpro/returns/">🔄 Returns</Link>
          <Link href="/hisabpro/reports/">📊 Reports</Link>
          <Link href="/hisabpro/settings/">🏪 Business Settings</Link>
          <Link href="/hisabpro/backup/">💾 Backup & Restore</Link>
        </div>
      </section>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <Link href="/hisabpro/">
          <svg viewBox="0 0 24 24">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9v11h14V9" />
          </svg>
          <span>Home</span>
        </Link>

        <Link href="/hisabpro/sales/">
          <svg viewBox="0 0 24 24">
            <path d="M6 2h12v20H6z" />
            <path d="M9 6h6" />
            <path d="M9 10h6" />
            <path d="M9 14h6" />
          </svg>
          <span>Sales</span>
        </Link>

        <Link href="/hisabpro/stock/">
          <svg viewBox="0 0 24 24">
            <path d="M3 9l9-5 9 5-9 5-9-5z" />
            <path d="M3 9v10l9 5 9-5V9" />
          </svg>
          <span>Stock</span>
        </Link>

        <Link href="/hisabpro/khata/">
          <svg viewBox="0 0 24 24">
            <circle cx="9" cy="8" r="4" />
            <path d="M3 21a6 6 0 0 1 12 0" />
            <path d="M16 11a4 4 0 0 1 5 4" />
          </svg>
          <span>Khata</span>
        </Link>

        <Link href="/hisabpro/more/" className="active">
          <svg viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
          <span>More</span>
        </Link>
      </nav>
    </main>
  );
}
