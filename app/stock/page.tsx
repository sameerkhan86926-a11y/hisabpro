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

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedProducts = JSON.parse(
      localStorage.getItem("hisabpro_products") || "[]"
    );

    setProducts(savedProducts);
  }, []);

  function addProduct() {
    if (!name.trim()) {
      setMessage("Product name required.");
      return;
    }

    if (sellingPrice <= 0) {
      setMessage("Selling price enter karein.");
      return;
    }

    const product: Product = {
      id: Date.now(),
      name: name.trim(),
      category: category.trim() || "General",
      purchasePrice,
      sellingPrice,
      stock: Math.max(0, stock),
    };

    const updatedProducts = [...products, product];

    setProducts(updatedProducts);

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(updatedProducts)
    );

    setName("");
    setCategory("");
    setPurchasePrice(0);
    setSellingPrice(0);
    setStock(0);

    setMessage("Product added successfully ✅");
  }

  function deleteProduct(id: number) {
    const updatedProducts = products.filter(
      (product) => product.id !== id
    );

    setProducts(updatedProducts);

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(updatedProducts)
    );
  }

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  const lowStock = products.filter(
    (product) => product.stock <= 5
  ).length;

  return (
    <main className="stock-page">

      <header className="stock-header">
        <button
  onClick={() => window.history.back()}
  className="back-button"
>
  ← Back
</button>

        <h1>Stock</h1>

        <span></span>
      </header>

      <section className="stock-stats">

        <div>
          <span>Total Products</span>
          <strong>{totalProducts}</strong>
        </div>

        <div>
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
        </div>

        <div>
          <span>Low Stock</span>
          <strong>{lowStock}</strong>
        </div>

      </section>

      <section className="product-form">

        <h2>Add Product</h2>

        <label>Product Name</label>

        <input
          type="text"
          placeholder="Example: T-Shirt"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Category</label>

        <input
          type="text"
          placeholder="Example: Clothing"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <label>Purchase Price</label>

        <input
          type="number"
          min="0"
          value={purchasePrice}
          onChange={(e) =>
            setPurchasePrice(Math.max(0, Number(e.target.value)))
          }
        />

        <label>Selling Price</label>

        <input
          type="number"
          min="0"
          value={sellingPrice}
          onChange={(e) =>
            setSellingPrice(Math.max(0, Number(e.target.value)))
          }
        />

        <label>Stock Quantity</label>

        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) =>
            setStock(Math.max(0, Number(e.target.value)))
          }
        />

        <button onClick={addProduct}>
          + Add Product
        </button>

        {message && (
          <p className="stock-message">{message}</p>
        )}

      </section>

      <section className="product-list">

        <h2>Products</h2>

        {products.length === 0 ? (
          <div className="empty-products">
            <div>📦</div>

            <h3>No Products Yet</h3>

            <p>Add your first product above.</p>
          </div>
        ) : (
          products.map((product) => (
            <div className="product-item" key={product.id}>

              <div className="product-icon">
                📦
              </div>

              <div className="product-info">

                <strong>{product.name}</strong>

                <span>{product.category}</span>

                <small>
                  Buy ₹{product.purchasePrice.toLocaleString("en-IN")}
                  {" • "}
                  Sell ₹{product.sellingPrice.toLocaleString("en-IN")}
                </small>

              </div>

              <div className="product-stock">

                <strong>{product.stock}</strong>

                <span>
                  {product.stock <= 5
                    ? "Low Stock"
                    : "In Stock"}
                </span>

                <button
                  onClick={() => deleteProduct(product.id)}
                >
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </section>

    </main>
  );
}
