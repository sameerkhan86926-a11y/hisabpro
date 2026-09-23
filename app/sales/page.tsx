"use client";

import { useEffect, useMemo, useState } from "react";

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

type PaymentType = "cash" | "credit";

type CartItem = {
  productId: number;
  product: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  amount: number;
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
    const savedProducts = JSON.parse(
      localStorage.getItem("hisabpro_products") || "[]"
    );

    const savedCustomers = JSON.parse(
      localStorage.getItem("hisabpro_customers") || "[]"
    );

    setProducts(savedProducts);
    setCustomers(savedCustomers);
  }, []);

  const selectedProduct = products.find(
    (product) => product.id === Number(productId)
  );

  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(customerId)
  );

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.amount,
      0
    );
  }, [cart]);

  const totalQuantity = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }, [cart]);

  const total = Math.max(
    subtotal - discount,
    0
  );

  function addToBill() {
    setMessage("");

    if (!selectedProduct) {
      setMessage("Please select a product.");
      return;
    }

    if (selectedProduct.stock <= 0) {
      setMessage("This product is out of stock.");
      return;
    }

    if (quantity > selectedProduct.stock) {
      setMessage(
        `Only ${selectedProduct.stock} items available in stock.`
      );
      return;
    }

    const existingItem = cart.find(
      (item) =>
        item.productId === selectedProduct.id
    );

    const existingQuantity =
      existingItem?.quantity || 0;

    if (
      existingQuantity + quantity >
      selectedProduct.stock
    ) {
      setMessage(
        `Only ${selectedProduct.stock} items available in stock.`
      );
      return;
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === selectedProduct.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
                amount:
                  (item.quantity + quantity) *
                  item.price,
              }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        productId: selectedProduct.id,
        product: selectedProduct.name,
        price: selectedProduct.sellingPrice,
        purchasePrice:
          selectedProduct.purchasePrice,
        quantity,
        amount:
          selectedProduct.sellingPrice *
          quantity,
      };

      setCart([...cart, newItem]);
    }

    setProductId("");
    setQuantity(1);
    setMessage("");
  }

  function removeFromBill(productId: number) {
    setCart(
      cart.filter(
        (item) => item.productId !== productId
      )
    );
  }

  function saveSale() {
    setMessage("");

    if (cart.length === 0) {
      setMessage(
        "Please add at least one product to the bill."
      );
      return;
    }

    if (
      paymentType === "credit" &&
      !selectedCustomer
    ) {
      setMessage(
        "Please select a customer for credit sale."
      );
      return;
    }

    // Final stock check
    for (const item of cart) {
      const product = products.find(
        (p) => p.id === item.productId
      );

      if (!product) {
        setMessage(
          `Product "${item.product}" not found.`
        );
        return;
      }

      if (item.quantity > product.stock) {
        setMessage(
          `Not enough stock for ${item.product}.`
        );
        return;
      }
    }

    const saleId = Date.now();

    const sale = {
      id: saleId,
      items: cart,
      subtotal,
      discount,
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
      date: new Date().toISOString(),
    };

    const oldSales = JSON.parse(
      localStorage.getItem(
        "hisabpro_sales"
      ) || "[]"
    );

    oldSales.push(sale);

    localStorage.setItem(
      "hisabpro_sales",
      JSON.stringify(oldSales)
    );

    // Save latest invoice
    localStorage.setItem(
      "hisabpro_last_invoice",
      JSON.stringify(sale)
    );

    // Reduce stock for every product
    const updatedProducts =
      products.map((product) => {
        const item = cart.find(
          (cartItem) =>
            cartItem.productId === product.id
        );

        if (!item) {
          return product;
        }

        return {
          ...product,
          stock:
            product.stock - item.quantity,
        };
      });

    setProducts(updatedProducts);

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(updatedProducts)
    );

    // Credit Sale
    if (
      paymentType === "credit" &&
      selectedCustomer
    ) {
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        due:
          selectedCustomer.due + total,
      };

      const updatedCustomers =
        customers.map((customer) =>
          customer.id === selectedCustomer.id
            ? updatedCustomer
            : customer
        );

      setCustomers(updatedCustomers);

      localStorage.setItem(
        "hisabpro_customers",
        JSON.stringify(updatedCustomers)
      );

      const transaction: Transaction = {
        id: Date.now() + 1,
        customerId: selectedCustomer.id,
        type: "credit",
        amount: total,
        note: `Credit Sale - ${cart
          .map((item) => item.product)
          .join(", ")}`,
        date: new Date().toISOString(),
      };

      const oldTransactions =
        JSON.parse(
          localStorage.getItem(
            "hisabpro_transactions"
          ) || "[]"
        );

      oldTransactions.push(transaction);

      localStorage.setItem(
        "hisabpro_transactions",
        JSON.stringify(oldTransactions)
      );
    }

    // Reset form
    setProductId("");
    setCustomerId("");
    setQuantity(1);
    setDiscount(0);
    setPaymentType("cash");
    setCart([]);

    // Open invoice
    window.location.href =
      "/hisabpro/invoice/";
  }

  return (
    <main className="sales-page">

      <header className="sales-header">

        <button
          onClick={() => window.history.back()}
          className="back-button"
        >
          ← Back
        </button>

        <h1>New Sale</h1>

        <a href="/hisabpro/sales/history/">
          History
        </a>

      </header>

      <section className="sale-box">

        <h2>Create New Sale</h2>

        {/* PRODUCT */}

        <label>Product</label>

        <select
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            setMessage("");
          }}
        >
          <option value="">
            Select Product
          </option>

          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
              disabled={product.stock <= 0}
            >
              {product.name} — ₹
              {product.sellingPrice.toLocaleString(
                "en-IN"
              )}
              {" | Stock: "}
              {product.stock}
            </option>
          ))}
        </select>

        {selectedProduct && (
          <p className="stock-available">
            Available Stock:{" "}
            {selectedProduct.stock}
          </p>
        )}

        {/* QUANTITY */}

        <label>Quantity</label>

        <input
          type="number"
          min="1"
          max={
            selectedProduct?.stock ||
            undefined
          }
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.max(
                1,
                Number(e.target.value)
              )
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addToBill();
            }
          }}
        />

        <button
          className="add-to-bill"
          onClick={addToBill}
        >
          + Add to Bill
        </button>

        {/* BILL ITEMS */}

        {cart.length > 0 && (
          <div className="bill-items">

            <h3>Bill Items</h3>

            {cart.map((item) => (
              <div
                className="bill-item"
                key={item.productId}
              >

                <div className="bill-item-info">

                  <strong>
                    {item.product}
                  </strong>

                  <span>
                    {item.quantity} × ₹
                    {item.price.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="bill-item-right">

                  <strong>
                    ₹
                    {item.amount.toLocaleString(
                      "en-IN"
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

              </div>
            ))}

          </div>
        )}

        {/* DISCOUNT */}

        <label>Discount</label>

        <input
          type="number"
          min="0"
          value={discount}
          onChange={(e) =>
            setDiscount(
              Math.max(
                0,
                Number(e.target.value)
              )
            )
          }
        />

        {/* PAYMENT */}

        <label>Payment Type</label>

        <select
          value={paymentType}
          onChange={(e) => {
            setPaymentType(
              e.target.value as PaymentType
            );
            setMessage("");
          }}
        >
          <option value="cash">
            Cash
          </option>

          <option value="credit">
            Credit / Udhaar
          </option>
        </select>

        {/* CUSTOMER */}

        {paymentType === "credit" && (
          <>
            <label>Customer</label>

            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(
                  e.target.value
                );
                setMessage("");
              }}
            >
              <option value="">
                Select Customer
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name} — Due ₹
                  {customer.due.toLocaleString(
                    "en-IN"
                  )}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <p className="customer-selected">
                Current Due: ₹
                {selectedCustomer.due.toLocaleString(
                  "en-IN"
                )}
              </p>
            )}
          </>
        )}

        {/* SUMMARY */}

        <div className="sale-summary">

          <div>
            <span>Items</span>
            <strong>
              {totalQuantity}
            </strong>
          </div>

          <div>
            <span>Subtotal</span>
            <strong>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>
              ₹
              {discount.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="sale-total">
            <span>Total</span>
            <strong>
              ₹
              {total.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>

        {/* SAVE */}

        <button
          className="save-sale"
          onClick={saveSale}
        >
          Save Sale
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
