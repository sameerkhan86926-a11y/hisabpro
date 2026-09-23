"use client";

import { useEffect, useMemo, useState } from "react";

type Sale = {
  id: number;
  product: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  discount: number;
  total: number;
  date: string;
  paymentType?: "cash" | "credit";
};

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  note: string;
  date: string;
};

type ProductReport = {
  name: string;
  quantity: number;
  sales: number;
  profit: number;
};

type Period = "today" | "week" | "month" | "all";

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [period, setPeriod] = useState<Period>("today");

  useEffect(() => {
    const savedSales = JSON.parse(
      localStorage.getItem("hisabpro_sales") || "[]"
    );

    const savedExpenses = JSON.parse(
      localStorage.getItem("hisabpro_expenses") || "[]"
    );

    setSales(savedSales);
    setExpenses(savedExpenses);
  }, []);

  function isInPeriod(dateString: string) {
    if (period === "all") return true;

    const date = new Date(dateString);
    const now = new Date();

    if (period === "today") {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (period === "week") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const day = start.getDay();
      const difference = day === 0 ? 6 : day - 1;

      start.setDate(start.getDate() - difference);

      return date >= start && date <= now;
    }

    if (period === "month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return true;
  }

  const filteredSales = useMemo(
    () => sales.filter((sale) => isInPeriod(sale.date)),
    [sales, period]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => isInPeriod(expense.date)),
    [expenses, period]
  );

  const totalSales = filteredSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalItems = filteredSales.reduce(
    (sum, sale) => sum + sale.quantity,
    0
  );

  const grossProfit = filteredSales.reduce(
    (sum, sale) =>
      sum +
      (sale.price - sale.purchasePrice) * sale.quantity -
      sale.discount,
    0
  );

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const netProfit = grossProfit - totalExpenses;

  const cashSales = filteredSales
    .filter((sale) => sale.paymentType !== "credit")
    .reduce((sum, sale) => sum + sale.total, 0);

  const creditSales = filteredSales
    .filter((sale) => sale.paymentType === "credit")
    .reduce((sum, sale) => sum + sale.total, 0);

  const topProducts = useMemo(() => {
    const map: Record<string, ProductReport> = {};

    filteredSales.forEach((sale) => {
      if (!map[sale.product]) {
        map[sale.product] = {
          name: sale.product,
          quantity: 0,
          sales: 0,
          profit: 0,
        };
      }

      map[sale.product].quantity += sale.quantity;
      map[sale.product].sales += sale.total;

      map[sale.product].profit +=
        (sale.price - sale.purchasePrice) *
          sale.quantity -
        sale.discount;
    });

    return Object.values(map)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  }, [filteredSales]);

  const periodTitle =
    period === "today"
      ? "Today's Report"
      : period === "week"
      ? "This Week's Report"
      : period === "month"
      ? "This Month's Report"
      : "All Time Report";

  return (
    <main className="reports-page">
      <header className="reports-header">
        <button
  onClick={() => window.history.back()}
  className="back-button"
>
  ← Back
</button>
        <h1>Reports</h1>
        <span></span>
      </header>

      <section className="report-period">
        <button
          className={period === "today" ? "active" : ""}
          onClick={() => setPeriod("today")}
        >
          Today
        </button>

        <button
          className={period === "week" ? "active" : ""}
          onClick={() => setPeriod("week")}
        >
          This Week
        </button>

        <button
          className={period === "month" ? "active" : ""}
          onClick={() => setPeriod("month")}
        >
          This Month
        </button>

        <button
          className={period === "all" ? "active" : ""}
          onClick={() => setPeriod("all")}
        >
          All Time
        </button>
      </section>

      <section className="report-title">
        <h2>{periodTitle}</h2>
        <p>
          {filteredSales.length} bills • {totalItems} items sold
        </p>
      </section>

      <section className="report-stats">
        <div className="report-card">
          <span>Total Sales</span>
          <strong>
            ₹{totalSales.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="report-card">
          <span>Gross Profit</span>
          <strong>
            ₹{grossProfit.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="report-card expense">
          <span>Expenses</span>
          <strong>
            ₹{totalExpenses.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="report-card profit">
          <span>Net Profit</span>
          <strong>
            ₹{netProfit.toLocaleString("en-IN")}
          </strong>
        </div>
      </section>

      <section className="report-section">
        <h2>Payment Summary</h2>

        <div className="payment-summary">
          <div>
            <span>💵 Cash Sales</span>
            <strong>
              ₹{cashSales.toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>📒 Credit Sales</span>
            <strong>
              ₹{creditSales.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2>Top Products</h2>

        {topProducts.length === 0 ? (
          <div className="report-empty">
            <div>📊</div>
            <h3>No Sales Data</h3>
            <p>
              Selected period me abhi koi sale nahi hai.
            </p>
          </div>
        ) : (
          <div className="top-products">
            {topProducts.map((product, index) => (
              <div
                className="top-product"
                key={product.name}
              >
                <div className="rank">
                  #{index + 1}
                </div>

                <div className="top-product-info">
                  <strong>{product.name}</strong>

                  <span>
                    {product.quantity} items sold
                  </span>
                </div>

                <div className="top-product-right">
                  <strong>
                    ₹{product.sales.toLocaleString("en-IN")}
                  </strong>

                  <small>
                    Profit ₹
                    {product.profit.toLocaleString("en-IN")}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="report-section">
        <h2>Recent Report Sales</h2>

        {filteredSales.length === 0 ? (
          <div className="report-empty">
            <div>🧾</div>
            <h3>No Sales</h3>
            <p>Selected period me sales nahi hain.</p>
          </div>
        ) : (
          <div className="report-sales">
            {[...filteredSales]
              .reverse()
              .slice(0, 10)
              .map((sale) => (
                <div
                  className="report-sale"
                  key={sale.id}
                >
                  <div>
                    <strong>{sale.product}</strong>

                    <span>
                      {sale.quantity} × ₹
                      {sale.price.toLocaleString("en-IN")}
                    </span>

                    <small>
                      {new Date(
                        sale.date
                      ).toLocaleString("en-IN")}
                    </small>
                  </div>

                  <div>
                    <strong>
                      ₹{sale.total.toLocaleString("en-IN")}
                    </strong>

                    <small>
                      {sale.paymentType === "credit"
                        ? "Credit"
                        : "Cash"}
                    </small>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
