"use client";

import { useEffect, useState } from "react";

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

  // Old format compatibility
  product?: string;
  price?: number;
  purchasePrice?: number;
  quantity?: number;

  discount: number;
  total: number;
  date: string;

  paymentType?: "cash" | "credit";
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
};

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  function loadSales() {
    const savedSales: Sale[] = JSON.parse(
      localStorage.getItem(
        "hisabpro_sales"
      ) || "[]"
    );

    setSales(
      [...savedSales].reverse()
    );
  }

  /*
   * Convert old single-product sale
   * into the new items format.
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

  const totalSales = sales.reduce(
    (sum, sale) =>
      sum + sale.total,
    0
  );

  const totalItems = sales.reduce(
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

  function deleteSale(sale: Sale) {
    setMessage("");

    const confirmDelete =
      window.confirm(
        `Delete this bill for ₹${sale.total.toLocaleString(
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
     * 1. REMOVE SALE FROM SALES HISTORY
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
     * 2. RESTORE STOCK BATCH-WISE
     * =====================================
     */

    const savedProducts: Product[] =
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
            productItems.length === 0
          ) {
            return product;
          }

          /*
           * New batch-aware sale
           */
          const hasBatchDetails =
            productItems.some(
              (item) =>
                item.batchDetails &&
                item.batchDetails.length >
                  0
            );

          if (hasBatchDetails) {

            let batches: StockBatch[] =
              product.batches
                ? [...product.batches]
                : [];

            productItems.forEach(
              (item) => {

                /*
                 * Restore exact quantities
                 * into their original batches.
                 */
                if (
                  item.batchDetails &&
                  item.batchDetails.length >
                    0
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
                        batchIndex !== -1
                      ) {

                        batches[
                          batchIndex
                        ] = {
                          ...batches[
                            batchIndex
                          ],
                          quantity:
                            batches[
                              batchIndex
                            ].quantity +
                            soldBatch.quantity,
                        };

                      } else {

                        /*
                         * If original batch was
                         * removed, recreate it.
                         */
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

                  /*
                   * Fallback for an item without
                   * batchDetails.
                   */
                  const fallbackBatchIndex =
                    batches.findIndex(
                      (batch) =>
                        batch.sellingPrice ===
                        item.price
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
                        batches[
                          fallbackBatchIndex
                        ].quantity +
                        item.quantity,
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

            /*
             * Recalculate total stock
             */
            const totalStock =
              batches.reduce(
                (sum, batch) =>
                  sum +
                  Number(
                    batch.quantity
                  ),
                0
              );

            /*
             * Latest remaining batch
             * becomes current display rate.
             */
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
           *
           * Old sales did not contain batchDetails.
           * Restore their quantity normally.
           */

          const totalQuantity =
            productItems.reduce(
              (sum, item) =>
                sum +
                item.quantity,
              0
            );

          /*
           * If old product has no batches,
           * simply restore stock.
           */
          if (
            !product.batches ||
            product.batches.length === 0
          ) {

            return {
              ...product,
              stock:
                product.stock +
                totalQuantity,
            };

          }

          /*
           * If batches exist but old sale
           * has no batch information, restore
           * into a matching selling-price batch.
           */
          const batches =
            [...product.batches];

          productItems.forEach(
            (item) => {

              const batchIndex =
                batches.findIndex(
                  (batch) =>
                    batch.sellingPrice ===
                    item.price
                );

              if (
                batchIndex !== -1
              ) {

                batches[
                  batchIndex
                ] = {
                  ...batches[
                    batchIndex
                  ],
                  quantity:
                    batches[
                      batchIndex
                    ].quantity +
                    item.quantity,
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
              (sum, batch) =>
                sum +
                batch.quantity,
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
     * 3. REVERSE CUSTOMER DUE
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
                    customer.due -
                      sale.total
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
       * =================================
       * 4. REMOVE CREDIT TRANSACTION
       * =================================
       */

      const productNames =
        items
          .map(
            (item) =>
              item.product
          )
          .join(", ");

      const newNote =
        `Credit Sale - ${productNames}`;

      const savedTransactions:
        Transaction[] =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_transactions"
          ) || "[]"
        );

      let transactionRemoved =
        false;

      const updatedTransactions =
        savedTransactions.filter(
          (transaction) => {

            if (
              transaction.customerId ===
                sale.customerId &&
              transaction.type ===
                "credit" &&
              transaction.amount ===
                sale.total &&
              (
                transaction.note ===
                  newNote ||
                transaction.note ===
                  `Credit Sale - ${sale.product}`
              ) &&
              !transactionRemoved
            ) {

              transactionRemoved =
                true;

              return false;
            }

            return true;
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
     * SUCCESS
     * =====================================
     */

    setMessage(
      "Bill deleted, original stock batches & Khata updated successfully ✅"
    );
  }

  return (
    <main className="history-page">

      {/* HEADER */}

      <header className="history-header">

        <button
          onClick={() =>
            window.history.back()
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

      {/* SALES LIST */}

      <section className="sales-list">

        <div className="history-title">

          <h2>
            Recent Sales
          </h2>

        </div>

        {sales.length === 0 ? (
          <div className="empty-sales">

            <div>🧾</div>

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
          sales.map((sale) => {

            const items =
              getSaleItems(
                sale
              );

            return (
              <div
                className="sale-history-item"
                key={sale.id}
              >

                {/* ICON */}

                <div className="sale-icon">
                  🧾
                </div>

                {/* INFO */}

                <div className="sale-info">

                  <strong>
                    {items.length ===
                    1
                      ? items[0]
                          .product
                      : `${items.length} Items`}
                  </strong>

                  {/* PRODUCTS */}

                  <div className="history-products">

                    {items.map(
                      (item, itemIndex) => {

                        const hasBatches =
                          item.batchDetails &&
                          item.batchDetails
                            .length > 0;

                        return (
                          <div
                            key={`${item.productId}-${itemIndex}`}
                            className="history-product-row"
                          >

                            <span>
                              {item.product}
                            </span>

                            <span>
                              {item.quantity}
                              {" × ₹"}
                              {item.price.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            <strong>
                              ₹
                              {item.amount.toLocaleString(
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
                                    (batch) =>
                                      `${batch.quantity} × ₹${batch.sellingPrice.toLocaleString(
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

                  {/* DATE */}

                  <small>
                    {new Date(
                      sale.date
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </small>

                  {/* PAYMENT */}

                  {sale.paymentType ===
                  "credit" ? (
                    <div className="sale-customer">

                      <span className="credit-badge">
                        Credit / Udhaar
                      </span>

                      {sale.customerName && (
                        <span className="customer-name">
                          👤{" "}
                          {sale.customerName}
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

                {/* RIGHT */}

                <div className="sale-right">

                  <strong>
                    ₹
                    {sale.total.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <button
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
          })
        )}

      </section>

    </main>
  );
}
