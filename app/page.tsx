import Link from "next/link";

export default function Home() {
  return (
    <main className="app">

      <header className="header">
        <div>
          <h1>HisabPro</h1>
          <p>Sales • Stock • Khata • Profit</p>
        </div>

        <button className="notification">
          🔔
        </button>
      </header>

      <section className="welcome">
        <p>Good Morning 👋</p>
        <h2>Business Overview</h2>
      </section>

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

      <section className="section">

        <div className="section-title">
          <h3>Quick Actions</h3>
        </div>

        <div className="actions">

          <Link href="/hisabpro/sales/" className="action-link">
            ＋
            <span>New Sale</span>
          </Link>

          <Link href="/hisabpro/stock/" className="action-link">
            ＋
            <span>Add Product</span>
          </Link>

          <button>
            ＋
            <span>Add Expense</span>
          </button>

          <button>
            ＋
            <span>Add Customer</span>
          </button>

        </div>

      </section>

      <section className="section">

        <div className="section-title">
          <h3>Business Summary</h3>

          <Link href="/hisabpro/sales/history/">
            View All
          </Link>
        </div>

        <div className="summary">

          <Link href="/hisabpro/stock/">
            <span>📦</span>
            <p>Low Stock</p>
            <strong>View Stock</strong>
          </Link>

          <div>
            <span>👥</span>
            <p>Total Customers</p>
            <strong>126</strong>
          </div>

          <Link href="/hisabpro/sales/history/">
            <span>🧾</span>
            <p>Total Bills</p>
            <strong>View Sales</strong>
          </Link>

        </div>

      </section>

      <nav className="bottom-nav">

        <Link
          href="/hisabpro/"
          className="active"
        >
          ⌂
          <span>Home</span>
        </Link>

        <Link href="/hisabpro/sales/">
          ₹
          <span>Sales</span>
        </Link>

        <Link href="/hisabpro/stock/">
          📦
          <span>Stock</span>
        </Link>

        <button>
          👥
          <span>Khata</span>
        </button>

        <button>
          ☰
          <span>More</span>
        </button>

      </nav>

    </main>
  );
}
