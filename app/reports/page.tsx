"use client";

import { useEffect, useState } from "react";

type PaymentType = "cash" | "credit";

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

type BatchDetail = {
  batchId: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
};

type SaleItem = {
  productId: number;
  product: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  amount: number;
  batchDetails?: BatchDetail[];
};

type Sale = {
  id: number;
  items?: SaleItem[];
  subtotal?: number;

  product?: string;
  price?: number;
  purchasePrice?: number;
  quantity?: number;

  discount: number;
  total: number;
  date: string;

  paymentType?: PaymentType;
  paymentMode?: PaymentMode;

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

type ReturnRecord = {
  id: number;
  type: "sales" | "purchase";

  saleId?: number;
  purchaseId?: number;

  customerId?: number | null;
  customerName?: string;

  supplierId?: number;
  supplierName?: string;

  productId: number;
  productName: string;

  quantity: number;
  amount: number;

  paymentType: PaymentType;
  paymentMode?: PaymentMode;

  reason: string;
  date: string;
};

type Period =
  | "today"
  | "week"
  | "month"
  | "custom"
  | "all";

type ProductReport = {
  quantity: number;
  sales: number;
  profit: number;
};

export default function ReportsPage() {
  const [sales, setSales] =
    useState<Sale[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [returns, setReturns] =
    useState<ReturnRecord[]>([]);

  const [period, setPeriod] =
    useState<Period>("month");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

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

    const savedReturns =
      JSON.parse(
        localStorage.getItem(
          "hisabpro_returns"
        ) || "[]"
      );

    setSales(savedSales);
    setExpenses(savedExpenses);
    setReturns(savedReturns);
  }, []);

  /*
   * =====================================
   * PAYMENT MODE
   * =====================================
   */

  function getPaymentModeLabel(
    paymentType?: PaymentType,
    paymentMode?: PaymentMode
  ) {
    if (paymentType === "credit") {
      return "Credit";
    }

    switch (paymentMode || "cash") {
      case "cash":
        return "Cash";

      case "upi":
        return "UPI";

      case "card":
        return "Card";

      case "bank":
        return "Bank";

      case "online":
        return "Online";

      default:
        return "Cash";
    }
  }

  /*
   * =====================================
   * SALE ITEMS
   * =====================================
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
          quantity:
            sale.quantity || 1,
          amount:
            (sale.price || 0) *
            (sale.quantity || 1),
        },
      ];
    }

    return [];
  }

  /*
   * =====================================
   * BATCH-WISE PROFIT
   * =====================================
   */

  function getItemReport(
    item: SaleItem
  ) {
    if (
      item.batchDetails &&
      item.batchDetails.length > 0
    ) {
      let sales = 0;
      let profit = 0;
      let quantity = 0;

      item.batchDetails.forEach(
        (batch) => {
          const qty =
            Number(batch.quantity);

          const sellingPrice =
            Number(
              batch.sellingPrice
            );

          const purchasePrice =
            Number(
              batch.purchasePrice
            );

          sales +=
            sellingPrice * qty;

          profit +=
            (sellingPrice -
              purchasePrice) *
            qty;

          quantity += qty;
        }
      );

      return {
        quantity,
        sales,
        profit,
      };
    }

    return {
      quantity: Number(
        item.quantity || 0
      ),

      sales: Number(
        item.amount || 0
      ),

      profit:
        (Number(item.price || 0) -
          Number(
            item.purchasePrice || 0
          )) *
        Number(item.quantity || 0),
    };
  }

  /*
   * =====================================
   * DATE FILTER
   * =====================================
   */

  function getDateOnly(
    date: Date
  ) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  function isInPeriod(
    dateString: string
  ) {
    const date =
      getDateOnly(
        new Date(dateString)
      );

    const now =
      getDateOnly(
        new Date()
      );

    /*
     * TODAY
     */

    if (period === "today") {
      return (
        date.getTime() ===
        now.getTime()
      );
    }

    /*
     * WEEK
     */

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

    /*
     * MONTH
     */

    if (period === "month") {
      return (
        date.getFullYear() ===
          now.getFullYear() &&
        date.getMonth() ===
          now.getMonth()
      );
    }

    /*
     * CUSTOM
     */

    if (period === "custom") {
      if (
        !fromDate &&
        !toDate
      ) {
        return false;
      }

      const start =
        fromDate
          ? getDateOnly(
              new Date(
                `${fromDate}T00:00:00`
              )
            )
          : null;

      const end =
        toDate
          ? getDateOnly(
              new Date(
                `${toDate}T00:00:00`
              )
            )
          : null;

      if (start && end) {
        return (
          date >= start &&
          date <= end
        );
      }

      if (start) {
        return date >= start;
      }

      if (end) {
        return date <= end;
      }

      return false;
    }

    /*
     * ALL TIME
     */

    if (period === "all") {
      return true;
    }

    return true;
  }

  /*
   * =====================================
   * FILTERED DATA
   * =====================================
   */

  const filteredSales =
    sales.filter((sale) =>
      isInPeriod(sale.date)
    );

  const filteredExpenses =
    expenses.filter((expense) =>
      isInPeriod(expense.date)
    );

  const filteredReturns =
    returns.filter((item) =>
      isInPeriod(item.date)
    );

  /*
   * =====================================
   * RETURN TOTALS
   * =====================================
   */

  const salesReturns =
    filteredReturns
      .filter(
        (item) =>
          item.type === "sales"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.amount || 0),
        0
      );

  const purchaseReturns =
    filteredReturns
      .filter(
        (item) =>
          item.type === "purchase"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.amount || 0),
        0
      );

  /*
   * =====================================
   * TOTAL SALES
   * =====================================
   */

  const totalSales =
    filteredSales.reduce(
      (sum, sale) =>
        sum +
        Number(sale.total || 0),
      0
    );

  /*
   * NET SALES
   *
   * Sales - Sales Returns
   * =====================================
   */

  const netSales =
    totalSales -
    salesReturns;

  /*
   * =====================================
   * TOTAL ITEMS
   * =====================================
   */

  const totalItems =
    filteredSales.reduce(
      (sum, sale) => {
        const items =
          getSaleItems(sale);

        return (
          sum +
          items.reduce(
            (
              itemSum,
              item
            ) =>
              itemSum +
              Number(
                item.quantity || 0
              ),
            0
          )
        );
      },
      0
    );

  /*
   * =====================================
   * GROSS PROFIT
   * =====================================
   */

  const grossProfit =
    filteredSales.reduce(
      (sum, sale) => {
        const items =
          getSaleItems(sale);

        const itemProfit =
          items.reduce(
            (
              itemSum,
              item
            ) => {
              const report =
                getItemReport(
                  item
                );

              return (
                itemSum +
                report.profit
              );
            },
            0
          );

        return (
          sum +
          itemProfit -
          Number(
            sale.discount || 0
          )
        );
      },
      0
    );

  /*
   * =====================================
   * NET GROSS PROFIT AFTER RETURNS
   * =====================================
   */

  const grossProfitAfterReturns =
    grossProfit -
    salesReturns +
    purchaseReturns;

  /*
   * =====================================
   * EXPENSES
   * =====================================
   */

  const totalExpenses =
    filteredExpenses.reduce(
      (sum, expense) =>
        sum +
        Number(
          expense.amount || 0
        ),
      0
    );

  /*
   * =====================================
   * NET PROFIT
   * =====================================
   */

  const netProfit =
    grossProfitAfterReturns -
    totalExpenses;

  /*
   * =====================================
   * PAYMENT MODE SALES
   * =====================================
   */

  const cashSales =
    filteredSales
      .filter(
        (sale) =>
          sale.paymentType !==
            "credit" &&
          (sale.paymentMode ||
            "cash") ===
            "cash"
      )
      .reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

  const upiSales =
    filteredSales
      .filter(
        (sale) =>
          sale.paymentType !==
            "credit" &&
          sale.paymentMode ===
            "upi"
      )
      .reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

  const cardSales =
    filteredSales
      .filter(
        (sale) =>
          sale.paymentType !==
            "credit" &&
          sale.paymentMode ===
            "card"
      )
      .reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

  const bankSales =
    filteredSales
      .filter(
        (sale) =>
          sale.paymentType !==
            "credit" &&
          sale.paymentMode ===
            "bank"
      )
      .reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

  const onlineSales =
    filteredSales
      .filter(
        (sale) =>
          sale.paymentType !==
            "credit" &&
          sale.paymentMode ===
            "online"
      )
      .reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

  const creditSales =
    filteredSales
      .filter(
        (sale) =>
          sale.paymentType ===
          "credit"
      )
      .reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

  /*
   * =====================================
   * PAYMENT TOTAL
   * =====================================
   */

  const paymentModeTotal =
    cashSales +
    upiSales +
    cardSales +
    bankSales +
    onlineSales +
    creditSales;

  /*
   * =====================================
   * TOP PRODUCTS
   * =====================================
   */

  const productMap =
    new Map<
      string,
      ProductReport
    >();

  filteredSales.forEach(
    (sale) => {
      const items =
        getSaleItems(sale);

      items.forEach(
        (item) => {
          const report =
            getItemReport(
              item
            );

          const existing =
            productMap.get(
              item.product
            );

          if (existing) {
            productMap.set(
              item.product,
              {
                quantity:
                  existing.quantity +
                  report.quantity,

                sales:
                  existing.sales +
                  report.sales,

                profit:
                  existing.profit +
                  report.profit,
              }
            );
          } else {
            productMap.set(
              item.product,
              {
                quantity:
                  report.quantity,

                sales:
                  report.sales,

                profit:
                  report.profit,
              }
            );
          }
        }
      );
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

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <main className="reports-page">

      {/* HEADER */}

      <header className="reports-header">

        <button
          type="button"
          onClick={() =>
            window.location.href =
              "/hisabpro/"
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
            period === "custom"
              ? "active"
              : ""
          }
          onClick={() =>
            setPeriod("custom")
          }
        >
          📅 Custom
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

      {/* CUSTOM DATE */}

      {period === "custom" && (
        <section className="custom-date-filter">

          <div>
            <label>
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label>
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              min={
                fromDate ||
                undefined
              }
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
            />
          </div>

          {(fromDate ||
            toDate) && (
            <button
              className="clear-date-button"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </button>
          )}

        </section>
      )}

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
            Net Sales
          </span>

          <strong>
            ₹
            {netSales.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            After sales returns
          </small>

        </div>

        <div className="report-card">

          <span>
            Gross Profit
          </span>

          <strong>
            ₹
            {grossProfitAfterReturns.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            After returns
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

      {/* PAYMENT BREAKDOWN */}

      <section className="report-section">

        <div className="report-section-title">

          <h2>
            Payment Breakdown
          </h2>

          <span>
            ₹
            {paymentModeTotal.toLocaleString(
              "en-IN"
            )}
          </span>

        </div>

        <div className="report-breakdown">

          <div>
            <span>💵</span>

            <p>
              Cash
            </p>

            <strong>
              ₹
              {cashSales.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>📱</span>

            <p>
              UPI
            </p>

            <strong>
              ₹
              {upiSales.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>💳</span>

            <p>
              Card
            </p>

            <strong>
              ₹
              {cardSales.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>🏦</span>

            <p>
              Bank
            </p>

            <strong>
              ₹
              {bankSales.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>🌐</span>

            <p>
              Online
            </p>

            <strong>
              ₹
              {onlineSales.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>📒</span>

            <p>
              Credit
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

      {/* SALES BREAKDOWN */}

      <section className="report-section">

        <h2>
          Sales Breakdown
        </h2>

        <div className="report-breakdown">

          <div>

            <span>🧾</span>

            <p>
              Total Bills
            </p>

            <strong>
              {filteredSales.length}
            </strong>

          </div>

          <div>

            <span>📦</span>

            <p>
              Items Sold
            </p>

            <strong>
              {totalItems}
            </strong>

          </div>

          <div>

            <span>↩️</span>

            <p>
              Sales Returns
            </p>

            <strong>
              ₹
              {salesReturns.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div>

            <span>↩️</span>

            <p>
              Purchase Returns
            </p>

            <strong>
              ₹
              {purchaseReturns.toLocaleString(
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

                      <small
                        style={{
                          display:
                            "block",
                          marginTop:
                            "4px",
                          color:
                            "#1559b7",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                        }}
                      >
                        {getPaymentModeLabel(
                          sale.paymentType,
                          sale.paymentMode
                        )}
                      </small>

                    </div>

                    <strong>
                      ₹
                      {Number(
                        sale.total || 0
                      ).toLocaleString(
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
