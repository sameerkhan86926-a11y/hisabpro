"use client";

import { useEffect, useState } from "react";

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

  paymentType: "cash" | "credit";
  reason: string;
  date: string;
};

type ProductBatch = {
  id: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  date: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  batches?: ProductBatch[];
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  due: number;
  createdAt: string;
};

type Supplier = {
  id: number;
  name: string;
  phone: string;
  due: number;
  createdAt: string;
};

export default function ReturnHistoryPage() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("hisabpro_returns") || "[]"
      );

      saved.sort(
        (a: ReturnRecord, b: ReturnRecord) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

      setReturns(saved);
    } catch {
      setReturns([]);
    }
  };

  const formatMoney = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const deleteReturn = (returnRecord: ReturnRecord) => {
    const confirmed = window.confirm(
      "Delete this return? Stock and account balance will be reversed."
    );

    if (!confirmed) return;

    try {
      const savedReturns: ReturnRecord[] = JSON.parse(
        localStorage.getItem("hisabpro_returns") || "[]"
      );

      const products: Product[] = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      const customers: Customer[] = JSON.parse(
        localStorage.getItem("hisabpro_customers") || "[]"
      );

      const suppliers: Supplier[] = JSON.parse(
        localStorage.getItem("hisabpro_suppliers") || "[]"
      );

      const productIndex = products.findIndex(
        (product) =>
          Number(product.id) ===
          Number(returnRecord.productId)
      );

      if (productIndex === -1) {
        setMessage("Product not found.");
        return;
      }

      const product = products[productIndex];

      let batches = Array.isArray(product.batches)
        ? [...product.batches]
        : [];

      if (returnRecord.type === "sales") {
        if (batches.length > 0) {
          const index = batches.length - 1;

          batches[index] = {
            ...batches[index],
            quantity:
              Number(batches[index].quantity || 0) -
              Number(returnRecord.quantity || 0),
          };

          if (batches[index].quantity < 0) {
            batches[index].quantity = 0;
          }
        }

        products[productIndex] = {
          ...product,
          stock: Math.max(
            0,
            Number(product.stock || 0) -
              Number(returnRecord.quantity || 0)
          ),
          batches: batches.filter(
            (batch) => Number(batch.quantity) > 0
          ),
        };

        if (
          returnRecord.paymentType === "credit" &&
          returnRecord.customerId
        ) {
          const customerIndex = customers.findIndex(
            (customer) =>
              Number(customer.id) ===
              Number(returnRecord.customerId)
          );

          if (customerIndex !== -1) {
            customers[customerIndex] = {
              ...customers[customerIndex],
              due:
                Number(customers[customerIndex].due || 0) +
                Number(returnRecord.amount || 0),
            };
          }
        }
      }

      if (returnRecord.type === "purchase") {
        const newBatch: ProductBatch = {
          id: Date.now(),
          quantity: Number(returnRecord.quantity || 0),
          purchasePrice: Number(
            product.purchasePrice || 0
          ),
          sellingPrice: Number(
            product.sellingPrice || 0
          ),
          date: new Date().toISOString(),
        };

        batches.push(newBatch);

        products[productIndex] = {
          ...product,
          stock:
            Number(product.stock || 0) +
            Number(returnRecord.quantity || 0),
          batches,
        };

        if (
          returnRecord.paymentType === "credit" &&
          returnRecord.supplierId
        ) {
          const supplierIndex = suppliers.findIndex(
            (supplier) =>
              Number(supplier.id) ===
              Number(returnRecord.supplierId)
          );

          if (supplierIndex !== -1) {
            suppliers[supplierIndex] = {
              ...suppliers[supplierIndex],
              due:
                Number(suppliers[supplierIndex].due || 0) +
                Number(returnRecord.amount || 0),
            };
          }
        }
      }

      const updatedReturns = savedReturns.filter(
        (item) =>
          Number(item.id) !== Number(returnRecord.id)
      );

      localStorage.setItem(
        "hisabpro_returns",
        JSON.stringify(updatedReturns)
      );

      localStorage.setItem(
        "hisabpro_products",
        JSON.stringify(products)
      );

      localStorage.setItem(
        "hisabpro_customers",
        JSON.stringify(customers)
      );

      localStorage.setItem(
        "hisabpro_suppliers",
        JSON.stringify(suppliers)
      );

      setReturns(updatedReturns);

      setMessage("Return deleted and reversed successfully.");
    } catch {
      setMessage("Unable to delete return.");
    }
  };

  const totalSalesReturns = returns
    .filter((item) => item.type === "sales")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const totalPurchaseReturns = returns
    .filter((item) => item.type === "purchase")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  return (
    <main className="return-history-page">
      <header className="return-history-header">
        <button
          className="return-history-back"
          onClick={() => window.history.back()}
        >
          ←
        </button>

        <div>
          <h1>Return History</h1>
          <p>Sales & Purchase Returns</p>
        </div>
      </header>

      <section className="return-history-content">
        <div className="return-history-summary">
          <div>
            <span>Sales Returns</span>
            <strong>
              {formatMoney(totalSalesReturns)}
            </strong>
          </div>

          <div>
            <span>Purchase Returns</span>
            <strong>
              {formatMoney(totalPurchaseReturns)}
            </strong>
          </div>

          <div>
            <span>Total Returns</span>
            <strong>{returns.length}</strong>
          </div>
        </div>

        {message && (
          <div className="return-history-message">
            {message}
          </div>
        )}

        {returns.length === 0 ? (
          <div className="return-history-empty">
            <div>📋</div>
            <h2>No returns yet</h2>
            <p>
              Sales and purchase returns will appear here.
            </p>
          </div>
        ) : (
          <div className="return-history-list">
            {returns.map((item) => (
              <div
                className="return-history-card"
                key={item.id}
              >
                <div
                  className={`return-history-icon ${
                    item.type
                  }`}
                >
                  {item.type === "sales"
                    ? "↩️"
                    : "↪️"}
                </div>

                <div className="return-history-info">
                  <strong>
                    {item.type === "sales"
                      ? "Sales Return"
                      : "Purchase Return"}
                  </strong>

                  <span>
                    {item.productName}
                  </span>

                  <small>
                    Qty: {item.quantity} •{" "}
                    {new Date(
                      item.date
                    ).toLocaleDateString("en-IN")}
                  </small>

                  <small>
                    {item.type === "sales"
                      ? `Customer: ${
                          item.customerName ||
                          "Walk-in Customer"
                        }`
                      : `Supplier: ${
                          item.supplierName || "-"
                        }`}
                  </small>

                  {item.reason && (
                    <small>
                      Reason: {item.reason}
                    </small>
                  )}
                </div>

                <div className="return-history-right">
                  <strong>
                    {formatMoney(
                      Number(item.amount) || 0
                    )}
                  </strong>

                  <span>
                    {item.paymentType === "credit"
                      ? "Credit"
                      : "Cash"}
                  </span>

                  <button
                    className="return-history-delete"
                    onClick={() =>
                      deleteReturn(item)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
