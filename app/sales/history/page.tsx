"use client";

import { useEffect, useState } from "react";

type Sale = {
  id: number;
  productId?: number;
  product: string;
  price: number;
  purchasePrice?: number;
  quantity: number;
  discount: number;
  total: number;
  date: string;
  paymentType?: "cash" | "credit";
  customerId?: number | null;
  customerName?: string;
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

type Transaction = {
  id: number;
  customerId: number;
  type: "credit" | "payment";
  amount: number;
  note: string;
  date: string;
};

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  function loadSales() {
    const savedSales = JSON.parse(
      localStorage.getItem("hisabpro_sales") || "[]"
    );

    setSales([...savedSales].reverse());
  }

  const totalSales = sales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalItems = sales.reduce(
    (sum, sale) => sum + sale.quantity,
    0
  );

  function deleteSale(sale: Sale) {
    setMessage("");

    const confirmDelete = window.confirm(
      `Delete sale of "${sale.product}" for ₹${sale.total.toLocaleString(
        "en-IN"
      )}?`
    );

    if (!confirmDelete) {
      return;
    }

    /*
     * 1. Remove sale
     */

    const savedSales: Sale[] = JSON.parse(
      localStorage.getItem("hisabpro_sales") || "[]"
    );

    const updatedSales = savedSales.filter(
      (item) => item.id !== sale.id
    );

    localStorage.setItem(
      "hisabpro_sales",
      JSON.stringify(updatedSales)
    );

    setSales([...updatedSales].reverse());

    /*
     * 2. Restore stock
     */

    if (sale.productId) {
      const savedProducts: Product[] = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      const updatedProducts = savedProducts.map(
        (product) =>
          product.id === sale.productId
            ? {
                ...product,
                stock: product.stock + sale.quantity,
              }
            : product
      );

      localStorage.setItem(
        "hisabpro_products",
        JSON.stringify(updatedProducts)
      );
    }

    /*
     * 3. Reverse customer credit
     */

    if (
      sale.paymentType === "credit" &&
      sale.customerId
    ) {
      const savedCustomers: Customer[] = JSON.parse(
        localStorage.getItem("hisabpro_customers") || "[]"
      );

      const updatedCustomers = savedCustomers.map(
        (customer) =>
          customer.id === sale.customerId
            ? {
                ...customer,
                due: Math.max(
                  0,
                  customer.due - sale.total
                ),
              }
            : customer
      );

      localStorage.setItem(
        "hisabpro_customers",
        JSON.stringify(updatedCustomers)
      );

      /*
       * 4. Remove corresponding credit transaction
       */

      const savedTransactions: Transaction[] =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_transactions"
          ) || "[]"
        );

      const updatedTransactions =
        savedTransactions.filter(
          (transaction) =>
            !(
              transaction.customerId ===
                sale.customerId &&
              transaction.type === "credit" &&
              transaction.amount === sale.total &&
              transaction.note ===
                `Credit Sale - ${sale.product}`
            )
        );

      localStorage.setItem(
        "hisabpro_transactions",
        JSON.stringify(updatedTransactions)
      );
    }

    setMessage(
      "Sale deleted, stock & Khata updated successfully ✅"
    );
  }

  return (
    <main className="history-page">
      <header className="history-header">
        <a href="/hisabpro/">← Dashboard</a>

        <h1>Sales History</h1>

        <a href="/hisabpro/sales/">
          + New Sale
        </a>
      </header>

      {message && (
        <div
          style={{
            width: "min(1100px, 92%)",
            margin: "18px auto 0",
            padding: "12px 15px",
            background: "#edf9f2",
            color: "#138a50",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      <section className="history-stats">
        <div className="history-card">
          <span>Total Sales</span>

          <strong>
            ₹{totalSales.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="history-card">
          <span>Total Bills</span>

          <strong>{sales.length}</strong>
        </div>

        <div className="history-card">
          <span>Items Sold</span>

          <strong>{totalItems}</strong>
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
                    deleteSale(sale)
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
