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

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const [stockProductId, setStockProductId] = useState<number | null>(null);
  const [addQuantity, setAddQuantity] = useState(0);
  const [addPurchasePrice, setAddPurchasePrice] = useState(0);
  const [addSellingPrice, setAddSellingPrice] = useState(0);

  const [historyProductId, setHistoryProductId] = useState<number | null>(
    null
  );

  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editSellingPrice, setEditSellingPrice] = useState(0);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      if (!Array.isArray(saved)) {
        setProducts([]);
        return;
      }

      // Existing old products ko automatically batch format me convert
      const migrated: Product[] = saved.map((product: Product) => {
        if (product.batches && product.batches.length > 0) {
          return product;
        }

        return {
          ...product,
          batches:
            Number(product.stock || 0) > 0
              ? [
                  {
                    id: product.id,
                    quantity: Number(product.stock || 0),
                    purchasePrice: Number(product.purchasePrice || 0),
                    sellingPrice: Number(product.sellingPrice || 0),
                    date: new Date().toISOString(),
                  },
                ]
              : [],
        };
      });

      setProducts(migrated);

      localStorage.setItem(
        "hisabpro_products",
        JSON.stringify(migrated)
      );
    } catch (error) {
      console.error("Stock loading error:", error);
      setProducts([]);
    }
  }

  function saveProducts(updated: Product[]) {
    setProducts(updated);

    localStorage.setItem(
      "hisabpro_products",
      JSON.stringify(updated)
    );
  }

  // --------------------------------
  // ADD NEW PRODUCT
  // --------------------------------

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

    if (stock > 0 && purchasePrice <= 0) {
      setMessage("Purchase price enter karein.");
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      name: name.trim(),
      category: category.trim() || "General",
      purchasePrice,
      sellingPrice,
      stock: Math.max(0, stock),
      batches:
        stock > 0
          ? [
              {
                id: Date.now(),
                quantity: stock,
                purchasePrice,
                sellingPrice,
                date: new Date().toISOString(),
              },
            ]
          : [],
    };

    const updated = [...products, newProduct];

    saveProducts(updated);

    setName("");
    setCategory("");
    setPurchasePrice(0);
    setSellingPrice(0);
    setStock(0);

    setMessage("Product added successfully ✅");
  }

  // --------------------------------
  // OPEN ADD STOCK
  // --------------------------------

  function openAddStock(product: Product) {
    setStockProductId(product.id);

    setAddQuantity(0);

    setAddPurchasePrice(
      Number(product.purchasePrice || 0)
    );

    setAddSellingPrice(
      Number(product.sellingPrice || 0)
    );

    setEditProductId(null);
    setHistoryProductId(null);
    setMessage("");
  }

  // --------------------------------
  // ADD NEW STOCK BATCH
  // --------------------------------

  function addStock() {
    if (stockProductId === null) return;

    if (addQuantity <= 0) {
      setMessage("Quantity enter karein.");
      return;
    }

    if (addPurchasePrice <= 0) {
      setMessage("Purchase price enter karein.");
      return;
    }

    if (addSellingPrice <= 0) {
      setMessage("Selling price enter karein.");
      return;
    }

    const updated = products.map((product) => {
      if (product.id !== stockProductId) {
        return product;
      }

      const newBatch: StockBatch = {
        id: Date.now(),
        quantity: addQuantity,
        purchasePrice: addPurchasePrice,
        sellingPrice: addSellingPrice,
        date: new Date().toISOString(),
      };

      const existingBatches = product.batches || [];

      return {
        ...product,

        stock:
          Number(product.stock || 0) + addQuantity,

        // Latest rate for product display
        purchasePrice: addPurchasePrice,
        sellingPrice: addSellingPrice,

        batches: [
          ...existingBatches,
          newBatch,
        ],
      };
    });

    saveProducts(updated);

    setStockProductId(null);
    setAddQuantity(0);
    setAddPurchasePrice(0);
    setAddSellingPrice(0);

    setMessage("New stock batch added successfully ✅");
  }

  // --------------------------------
  // EDIT SELLING PRICE
  // --------------------------------

  function openEditPrice(product: Product) {
    setEditProductId(product.id);
    setEditSellingPrice(product.sellingPrice);

    setStockProductId(null);
    setHistoryProductId(null);
    setMessage("");
  }

  function saveSellingPrice(productId: number) {
    if (editSellingPrice <= 0) {
      setMessage("Selling price enter karein.");
      return;
    }

    const updated = products.map((product) => {
      if (product.id !== productId) {
        return product;
      }

      // Current/future display rate update.
      // Existing batches remain unchanged.
      return {
        ...product,
        sellingPrice: editSellingPrice,
      };
    });

    saveProducts(updated);

    setEditProductId(null);
    setEditSellingPrice(0);

    setMessage("Selling price updated ✅");
  }

  // --------------------------------
  // DELETE PRODUCT
  // --------------------------------

  function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Kya aap is product ko delete karna chahte hain?"
    );

    if (!confirmed) return;

    const updated = products.filter(
      (product) => product.id !== id
    );

    saveProducts(updated);

    setMessage("Product deleted.");
  }

  // --------------------------------
  // CALCULATIONS
  // --------------------------------

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.stock || 0),
    0
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.stock || 0) <= 5
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
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <label>Category</label>

        <input
          type="text"
          placeholder="Example: Clothing"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        />

        <label>Purchase Price</label>

        <input
          type="number"
          min="0"
          value={purchasePrice}
          onChange={(e) =>
            setPurchasePrice(
              Math.max(
                0,
                Number(e.target.value)
              )
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
              Math.max(
                0,
                Number(e.target.value)
              )
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
              Math.max(
                0,
                Number(e.target.value)
              )
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

          products.map((product) => {

            const batches =
              product.batches || [];

            return (
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
                    Latest Buy ₹
                    {Number(
                      product.purchasePrice || 0
                    ).toLocaleString("en-IN")}

                    {" • "}

                    Latest Sell ₹
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
                    className="edit-price-button"
                    onClick={() =>
                      openEditPrice(product)
                    }
                  >
                    Edit Sale
                  </button>

                  <button
                    className="history-button"
                    onClick={() => {
                      setHistoryProductId(
                        historyProductId === product.id
                          ? null
                          : product.id
                      );

                      setStockProductId(null);
                      setEditProductId(null);
                    }}
                  >
                    History
                  </button>

                  <button
                    onClick={() =>
                      deleteProduct(product.id)
                    }
                  >
                    Delete
                  </button>

                </div>

                {/* ADD STOCK */}

                {stockProductId === product.id && (

                  <div className="add-stock-panel">

                    <h3>
                      Add New Stock
                    </h3>

                    <p>
                      New purchase ko separate batch
                      ke roop me save kiya jayega.
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
                      New Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      placeholder="Example: 20"
                      value={
                        addQuantity || ""
                      }
                      onChange={(e) =>
                        setAddQuantity(
                          Math.max(
                            0,
                            Number(
                              e.target.value
                            )
                          )
                        )
                      }
                    />

                    <label>
                      New Purchase Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        addPurchasePrice
                      }
                      onChange={(e) =>
                        setAddPurchasePrice(
                          Math.max(
                            0,
                            Number(
                              e.target.value
                            )
                          )
                        )
                      }
                    />

                    <label>
                      New Selling Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        addSellingPrice
                      }
                      onChange={(e) =>
                        setAddSellingPrice(
                          Math.max(
                            0,
                            Number(
                              e.target.value
                            )
                          )
                        )
                      }
                    />

                    <div className="add-stock-actions">

                      <button
                        onClick={addStock}
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

                {/* EDIT SELLING PRICE */}

                {editProductId === product.id && (

                  <div className="add-stock-panel">

                    <h3>
                      Edit Selling Price
                    </h3>

                    <p>
                      Existing batches ke rates
                      change nahi honge.
                    </p>

                    <label>
                      New Selling Price
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        editSellingPrice
                      }
                      onChange={(e) =>
                        setEditSellingPrice(
                          Math.max(
                            0,
                            Number(
                              e.target.value
                            )
                          )
                        )
                      }
                    />

                    <div className="add-stock-actions">

                      <button
                        onClick={() =>
                          saveSellingPrice(
                            product.id
                          )
                        }
                      >
                        Save Price
                      </button>

                      <button
                        onClick={() =>
                          setEditProductId(null)
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                )}

                {/* BATCH HISTORY */}

                {historyProductId === product.id && (

                  <div className="batch-history">

                    <h3>
                      Stock Purchase History
                    </h3>

                    {batches.length === 0 ? (

                      <p>
                        No stock purchase history.
                      </p>

                    ) : (

                      [...batches]
                        .reverse()
                        .map((batch) => (

                          <div
                            className="batch-row"
                            key={batch.id}
                          >

                            <div>
                              <strong>
                                {batch.quantity} pcs
                              </strong>

                              <span>
                                {new Date(
                                  batch.date
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </span>
                            </div>

                            <div>
                              <span>
                                Buy
                              </span>

                              <strong>
                                ₹
                                {batch.purchasePrice.toLocaleString(
                                  "en-IN"
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Sell
                              </span>

                              <strong>
                                ₹
                                {batch.sellingPrice.toLocaleString(
                                  "en-IN"
                                )}
                              </strong>
                            </div>

                          </div>

                        ))

                    )}

                  </div>

                )}

              </div>
            );
          })

        )}

      </section>

    </main>
  );
}
