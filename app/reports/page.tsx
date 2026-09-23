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

  // New multi-product format
  items?: SaleItem[];
  subtotal?: number;

  // Old single-product format
  product?: string;
  price?: number;
  purchasePrice?: number;
  quantity?: number;

  discount: number;
  total: number;
  date: string;
  paymentType?: "cash" | "credit";
  customerName?: string;
};

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  note: string;
  date: string;
};

type Period =
  | "today"
  | "week"
  | "month"
  | "all";

export default function ReportsPage() {
  const [sales, setSales] =
    useState<Sale[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [period, setPeriod] =
    useState<Period>("month");

  useEffect(() => {
    const savedSales =
      JSON.parse(
        localStorage.getItem(
          "hisabpro_sales"
        ) || "[]"
      );

    const savedExpenses =
      JSON.parse(
        localStorage.getItem(
          "hisabpro_expenses"
        ) || "[]"
      );

    setSales(savedSales);
    setExpenses(savedExpenses);
  }, []);

  /*
   * Convert old single-product sale
   * into items format.
   */
  function getSaleItems(
    sale: Sale
  ): SaleItem[] {
    if (
      sale.items &&
      sale.items.length > 0
    ) {
      return sale.items;
    }

    if (sale.product) {
      return [
        {
          productId: 0,
          product: sale.product,
          price: sale.price || 0,
          purchasePrice:
            sale.purchasePrice || 0,
          quantity: sale.quantity || 1,
          amount:
            (sale.price || 0) *
            (sale.quantity || 1),
        },
      ];
    }

    return [];
  }

  function isInPeriod(
    dateString: string
  ) {
    if (period === "all") {
      return true;
    }

    const date = new Date(
      dateString
    );

    const now = new Date();

    if (period === "today") {
      return (
        date.getFullYear() ===
          now.getFullYear() &&
        date.getMonth() ===
          now.getMonth() &&
        date.getDate() ===
          now.getDate()
      );
    }

    if (period === "week") {
      const startOfWeek =
        new Date(now);

      const day =
        startOfWeek.getDay();

      const difference =
        day === 0 ? 6 : day - 1;

      startOfWeek.setDate(
        now.getDate() -
          difference
      );

      startOfWeek.setHours(
        0,
        0,
        0,
        0
      );

      return date >= startOfWeek;
    }

    if (period === "month") {
      return (
        date.getFullYear() ===
          now.getFullYear() &&
        date.getMonth() ===
          now.getMonth()
      );
    }

    return true;
  }

  const filteredSales =
    sales.filter((sale) =>
      isInPeriod(sale.date)
    );

  const filteredExpenses =
    expenses.filter((expense) =>
      isInPeriod(expense.date)
    );

  /*
   * Total Sales
   */
  const totalSales =
    filteredSales.reduce(
      (sum, sale) =>
        sum + sale.total,
      0
    );

  /*
   * Total Items
   */
  const totalItems =
    filteredSales.reduce(
      (sum, sale) => {
        const items =
          getSaleItems(sale);

        return (
          sum +
          items.reduce(
            (itemSum, item) =>
              itemSum +
              item.quantity,
            0
          )
        );
      },
      0
    );

  /*
   * Gross Profit
   *
   * Product Profit =
   * (Selling Price - Purchase Price)
   * × Quantity
   *
   * Bill discount is deducted
   * once from the bill.
   */
  const grossProfit =
    filteredSales.reduce(
      (sum, sale) => {
        const items =
          getSaleItems(sale);

        const itemProfit =
          items.reduce(
            (itemSum, item) =>
              itemSum +
              (item.price -
                item.purchasePrice) *
                item.quantity,
            0
          );

        return (
          sum +
          itemProfit -
          (sale.discount || 0)
        );
      },
      0
    );

  /*
   * Total Expenses
   */
  const totalExpenses =
    filteredExpenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0
    );

  /*
   * Net Profit
   */
  const netProfit =
    grossProfit -
    totalExpenses;

  /*
   * Cash Sales
   */
  const cashSales =
    filteredSales
      .filter(
        (sale) =>
          sale.paymentType !==
          "credit"
      )
      .reduce(
        (sum, sale) =>
          sum + sale.total,
        0
      );

  /*
   * Credit Sales
   */
  const creditSales =
    filteredSales
      .filter(
        (sale) =>
          sale.paymentType ===
          "credit"
      )
      .reduce(
        (sum, sale) =>
          sum + sale.total,
        0
      );

  /*
   * Top Products
   */
  const productMap =
    new Map<
      string,
      {
        quantity: number;
        sales: number;
        profit: number;
      }
    >();

  filteredSales.forEach(
    (sale) => {
      const items =
        getSaleItems(sale);

      items.forEach((item) => {
        const existing =
          productMap.get(
            item.product
          );

        const itemSales =
          item.amount;

        const itemProfit =
          (item.price -
            item.purchasePrice) *
          item.quantity;

        if (existing) {
          productMap.set(
            item.product,
            {
              quantity:
                existing.quantity +
                item.quantity,

              sales:
                existing.sales +
                itemSales,

              profit:
                existing.profit +
                itemProfit,
            }
          );
        } else {
          productMap.set(
            item.product,
            {
              quantity:
                item.quantity,

              sales:
                itemSales,

              profit:
                itemProfit,
            }
          );
        }
      });
    }
  );

  const topProducts =
    Array.from(
      productMap.entries()
    )
      .map(
        ([
          product,
          data,
        ]) => ({
          product,
          ...data,
        })
      )
      .sort(
        (a, b) =>
          b.sales - a.sales
      )
      .slice(0, 10);

  return (
    <main className="reports-page">

      {/* HEADER */}

      <header className="reports-header">

        <button
          onClick={() =>
            window.history.back()
          }
          className="back-button"
        >
          ← Back
        </button>

        <h1>
          Reports
        </h1>

        <span></span>

      </header>

      {/* PERIOD FILTER */}

      <section className="report-filter">

        <button
          className={
            period === "today"
              ? "active"
              : ""
          }
          onClick={() =>
            setPeriod("today")
          }
        >
          Today
        </button>

        <button
          className={
            period === "week"
              ? "active"
              : ""
          }
          onClick={() =>
            setPeriod("week")
          }
        >
          This Week
        </button>

        <button
          className={
            period === "month"
              ? "active"
              : ""
          }
          onClick={() =>
            setPeriod("month")
          }
        >
          This Month
        </button>

        <button
          className={
            period === "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setPeriod("all")
          }
        >
          All Time
        </button>

      </section>

      {/* MAIN STATS */}

      <section className="report-stats">

        <div className="report-card">

          <span>
            Total Sales
          </span>

          <strong>
            ₹
            {totalSales.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            {filteredSales.length} bills
          </small>

        </div>

        <div className="report-card">

          <span>
            Gross Profit
          </span>

          <strong>
            ₹
            {grossProfit.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Before expenses
          </small>

        </div>

        <div className="report-card">

          <span>
            Expenses
          </span>

          <strong>
            ₹
            {totalExpenses.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Business expenses
          </small>

        </div>

        <div className="report-card profit-card">

          <span>
            Net Profit
          </span>

          <strong>
            ₹
            {netProfit.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Profit after expenses
          </small>

        </div>

      </section>

      {/* SALES BREAKDOWN */}

      <section className="report-section">

        <h2>
          Sales Breakdown
        </h2>

        <div className="report-breakdown">

          <div>

            <span>
              🧾
            </span>

            <p>
              Total Bills
            </p>

            <strong>
              {filteredSales.length}
            </strong>

          </div>

          <div>

            <span>
              📦
            </span>

            <p>
              Items Sold
            </p>

            <strong>
              {totalItems}
            </strong>

          </div>

          <div>

            <span>
              💵
            </span>

            <p>
              Cash Sales
            </p>

            <strong>
              ₹
              {cashSales.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div>

            <span>
              📒
            </span>

            <p>
              Credit Sales
            </p>

            <strong>
              ₹
              {creditSales.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* TOP PRODUCTS */}

      <section className="report-section">

        <div className="report-section-title">

          <h2>
            Top Products
          </h2>

          <span>
            By sales
          </span>

        </div>

        {topProducts.length ===
        0 ? (
          <div className="report-empty">
            No product sales in
            this period.
          </div>
        ) : (
          <div className="top-products">

            {topProducts.map(
              (
                item,
                index
              ) => (
                <div
                  className="top-product"
                  key={
                    item.product
                  }
                >

                  <div className="product-rank">
                    {index + 1}
                  </div>

                  <div className="top-product-info">

                    <strong>
                      {item.product}
                    </strong>

                    <span>
                      {item.quantity}{" "}
                      units sold
                    </span>

                  </div>

                  <div className="top-product-right">

                    <strong>
                      ₹
                      {item.sales.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <span>
                      Profit ₹
                      {item.profit.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* RECENT SALES */}

      <section className="report-section">

        <div className="report-section-title">

          <h2>
            Recent Sales
          </h2>

          <a href="/hisabpro/sales/history/">
            View All
          </a>

        </div>

        {filteredSales.length ===
        0 ? (
          <div className="report-empty">
            No sales in this
            period.
          </div>
        ) : (
          <div className="recent-reports">

            {[...filteredSales]
              .reverse()
              .slice(0, 10)
              .map((sale) => {

                const items =
                  getSaleItems(
                    sale
                  );

                return (
                  <div
                    className="recent-report-item"
                    key={
                      sale.id
                    }
                  >

                    <div>

                      <strong>
                        {items.length ===
                        1
                          ? items[0]
                              .product
                          : `${items.length} Items`}
                      </strong>

                      <span>
                        {new Date(
                          sale.date
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                    <strong>
                      ₹
                      {sale.total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>
                );
              })}

          </div>
        )}

      </section>

    </main>
  );
}
