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

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedProducts = JSON.parse(
      localStorage.getItem("hisabpro_products") || "[]"
    );

    setProducts(savedProducts);
  }, []);

  const selectedProduct = products.find(
    (product) => product.id === Number(productId)
  );

  const subtotal = selectedProduct
    ? selectedProduct.sellingPrice * quantity
    : 0;

  const total = Math.max(subtotal - discount, 0);

  function saveSale() {
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

    const sale = {
      id: Date.now(),
      productId: selectedProduct.id,
      product: selectedProduct.name,
      price: selectedProduct.sellingPrice,
      purchasePrice: selectedProduct.purchasePrice,
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

    setMessage("Sale saved & stock updated successfully ✅");

    setProductId("");
    setQuantity(1);
    setDiscount(0);
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

            <strong>{quantity}</strong>
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
