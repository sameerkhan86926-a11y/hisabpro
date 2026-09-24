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

  customerId?: number | null;
  customerName?: string;
};

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
  saleId?: number;
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

export default function SalesHistoryPage() {
  const [sales, setSales] =
    useState<Sale[]>([]);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadSales();
  }, []);

  function loadSales() {
    try {
      const savedSales: Sale[] =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_sales"
          ) || "[]"
        );

      setSales(
        [...savedSales].reverse()
      );
    } catch (error) {
      console.error(
        "Sales history loading error:",
        error
      );

      setSales([]);
    }
  }

  /*
   * =====================================
   * PAYMENT MODE LABEL
   * =====================================
   */

  function getPaymentModeLabel(
    paymentType?: PaymentType,
    paymentMode?: PaymentMode
  ) {
    if (
      paymentType === "credit"
    ) {
      return "Credit / Udhaar";
    }

    switch (
      paymentMode || "cash"
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

  /*
   * =====================================
   * OLD + NEW SALE COMPATIBILITY
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

          product:
            sale.product,

          price:
            sale.price || 0,

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
   * TOTALS
   * =====================================
   */

  const totalSales =
    sales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.total || 0
        ),
      0
    );

  const totalItems =
    sales.reduce(
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
   * DELETE SALE
   * =====================================
   */

  function deleteSale(
    sale: Sale
  ) {
    setMessage("");

    const confirmDelete =
      window.confirm(
        `Delete this bill for ₹${Number(
          sale.total || 0
        ).toLocaleString(
          "en-IN"
        )}?`
      );

    if (!confirmDelete) {
      return;
    }

    const items =
      getSaleItems(sale);

    /*
     * =====================================
     * 1. REMOVE SALE
     * =====================================
     */

    const savedSales: Sale[] =
      JSON.parse(
        localStorage.getItem(
          "hisabpro_sales"
        ) || "[]"
      );

    const updatedSales =
      savedSales.filter(
        (item) =>
          item.id !== sale.id
      );

    localStorage.setItem(
      "hisabpro_sales",
      JSON.stringify(
        updatedSales
      )
    );

    setSales(
      [...updatedSales].reverse()
    );

    /*
     * =====================================
     * 2. RESTORE STOCK
     * =====================================
     */

    const savedProducts:
      Product[] =
      JSON.parse(
        localStorage.getItem(
          "hisabpro_products"
        ) || "[]"
      );

    const updatedProducts =
      savedProducts.map(
        (product) => {
          const productItems =
            items.filter(
              (item) =>
                item.productId ===
                product.id
            );

          if (
            productItems.length ===
            0
          ) {
            return product;
          }

          const hasBatchDetails =
            productItems.some(
              (item) =>
                item.batchDetails &&
                item.batchDetails
                  .length > 0
            );

          /*
           * =================================
           * NEW BATCH-AWARE SALE
           * =================================
           */

          if (
            hasBatchDetails
          ) {
            let batches:
              StockBatch[] =
              product.batches
                ? [
                    ...product.batches,
                  ]
                : [];

            productItems.forEach(
              (item) => {
                if (
                  item.batchDetails &&
                  item.batchDetails
                    .length > 0
                ) {
                  item.batchDetails.forEach(
                    (soldBatch) => {
                      const batchIndex =
                        batches.findIndex(
                          (batch) =>
                            batch.id ===
                            soldBatch.batchId
                        );

                      if (
                        batchIndex !==
                        -1
                      ) {
                        batches[
                          batchIndex
                        ] = {
                          ...batches[
                            batchIndex
                          ],

                          quantity:
                            Number(
                              batches[
                                batchIndex
                              ]
                                .quantity
                            ) +
                            Number(
                              soldBatch.quantity
                            ),
                        };
                      } else {
                        batches.push({
                          id:
                            soldBatch.batchId,

                          quantity:
                            soldBatch.quantity,

                          purchasePrice:
                            soldBatch.purchasePrice,

                          sellingPrice:
                            soldBatch.sellingPrice,

                          date:
                            sale.date,
                        });
                      }
                    }
                  );
                } else {
                  const fallbackBatchIndex =
                    batches.findIndex(
                      (batch) =>
                        Number(
                          batch.sellingPrice
                        ) ===
                        Number(
                          item.price
                        )
                    );

                  if (
                    fallbackBatchIndex !==
                    -1
                  ) {
                    batches[
                      fallbackBatchIndex
                    ] = {
                      ...batches[
                        fallbackBatchIndex
                      ],

                      quantity:
                        Number(
                          batches[
                            fallbackBatchIndex
                          ]
                            .quantity
                        ) +
                        Number(
                          item.quantity
                        ),
                    };
                  } else {
                    batches.push({
                      id:
                        Date.now() +
                        Math.floor(
                          Math.random() *
                            1000
                        ),

                      quantity:
                        item.quantity,

                      purchasePrice:
                        item.purchasePrice,

                      sellingPrice:
                        item.price,

                      date:
                        sale.date,
                    });
                  }
                }
              }
            );

            const totalStock =
              batches.reduce(
                (
                  sum,
                  batch
                ) =>
                  sum +
                  Number(
                    batch.quantity
                  ),
                0
              );

            const sortedBatches =
              [...batches].sort(
                (a, b) =>
                  new Date(
                    b.date
                  ).getTime() -
                  new Date(
                    a.date
                  ).getTime()
              );

            const latestBatch =
              sortedBatches[0];

            return {
              ...product,

              stock:
                totalStock,

              batches,

              purchasePrice:
                latestBatch
                  ? latestBatch.purchasePrice
                  : product.purchasePrice,

              sellingPrice:
                latestBatch
                  ? latestBatch.sellingPrice
                  : product.sellingPrice,
            };
          }

          /*
           * =================================
           * OLD SALE COMPATIBILITY
           * =================================
           */

          const totalQuantity =
            productItems.reduce(
              (
                sum,
                item
              ) =>
                sum +
                Number(
                  item.quantity || 0
                ),
              0
            );

          if (
            !product.batches ||
            product.batches.length ===
              0
          ) {
            return {
              ...product,

              stock:
                Number(
                  product.stock || 0
                ) +
                totalQuantity,
            };
          }

          const batches =
            [
              ...product.batches,
            ];

          productItems.forEach(
            (item) => {
              const batchIndex =
                batches.findIndex(
                  (batch) =>
                    Number(
                      batch.sellingPrice
                    ) ===
                    Number(
                      item.price
                    )
                );

              if (
                batchIndex !==
                -1
              ) {
                batches[
                  batchIndex
                ] = {
                  ...batches[
                    batchIndex
                  ],

                  quantity:
                    Number(
                      batches[
                        batchIndex
                      ].quantity
                    ) +
                    Number(
                      item.quantity
                    ),
                };
              } else {
                batches.push({
                  id:
                    Date.now() +
                    Math.floor(
                      Math.random() *
                        1000
                    ),

                  quantity:
                    item.quantity,

                  purchasePrice:
                    item.purchasePrice,

                  sellingPrice:
                    item.price,

                  date:
                    sale.date,
                });
              }
            }
          );

          const totalStock =
            batches.reduce(
              (
                sum,
                batch
              ) =>
                sum +
                Number(
                  batch.quantity
                ),
              0
            );

          return {
            ...product,

            stock:
              totalStock,

            batches,
          };
        }
      );

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(
        updatedProducts
      )
    );

    /*
     * =====================================
     * 3. CREDIT SALE → REVERSE KHATA
     * =====================================
     */

    if (
      sale.paymentType ===
        "credit" &&
      sale.customerId
    ) {
      const savedCustomers:
        Customer[] =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_customers"
          ) || "[]"
        );

      const updatedCustomers =
        savedCustomers.map(
          (customer) =>
            customer.id ===
            sale.customerId
              ? {
                  ...customer,

                  due: Math.max(
                    0,
                    Number(
                      customer.due ||
                        0
                    ) -
                      Number(
                        sale.total ||
                          0
                      )
                  ),
                }
              : customer
        );

      localStorage.setItem(
        "hisabpro_customers",
        JSON.stringify(
          updatedCustomers
        )
      );

      /*
       * Remove exact sale transaction.
       */

      const savedTransactions:
        Transaction[] =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_transactions"
          ) || "[]"
        );

      const itemsText =
        items
          .map(
            (item) =>
              `${item.product} (${item.quantity})`
          )
          .join(", ");

      const newNote =
        `Credit Sale - ${itemsText}`;

      const updatedTransactions =
        savedTransactions.filter(
          (transaction) => {
            /*
             * New transaction format
             */
            if (
              transaction.saleId !==
              undefined
            ) {
              return (
                transaction.saleId !==
                sale.id
              );
            }

            /*
             * Old transaction format
             */
            return !(
              transaction.customerId ===
                sale.customerId &&
              transaction.type ===
                "credit" &&
              Number(
                transaction.amount
              ) ===
                Number(
                  sale.total
                ) &&
              (
                transaction.note ===
                  newNote ||
                transaction.note ===
                  `Credit Sale - ${sale.product}`
              )
            );
          }
        );

      localStorage.setItem(
        "hisabpro_transactions",
        JSON.stringify(
          updatedTransactions
        )
      );
    }

    /*
     * =====================================
     * 4. CASH SALE → REMOVE CASHBOOK
     * =====================================
     *
     * IMPORTANT:
     *
     * Only actual CASH sale affects
     * Cashbook.
     *
     * UPI / Card / Bank / Online
     * do NOT affect Cashbook.
     */

    const actualPaymentMode:
      PaymentMode =
      sale.paymentType ===
        "credit"
        ? "cash"
        : sale.paymentMode ||
          "cash";

    if (
      sale.paymentType !==
        "credit" &&
      actualPaymentMode ===
        "cash"
    ) {
      const savedCashbook:
        CashTransaction[] =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_cashbook"
          ) || "[]"
        );

      /*
       * New automatic entries have
       * referenceType + referenceId.
       *
       * Old cash sales without a
       * reference are NOT touched.
       */

      const updatedCashbook =
        savedCashbook.filter(
          (transaction) =>
            !(
              transaction.referenceType ===
                "sale" &&
              Number(
                transaction.referenceId
              ) ===
                Number(
                  sale.id
                )
            )
        );

      localStorage.setItem(
        "hisabpro_cashbook",
        JSON.stringify(
          updatedCashbook
        )
      );
    }

    /*
     * =====================================
     * SUCCESS
     * =====================================
     */

    setMessage(
      "Bill deleted, stock restored and linked accounts updated successfully ✅"
    );
  }

  return (
    <main className="history-page">

      {/* HEADER */}

      <header className="history-header">

        <button
          type="button"
          onClick={() =>
            window.location.href =
              "/hisabpro/sales/"
          }
          className="back-button"
        >
          ← Back
        </button>

        <h1>
          Sales History
        </h1>

        <a href="/hisabpro/sales/">
          + New Sale
        </a>

      </header>

      {/* MESSAGE */}

      {message && (
        <div
          style={{
            width:
              "min(1100px, 92%)",

            margin:
              "18px auto 0",

            padding:
              "12px 15px",

            background:
              "#edf9f2",

            color:
              "#138a50",

            borderRadius:
              "10px",

            fontSize:
              "13px",

            fontWeight:
              600,

            textAlign:
              "center",
          }}
        >
          {message}
        </div>
      )}

      {/* STATS */}

      <section className="history-stats">

        <div className="history-card">

          <span>
            Total Sales
          </span>

          <strong>
            ₹
            {totalSales.toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>

        <div className="history-card">

          <span>
            Total Bills
          </span>

          <strong>
            {sales.length}
          </strong>

        </div>

        <div className="history-card">

          <span>
            Items Sold
          </span>

          <strong>
            {totalItems}
          </strong>

        </div>

      </section>

      {/* SALES */}

      <section className="sales-list">

        <div className="history-title">

          <h2>
            Recent Sales
          </h2>

        </div>

        {sales.length === 0 ? (

          <div className="empty-sales">

            <div>
              🧾
            </div>

            <h3>
              No Sales Yet
            </h3>

            <p>
              Create your first
              sale to see it here.
            </p>

            <a href="/hisabpro/sales/">
              Create New Sale
            </a>

          </div>

        ) : (

          sales.map(
            (sale) => {
              const items =
                getSaleItems(
                  sale
                );

              const paymentLabel =
                getPaymentModeLabel(
                  sale.paymentType,
                  sale.paymentMode
                );

              const isCredit =
                sale.paymentType ===
                "credit";

              return (
                <div
                  className="sale-history-item"
                  key={sale.id}
                >

                  <div className="sale-icon">
                    🧾
                  </div>

                  <div className="sale-info">

                    <strong>
                      {items.length ===
                      1
                        ? items[0]
                            .product
                        : `${items.length} Items`}
                    </strong>

                    <div className="history-products">

                      {items.map(
                        (
                          item,
                          itemIndex
                        ) => {

                          const hasBatches =
                            item.batchDetails &&
                            item
                              .batchDetails
                              .length >
                              0;

                          return (
                            <div
                              key={`${item.productId}-${itemIndex}`}
                              className="history-product-row"
                            >

                              <span>
                                {item.product}
                              </span>

                              <span>
                                {
                                  item.quantity
                                }
                                {" × ₹"}
                                {Number(
                                  item.price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                              <strong>
                                ₹
                                {Number(
                                  item.amount
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                              {hasBatches && (
                                <small
                                  style={{
                                    gridColumn:
                                      "1 / -1",

                                    color:
                                      "#687386",

                                    fontSize:
                                      "10px",
                                  }}
                                >
                                  {item.batchDetails!
                                    .map(
                                      (
                                        batch
                                      ) =>
                                        `${batch.quantity} × ₹${Number(
                                          batch.sellingPrice
                                        ).toLocaleString(
                                          "en-IN"
                                        )}`
                                    )
                                    .join(
                                      " + "
                                    )}
                                </small>
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>

                    <small>
                      {new Date(
                        sale.date
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </small>

                    {/* PAYMENT */}

                    <div className="sale-customer">

                      <span
                        className={
                          isCredit
                            ? "credit-badge"
                            : sale.paymentMode ===
                                "upi"
                              ? "upi-badge"
                              : sale.paymentMode ===
                                  "card"
                                ? "card-badge"
                                : sale.paymentMode ===
                                    "bank"
                                  ? "bank-badge"
                                  : sale.paymentMode ===
                                      "online"
                                    ? "online-badge"
                                    : "cash-badge"
                        }
                      >
                        {paymentLabel}
                      </span>

                      {isCredit &&
                        sale.customerName && (
                          <span className="customer-name">
                            👤{" "}
                            {
                              sale.customerName
                            }
                          </span>
                        )}

                    </div>

                  </div>

                  <div className="sale-right">

                    <strong>
                      ₹
                      {Number(
                        sale.total
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        deleteSale(
                          sale
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              );
            }
          )

        )}

      </section>

    </main>
  );
}
