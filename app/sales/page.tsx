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

    // Old product compatibility
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

    return (
      Number(product.stock || 0) -
      alreadyInCart
    );
  }

  // --------------------------------
  // ADD PRODUCT TO BILL
  // --------------------------------

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

    /*
      Selling price:
      FIFO me agar multiple batches hain,
      to har batch ka selling rate alag ho sakta hai.

      Isliye ek hi cart line me different
      selling rates possible hain.

      Display ke liye weighted average selling
      price calculate kar rahe hain.
    */

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

  // --------------------------------
  // REMOVE CART ITEM
  // --------------------------------

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

  // --------------------------------
  // CALCULATIONS
  // --------------------------------

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

  // --------------------------------
  // SAVE SALE
  // --------------------------------

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

    /*
      Sale ke andar batch details bhi save
      kar rahe hain.
    */

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

    // --------------------------------
    // SAVE SALE HISTORY
    // --------------------------------

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

    // --------------------------------
    // UPDATE STOCK BATCHES
    // --------------------------------

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

        /*
          FIFO deduction:
          oldest batch first
        */

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

        /*
          Product display rate ko
          latest remaining batch ka rate
          rakhenge.
        */

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

    // --------------------------------
    // CREDIT CUSTOMER
    // --------------------------------

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

    // --------------------------------
    // SAVE LAST INVOICE
    // --------------------------------

    localStorage.setItem(
      "hisabpro_last_invoice",
      JSON.stringify(sale)
    );

    // --------------------------------
    // RESET
    // --------------------------------

    setCart([]);
    setCustomerId("");
    setDiscount(0);
    setPaymentType("cash");

    setMessage(
      "Sale saved successfully ✅"
    );

    /*
      Invoice page par jao.
    */

    window.location.href =
      "/hisabpro/invoice/";
  }

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
          ← Back
        </button>

        <h1>New Sale</h1>

        <span></span>

      </header>

      {/* SALE FORM */}

      <section className="sale-form">

        <h2>Add Product</h2>

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
                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    Available:{" "}
                    {
                      getAvailableQuantity(
                        product
                      )
                    }
                  </span>

                  {batches.map(
                    (batch) => (
                      <small
                        key={batch.id}
                      >
                        {batch.quantity} pcs
                        {" • "}
                        Buy ₹
                        {batch.purchasePrice.toLocaleString(
                          "en-IN"
                        )}
                        {" • "}
                        Sell ₹
                        {batch.sellingPrice.toLocaleString(
                          "en-IN"
                        )}
                      </small>
                    )
                  )}
                </>
              );
            })()}

          </div>
        )}

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

        <button
          className="add-to-bill"
          onClick={addToBill}
        >
          + Add to Bill
        </button>

      </section>

      {/* BILL */}

      <section className="bill-section">

        <div className="section-title">
          <h2>
            Bill
          </h2>

          <span>
            {cart.length} item
            {cart.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {cart.length === 0 ? (

          <div className="empty-bill">
            <div>🧾</div>

            <p>
              No products added yet.
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

                  <div>
                    <strong>
                      {item.product}
                    </strong>

                    <small>
                      Qty:{" "}
                      {item.quantity}
                    </small>

                    <small>
                      Avg. Sell ₹
                      {item.price.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </small>
                  </div>

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
                  >
                    Remove
                  </button>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* CUSTOMER */}

      <section className="sale-summary">

        <label>
          Payment Type
        </label>

        <div className="payment-buttons">

          <button
            className={
              paymentType === "cash"
                ? "active"
                : ""
            }
            onClick={() =>
              setPaymentType(
                "cash"
              )
            }
          >
            💵 Cash
          </button>

          <button
            className={
              paymentType === "credit"
                ? "active"
                : ""
            }
            onClick={() =>
              setPaymentType(
                "credit"
              )
            }
          >
            📒 Credit
          </button>

        </div>

        {paymentType ===
          "credit" && (

          <>
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
          </>
        )}

        <label>
          Discount
        </label>

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
