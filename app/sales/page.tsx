"use client";

import { useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "T-Shirt", price: 499 },
  { id: 2, name: "Jeans", price: 999 },
  { id: 3, name: "Shirt", price: 699 },
  { id: 4, name: "Kurti", price: 799 },
];

export default function SalesPage() {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");

  const selectedProduct = products.find(
    (product) => product.id === Number(productId)
  );

  const subtotal = selectedProduct
    ? selectedProduct.price * quantity
    : 0;

  const total = Math.max(subtotal - discount, 0);

  function saveSale() {
    if (!selectedProduct) {
      setMessage("Please select a product.");
      return;
    }

    const sale = {
      id: Date.now(),
      product: selectedProduct.name,
      price: selectedProduct.price,
      quantity,
      discount,
      total,
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

    setMessage("Sale saved successfully ✅");

    setProductId("");
    setQuantity(1);
    setDiscount(0);
  }

  return (
    <main className="sales-page">
      <header className="sales-header">
        <a href="/">← Dashboard</a>
        <h1>New Sale</h1>
        <span></span>
      </header>

      <section className="sale-box">
        <h2>Create New Sale</h2>

        <label>Product</label>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Select Product</option>

          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} — ₹{product.price}
            </option>
          ))}
        </select>

        <label>Quantity</label>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Number(e.target.value)))
          }
        />

        <label>Discount</label>

        <input
          type="number"
          min="0"
          value={discount}
          onChange={(e) =>
            setDiscount(Math.max(0, Number(e.target.value)))
          }
        />

        <div className="sale-summary">
          <div>
            <span>Subtotal</span>
            <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>₹{discount.toLocaleString("en-IN")}</strong>
          </div>

          <div className="sale-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <button className="save-sale" onClick={saveSale}>
          Save Sale
        </button>

        {message && (
          <p className="sale-message">{message}</p>
        )}
      </section>
    </main>
  );
}
