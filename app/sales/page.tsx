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

type Customer = {
  id: number;
  name: string;
  phone: string;
  due: number;
};

type PaymentType = "cash" | "credit";

type CartItem = {
  productId: number;
  product: string;
  quantity: number;
  price: number;
  purchasePrice: number;
  amount: number;
  batchDetails: {
    batchId: number;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
  }[];
};

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [productId, setProductId] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  const [paymentType, setPaymentType] =
    useState<PaymentType>("cash");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    try {
      const savedProducts = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      const savedCustomers = JSON.parse(
        localStorage.getItem("hisabpro_customers") || "[]"
      );

      setProducts(
        Array.isArray(savedProducts)
          ? savedProducts
          : []
      );

      setCustomers(
        Array.isArray(savedCustomers)
          ? savedCustomers
          : []
      );
    } catch (error) {
      console.error("Sales loading error:", error);
    }
  }

  function getProductBatches(
    product: Product
  ): StockBatch[] {
    if (
      product.batches &&
      product.batches.length > 0
    ) {
      return [...product.batches]
        .filter(
          (batch) =>
            Number(batch.quantity) > 0
        )
        .sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        );
    }

    if (Number(product.stock) > 0) {
      return [
        {
          id: product.id,
          quantity: Number(product.stock),
          purchasePrice: Number(
            product.purchasePrice || 0
          ),
          sellingPrice: Number(
            product.sellingPrice || 0
          ),
          date: new Date().toISOString(),
        },
      ];
    }

    return [];
  }

  function getAvailableQuantity(
    product: Product
  ) {
    const alreadyInCart = cart
      .filter(
        (item) =>
          item.productId === product.id
      )
      .reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    return Math.max(
      0,
      Number(product.stock || 0) -
        alreadyInCart
    );
  }

  // =================================
  // ADD PRODUCT TO BILL
  // =================================

  function addToBill() {
    setMessage("");

    if (!productId) {
      setMessage("Product select karein.");
      return;
    }

    if (quantity <= 0) {
      setMessage("Quantity enter karein.");
      return;
    }

    const product = products.find(
      (item) =>
        item.id === Number(productId)
    );

    if (!product) {
      setMessage("Product nahi mila.");
      return;
    }

    const available =
      getAvailableQuantity(product);

    if (quantity > available) {
      setMessage(
        `Available stock sirf ${available} hai.`
      );
      return;
    }

    const batches =
      getProductBatches(product);

    let remaining = quantity;

    const batchDetails: CartItem["batchDetails"] =
      [];

    for (const batch of batches) {
      if (remaining <= 0) break;

      const take = Math.min(
        remaining,
        Number(batch.quantity)
      );

      batchDetails.push({
        batchId: batch.id,
        quantity: take,
        purchasePrice:
          Number(batch.purchasePrice),
        sellingPrice:
          Number(batch.sellingPrice),
      });

      remaining -= take;
    }

    if (remaining > 0) {
      setMessage(
        "Stock batches me available quantity nahi mili."
      );
      return;
    }

    const totalAmount =
      batchDetails.reduce(
        (sum, batch) =>
          sum +
          batch.quantity *
            batch.sellingPrice,
        0
      );

    const totalPurchaseCost =
      batchDetails.reduce(
        (sum, batch) =>
          sum +
          batch.quantity *
            batch.purchasePrice,
        0
      );

    const averageSellingPrice =
      totalAmount / quantity;

    const averagePurchasePrice =
      totalPurchaseCost / quantity;

    const existingIndex =
      cart.findIndex(
        (item) =>
          item.productId ===
          product.id
      );

    if (existingIndex >= 0) {
      const updatedCart = [...cart];

      const existing =
        updatedCart[existingIndex];

      updatedCart[existingIndex] = {
        ...existing,

        quantity:
          existing.quantity + quantity,

        amount:
          existing.amount + totalAmount,

        price:
          (existing.amount +
            totalAmount) /
          (existing.quantity +
            quantity),

        purchasePrice:
          (existing.purchasePrice *
            existing.quantity +
            averagePurchasePrice *
              quantity) /
          (existing.quantity +
            quantity),

        batchDetails: [
          ...existing.batchDetails,
          ...batchDetails,
        ],
      };

      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          product: product.name,
          quantity,
          price: averageSellingPrice,
          purchasePrice:
            averagePurchasePrice,
          amount: totalAmount,
          batchDetails,
        },
      ]);
    }

    setProductId("");
    setQuantity(1);
  }

  // =================================
  // REMOVE
  // =================================

  function removeFromBill(
    productId: number
  ) {
    setCart(
      cart.filter(
        (item) =>
          item.productId !== productId
      )
    );
  }

  // =================================
  // CALCULATIONS
  // =================================

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.amount),
    0
  );

  const safeDiscount = Math.min(
    Math.max(0, Number(discount)),
    subtotal
  );

  const total =
    subtotal - safeDiscount;

  const selectedCustomer =
    customers.find(
      (customer) =>
        customer.id ===
        Number(customerId)
    );

  // =================================
  // SAVE SALE
  // =================================

  function saveSale() {
    setMessage("");

    if (cart.length === 0) {
      setMessage(
        "Bill me kam se kam ek product add karein."
      );
      return;
    }

    if (
      paymentType === "credit" &&
      !selectedCustomer
    ) {
      setMessage(
        "Credit sale ke liye customer select karein."
      );
      return;
    }

    const saleId = Date.now();

    const sale = {
      id: saleId,

      items: cart,

      subtotal,
      discount: safeDiscount,
      total,

      paymentType,

      customerId:
        paymentType === "credit"
          ? selectedCustomer?.id
          : null,

      customerName:
        paymentType === "credit"
          ? selectedCustomer?.name
          : "",

      date:
        new Date().toISOString(),
    };

    // =================================
    // SALES HISTORY
    // =================================

    const oldSales = JSON.parse(
      localStorage.getItem(
        "hisabpro_sales"
      ) || "[]"
    );

    localStorage.setItem(
      "hisabpro_sales",
      JSON.stringify([
        ...oldSales,
        sale,
      ])
    );

    // =================================
    // UPDATE STOCK
    // =================================

    const updatedProducts =
      products.map((product) => {
        const cartItem =
          cart.find(
            (item) =>
              item.productId ===
              product.id
          );

        if (!cartItem) {
          return product;
        }

        let batches =
          getProductBatches(product);

        for (const soldBatch of
          cartItem.batchDetails) {
          let remaining =
            soldBatch.quantity;

          batches = batches.map(
            (batch) => {
              if (
                batch.id !==
                  soldBatch.batchId ||
                remaining <= 0
              ) {
                return batch;
              }

              const deduction =
                Math.min(
                  remaining,
                  Number(batch.quantity)
                );

              remaining -= deduction;

              return {
                ...batch,
                quantity:
                  Number(
                    batch.quantity
                  ) - deduction,
              };
            }
          );
        }

        batches =
          batches.filter(
            (batch) =>
              Number(batch.quantity) >
              0
          );

        const newStock =
          batches.reduce(
            (sum, batch) =>
              sum +
              Number(batch.quantity),
            0
          );

        const latestBatch =
          batches.length > 0
            ? batches[
                batches.length - 1
              ]
            : null;

        return {
          ...product,

          stock: newStock,

          purchasePrice:
            latestBatch
              ? latestBatch.purchasePrice
              : product.purchasePrice,

          sellingPrice:
            latestBatch
              ? latestBatch.sellingPrice
              : product.sellingPrice,

          batches,
        };
      });

    setProducts(updatedProducts);

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(
        updatedProducts
      )
    );

    // =================================
    // CREDIT CUSTOMER
    // =================================

    if (
      paymentType === "credit" &&
      selectedCustomer
    ) {
      const updatedCustomers =
        customers.map(
          (customer) => {
            if (
              customer.id !==
              selectedCustomer.id
            ) {
              return customer;
            }

            return {
              ...customer,
              due:
                Number(customer.due) +
                total,
            };
          }
        );

      setCustomers(
        updatedCustomers
      );

      localStorage.setItem(
        "hisabpro_customers",
        JSON.stringify(
          updatedCustomers
        )
      );

      const oldTransactions =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_transactions"
          ) || "[]"
        );

      localStorage.setItem(
        "hisabpro_transactions",
        JSON.stringify([
          ...oldTransactions,
          {
            id: Date.now(),
            customerId:
              selectedCustomer.id,
            type: "credit",
            amount: total,
            note:
              `Credit Sale - ${cart
                .map(
                  (item) =>
                    `${item.product} (${item.quantity})`
                )
                .join(", ")}`,
            date:
              new Date().toISOString(),
          },
        ])
      );
    }

    // =================================
    // LAST INVOICE
    // =================================

    localStorage.setItem(
      "hisabpro_last_invoice",
      JSON.stringify(sale)
    );

    setCart([]);
    setCustomerId("");
    setDiscount(0);
    setPaymentType("cash");

    window.location.href =
      "/hisabpro/invoice/";
  }

  // =================================
  // UI
  // =================================

  return (
    <main className="sales-page">

      {/* HEADER */}

      <header className="sales-header">

        <button
          onClick={() =>
            window.history.back()
          }
          className="back-button"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>

          <span>Back</span>
        </button>

        <h1>New Sale</h1>

        <div className="sales-header-space"></div>

      </header>

      {/* ADD PRODUCT */}

      <section className="sale-form">

        <div className="sale-section-heading">

          <div className="sale-heading-icon">
            <svg viewBox="0 0 24 24">
              <path d="M4 7h16v13H4z" />
              <path d="M8 7V5h8v2" />
              <path d="M8 11h8M8 15h5" />
            </svg>
          </div>

          <div>
            <h2>Add Product</h2>
            <p>
              Select product and quantity
            </p>
          </div>

        </div>

        <label>
          Product
        </label>

        <select
          value={productId}
          onChange={(e) =>
            setProductId(
              e.target.value
            )
          }
        >
          <option value="">
            Select Product
          </option>

          {products.map(
            (product) => (
              <option
                key={product.id}
                value={product.id}
                disabled={
                  getAvailableQuantity(
                    product
                  ) <= 0
                }
              >
                {product.name} — Stock:{" "}
                {getAvailableQuantity(
                  product
                )}
              </option>
            )
          )}
        </select>

        {productId && (
          <div className="selected-product-info">

            {(() => {
              const product =
                products.find(
                  (item) =>
                    item.id ===
                    Number(
                      productId
                    )
                );

              if (!product)
                return null;

              const batches =
                getProductBatches(
                  product
                );

              return (
                <>
                  <div className="selected-product-title">

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {getAvailableQuantity(
                        product
                      )}{" "}
                      pcs available
                    </span>

                  </div>

                  <div className="batch-list">

                    {batches.map(
                      (batch) => (
                        <div
                          className="batch-rate"
                          key={
                            batch.id
                          }
                        >
                          <span>
                            {batch.quantity} pcs
                          </span>

                          <span>
                            Buy ₹
                            {batch.purchasePrice.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          <span className="sell-rate">
                            Sell ₹
                            {batch.sellingPrice.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      )
                    )}

                  </div>
                </>
              );
            })()}

          </div>
        )}

        <label>
          Quantity
        </label>

        <input
          className="quantity-input"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.max(
                1,
                Number(
                  e.target.value
                )
              )
            )
          }
        />

        <button
          className="add-to-bill"
          onClick={addToBill}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          Add to Bill
        </button>

      </section>

      {/* BILL */}

      <section className="bill-section">

        <div className="section-title">

          <div>
            <h2>Bill</h2>
            <p>
              Products added to this sale
            </p>
          </div>

          <span className="bill-count">
            {cart.length}{" "}
            {cart.length === 1
              ? "Item"
              : "Items"}
          </span>

        </div>

        {cart.length === 0 ? (

          <div className="empty-bill">

            <div className="empty-bill-icon">
              <svg viewBox="0 0 24 24">
                <path d="M6 3h12v18H6z" />
                <path d="M9 7h6M9 11h6M9 15h4" />
              </svg>
            </div>

            <strong>
              No products added yet
            </strong>

            <p>
              Select a product above to
              create your bill.
            </p>

          </div>

        ) : (

          <div className="bill-items">

            {cart.map(
              (item) => (
                <div
                  className="bill-item"
                  key={
                    item.productId
                  }
                >

                  <div className="bill-item-main">

                    <div className="bill-product-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M4 7h16v13H4z" />
                        <path d="M8 7V5h8v2" />
                      </svg>
                    </div>

                    <div>
                      <strong>
                        {item.product}
                      </strong>

                      <small>
                        Qty {item.quantity}
                        {" • "}
                        Avg. ₹
                        {item.price.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </small>
                    </div>

                  </div>

                  <div className="bill-item-right">

                    <strong>
                      ₹
                      {item.amount.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </strong>

                    <button
                      className="remove-item"
                      onClick={() =>
                        removeFromBill(
                          item.productId
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* PAYMENT + SUMMARY */}

      <section className="sale-summary">

        <div className="sale-section-heading">

          <div className="sale-heading-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 6h18v12H3z" />
              <path d="M7 10h10M7 14h6" />
            </svg>
          </div>

          <div>
            <h2>Payment</h2>
            <p>
              Choose payment method
            </p>
          </div>

        </div>

        <label>
          Payment Type
        </label>

        <div className="payment-buttons">

          <button
            className={
              paymentType === "cash"
                ? "payment-option active"
                : "payment-option"
            }
            onClick={() =>
              setPaymentType(
                "cash"
              )
            }
          >
            <span className="payment-icon">
              <svg viewBox="0 0 24 24">
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="12"
                  rx="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
                <path d="M3 9h3M18 9h3M3 15h3M18 15h3" />
              </svg>
            </span>

            <span>Cash</span>
          </button>

          <button
            className={
              paymentType === "credit"
                ? "payment-option active"
                : "payment-option"
            }
            onClick={() =>
              setPaymentType(
                "credit"
              )
            }
          >
            <span className="payment-icon">
              <svg viewBox="0 0 24 24">
                <path d="M4 5h16v14H4z" />
                <path d="M7 9h10M7 13h5M7 16h3" />
              </svg>
            </span>

            <span>
              Credit / Udhaar
            </span>
          </button>

        </div>

        {paymentType ===
          "credit" && (

          <div className="customer-box">

            <label>
              Customer
            </label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Customer
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={
                      customer.id
                    }
                  >
                    {customer.name}
                    {" — Due ₹"}
                    {Number(
                      customer.due
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </option>
                )
              )}
            </select>

          </div>
        )}

        <label>
          Discount
        </label>

        <input
          className="discount-input"
          type="number"
          min="0"
          value={discount}
          onChange={(e) =>
            setDiscount(
              Math.max(
                0,
                Number(
                  e.target.value
                )
              )
            )
          }
        />

        {/* TOTALS */}

        <div className="sale-totals">

          <div>
            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {subtotal.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div>
            <span>
              Discount
            </span>

            <strong>
              ₹
              {safeDiscount.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div className="grand-total">

            <span>
              Total
            </span>

            <strong>
              ₹
              {total.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}
            </strong>

          </div>

        </div>

        <button
          className="save-sale"
          onClick={saveSale}
        >
          <svg viewBox="0 0 24 24">
            <path d="M5 3h11l3 3v15H5z" />
            <path d="M8 3v6h8V3M8 21v-7h8v7" />
          </svg>

          Save Sale & Generate Invoice
        </button>

        {message && (
          <div className="sale-message">
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="9"
              />
              <path d="M12 8v4M12 16h.01" />
            </svg>

            {message}
          </div>
        )}

      </section>

    </main>
  );
}
