"use client";

import { useEffect, useState } from "react";

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

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [productId, setProductId] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  const [paymentType, setPaymentType] =
    useState<PaymentType>("cash");

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

  const subtotal = selectedProduct
    ? selectedProduct.sellingPrice * quantity
    : 0;

  const total = Math.max(subtotal - discount, 0);

  function saveSale() {
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

    if (paymentType === "credit" && !selectedCustomer) {
      setMessage("Please select a customer for credit sale.");
      return;
    }

    const saleId = Date.now();

    const sale = {
      id: saleId,
      productId: selectedProduct.id,
      product: selectedProduct.name,
      price: selectedProduct.sellingPrice,
      purchasePrice: selectedProduct.purchasePrice,
      quantity,
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
      localStorage.getItem("hisabpro_sales") || "[]"
    );

    oldSales.push(sale);

    localStorage.setItem(
      "hisabpro_sales",
      JSON.stringify(oldSales)
    );

    // Reduce stock
    const updatedProducts = products.map((product) =>
      product.id === selectedProduct.id
        ? {
            ...product,
            stock: product.stock - quantity,
          }
        : product
    );

    setProducts(updatedProducts);

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(updatedProducts)
    );

    // Credit Sale → Add customer due
    if (paymentType === "credit" && selectedCustomer) {
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        due: selectedCustomer.due + total,
      };

      const updatedCustomers = customers.map(
        (customer) =>
          customer.id === selectedCustomer.id
            ? updatedCustomer
            : customer
      );

      setCustomers(updatedCustomers);

      localStorage.setItem(
        "hisabpro_customers",
        JSON.stringify(updatedCustomers)
      );

      // Add transaction to customer history
      const transaction: Transaction = {
        id: Date.now() + 1,
        customerId: selectedCustomer.id,
        type: "credit",
        amount: total,
        note: `Credit Sale - ${selectedProduct.name}`,
        date: new Date().toISOString(),
      };

      const oldTransactions = JSON.parse(
        localStorage.getItem("hisabpro_transactions") || "[]"
      );

      oldTransactions.push(transaction);

      localStorage.setItem(
        "hisabpro_transactions",
        JSON.stringify(oldTransactions)
      );
    }

    setMessage(
      paymentType === "credit"
        ? "Credit sale saved & customer due updated successfully ✅"
        : "Sale saved & stock updated successfully ✅"
    );

    setProductId("");
    setCustomerId("");
    setQuantity(1);
    setDiscount(0);
    setPaymentType("cash");
  }

  return (
    <main className="sales-page">

      <header className="sales-header">

        <a href="/hisabpro/">
          ← Dashboard
        </a>

        <h1>New Sale</h1>

        <a href="/hisabpro/sales/history/">
          History
        </a>

      </header>

      <section className="sale-box">

        <h2>Create New Sale</h2>

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
              {product.sellingPrice.toLocaleString("en-IN")}
              {" | Stock: "}
              {product.stock}
            </option>

          ))}

        </select>

        {selectedProduct && (
          <p className="stock-available">
            Available Stock: {selectedProduct.stock}
          </p>
        )}

        <label>Quantity</label>

        <input
          type="number"
          min="1"
          max={selectedProduct?.stock || undefined}
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.max(1, Number(e.target.value))
            )
          }
        />

        <label>Discount</label>

        <input
          type="number"
          min="0"
          value={discount}
          onChange={(e) =>
            setDiscount(
              Math.max(0, Number(e.target.value))
            )
          }
        />

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

        {paymentType === "credit" && (
          <>
            <label>Customer</label>

            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
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
                  {customer.due.toLocaleString("en-IN")}
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

        <div className="sale-summary">

          <div>
            <span>Price</span>

            <strong>
              ₹
              {selectedProduct
                ? selectedProduct.sellingPrice.toLocaleString(
                    "en-IN"
                  )
                : "0"}
            </strong>
          </div>

          <div>
            <span>Quantity</span>

            <strong>
              {quantity}
            </strong>
          </div>

          <div>
            <span>Subtotal</span>

            <strong>
              ₹{subtotal.toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Discount</span>

            <strong>
              ₹{discount.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="sale-total">

            <span>Total</span>

            <strong>
              ₹{total.toLocaleString("en-IN")}
            </strong>

          </div>

        </div>

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
