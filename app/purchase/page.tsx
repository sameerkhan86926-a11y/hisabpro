"use client";

import { useEffect, useMemo, useState } from "react";
import BarcodeScannerModal from "../../components/BarcodeScannerModal";

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
  barcode?: string;
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

type PaymentType = "cash" | "credit";

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

type Purchase = {
  id: number;
  supplierId: number;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  paymentType: PaymentType;
  paymentMode?: PaymentMode;
  date: string;
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

const PRODUCT_KEY = "hisabpro_products";
const SUPPLIER_KEY = "hisabpro_suppliers";
const PURCHASE_KEY = "hisabpro_purchases";
const CASHBOOK_KEY = "hisabpro_cashbook";

export default function PurchasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const [paymentType, setPaymentType] =
    useState<PaymentType>("cash");

  const [paymentMode, setPaymentMode] =
    useState<PaymentMode>("cash");

  const [cart, setCart] = useState<PurchaseItem[]>([]);
  const [message, setMessage] = useState("");

  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

  // Scan hone par direct Cart me add / quantity increment
  function handleBarcodeScanned(decodedBarcode: string) {
    const cleanCode = decodedBarcode.trim().toLowerCase();

    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.trim().toLowerCase() === cleanCode) ||
        String(p.id) === cleanCode
    );

    if (!matched) {
      setMessage(`Barcode "${decodedBarcode}" kisi product se match nahi hua.`);
      return;
    }

    const buyPrice = Number(matched.purchasePrice || 0);
    const sellPrice = Number(matched.sellingPrice || 0);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === matched.id
      );

      if (existingIndex !== -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          amount: newQty * updated[existingIndex].purchasePrice,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: Date.now(),
            productId: matched.id,
            productName: matched.name,
            quantity: 1,
            purchasePrice: buyPrice,
            sellingPrice: sellPrice,
            amount: 1 * buyPrice,
          },
        ];
      }
    });

    setMessage(`✓ ${matched.name} purchase cart me add hua (+1)`);
  }

  // Cart me hi direct quantity update karne ka option
  function updateCartItemQuantity(id: number, newQty: number) {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: newQty, amount: newQty * item.purchasePrice }
          : item
      )
    );
  }

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
  }

  function getPaymentModeLabel(
    mode?: PaymentMode
  ) {
    switch (mode) {
      case "cash":
        return "Cash";
      case "upi":
        return "UPI";
      case "card":
        return "Card";
      case "bank":
        return "Bank Transfer";
      case "online":
        return "Online";
      default:
        return "Cash";
    }
  }

  function addToPurchase() {
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
      const newQuantity = updated[existingIndex].quantity + qty;

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

    if (cartTotal <= 0) {
      setMessage(
        "Purchase total must be greater than ₹0."
      );
      return;
    }

    try {
      const savedProducts: Product[] = JSON.parse(
        localStorage.getItem(PRODUCT_KEY) || "[]"
      );

      const savedSuppliers: Supplier[] =
        JSON.parse(
          localStorage.getItem(SUPPLIER_KEY) || "[]"
        );

      const savedPurchases: Purchase[] =
        JSON.parse(
          localStorage.getItem(PURCHASE_KEY) || "[]"
        );

      const savedCashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(CASHBOOK_KEY) || "[]"
        );

      const purchaseId = Date.now();
      const purchaseDate = new Date().toISOString();

      const updatedProducts = savedProducts.map((product) => {
        const purchaseItems = cart.filter(
          (item) => item.productId === product.id
        );

        if (purchaseItems.length === 0) {
          return product;
        }

        const item = purchaseItems[0];

        const newBatch: StockBatch = {
          id: purchaseId + product.id + Math.floor(Math.random() * 1000),
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          date: purchaseDate,
        };

        const oldBatches = Array.isArray(product.batches) ? product.batches : [];

        return {
          ...product,
          stock: Number(product.stock || 0) + item.quantity,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          batches: [...oldBatches, newBatch],
        };
      });

      const purchase: Purchase = {
        id: purchaseId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        items: cart,
        total: cartTotal,
        paymentType,
        paymentMode: paymentType === "credit" ? undefined : paymentMode,
        date: purchaseDate,
      };

      const updatedPurchases = [...savedPurchases, purchase];

      const updatedSuppliers = savedSuppliers.map((item) => {
        if (item.id !== supplier.id) return item;
        return {
          ...item,
          due: Number(item.due || 0) + (paymentType === "credit" ? cartTotal : 0),
        };
      });

      let updatedCashbook = savedCashbook;

      if (paymentType === "cash" && paymentMode === "cash") {
        const cashTransaction: CashTransaction = {
          id: purchaseId + 1,
          type: "out",
          amount: cartTotal,
          category: "Purchase",
          note:
            `Cash Purchase - ${supplier.name} - ` +
            cart.map((item) => `${item.productName} x${item.quantity}`).join(", "),
          date: purchaseDate,
          referenceType: "purchase",
          referenceId: purchaseId,
        };

        updatedCashbook = [...savedCashbook, cashTransaction];
      }

      localStorage.setItem(PRODUCT_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(SUPPLIER_KEY, JSON.stringify(updatedSuppliers));
      localStorage.setItem(PURCHASE_KEY, JSON.stringify(updatedPurchases));
      localStorage.setItem(CASHBOOK_KEY, JSON.stringify(updatedCashbook));

      setProducts(updatedProducts);
      setSuppliers(updatedSuppliers);
      setCart([]);
      setSupplierId("");
      setProductId("");
      setQuantity("");
      setPurchasePrice("");
      setSellingPrice("");
      setPaymentType("cash");
      setPaymentMode("cash");

      setMessage(
        `Purchase saved successfully. Total ₹${cartTotal.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Purchase save error:", error);
      setMessage("Something went wrong while saving purchase.");
    }
  }

  return (
    <main className="purchase-page">
      <header className="purchase-header">
        <button
          type="button"
          className="purchase-back"
          onClick={() => (window.location.href = "/hisabpro/")}
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

      <section className="purchase-form-card">
        {/* SUPPLIER */}
        <div className="purchase-field">
          <label>Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>

          {suppliers.length === 0 && (
            <small className="purchase-help">
              No suppliers found. Add a supplier first.
            </small>
          )}

          {selectedSupplier && (
            <small className="purchase-selected-info">
              {selectedSupplier.phone || "No mobile"}
            </small>
          )}
        </div>

        {/* SCANNER BAR */}
        <div style={{ margin: "14px 0" }}>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              backgroundColor: "#102a56",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
            </svg>
            <span>Scan Barcodes to Add in Purchase</span>
          </button>
        </div>

        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", margin: "10px 0" }}>
          — Ya Manual Item Select Karein —
        </div>

        {/* PRODUCT */}
        <div className="purchase-field">
          <label>Product</label>
          <select
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* QUANTITY */}
        <div className="purchase-field">
          <label>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
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
              onChange={(e) => setPurchasePrice(e.target.value)}
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
              onChange={(e) => setSellingPrice(e.target.value)}
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
              <div key={item.id} className="purchase-item" style={{ alignItems: "center" }}>
                <div className="purchase-item-info">
                  <strong>{item.productName}</strong>
                  <small>
                    Buy: ₹{item.purchasePrice.toLocaleString("en-IN")} • Sell: ₹{item.sellingPrice.toLocaleString("en-IN")}
                  </small>
                </div>

                {/* Direct Quantity Counter in Cart */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      background: "#f1f5f9",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateCartItemQuantity(item.id, Math.max(1, Number(e.target.value)))}
                    style={{
                      width: "48px",
                      textAlign: "center",
                      padding: "4px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      background: "#f1f5f9",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                <div className="purchase-item-right">
                  <strong>
                    ₹{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </strong>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="purchase-total">
            <span>Total Purchase</span>
            <strong>
              ₹{cartTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </strong>
          </div>

          {/* PAYMENT */}
          <div className="purchase-payment">
            <label>Payment</label>
            <div className="purchase-payment-options">
              <button
                type="button"
                className={paymentType === "cash" && paymentMode === "cash" ? "active" : ""}
                onClick={() => selectPaymentMode("cash")}
              >
                <span>💵</span>
                <strong>Cash</strong>
              </button>

              <button
                type="button"
                className={paymentType === "cash" && paymentMode === "upi" ? "active" : ""}
                onClick={() => selectPaymentMode("upi")}
              >
                <span>📱</span>
                <strong>UPI</strong>
              </button>

              <button
                type="button"
                className={paymentType === "cash" && paymentMode === "card" ? "active" : ""}
                onClick={() => selectPaymentMode("card")}
              >
                <span>💳</span>
                <strong>Card</strong>
              </button>

              <button
                type="button"
                className={paymentType === "cash" && paymentMode === "bank" ? "active" : ""}
                onClick={() => selectPaymentMode("bank")}
              >
                <span>🏦</span>
                <strong>Bank</strong>
              </button>

              <button
                type="button"
                className={paymentType === "cash" && paymentMode === "online" ? "active" : ""}
                onClick={() => selectPaymentMode("online")}
              >
                <span>🌐</span>
                <strong>Online</strong>
              </button>

              <button
                type="button"
                className={paymentType === "credit" ? "active" : ""}
                onClick={() => selectPaymentType("credit")}
              >
                <span>📝</span>
                <strong>Credit</strong>
              </button>
            </div>
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

      {message && (
        <div className="purchase-message">
          {message}
        </div>
      )}

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleBarcodeScanned}
      />
    </main>
  );
}
