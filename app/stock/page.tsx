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

  // Add Product form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stock, setStock] = useState(0);

  // Add stock
  const [stockProductId, setStockProductId] = useState<number | null>(null);
  const [addStockQuantity, setAddStockQuantity] = useState(0);
  const [addStockPurchasePrice, setAddStockPurchasePrice] = useState(0);

  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedProducts = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      setProducts(
        Array.isArray(savedProducts) ? savedProducts : []
      );
    } catch (error) {
      console.error("Stock loading error:", error);
      setProducts([]);
    }
  }, []);

  // -----------------------------
  // ADD NEW PRODUCT
  // -----------------------------

  function addProduct() {
    setMessage("");

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
      purchasePrice: Math.max(0, purchasePrice),
      sellingPrice: Math.max(0, sellingPrice),
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

  // -----------------------------
  // OPEN ADD STOCK
  // -----------------------------

  function openAddStock(product: Product) {
    setStockProductId(product.id);

    setAddStockQuantity(0);

    setAddStockPurchasePrice(
      Number(product.purchasePrice || 0)
    );

    setMessage("");
  }

  // -----------------------------
  // ADD STOCK TO EXISTING PRODUCT
  // -----------------------------

  function addStockToProduct() {
    setMessage("");

    if (stockProductId === null) {
      return;
    }

    if (addStockQuantity <= 0) {
      setMessage("Stock quantity enter karein.");
      return;
    }

    if (addStockPurchasePrice <= 0) {
      setMessage("Purchase price enter karein.");
      return;
    }

    const updatedProducts = products.map((product) => {
      if (product.id !== stockProductId) {
        return product;
      }

      return {
        ...product,

        // Existing stock + new stock
        stock:
          Number(product.stock || 0) +
          Number(addStockQuantity),

        // Latest purchase price
        purchasePrice: Number(addStockPurchasePrice),
      };
    });

    setProducts(updatedProducts);

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(updatedProducts)
    );

    setStockProductId(null);
    setAddStockQuantity(0);
    setAddStockPurchasePrice(0);

    setMessage("Stock added successfully ✅");
  }

  // -----------------------------
  // DELETE PRODUCT
  // -----------------------------

  function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Kya aap is product ko delete karna chahte hain?"
    );

    if (!confirmed) {
      return;
    }

    const updatedProducts = products.filter(
      (product) => product.id !== id
    );

    setProducts(updatedProducts);

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(updatedProducts)
    );

    if (stockProductId === id) {
      setStockProductId(null);
    }

    setMessage("Product deleted.");
  }

  // -----------------------------
  // STATS
  // -----------------------------

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.stock || 0),
    0
  );

  const lowStock = products.filter(
    (product) => Number(product.stock || 0) <= 5
  ).length;

  return (
    <main className="stock-page">

      {/* HEADER */}

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

      {/* STATS */}

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

      {/* ADD PRODUCT */}

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
            setPurchasePrice(
              Math.max(0, Number(e.target.value))
            )
          }
        />

        <label>Selling Price</label>

        <input
          type="number"
          min="0"
          value={sellingPrice}
          onChange={(e) =>
            setSellingPrice(
              Math.max(0, Number(e.target.value))
            )
          }
        />

        <label>Opening Stock</label>

        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) =>
            setStock(
              Math.max(0, Number(e.target.value))
            )
          }
        />

        <button onClick={addProduct}>
          + Add Product
        </button>

        {message && (
          <p className="stock-message">
            {message}
          </p>
        )}

      </section>

      {/* PRODUCT LIST */}

      <section className="product-list">

        <h2>Products</h2>

        {products.length === 0 ? (

          <div className="empty-products">

            <div>📦</div>

            <h3>No Products Yet</h3>

            <p>
              Add your first product above.
            </p>

          </div>

        ) : (

          products.map((product) => (

            <div
              className="product-item"
              key={product.id}
            >

              <div className="product-icon">
                📦
              </div>

              <div className="product-info">

                <strong>
                  {product.name}
                </strong>

                <span>
                  {product.category}
                </span>

                <small>
                  Buy ₹
                  {Number(
                    product.purchasePrice || 0
                  ).toLocaleString("en-IN")}

                  {" • "}

                  Sell ₹
                  {Number(
                    product.sellingPrice || 0
                  ).toLocaleString("en-IN")}
                </small>

              </div>

              <div className="product-stock">

                <strong>
                  {product.stock}
                </strong>

                <span>
                  {product.stock <= 0
                    ? "Out of Stock"
                    : product.stock <= 5
                    ? "Low Stock"
                    : "In Stock"}
                </span>

                <button
                  className="add-stock-button"
                  onClick={() =>
                    openAddStock(product)
                  }
                >
                  + Stock
                </button>

                <button
                  onClick={() =>
                    deleteProduct(product.id)
                  }
                >
                  Delete
                </button>

              </div>

              {/* ADD STOCK PANEL */}

              {stockProductId === product.id && (

                <div className="add-stock-panel">

                  <h3>
                    Add Stock
                  </h3>

                  <p>
                    {product.name}
                  </p>

                  <label>
                    Current Stock
                  </label>

                  <input
                    type="number"
                    value={product.stock}
                    disabled
                  />

                  <label>
                    Quantity to Add
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Example: 20"
                    value={
                      addStockQuantity || ""
                    }
                    onChange={(e) =>
                      setAddStockQuantity(
                        Math.max(
                          0,
                          Number(e.target.value)
                        )
                      )
                    }
                  />

                  <label>
                    Purchase Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      addStockPurchasePrice
                    }
                    onChange={(e) =>
                      setAddStockPurchasePrice(
                        Math.max(
                          0,
                          Number(e.target.value)
                        )
                      )
                    }
                  />

                  <div className="add-stock-actions">

                    <button
                      onClick={
                        addStockToProduct
                      }
                    >
                      Add Stock
                    </button>

                    <button
                      onClick={() =>
                        setStockProductId(null)
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              )}

            </div>

          ))

        )}

      </section>

    </main>
  );
}
