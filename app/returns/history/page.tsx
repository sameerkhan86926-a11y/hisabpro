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

const RETURNS_KEY = "hisabpro_returns";
const PRODUCT_KEY = "hisabpro_products";
const CUSTOMER_KEY = "hisabpro_customers";
const SUPPLIER_KEY = "hisabpro_suppliers";
const CASHBOOK_KEY = "hisabpro_cashbook";

export default function ReturnHistoryPage() {
  const [returns, setReturns] =
    useState<ReturnRecord[]>([]);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = () => {
    try {
      const saved: ReturnRecord[] =
        JSON.parse(
          localStorage.getItem(
            RETURNS_KEY
          ) || "[]"
        );

      saved.sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

      setReturns(saved);
    } catch {
      setReturns([]);
    }
  };

  const formatMoney = (amount: number) =>
    `₹${Number(
      amount || 0
    ).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const deleteReturn = (
    returnRecord: ReturnRecord
  ) => {
    const confirmed = window.confirm(
      "Delete this return? Stock, account balance and linked Cashbook entry will be reversed."
    );

    if (!confirmed) return;

    try {
      const savedReturns: ReturnRecord[] =
        JSON.parse(
          localStorage.getItem(
            RETURNS_KEY
          ) || "[]"
        );

      const products: Product[] =
        JSON.parse(
          localStorage.getItem(
            PRODUCT_KEY
          ) || "[]"
        );

      const customers: Customer[] =
        JSON.parse(
          localStorage.getItem(
            CUSTOMER_KEY
          ) || "[]"
        );

      const suppliers: Supplier[] =
        JSON.parse(
          localStorage.getItem(
            SUPPLIER_KEY
          ) || "[]"
        );

      const cashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(
            CASHBOOK_KEY
          ) || "[]"
        );

      const productIndex =
        products.findIndex(
          (product) =>
            Number(product.id) ===
            Number(
              returnRecord.productId
            )
        );

      if (productIndex === -1) {
        setMessage(
          "Product not found."
        );
        return;
      }

      const product =
        products[productIndex];

      let batches = Array.isArray(
        product.batches
      )
        ? [...product.batches]
        : [];

      /*
       * SALES RETURN DELETE
       *
       * Original Sales Return:
       * Stock + quantity
       *
       * Delete:
       * Stock - quantity
       */
      if (
        returnRecord.type ===
        "sales"
      ) {
        if (batches.length > 0) {
          let remaining =
            Number(
              returnRecord.quantity ||
                0
            );

          /*
           * Returned sales stock was added
           * to the latest batch.
           *
           * Remove from newest batches first.
           */
          for (
            let i =
              batches.length - 1;
            i >= 0 && remaining > 0;
            i--
          ) {
            const available =
              Number(
                batches[i]
                  .quantity || 0
              );

            if (available <= 0) {
              continue;
            }

            const remove =
              Math.min(
                available,
                remaining
              );

            batches[i] = {
              ...batches[i],
              quantity:
                available - remove,
            };

            remaining -= remove;
          }
        }

        products[productIndex] = {
          ...product,

          stock: Math.max(
            0,
            Number(
              product.stock || 0
            ) -
              Number(
                returnRecord.quantity ||
                  0
              )
          ),

          batches: batches.filter(
            (batch) =>
              Number(
                batch.quantity
              ) > 0
          ),
        };

        /*
         * CREDIT SALES RETURN DELETE
         *
         * Original return reduced
         * customer due.
         *
         * Deleting return therefore
         * increases customer due again.
         */
        if (
          returnRecord.paymentType ===
            "credit" &&
          returnRecord.customerId
        ) {
          const customerIndex =
            customers.findIndex(
              (customer) =>
                Number(
                  customer.id
                ) ===
                Number(
                  returnRecord.customerId
                )
            );

          if (
            customerIndex !== -1
          ) {
            customers[
              customerIndex
            ] = {
              ...customers[
                customerIndex
              ],

              due:
                Number(
                  customers[
                    customerIndex
                  ].due || 0
                ) +
                Number(
                  returnRecord.amount ||
                    0
                ),
            };
          }
        }

        /*
         * CASH SALES RETURN DELETE
         *
         * Original Sales Return created:
         * Cashbook Cash Out
         *
         * Delete only the linked automatic
         * transaction.
         *
         * Manual Cashbook entries remain safe.
         */
        if (
          returnRecord.paymentType ===
          "cash"
        ) {
          const updatedCashbook =
            cashbook.filter(
              (transaction) =>
                !(
                  transaction.referenceType ===
                    "sales_return" &&
                  Number(
                    transaction.referenceId
                  ) ===
                    Number(
                      returnRecord.id
                    )
                )
            );

          localStorage.setItem(
            CASHBOOK_KEY,
            JSON.stringify(
              updatedCashbook
            )
          );
        }
      }

      /*
       * PURCHASE RETURN DELETE
       *
       * Original Purchase Return:
       * Stock - quantity
       *
       * Delete:
       * Stock + quantity
       */
      if (
        returnRecord.type ===
        "purchase"
      ) {
        const newBatch: ProductBatch =
          {
            id:
              Date.now() +
              10,

            quantity: Number(
              returnRecord.quantity ||
                0
            ),

            purchasePrice: Number(
              product.purchasePrice ||
                0
            ),

            sellingPrice: Number(
              product.sellingPrice ||
                0
            ),

            date:
              new Date().toISOString(),
          };

        batches.push(
          newBatch
        );

        products[productIndex] = {
          ...product,

          stock:
            Number(
              product.stock || 0
            ) +
            Number(
              returnRecord.quantity ||
                0
            ),

          batches,
        };

        /*
         * CREDIT PURCHASE RETURN DELETE
         *
         * Original return reduced
         * supplier payable.
         *
         * Deleting return therefore
         * increases supplier due again.
         */
        if (
          returnRecord.paymentType ===
            "credit" &&
          returnRecord.supplierId
        ) {
          const supplierIndex =
            suppliers.findIndex(
              (supplier) =>
                Number(
                  supplier.id
                ) ===
                Number(
                  returnRecord.supplierId
                )
            );

          if (
            supplierIndex !== -1
          ) {
            suppliers[
              supplierIndex
            ] = {
              ...suppliers[
                supplierIndex
              ],

              due:
                Number(
                  suppliers[
                    supplierIndex
                  ].due || 0
                ) +
                Number(
                  returnRecord.amount ||
                    0
                ),
            };
          }
        }

        /*
         * CASH PURCHASE RETURN DELETE
         *
         * Original Purchase Return created:
         * Cashbook Cash In
         *
         * Delete only the linked automatic
         * Cash In transaction.
         *
         * Manual Cashbook entries remain safe.
         */
        if (
          returnRecord.paymentType ===
          "cash"
        ) {
          const updatedCashbook =
            cashbook.filter(
              (transaction) =>
                !(
                  transaction.referenceType ===
                    "purchase_return" &&
                  Number(
                    transaction.referenceId
                  ) ===
                    Number(
                      returnRecord.id
                    )
                )
            );

          localStorage.setItem(
            CASHBOOK_KEY,
            JSON.stringify(
              updatedCashbook
            )
          );
        }
      }

      /*
       * Remove return from history.
       */
      const updatedReturns =
        savedReturns.filter(
          (item) =>
            Number(item.id) !==
            Number(
              returnRecord.id
            )
        );

      /*
       * Save everything.
       */
      localStorage.setItem(
        RETURNS_KEY,
        JSON.stringify(
          updatedReturns
        )
      );

      localStorage.setItem(
        PRODUCT_KEY,
        JSON.stringify(
          products
        )
      );

      localStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify(
          customers
        )
      );

      localStorage.setItem(
        SUPPLIER_KEY,
        JSON.stringify(
          suppliers
        )
      );

      setReturns(
        updatedReturns
      );

      /*
       * Different success message
       * depending on payment type.
       */
      if (
        returnRecord.paymentType ===
        "cash"
      ) {
        setMessage(
          "Return deleted, stock reversed and linked Cashbook entry removed successfully ✅"
        );
      } else {
        setMessage(
          "Return deleted, stock and account balance reversed successfully ✅"
        );
      }
    } catch (error) {
      console.error(
        "Delete return error:",
        error
      );

      setMessage(
        "Unable to delete return."
      );
    }
  };

  const totalSalesReturns =
    returns
      .filter(
        (item) =>
          item.type === "sales"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

  const totalPurchaseReturns =
    returns
      .filter(
        (item) =>
          item.type ===
          "purchase"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

  return (
    <main className="return-history-page">

      <header className="return-history-header">

        <button
          className="return-history-back"
          onClick={() =>
            window.history.back()
          }
        >
          ←
        </button>

        <div>
          <h1>
            Return History
          </h1>

          <p>
            Sales & Purchase Returns
          </p>
        </div>

      </header>

      <section className="return-history-content">

        <div className="return-history-summary">

          <div>
            <span>
              Sales Returns
            </span>

            <strong>
              {formatMoney(
                totalSalesReturns
              )}
            </strong>
          </div>

          <div>
            <span>
              Purchase Returns
            </span>

            <strong>
              {formatMoney(
                totalPurchaseReturns
              )}
            </strong>
          </div>

          <div>
            <span>
              Total Returns
            </span>

            <strong>
              {returns.length}
            </strong>
          </div>

        </div>

        {message && (
          <div className="return-history-message">
            {message}
          </div>
        )}

        {returns.length ===
        0 ? (
          <div className="return-history-empty">

            <div>
              📋
            </div>

            <h2>
              No returns yet
            </h2>

            <p>
              Sales and purchase
              returns will appear
              here.
            </p>

          </div>
        ) : (
          <div className="return-history-list">

            {returns.map(
              (item) => (
                <div
                  className="return-history-card"
                  key={item.id}
                >

                  <div
                    className={`return-history-icon ${
                      item.type
                    }`}
                  >
                    {item.type ===
                    "sales"
                      ? "↩️"
                      : "↪️"}
                  </div>

                  <div className="return-history-info">

                    <strong>
                      {item.type ===
                      "sales"
                        ? "Sales Return"
                        : "Purchase Return"}
                    </strong>

                    <span>
                      {
                        item.productName
                      }
                    </span>

                    <small>
                      Qty:{" "}
                      {
                        item.quantity
                      }{" "}
                      •{" "}
                      {new Date(
                        item.date
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </small>

                    <small>
                      {item.type ===
                      "sales"
                        ? `Customer: ${
                            item.customerName ||
                            "Walk-in Customer"
                          }`
                        : `Supplier: ${
                            item.supplierName ||
                            "-"
                          }`}
                    </small>

                    {item.reason && (
                      <small>
                        Reason:{" "}
                        {
                          item.reason
                        }
                      </small>
                    )}

                  </div>

                  <div className="return-history-right">

                    <strong>
                      {formatMoney(
                        Number(
                          item.amount
                        ) || 0
                      )}
                    </strong>

                    <span>
                      {item.paymentType ===
                      "credit"
                        ? "Credit"
                        : "Cash"}
                    </span>

                    <button
                      className="return-history-delete"
                      onClick={() =>
                        deleteReturn(
                          item
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

    </main>
  );
}
