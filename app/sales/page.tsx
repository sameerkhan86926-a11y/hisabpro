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

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

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

type CustomerTransaction = {
  id: number;
  customerId: number;
  type: "credit" | "payment";
  amount: number;
  note: string;
  date: string;
  saleId?: number;
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

  const [paymentMode, setPaymentMode] =
    useState<PaymentMode>("cash");

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
      if (remaining <= 0) {
        break;
      }

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
      quantity > 0
        ? totalAmount / quantity
        : 0;

    const averagePurchasePrice =
      quantity > 0
        ? totalPurchaseCost / quantity
        : 0;

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
          (
            existing.purchasePrice *
              existing.quantity +
            averagePurchasePrice *
              quantity
          ) /
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

  function selectPaymentType(
    type: PaymentType
  ) {
    setPaymentType(type);

    if (type === "credit") {
      setPaymentMode("cash");
    }
  }

  function selectPaymentMode(
    mode: PaymentMode
  ) {
    setPaymentType("cash");
    setPaymentMode(mode);
    setCustomerId("");
  }

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

    if (total <= 0) {
      setMessage(
        "Sale total ₹0 se greater hona chahiye."
      );
      return;
    }

    const saleId = Date.now();
    const saleDate =
      new Date().toISOString();

    const sale = {
      id: saleId,
      items: cart,
      subtotal,
      discount: safeDiscount,
      total,

      paymentType,

      paymentMode:
        paymentType === "credit"
          ? undefined
          : paymentMode,

      customerId:
        paymentType === "credit"
          ? selectedCustomer?.id
          : null,

      customerName:
        paymentType === "credit"
          ? selectedCustomer?.name
          : "",

      date: saleDate,
    };

    /*
     * =====================================
     * 1. SAVE SALE
     * =====================================
     */

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

    /*
     * =====================================
     * 2. REDUCE STOCK FIFO BATCH-WISE
     * =====================================
     */

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

    /*
     * =====================================
     * 3. CREDIT SALE → KHATA
     * =====================================
     */

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

      const oldTransactions:
        CustomerTransaction[] =
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
            id: Date.now() + 1,

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

            date: saleDate,

            saleId: saleId,
          },
        ])
      );
    }

    /*
     * =====================================
     * 4. ONLY CASH SALE → CASHBOOK
     * =====================================
     */

    if (
      paymentType === "cash" &&
      paymentMode === "cash"
    ) {
      const oldCashbook:
        CashTransaction[] =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_cashbook"
          ) || "[]"
        );

      localStorage.setItem(
        "hisabpro_cashbook",
        JSON.stringify([
          ...oldCashbook,
          {
            id: Date.now() + 2,

            type: "in",

            amount: total,

            category: "Sale",

            note:
              `Cash Sale - ${cart
                .map(
                  (item) =>
                    `${item.product} (${item.quantity})`
                )
                .join(", ")}`,

            date: saleDate,

            referenceType: "sale",

            referenceId: saleId,
          },
        ])
      );
    }

    /*
     * =====================================
     * 5. SAVE LAST INVOICE
     * =====================================
     */

    localStorage.setItem(
      "hisabpro_last_invoice",
      JSON.stringify(sale)
    );

    /*
     * =====================================
     * 6. RESET
     * =====================================
     */

    setCart([]);
    setCustomerId("");
    setDiscount(0);
    setPaymentType("cash");
    setPaymentMode("cash");

    window.location.href =
      "/hisabpro/invoice/";
  }

  return (
    <main className="sales-page">

      <header className="sales-header">

        <button
  onClick={() => {
    window.location.href = "/hisabpro/";
  }}
  className="back-button"
>
  ← Back
</button>

        <h1>New Sale</h1>

        <span></span>

      </header>

      <section className="sale-form">

        <div className="sale-section-heading">

          <div className="sale-heading-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16" />
              <path d="M6 7V5h12v2" />
              <path d="M5 7l1 13h12l1-13" />
              <path d="M9 11v5" />
              <path d="M15 11v5" />
            </svg>

          </div>

          <div>
            <h2>Add Product</h2>

            <p>
              Select product and quantity
            </p>
          </div>

        </div>

        <div className="product-input-row">

          <div className="sale-field">

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
                    {product.name}
                    {" — Stock: "}
                    {getAvailableQuantity(
                      product
                    )}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="sale-field">

            <label>
              Quantity
            </label>

            <input
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

          </div>

        </div>

        {productId && (
          <div className="selected-product-info">

            {(() => {

              const product =
                products.find(
                  (item) =>
                    item.id ===
                    Number(productId)
                );

              if (!product) {
                return null;
              }

              const batches =
                getProductBatches(
                  product
                );

              return (
                <>

                  <div className="selected-product-header">

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
                          className="batch-price-row"
                          key={batch.id}
                        >

                          <span>
                            {batch.quantity} pcs
                          </span>

                          <span>
                            Buy ₹
                            {Number(
                              batch.purchasePrice
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          <span>
                            Sell ₹
                            {Number(
                              batch.sellingPrice
                            ).toLocaleString(
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

        <button
          className="add-to-bill"
          onClick={addToBill}
        >

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          Add to Bill

        </button>

      </section>

      <section className="bill-section">

        <div className="bill-section-header">

          <div>

            <h2>
              Bill
            </h2>

            <p>
              {cart.length} item
              {cart.length !== 1
                ? "s"
                : ""} added
            </p>

          </div>

          <div className="bill-count">
            {cart.length}
          </div>

        </div>

        {cart.length === 0 ? (

          <div className="empty-bill">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1V3z" />
              <path d="M9 7h6" />
              <path d="M9 11h6" />
              <path d="M9 15h4" />
            </svg>

            <strong>
              No products added yet
            </strong>

            <p>
              Add products above to create the bill.
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

                  <div className="bill-item-info">

                    <strong>
                      {item.product}
                    </strong>

                    <span>
                      Qty {item.quantity}
                      {" × "}
                      ₹
                      {item.price.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>

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
                      onClick={() =>
                        removeFromBill(
                          item.productId
                        )
                      }
                      aria-label="Remove"
                    >

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 15H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>

                    </button>

                  </div>

                </div>
              )
            )}

          </div>

        )}

      </section>

      <section className="sale-summary">

        <div className="summary-heading">

          <h2>
            Payment & Summary
          </h2>

        </div>

        <label>
          Payment Type
        </label>

        <div className="payment-buttons">

          {/* CASH */}

          <button
            className={
              paymentType === "cash" &&
              paymentMode === "cash"
                ? "active"
                : ""
            }
            onClick={() =>
              selectPaymentMode("cash")
            }
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

              <path d="M3 9h2" />
              <path d="M19 9h2" />
              <path d="M3 15h2" />
              <path d="M19 15h2" />
            </svg>

            Cash

          </button>

          {/* UPI */}

          <button
            className={
              paymentType === "cash" &&
              paymentMode === "upi"
                ? "active"
                : ""
            }
            onClick={() =>
              selectPaymentMode("upi")
            }
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="6"
                y="2"
                width="12"
                height="20"
                rx="2"
              />

              <path d="M10 18h4" />

              <path d="M9 7h6" />
              <path d="M9 11h3" />
            </svg>

            UPI

          </button>

          {/* CARD */}

          <button
            className={
              paymentType === "cash" &&
              paymentMode === "card"
                ? "active"
                : ""
            }
            onClick={() =>
              selectPaymentMode("card")
            }
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="2.5"
                y="5"
                width="19"
                height="14"
                rx="2"
              />

              <path d="M2.5 10h19" />

              <path d="M6 15h4" />
            </svg>

            Card

          </button>

          {/* BANK */}

          <button
            className={
              paymentType === "cash" &&
              paymentMode === "bank"
                ? "active"
                : ""
            }
            onClick={() =>
              selectPaymentMode("bank")
            }
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9h18" />

              <path d="M4 9l8-5 8 5" />

              <path d="M5 9v9" />
              <path d="M9 9v9" />
              <path d="M15 9v9" />
              <path d="M19 9v9" />

              <path d="M3 18h18" />
              <path d="M2 21h20" />
            </svg>

            Bank

          </button>

          {/* ONLINE */}

          <button
            className={
              paymentType === "cash" &&
              paymentMode === "online"
                ? "active"
                : ""
            }
            onClick={() =>
              selectPaymentMode("online")
            }
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="M3 12h18" />

              <path d="M12 3c3 3 4 6 4 9s-1 6-4 9" />
              <path d="M12 3c-3 3-4 6-4 9s1 6 4 9" />
            </svg>

            Online

          </button>

          {/* CREDIT */}

          <button
            className={
              paymentType === "credit"
                ? "active"
                : ""
            }
            onClick={() =>
              selectPaymentType("credit")
            }
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h16v14H4z" />

              <path d="M8 9h8" />
              <path d="M8 13h5" />
              <path d="M8 17h3" />
            </svg>

            Credit

          </button>

        </div>

        {paymentType === "credit" && (
          <div className="customer-field">

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

        <div className="discount-field">

          <label>
            Discount
          </label>

          <div className="discount-input">

            <span>
              ₹
            </span>

            <input
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

          </div>

        </div>

        <div className="sale-totals">

          <div className="total-row">

            <span>
              Subtotal:
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

          <div className="total-row">

            <span>
              Discount:
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

          <div className="total-row grand-total">

            <span>
              Total:
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

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 3h11l3 3v15H5z" />
            <path d="M8 3v6h8V3" />
            <path d="M8 15h8v6H8z" />
          </svg>

          Save Sale & Generate Invoice

        </button>

        {message && (
          <p className="sale-message">
            {message}
          </p>
        )}

      </section>

    </main>
  );
}
