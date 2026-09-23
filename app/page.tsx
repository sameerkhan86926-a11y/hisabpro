"use client";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v18" />
      <path d="M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3" />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 7 9-4 9 4-9 4-9-4Z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8" />
      <path d="M18 14c1.8.8 3 2.4 3 4.5" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 7 9-4 9 4-9 4-9-4Z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="app">

      {/* HEADER */}

      <header className="header">
        <div>
          <h1>HisabPro</h1>
          <p>Sales • Stock • Khata • Profit</p>
        </div>

        <button
          className="notification"
          aria-label="Notifications"
        >
          <BellIcon />
        </button>
      </header>


      {/* WELCOME */}

      <section className="welcome">
        <p>Good Morning 👋</p>
        <h2>Business Overview</h2>
      </section>


      {/* STATS */}

      <section className="stats">

        <div className="card sales">
          <span>Today's Sales</span>
          <strong>₹12,450</strong>
          <small>+12.5% from yesterday</small>
        </div>

        <div className="card">
          <span>Expenses</span>
          <strong>₹4,200</strong>
          <small>Today's expenses</small>
        </div>

        <div className="card profit">
          <span>Today's Profit</span>
          <strong>₹8,250</strong>
          <small>66.2% margin</small>
        </div>

        <div className="card">
          <span>Customer Due</span>
          <strong>₹18,700</strong>
          <small>12 customers</small>
        </div>

      </section>


      {/* QUICK ACTIONS */}

      <section className="section">

        <div className="section-title">
          <h3>Quick Actions</h3>
        </div>

        <div className="actions">

          <a
            href="/hisabpro/sales/"
            className="action-link"
          >
            <PlusIcon />
            <span>New Sale</span>
          </a>


          <a
            href="/hisabpro/stock/"
            className="action-link"
          >
            <PackageIcon />
            <span>Add Product</span>
          </a>


          <a
            href="/hisabpro/expenses/"
            className="action-link"
          >
            <PlusIcon />
            <span>Add Expense</span>
          </a>


          <a
            href="/hisabpro/khata/"
            className="action-link"
          >
            <PlusIcon />
            <span>Add Customer</span>
          </a>

        </div>

      </section>


      {/* BUSINESS SUMMARY */}

      <section className="section">

        <div className="section-title">
          <h3>Business Summary</h3>

          <a href="/hisabpro/sales/history/">
            View All
          </a>
        </div>


        <div className="summary">

          <a href="/hisabpro/stock/">
            <PackageIcon />
            <p>Low Stock</p>
            <strong>View Stock</strong>
          </a>


          <a href="/hisabpro/khata/">
            <UsersIcon />
            <p>Total Customers</p>
            <strong>126</strong>
          </a>


          <a href="/hisabpro/sales/history/">
            <ReceiptIcon />
            <p>Total Bills</p>
            <strong>View Sales</strong>
          </a>

        </div>

      </section>


      {/* BOTTOM NAVIGATION */}

      <nav className="bottom-nav">

        <a
          href="/hisabpro/"
          className="active"
        >
          <HomeIcon />
          <span>Home</span>
        </a>


        <a href="/hisabpro/sales/">
          <SalesIcon />
          <span>Sales</span>
        </a>


        <a href="/hisabpro/stock/">
          <StockIcon />
          <span>Stock</span>
        </a>


        <a href="/hisabpro/khata/">
          <UsersIcon />
          <span>Khata</span>
        </a>


        <a href="/hisabpro/more/">
          <MoreIcon />
          <span>More</span>
        </a>

      </nav>

    </main>
  );
}
