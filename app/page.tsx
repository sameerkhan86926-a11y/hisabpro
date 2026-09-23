export default function Home() {
  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>HisabPro</h1>
          <p>Sales • Stock • Khata • Profit</p>
        </div>

        <button className="notification">🔔</button>
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
          <button>＋<span>New Sale</span></button>
          <button>＋<span>Add Product</span></button>
          <button>＋<span>Add Expense</span></button>
          <button>＋<span>Add Customer</span></button>
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <h3>Business Summary</h3>
          <button>View All</button>
        </div>

        <div className="summary">
          <div>
            <span>📦</span>
            <p>Low Stock</p>
            <strong>8 Products</strong>
          </div>

          <div>
            <span>👥</span>
            <p>Total Customers</p>
            <strong>126</strong>
          </div>

          <div>
            <span>🧾</span>
            <p>Total Bills</p>
            <strong>48</strong>
          </div>
        </div>
      </section>

      <nav className="bottom-nav">
        <a className="active">⌂<span>Home</span></a>
        <a>₹<span>Sales</span></a>
        <a>📦<span>Stock</span></a>
        <a>👥<span>Khata</span></a>
        <a>☰<span>More</span></a>
      </nav>
    </main>
  );
}
