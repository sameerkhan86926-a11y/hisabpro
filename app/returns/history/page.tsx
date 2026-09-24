"use client";

import { useEffect, useState } from "react";

type PaymentType = "cash" | "credit";

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

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

const RETURNS_KEY =
  "hisabpro_returns";

const PRODUCT_KEY =
  "hisabpro_products";

const CUSTOMER_KEY =
  "hisabpro_customers";

const SUPPLIER_KEY =
  "hisabpro_suppliers";

const CASHBOOK_KEY =
  "hisabpro_cashbook";

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
          new Date(
            b.date
          ).getTime() -
          new Date(
            a.date
          ).getTime()
      );

      setReturns(saved);
    } catch {
      setReturns([]);
    }
  };

  const formatMoney = (
    amount: number
  ) =>
    `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  function getPaymentMode(
    returnRecord: ReturnRecord
  ): PaymentMode | undefined {
    if (
      returnRecord.paymentType ===
      "credit"
    ) {
      return undefined;
    }

    /*
     * Old return records don't have
     * paymentMode, so treat them as Cash.
     */
    return (
      returnRecord.paymentMode ||
      "cash"
    );
  }

  function getPaymentModeLabel(
    returnRecord: ReturnRecord
  ) {
    if (
      returnRecord.paymentType ===
      "credit"
    ) {
      return "Credit";
    }

    switch (
      getPaymentMode(
        returnRecord
      )
    ) {
      case "cash":
        return "Cash";

      case "upi":
        return "UPI";

      case "card":
        return "Card";

      case "bank":
        return "Bank Transfer";

      case "online":
        return "Online";

      default:
        return "Cash";
    }
  }

  const deleteReturn = (
    returnRecord: ReturnRecord
  ) => {
    const confirmed =
      window.confirm(
        "Delete this return? Stock, account balance and linked Cashbook entry will be reversed."
      );

    if (!confirmed) {
      return;
    }

    try {
      const savedReturns:
        ReturnRecord[] =
        JSON.parse(
          localStorage.getItem(
            RETURNS_KEY
          ) || "[]"
        );

      const products:
        Product[] =
        JSON.parse(
          localStorage.getItem(
            PRODUCT_KEY
          ) || "[]"
        );

      const customers:
        Customer[] =
        JSON.parse(
          localStorage.getItem(
            CUSTOMER_KEY
          ) || "[]"
        );

      const suppliers:
        Supplier[] =
        JSON.parse(
          localStorage.getItem(
            SUPPLIER_KEY
          ) || "[]"
        );

      const cashbook:
        CashTransaction[] =
        JSON.parse(
          localStorage.getItem(
            CASHBOOK_KEY
          ) || "[]"
        );

      const productIndex =
        products.findIndex(
          (product) =>
            Number(
              product.id
            ) ===
            Number(
              returnRecord.productId
            )
        );

      if (
        productIndex === -1
      ) {
        setMessage(
          "Product not found."
        );
        return;
      }

      const product =
        products[
          productIndex
        ];

      let batches =
        Array.isArray(
          product.batches
        )
          ? [
              ...product.batches,
            ]
          : [];

      /*
       * ============================
       * SALES RETURN DELETE
       * ============================
       *
       * Original:
       * Stock + quantity
       *
       * Delete:
       * Stock - quantity
       */
      if (
        returnRecord.type ===
        "sales"
      ) {
        if (
          batches.length > 0
        ) {
          let remaining =
            Number(
              returnRecord.quantity ||
                0
            );

          /*
           * Sales return adds stock
           * to the latest batch.
           *
           * Therefore remove returned
           * quantity from newest batches.
           */
          for (
            let i =
              batches.length -
              1;
            i >= 0 &&
            remaining > 0;
            i--
          ) {
            const available =
              Number(
                batches[i]
                  .quantity ||
                  0
              );

            if (
              available <= 0
            ) {
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
                available -
                remove,
            };

            remaining -=
              remove;
          }
        }

        products[
          productIndex
        ] = {
          ...product,

          stock: Math.max(
            0,
            Number(
              product.stock ||
                0
            ) -
              Number(
                returnRecord.quantity ||
                  0
              )
          ),

          batches:
            batches.filter(
              (batch) =>
                Number(
                  batch.quantity
                ) > 0
            ),
        };

        /*
         * CREDIT SALES RETURN
         *
         * Original return reduced
         * customer due.
         *
         * Delete reverses that:
         * customer due increases.
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
            customerIndex !==
            -1
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
         * SALES RETURN CASHBOOK
         *
         * Only Cash refund created
         * Cashbook Cash Out.
         *
         * UPI/Card/Bank/Online:
         * NO Cashbook reversal.
         */
        const paymentMode =
          getPaymentMode(
            returnRecord
          );

        if (
          returnRecord.paymentType ===
            "cash" &&
          paymentMode ===
            "cash"
        ) {
          const updatedCashbook =
            cashbook.filter(
              (
                transaction
              ) =>
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
       * ============================
       * PURCHASE RETURN DELETE
       * ============================
       *
       * Original:
       * Stock - quantity
       *
       * Delete:
       * Stock + quantity
       */
      if (
        returnRecord.type ===
        "purchase"
      ) {
        const newBatch:
          ProductBatch = {
          id:
            Date.now() +
            10,

          quantity:
            Number(
              returnRecord.quantity ||
                0
            ),

          purchasePrice:
            Number(
              product.purchasePrice ||
                0
            ),

          sellingPrice:
            Number(
              product.sellingPrice ||
                0
            ),

          date:
            new Date().toISOString(),
        };

        batches.push(
          newBatch
        );

        products[
          productIndex
        ] = {
          ...product,

          stock:
            Number(
              product.stock ||
                0
            ) +
            Number(
              returnRecord.quantity ||
                0
            ),

          batches,
        };

        /*
         * CREDIT PURCHASE RETURN
         *
         * Original return reduced
         * supplier due.
         *
         * Delete increases
         * supplier due again.
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
            supplierIndex !==
            -1
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
         * PURCHASE RETURN CASHBOOK
         *
         * Only Cash supplier refund
         * created Cashbook Cash In.
         *
         * UPI/Card/Bank/Online:
         * NO Cashbook reversal.
         */
        const paymentMode =
          getPaymentMode(
            returnRecord
          );

        if (
          returnRecord.paymentType ===
            "cash" &&
          paymentMode ===
            "cash"
        ) {
          const updatedCashbook =
            cashbook.filter(
              (
                transaction
              ) =>
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
            Number(
              item.id
            ) !==
            Number(
              returnRecord.id
            )
        );

      /*
       * Save all data.
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
       * Success message.
       */
      const paymentMode =
        getPaymentMode(
          returnRecord
        );

      if (
        returnRecord.paymentType ===
          "cash" &&
        paymentMode ===
          "cash"
      ) {
        setMessage(
          "Return deleted, stock reversed and linked Cashbook entry removed successfully ✅"
        );
      } else if (
        returnRecord.paymentType ===
        "credit"
      ) {
        setMessage(
          "Return deleted, stock and account balance reversed successfully ✅"
        );
      } else {
        setMessage(
          `${getPaymentModeLabel(
            returnRecord
          )} return deleted and stock reversed successfully. Cashbook was not changed ✅`
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
          item.type ===
          "sales"
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
          onClick={() => {
            window.location.href =
              "/hisabpro/returns/";
          }}
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
                      {getPaymentModeLabel(
                        item
                      )}
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
