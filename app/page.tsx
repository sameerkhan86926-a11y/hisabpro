"use client";

import { useEffect, useState } from "react";

type Sale = {
  id: number;
  product: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  discount: number;
  total: number;
  date: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  due: number;
  createdAt: string;
};

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  function loadDashboardData() {
    const savedSales = JSON.parse(
      localStorage.getItem("hisabpro_sales") || "[]"
    );

    const savedProducts = JSON.parse(
      localStorage.getItem("hisabpro_products") || "[]"
    );

    const savedCustomers = JSON.parse(
      localStorage.getItem("hisabpro_customers") || "[]"
    );

    setSales(savedSales);
    setProducts(savedProducts);
    setCustomers(savedCustomers);
  }

  const today = new Date();

  const todaysSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);

    return (
      saleDate.getDate() === today.getDate() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getFullYear() === today.getFullYear()
    );
  });

  const todaySalesAmount = todaysSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalSales = sales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalProfit = sales.reduce(
    (sum, sale) =>
      sum +
      (sale.price - sale.purchasePrice) * sale.quantity -
      sale.discount,
    0
  );

  const totalStock = products.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  const stockValue = products.reduce(
    (sum, product) =>
      sum + product.purchasePrice * product.stock,
    0
  );

  const totalDue = customers.reduce(
    (sum, customer) => sum + customer.due,
    0
  );

  return (
    <main className="app">

      <header className="header">

        <div>
          <h1>HisabPro</h1>
          <p>Sales • Stock • Khata • Profit</p>
        </div>

        <button className="notification">
          <svg viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

      </header>

      <section className="welcome">

        <p>Good Morning 👋</p>

        <h2>Business Overview</h2>

      </section>

      <section className="stats">

        <div className="card sales">

          <span>Today's Sales</span>

          <strong>
            ₹{todaySalesAmount.toLocaleString("en-IN")}
          </strong>

          <small>
            {todaysSales.length} bills today
          </small>

        </div>

        <div className="card sales">

          <span>Total Sales</span>

          <strong>
            ₹{totalSales.toLocaleString("en-IN")}
          </strong>

          <small>
            {sales.length} total bills
          </small>

        </div>

        <div className="card profit">

          <span>Total Profit</span>

          <strong>
            ₹{Math.max(0, totalProfit).toLocaleString("en-IN")}
          </strong>

          <small>
            Based on recorded sales
          </small>

        </div>

        <div className="card">

          <span>Customers Due</span>

          <strong>
            ₹{totalDue.toLocaleString("en-IN")}
          </strong>

          <small>
            {customers.length} customers
          </small>

        </div>

      </section>

      <section className="section">

        <div className="section-title">

          <h3>Quick Actions</h3>

        </div>

        <div className="actions">

          <a
            className="action-link"
            href="/hisabpro/sales/"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>

            <span>New Sale</span>
          </a>

          <a
            className="action-link"
            href="/hisabpro/stock/"
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-5 9 5-9 5-9-5z" />
              <path d="M3 9v10l9 5 9-5V9" />
              <path d="M12 14v10" />
            </svg>

            <span>Add Product</span>
          </a>

          <a
            className="action-link"
            href="/hisabpro/expenses/"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 1v22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>

            <span>Add Expense</span>
          </a>

          <a
            className="action-link"
            href="/hisabpro/khata/"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="8" r="4" />
              <path d="M3 21a6 6 0 0 1 12 0" />
              <path d="M16 11a4 4 0 0 1 5 4" />
              <path d="M16 21h5" />
            </svg>

            <span>Add Customer</span>
          </a>

        </div>

      </section>

      <section className="section">

        <div className="section-title">

          <h3>Business Summary</h3>

        </div>

        <div className="summary">

          <a href="/hisabpro/stock/">

            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-5 9 5-9 5-9-5z" />
              <path d="M3 9v10l9 5 9-5V9" />
              <path d="M12 14v10" />
            </svg>

            <p>Total Stock</p>

            <strong>
              {totalStock} units
            </strong>

          </a>

          <a href="/hisabpro/stock/">

            <svg viewBox="0 0 24 24">
              <path d="M12 2v20" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>

            <p>Stock Value</p>

            <strong>
              ₹{stockValue.toLocaleString("en-IN")}
            </strong>

          </a>

          <a href="/hisabpro/khata/">

            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="8" r="4" />
              <path d="M3 21a6 6 0 0 1 12 0" />
              <path d="M16 11a4 4 0 0 1 5 4" />
              <path d="M16 21h5" />
            </svg>

            <p>Customers Due</p>

            <strong>
              ₹{totalDue.toLocaleString("en-IN")}
            </strong>

          </a>

        </div>

      </section>

      <nav className="bottom-nav">

        <a
          href="/hisabpro/"
          className="active"
        >
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

        <a href="/hisabpro/more/">

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
