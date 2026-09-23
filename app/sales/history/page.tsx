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
      localStorage.getItem(
        "hisabpro_sales"
      ) || "[]"
    );

    setSales(
      [...savedSales].reverse()
    );
  }

  /*
   * Converts old single-product sale
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
          quantity: sale.quantity || 1,
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
            itemSum + item.quantity,
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
     * Remove sale from sales history
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
     * Restore stock for ALL products
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
          const saleItem =
            items.find(
              (item) =>
                item.productId ===
                product.id
            );

          if (!saleItem) {
            return product;
          }

          return {
            ...product,
            stock:
              product.stock +
              saleItem.quantity,
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
     * Reverse customer due
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
       * Remove matching credit transaction
       *
       * New transaction note:
       * Credit Sale - Product 1, Product 2
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

    setMessage(
      "Bill deleted, stock & Khata updated successfully ✅"
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
                      (item) => (
                        <div
                          key={
                            item.productId
                          }
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

                        </div>
                      )
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
