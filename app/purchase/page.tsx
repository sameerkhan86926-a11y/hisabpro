"use client";

import { useEffect, useMemo, useState } from "react";

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

type Supplier = {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  due: number;
  createdAt: string;
};

type PurchaseItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  amount: number;
};

type Purchase = {
  id: number;
  supplierId: number;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  paymentType: "cash" | "credit";
  date: string;
};

const PRODUCT_KEY = "hisabpro_products";
const SUPPLIER_KEY = "hisabpro_suppliers";
const PURCHASE_KEY = "hisabpro_purchases";

export default function PurchasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const [paymentType, setPaymentType] = useState<
    "cash" | "credit"
  >("cash");

  const [cart, setCart] = useState<PurchaseItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    try {
      const savedProducts = JSON.parse(
        localStorage.getItem(PRODUCT_KEY) || "[]"
      );

      const savedSuppliers = JSON.parse(
        localStorage.getItem(SUPPLIER_KEY) || "[]"
      );

      setProducts(
        Array.isArray(savedProducts)
          ? savedProducts
          : []
      );

      setSuppliers(
        Array.isArray(savedSuppliers)
          ? savedSuppliers
          : []
      );
    } catch {
      setProducts([]);
      setSuppliers([]);
    }
  }

  const selectedSupplier = suppliers.find(
    (supplier) =>
      String(supplier.id) === supplierId
  );

  const selectedProduct = products.find(
    (product) =>
      String(product.id) === productId
  );

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  }, [cart]);

  function handleProductChange(value: string) {
    setProductId(value);

    const product = products.find(
      (item) => String(item.id) === value
    );

    if (!product) {
      setPurchasePrice("");
      setSellingPrice("");
      return;
    }

    setPurchasePrice(
      String(product.purchasePrice || "")
    );

    setSellingPrice(
      String(product.sellingPrice || "")
    );
  }

  function addToPurchase() {
    if (!supplierId) {
      setMessage("Please select a supplier.");
      return;
    }

    if (!productId) {
      setMessage("Please select a product.");
      return;
    }

    const qty = Number(quantity);
    const buyPrice = Number(purchasePrice);
    const sellPrice = Number(sellingPrice);

    if (qty <= 0) {
      setMessage("Enter a valid quantity.");
      return;
    }

    if (buyPrice < 0) {
      setMessage("Enter a valid purchase price.");
      return;
    }

    if (sellPrice < 0) {
      setMessage("Enter a valid selling price.");
      return;
    }

    const product = products.find(
      (item) => item.id === Number(productId)
    );

    if (!product) {
      setMessage("Product not found.");
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id
    );

    if (existingIndex !== -1) {
      const updated = [...cart];

      const newQuantity =
        updated[existingIndex].quantity + qty;

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQuantity,
        purchasePrice: buyPrice,
        sellingPrice: sellPrice,
        amount: newQuantity * buyPrice,
      };

      setCart(updated);
    } else {
      const item: PurchaseItem = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        quantity: qty,
        purchasePrice: buyPrice,
        sellingPrice: sellPrice,
        amount: qty * buyPrice,
      };

      setCart([...cart, item]);
    }

    setProductId("");
    setQuantity("");
    setPurchasePrice("");
    setSellingPrice("");
    setMessage("");
  }

  function removeItem(id: number) {
    setCart(
      cart.filter((item) => item.id !== id)
    );
  }

  function savePurchase() {
    if (!supplierId) {
      setMessage("Please select a supplier.");
      return;
    }

    if (cart.length === 0) {
      setMessage("Add at least one product.");
      return;
    }

    const supplier = suppliers.find(
      (item) => item.id === Number(supplierId)
    );

    if (!supplier) {
      setMessage("Supplier not found.");
      return;
    }

    try {
      const savedProducts: Product[] = JSON.parse(
        localStorage.getItem(PRODUCT_KEY) || "[]"
      );

      const savedSuppliers: Supplier[] = JSON.parse(
        localStorage.getItem(SUPPLIER_KEY) || "[]"
      );

      const savedPurchases: Purchase[] = JSON.parse(
        localStorage.getItem(PURCHASE_KEY) || "[]"
      );

      const purchaseId = Date.now();
      const purchaseDate =
        new Date().toISOString();

      /*
       * --------------------------------
       * UPDATE STOCK + ADD BATCHES
       * --------------------------------
       */

      const updatedProducts =
        savedProducts.map((product) => {
          const purchaseItems = cart.filter(
            (item) =>
              item.productId === product.id
          );

          if (purchaseItems.length === 0) {
            return product;
          }

          const item = purchaseItems[0];

          const newBatch: StockBatch = {
            id: Date.now() + product.id,
            quantity: item.quantity,
            purchasePrice:
              item.purchasePrice,
            sellingPrice:
              item.sellingPrice,
            date: purchaseDate,
          };

          const oldBatches =
            Array.isArray(product.batches)
              ? product.batches
              : [];

          return {
            ...product,

            stock:
              Number(product.stock || 0) +
              item.quantity,

            purchasePrice:
              item.purchasePrice,

            sellingPrice:
              item.sellingPrice,

            batches: [
              ...oldBatches,
              newBatch,
            ],
          };
        });

      /*
       * --------------------------------
       * CREATE PURCHASE
       * --------------------------------
       */

      const purchase: Purchase = {
        id: purchaseId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        items: cart,
        total: cartTotal,
        paymentType,
        date: purchaseDate,
      };

      const updatedPurchases = [
        ...savedPurchases,
        purchase,
      ];

      /*
       * --------------------------------
       * UPDATE SUPPLIER PAYABLE
       * --------------------------------
       */

      const updatedSuppliers =
        savedSuppliers.map((item) => {
          if (item.id !== supplier.id) {
            return item;
          }

          return {
            ...item,
            due:
              Number(item.due || 0) +
              (paymentType === "credit"
                ? cartTotal
                : 0),
          };
        });

      /*
       * --------------------------------
       * SAVE EVERYTHING
       * --------------------------------
       */

      localStorage.setItem(
        PRODUCT_KEY,
        JSON.stringify(updatedProducts)
      );

      localStorage.setItem(
        SUPPLIER_KEY,
        JSON.stringify(updatedSuppliers)
      );

      localStorage.setItem(
        PURCHASE_KEY,
        JSON.stringify(updatedPurchases)
      );

      setProducts(updatedProducts);
      setSuppliers(updatedSuppliers);

      setCart([]);
      setSupplierId("");
      setProductId("");
      setQuantity("");
      setPurchasePrice("");
      setSellingPrice("");
      setPaymentType("cash");

      setMessage(
        `Purchase saved successfully. Total ₹${cartTotal.toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
          }
        )}`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Purchase save error:",
        error
      );

      setMessage(
        "Something went wrong while saving purchase."
      );
    }
  }

  return (
    <main className="purchase-page">

      {/* HEADER */}
      <header className="purchase-header">

        <button
          type="button"
          className="purchase-back"
          onClick={() => window.history.back()}
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <h1>New Purchase</h1>
          <p>Add stock from supplier</p>
        </div>

      </header>

      {/* PURCHASE FORM */}
      <section className="purchase-form-card">

        {/* SUPPLIER */}
        <div className="purchase-field">

          <label>Supplier</label>

          <select
            value={supplierId}
            onChange={(e) =>
              setSupplierId(e.target.value)
            }
          >
            <option value="">
              Select supplier
            </option>

            {suppliers.map((supplier) => (
              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>
            ))}
          </select>

          {suppliers.length === 0 && (
            <small className="purchase-help">
              No suppliers found. Add a supplier
              first.
            </small>
          )}

          {selectedSupplier && (
            <small className="purchase-selected-info">
              {selectedSupplier.phone || "No mobile"}
            </small>
          )}

        </div>

        {/* PRODUCT */}
        <div className="purchase-field">

          <label>Product</label>

          <select
            value={productId}
            onChange={(e) =>
              handleProductChange(e.target.value)
            }
          >
            <option value="">
              Select product
            </option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>
            ))}
          </select>

          {products.length === 0 && (
            <small className="purchase-help">
              No products found. Add a product in
              Stock first.
            </small>
          )}

          {selectedProduct && (
            <small className="purchase-selected-info">
              Current stock:{" "}
              {Number(selectedProduct.stock || 0)}
            </small>
          )}

        </div>

        {/* QUANTITY */}
        <div className="purchase-field">

          <label>Quantity</label>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            placeholder="Enter quantity"
          />

        </div>

        {/* PURCHASE PRICE */}
        <div className="purchase-field">

          <label>Purchase Price</label>

          <div className="purchase-money-input">

            <span>₹</span>

            <input
              type="number"
              min="0"
              value={purchasePrice}
              onChange={(e) =>
                setPurchasePrice(e.target.value)
              }
              placeholder="0"
            />

          </div>

        </div>

        {/* SELLING PRICE */}
        <div className="purchase-field">

          <label>Selling Price</label>

          <div className="purchase-money-input">

            <span>₹</span>

            <input
              type="number"
              min="0"
              value={sellingPrice}
              onChange={(e) =>
                setSellingPrice(e.target.value)
              }
              placeholder="0"
            />

          </div>

        </div>

        <button
          type="button"
          className="purchase-add-button"
          onClick={addToPurchase}
        >
          + Add to Purchase
        </button>

      </section>

      {/* CART */}
      {cart.length > 0 && (
        <section className="purchase-cart">

          <div className="purchase-section-title">
            <h2>Purchase Items</h2>
            <span>{cart.length}</span>
          </div>

          <div className="purchase-items">

            {cart.map((item) => (
              <div
                key={item.id}
                className="purchase-item"
              >

                <div className="purchase-item-info">

                  <strong>
                    {item.productName}
                  </strong>

                  <small>
                    {item.quantity} × ₹
                    {item.purchasePrice.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </small>

                  <span>
                    Sell ₹
                    {item.sellingPrice.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>

                </div>

                <div className="purchase-item-right">

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
                    type="button"
                    onClick={() =>
                      removeItem(item.id)
                    }
                    aria-label="Remove item"
                  >
                    ×
                  </button>

                </div>

              </div>
            ))}

          </div>

          {/* TOTAL */}
          <div className="purchase-total">

            <span>Total Purchase</span>

            <strong>
              ₹
              {cartTotal.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}
            </strong>

          </div>

          {/* PAYMENT */}
          <div className="purchase-payment">

            <label>Payment Type</label>

            <div className="purchase-payment-options">

              <button
                type="button"
                className={
                  paymentType === "cash"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPaymentType("cash")
                }
              >
                Cash
              </button>

              <button
                type="button"
                className={
                  paymentType === "credit"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPaymentType("credit")
                }
              >
                Credit
              </button>

            </div>

            {paymentType === "credit" &&
              selectedSupplier && (
                <small>
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )}{" "}
                  will be added to supplier payable.
                </small>
              )}

          </div>

          <button
            type="button"
            className="purchase-save-button"
            onClick={savePurchase}
          >
            Save Purchase
          </button>

        </section>
      )}

      {/* MESSAGE */}
      {message && (
        <div className="purchase-message">
          {message}
        </div>
      )}

    </main>
  );
}
