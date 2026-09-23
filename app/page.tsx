"use client";

import { useEffect, useState } from "react";

type SaleItem = {
  productId: number;
  product: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  amount: number;
};

type Sale = {
  id: number;
  items?: SaleItem[];

  // Old sale format compatibility
  product?: string;
  price?: number;
  purchasePrice?: number;
  quantity?: number;

  discount?: number;
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

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  note: string;
  date: string;
};

function getSaleItems(sale: Sale): SaleItem[] {
  if (sale.items && sale.items.length > 0) {
    return sale.items;
  }

  // Old single-product sale support
  if (sale.product) {
    const quantity = sale.quantity || 1;
    const price = sale.price || 0;
    const purchasePrice = sale.purchasePrice || 0;

    return [
      {
        productId: 0,
        product: sale.product,
        price,
        purchasePrice,
        quantity,
        amount: price * quantity,
      },
    ];
  }

  return [];
}

function isToday(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    try {
      const savedSales = JSON.parse(
        localStorage.getItem("hisabpro_sales") || "[]"
      );

      const savedProducts = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      const savedCustomers = JSON.parse(
        localStorage.getItem("hisabpro_customers") || "[]"
      );

      const savedExpenses = JSON.parse(
        localStorage.getItem("hisabpro_expenses") || "[]"
      );

      setSales(Array.isArray(savedSales) ? savedSales : []);
      setProducts(Array.isArray(savedProducts) ? savedProducts : []);
      setCustomers(Array.isArray(savedCustomers) ? savedCustomers : []);
      setExpenses(Array.isArray(savedExpenses) ? savedExpenses : []);
    } catch (error) {
      console.error("Dashboard data error:", error);
    }
  }, []);

  // -----------------------------
  // SALES
  // -----------------------------

  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  const todaySales = sales
    .filter((sale) => isToday(sale.date))
    .reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );

  // -----------------------------
  // GROSS PROFIT
  // -----------------------------

  const grossProfit = sales.reduce((saleTotal, sale) => {
    const items = getSaleItems(sale);

    const itemProfit = items.reduce(
      (itemTotal, item) => {
        const sellingPrice = Number(item.price || 0);
        const purchasePrice = Number(
          item.purchasePrice || 0
        );
        const quantity = Number(item.quantity || 0);

        return (
          itemTotal +
          (sellingPrice - purchasePrice) * quantity
        );
      },
      0
    );

    const discount = Number(sale.discount || 0);

    return saleTotal + itemProfit - discount;
  }, 0);

  // -----------------------------
  // EXPENSES
  // -----------------------------

  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

  const todayExpenses = expenses
    .filter((expense) => isToday(expense.date))
    .reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

  const netProfit = grossProfit - totalExpenses;

  // -----------------------------
  // STOCK
  // -----------------------------

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.stock || 0),
    0
  );

  const stockValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.stock || 0) *
        Number(product.purchasePrice || 0),
    0
  );

  // -----------------------------
  // CUSTOMER DUE
  // -----------------------------

  const totalCustomerDue = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.due || 0),
    0
  );

  return (
    <main className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>HisabPro</h1>
          <p>Sales • Stock • Khata • Profit</p>
        </div>

        <a
  href="/hisabpro/notifications/"
  className="notification"
>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 21h4" />
  </svg>
</a>
      </header>

      {/* WELCOME */}
      <section className="welcome">
        <p>Good day 👋</p>
        <h2>Business Dashboard</h2>
      </section>

      {/* MAIN STATS */}
      <section className="stats">

        <div className="card sales">
          <span>Today's Sales</span>
          <strong>{formatMoney(todaySales)}</strong>
          <small>Today's business</small>
        </div>

        <div className="card">
          <span>Total Sales</span>
          <strong>{formatMoney(totalSales)}</strong>
          <small>{sales.length} bills</small>
        </div>

        <div className="card profit">
          <span>Net Profit</span>
          <strong>{formatMoney(netProfit)}</strong>
          <small>
            Gross {formatMoney(grossProfit)}
          </small>
        </div>

        <div className="card">
          <span>Expenses</span>
          <strong>{formatMoney(totalExpenses)}</strong>
          <small>
            Today {formatMoney(todayExpenses)}
          </small>
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
            <svg viewBox="0 0 24 24">
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>

            <span>New Sale</span>
          </a>

          <a
            href="/hisabpro/stock/"
            className="action-link"
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
              <path d="M12 11v10" />
            </svg>

            <span>Add Product</span>
          </a>

          <a
            href="/hisabpro/expenses/"
            className="action-link"
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 5h16v14H4z" />
              <path d="M8 9h8M8 13h5" />
            </svg>

            <span>Add Expense</span>
          </a>

          <a
            href="/hisabpro/khata/"
            className="action-link"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
            </svg>

            <span>Add Customer</span>
          </a>

        </div>
      </section>

      {/* BUSINESS SUMMARY */}
      <section className="section">

        <div className="section-title">
          <h3>Business Summary</h3>
        </div>

        <div className="summary">

          <a href="/hisabpro/stock/">
            <svg viewBox="0 0 24 24">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
              <path d="M12 11v10" />
            </svg>

            <p>Total Stock</p>
            <strong>{totalStock} items</strong>

            <small>
              Value: {formatMoney(stockValue)}
            </small>
          </a>

          <a href="/hisabpro/khata/">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
            </svg>

            <p>Customer Due</p>
            <strong>
              {formatMoney(totalCustomerDue)}
            </strong>

            <small>
              {customers.length} customers
            </small>
          </a>

          <a href="/hisabpro/reports/">
            <svg viewBox="0 0 24 24">
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="M7 15l3-4 3 2 5-6" />
            </svg>

            <p>Profit Report</p>
            <strong>
              {formatMoney(netProfit)}
            </strong>

            <small>
              Net profit
            </small>
          </a>

        </div>
      </section>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">

        <a
          href="/hisabpro/"
          className="active"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
            <path d="M9 20v-6h6v6" />
          </svg>
          <span>Home</span>
        </a>

        <a href="/hisabpro/sales/">
          <svg viewBox="0 0 24 24">
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          <span>Sales</span>
        </a>

        <a href="/hisabpro/stock/">
          <svg viewBox="0 0 24 24">
            <path d="M3 7l9-4 9 4-9 4-9-4z" />
            <path d="M3 7v10l9 4 9-4V7" />
            <path d="M12 11v10" />
          </svg>
          <span>Stock</span>
        </a>

        <a href="/hisabpro/khata/">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
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
