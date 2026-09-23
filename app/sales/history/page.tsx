"use client";

import { useEffect, useState } from "react";

type Sale = {
  id: number;
  product: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
  date: string;
  paymentType?: "cash" | "credit";
  customerId?: number | null;
  customerName?: string;
};

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const savedSales = JSON.parse(
      localStorage.getItem("hisabpro_sales") || "[]"
    );

    setSales([...savedSales].reverse());
  }, []);

  const totalSales = sales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalItems = sales.reduce(
    (sum, sale) => sum + sale.quantity,
    0
  );

  function deleteSale(id: number) {
    const updatedSales = sales.filter(
      (sale) => sale.id !== id
    );

    setSales(updatedSales);

    localStorage.setItem(
      "hisabpro_sales",
      JSON.stringify([...updatedSales].reverse())
    );
  }

  return (
    <main className="history-page">

      <header className="history-header">

        <a href="/hisabpro/">
          ← Dashboard
        </a>

        <h1>Sales History</h1>

        <a href="/hisabpro/sales/">
          + New Sale
        </a>

      </header>

      <section className="history-stats">

        <div className="history-card">
          <span>Total Sales</span>

          <strong>
            ₹{totalSales.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="history-card">
          <span>Total Bills</span>

          <strong>
            {sales.length}
          </strong>
        </div>

        <div className="history-card">
          <span>Items Sold</span>

          <strong>
            {totalItems}
          </strong>
        </div>

      </section>

      <section className="sales-list">

        <div className="history-title">
          <h2>Recent Sales</h2>
        </div>

        {sales.length === 0 ? (

          <div className="empty-sales">

            <div>🧾</div>

            <h3>No Sales Yet</h3>

            <p>
              Create your first sale to see it here.
            </p>

            <a href="/hisabpro/sales/">
              Create New Sale
            </a>

          </div>

        ) : (

          sales.map((sale) => (

            <div
              className="sale-history-item"
              key={sale.id}
            >

              <div className="sale-icon">
                🧾
              </div>

              <div className="sale-info">

                <strong>
                  {sale.product}
                </strong>

                <span>
                  {sale.quantity} × ₹
                  {sale.price.toLocaleString("en-IN")}
                </span>

                <small>
                  {new Date(
                    sale.date
                  ).toLocaleString("en-IN")}
                </small>

                {sale.paymentType === "credit" ? (

                  <div className="sale-customer">

                    <span className="credit-badge">
                      Credit / Udhaar
                    </span>

                    {sale.customerName && (
                      <span className="customer-name">
                        👤 {sale.customerName}
                      </span>
                    )}

                  </div>

                ) : (

                  <div className="sale-customer">

                    <span className="cash-badge">
                      Cash
                    </span>

                  </div>

                )}

              </div>

              <div className="sale-right">

                <strong>
                  ₹{sale.total.toLocaleString("en-IN")}
                </strong>

                <button
                  onClick={() =>
                    deleteSale(sale.id)
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          ))

        )}

      </section>

    </main>
  );
}
