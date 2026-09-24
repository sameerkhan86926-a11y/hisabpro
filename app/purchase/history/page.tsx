"use client";

import { useEffect, useState } from "react";

type StockBatch = {
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
  batches?: StockBatch[];
};

type Supplier = {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  due: number;
  createdAt: string;
};

type PurchaseItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  amount: number;
};

type PaymentType = "cash" | "credit";

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

type Purchase = {
  id: number;
  supplierId: number;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  paymentType: PaymentType;
  paymentMode?: PaymentMode;
  date: string;
};

type CashTransaction = {
  id: number;
  type: "in" | "out";
  amount: number;
  category: string;
  note: string;
  date: string;
  referenceType?: string;
  referenceId?: number;
};

const PURCHASE_KEY = "hisabpro_purchases";
const PRODUCT_KEY = "hisabpro_products";
const SUPPLIER_KEY = "hisabpro_suppliers";
const CASHBOOK_KEY = "hisabpro_cashbook";

export default function PurchaseHistoryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expandedId, setExpandedId] =
    useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPurchases();
  }, []);

  function loadPurchases() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(PURCHASE_KEY) || "[]"
      );

      setPurchases(
        Array.isArray(saved)
          ? [...saved].sort(
              (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime()
            )
          : []
      );
    } catch {
      setPurchases([]);
    }
  }

  function formatMoney(value: number) {
    return Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  }

  function formatDate(date: string) {
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }

  function formatTime(date: string) {
    try {
      return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  function getPaymentMode(
    purchase: Purchase
  ): PaymentMode | undefined {
    if (purchase.paymentType === "credit") {
      return undefined;
    }

    return purchase.paymentMode || "cash";
  }

  function getPaymentModeLabel(
    purchase: Purchase
  ) {
    if (purchase.paymentType === "credit") {
      return "Credit";
    }

    switch (getPaymentMode(purchase)) {
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

  function getPaymentBadgeClass(
    purchase: Purchase
  ) {
    if (purchase.paymentType === "credit") {
      return "credit";
    }

    switch (getPaymentMode(purchase)) {
      case "upi":
        return "upi";

      case "card":
        return "card";

      case "bank":
        return "bank";

      case "online":
        return "online";

      case "cash":
      default:
        return "cash";
    }
  }

  function deletePurchase(purchase: Purchase) {
    const confirmed = window.confirm(
      `Delete this purchase of ₹${formatMoney(
        purchase.total
      )}?\n\nStock will be reduced and supplier payable will be reversed if this was a credit purchase.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const savedProducts: Product[] = JSON.parse(
        localStorage.getItem(PRODUCT_KEY) || "[]"
      );

      const savedSuppliers: Supplier[] = JSON.parse(
        localStorage.getItem(SUPPLIER_KEY) || "[]"
      );

      const savedPurchases: Purchase[] = JSON.parse(
        localStorage.getItem(PURCHASE_KEY) || "[]"
      );

      const savedCashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(CASHBOOK_KEY) || "[]"
        );

      /*
       * --------------------------------
       * REDUCE STOCK
       * --------------------------------
       */

      const updatedProducts = savedProducts.map(
        (product) => {
          const items = purchase.items.filter(
            (item) =>
              item.productId === product.id
          );

          if (items.length === 0) {
            return product;
          }

          let updatedBatches = Array.isArray(
            product.batches
          )
            ? [...product.batches]
            : [];

          let updatedStock = Number(
            product.stock || 0
          );

          for (const item of items) {
            let remainingQty = Number(
              item.quantity || 0
            );

            const matchingIndexes =
              updatedBatches
                .map((batch, index) => ({
                  batch,
                  index,
                }))
                .filter(
                  ({ batch }) =>
                    Number(
                      batch.purchasePrice
                    ) ===
                      Number(
                        item.purchasePrice
                      ) &&
                    Number(
                      batch.sellingPrice
                    ) ===
                      Number(
                        item.sellingPrice
                      )
                )
                .sort(
                  (a, b) =>
                    new Date(
                      b.batch.date
                    ).getTime() -
                    new Date(
                      a.batch.date
                    ).getTime()
                );

            for (const match of matchingIndexes) {
              if (remainingQty <= 0) {
                break;
              }

              const batch =
                updatedBatches[match.index];

              const batchQty = Number(
                batch.quantity || 0
              );

              if (batchQty <= 0) {
                continue;
              }

              const reduceQty = Math.min(
                remainingQty,
                batchQty
              );

              batch.quantity =
                batchQty - reduceQty;

              remainingQty -= reduceQty;

              updatedStock = Math.max(
                0,
                updatedStock - reduceQty
              );
            }

            /*
             * Compatibility fallback
             */

            if (remainingQty > 0) {
              const fallbackQty = Math.min(
                remainingQty,
                updatedStock
              );

              updatedStock = Math.max(
                0,
                updatedStock - fallbackQty
              );
            }
          }

          updatedBatches =
            updatedBatches.filter(
              (batch) =>
                Number(batch.quantity || 0) > 0
            );

          return {
            ...product,
            stock: updatedStock,
            batches: updatedBatches,
          };
        }
      );

      /*
       * --------------------------------
       * REVERSE SUPPLIER PAYABLE
       * --------------------------------
       */

      const updatedSuppliers =
        savedSuppliers.map((supplier) => {
          if (
            supplier.id !==
            purchase.supplierId
          ) {
            return supplier;
          }

          if (
            purchase.paymentType !==
            "credit"
          ) {
            return supplier;
          }

          return {
            ...supplier,
            due: Math.max(
              0,
              Number(supplier.due || 0) -
                Number(purchase.total || 0)
            ),
          };
        });

      /*
       * --------------------------------
       * REMOVE PURCHASE
       * --------------------------------
       */

      const updatedPurchases =
        savedPurchases.filter(
          (item) =>
            item.id !== purchase.id
        );

      /*
       * --------------------------------
       * REMOVE LINKED CASHBOOK ENTRY
       * --------------------------------
       *
       * Only actual CASH purchase
       * automatically affects Cashbook.
       *
       * Credit / UPI / Card / Bank /
       * Online purchases do not affect
       * Cashbook.
       *
       * Old purchases without paymentMode
       * are treated as Cash.
       */

      const actualPaymentMode =
        purchase.paymentType === "credit"
          ? undefined
          : purchase.paymentMode || "cash";

      let updatedCashbook =
        savedCashbook;

      if (
        purchase.paymentType === "cash" &&
        actualPaymentMode === "cash"
      ) {
        updatedCashbook =
          savedCashbook.filter(
            (transaction) =>
              !(
                transaction.referenceType ===
                  "purchase" &&
                Number(
                  transaction.referenceId
                ) === Number(purchase.id)
              )
          );
      }

      /*
       * --------------------------------
       * SAVE EVERYTHING
       * --------------------------------
       */

      localStorage.setItem(
        PRODUCT_KEY,
        JSON.stringify(updatedProducts)
      );

      localStorage.setItem(
        SUPPLIER_KEY,
        JSON.stringify(updatedSuppliers)
      );

      localStorage.setItem(
        PURCHASE_KEY,
        JSON.stringify(updatedPurchases)
      );

      localStorage.setItem(
        CASHBOOK_KEY,
        JSON.stringify(updatedCashbook)
      );

      /*
       * --------------------------------
       * UPDATE UI
       * --------------------------------
       */

      setPurchases(
        [...updatedPurchases].sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )
      );

      setExpandedId(null);

      setMessage(
        "Purchase deleted, stock restored and linked records updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Purchase delete error:",
        error
      );

      setMessage(
        "Unable to delete purchase."
      );
    }
  }

  const totalPurchases = purchases.length;

  const totalAmount = purchases.reduce(
    (sum, purchase) =>
      sum + Number(purchase.total || 0),
    0
  );

  const creditAmount = purchases
    .filter(
      (purchase) =>
        purchase.paymentType === "credit"
    )
    .reduce(
      (sum, purchase) =>
        sum + Number(purchase.total || 0),
      0
    );

  return (
    <main className="purchase-history-page">

      {/* HEADER */}
      <header className="purchase-history-header">

        <button
          type="button"
          className="purchase-history-back"
          onClick={() => {
            window.location.href =
              "/hisabpro/purchase/";
          }}
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <h1>Purchase History</h1>
          <p>View all stock purchases</p>
        </div>

      </header>

      {/* SUMMARY */}
      <section className="purchase-history-summary">

        <div className="purchase-history-summary-card">
          <span>Total Purchases</span>
          <strong>{totalPurchases}</strong>
        </div>

        <div className="purchase-history-summary-card">
          <span>Total Amount</span>
          <strong>
            ₹{formatMoney(totalAmount)}
          </strong>
        </div>

        <div className="purchase-history-summary-card credit">
          <span>Credit Purchases</span>
          <strong>
            ₹{formatMoney(creditAmount)}
          </strong>
        </div>

      </section>

      {/* MESSAGE */}
      {message && (
        <div className="purchase-history-message">
          {message}
        </div>
      )}

      {/* LIST */}
      <section className="purchase-history-list">

        <div className="purchase-history-title">
          <h2>All Purchases</h2>
          <span>{purchases.length}</span>
        </div>

        {purchases.length === 0 ? (
          <div className="purchase-history-empty">

            <div className="purchase-history-empty-icon">
              🛒
            </div>

            <h3>No purchases yet</h3>

            <p>
              Your purchase history will appear
              here after you add stock.
            </p>

            <a
              href="/hisabpro/purchase/"
              className="purchase-history-add"
            >
              + New Purchase
            </a>

          </div>
        ) : (
          <div className="purchase-history-items">

            {purchases.map((purchase) => {
              const isExpanded =
                expandedId === purchase.id;

              const totalQuantity =
                purchase.items.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                  0
                );

              const paymentBadgeClass =
                getPaymentBadgeClass(
                  purchase
                );

              return (
                <div
                  key={purchase.id}
                  className="purchase-history-card"
                >

                  {/* MAIN ROW */}
                  <button
                    type="button"
                    className="purchase-history-main"
                    onClick={() =>
                      setExpandedId(
                        isExpanded
                          ? null
                          : purchase.id
                      )
                    }
                  >

                    <div className="purchase-history-icon">
                      🛍️
                    </div>

                    <div className="purchase-history-info">

                      <strong>
                        {purchase.supplierName ||
                          "Unknown Supplier"}
                      </strong>

                      <span>
                        {formatDate(
                          purchase.date
                        )}{" "}
                        •{" "}
                        {formatTime(
                          purchase.date
                        )}
                      </span>

                      <small>
                        {purchase.items.length}{" "}
                        item
                        {purchase.items.length !==
                        1
                          ? "s"
                          : ""}{" "}
                        •{" "}
                        {totalQuantity} units
                      </small>

                    </div>

                    <div className="purchase-history-right">

                      <strong>
                        ₹
                        {formatMoney(
                          purchase.total
                        )}
                      </strong>

                      <span
                        className={
                          paymentBadgeClass
                        }
                      >
                        {getPaymentModeLabel(
                          purchase
                        )}
                      </span>

                    </div>

                  </button>

                  {/* DETAILS */}
                  {isExpanded && (
                    <div className="purchase-history-details">

                      <div className="purchase-history-detail-title">
                        <strong>
                          Purchase Details
                        </strong>

                        <span>
                          #{purchase.id}
                        </span>
                      </div>

                      <div className="purchase-history-product-list">

                        {purchase.items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="purchase-history-product"
                            >

                              <div>
                                <strong>
                                  {
                                    item.productName
                                  }
                                </strong>

                                <small>
                                  {
                                    item.quantity
                                  }{" "}
                                  × ₹
                                  {formatMoney(
                                    item.purchasePrice
                                  )}
                                </small>

                                <small>
                                  Selling: ₹
                                  {formatMoney(
                                    item.sellingPrice
                                  )}
                                </small>
                              </div>

                              <strong>
                                ₹
                                {formatMoney(
                                  item.amount
                                )}
                              </strong>

                            </div>
                          )
                        )}

                      </div>

                      <div className="purchase-history-detail-total">

                        <span>
                          Total
                        </span>

                        <strong>
                          ₹
                          {formatMoney(
                            purchase.total
                          )}
                        </strong>

                      </div>

                      <div className="purchase-history-detail-payment">

                        <span>
                          Payment
                        </span>

                        <strong
                          className={
                            paymentBadgeClass
                          }
                        >
                          {getPaymentModeLabel(
                            purchase
                          )}
                        </strong>

                      </div>

                      <div className="purchase-history-actions">

                        <button
                          type="button"
                          className="purchase-history-delete"
                          onClick={() =>
                            deletePurchase(
                              purchase
                            )
                          }
                        >
                          Delete Purchase
                        </button>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </section>

    </main>
  );
}
