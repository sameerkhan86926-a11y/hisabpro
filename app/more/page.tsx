"use client";

export default function MorePage() {
  return (
    <main className="more-page">
      <header className="more-header">
        <a href="/hisabpro/">← Dashboard</a>
        <h1>More</h1>
        <span></span>
      </header>

      <section className="more-section">
        <h2>Business</h2>

        <div className="more-grid">

          <a
            href="/hisabpro/reports/"
            className="more-card"
          >
            <div className="more-icon">📊</div>
            <div>
              <strong>Reports</strong>
              <span>
                Sales, profit & business reports
              </span>
            </div>
          </a>

          <a
            href="/hisabpro/expenses/"
            className="more-card"
          >
            <div className="more-icon">💰</div>
            <div>
              <strong>Expenses</strong>
              <span>
                Manage business expenses
              </span>
            </div>
          </a>

          <a
            href="/hisabpro/stock/"
            className="more-card"
          >
            <div className="more-icon">📦</div>
            <div>
              <strong>Stock</strong>
              <span>
                Products & inventory
              </span>
            </div>
          </a>

          <a
            href="/hisabpro/khata/"
            className="more-card"
          >
            <div className="more-icon">👤</div>
            <div>
              <strong>Khata</strong>
              <span>
                Customers & outstanding dues
              </span>
            </div>
          </a>

          <a
            href="/hisabpro/settings/"
            className="more-card"
          >
            <div className="more-icon">🏪</div>
            <div>
              <strong>Business Settings</strong>
              <span>
                Shop name, phone, address & GSTIN
              </span>
            </div>
          </a>

        </div>
      </section>

      <section className="more-section">
        <h2>Sales</h2>

        <div className="more-grid">

          <a
            href="/hisabpro/sales/"
            className="more-card"
          >
            <div className="more-icon">🧾</div>
            <div>
              <strong>New Sale</strong>
              <span>
                Create a new bill
              </span>
            </div>
          </a>

          <a
            href="/hisabpro/sales/history/"
            className="more-card"
          >
            <div className="more-icon">📋</div>
            <div>
              <strong>Sales History</strong>
              <span>
                View previous sales
              </span>
            </div>
          </a>

        </div>
      </section>

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

          <a href="/hisabpro/reports/">
            📊 Reports
          </a>

          <a href="/hisabpro/settings/">
            🏪 Business Settings
          </a>
        </div>
      </section>

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
