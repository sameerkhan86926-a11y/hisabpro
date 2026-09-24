"use client";

import { useEffect, useMemo, useState } from "react";

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

type ProductBatch = {
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
  batches?: ProductBatch[];
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

export default function PurchaseReturnPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [selectedPurchaseId, setSelectedPurchaseId] =
    useState("");

  const [selectedItemIndex, setSelectedItemIndex] =
    useState("");

  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setPurchases(
        JSON.parse(
          localStorage.getItem("hisabpro_purchases") || "[]"
        )
      );

      setProducts(
        JSON.parse(
          localStorage.getItem("hisabpro_products") || "[]"
        )
      );

      setSuppliers(
        JSON.parse(
          localStorage.getItem("hisabpro_suppliers") || "[]"
        )
      );
    } catch {
      setPurchases([]);
      setProducts([]);
      setSuppliers([]);
    }
  }, []);

  const selectedPurchase = useMemo(() => {
    return purchases.find(
      (purchase) =>
        String(purchase.id) === selectedPurchaseId
    );
  }, [purchases, selectedPurchaseId]);

  const selectedItem = useMemo(() => {
    if (!selectedPurchase || selectedItemIndex === "")
      return null;

    return (
      selectedPurchase.items[Number(selectedItemIndex)] ||
      null
    );
  }, [selectedPurchase, selectedItemIndex]);

  const purchasePrice = selectedItem
    ? Number(selectedItem.purchasePrice) || 0
    : 0;

  const returnAmount =
    purchasePrice * Math.max(0, Number(quantity) || 0);

  const saveReturn = () => {
    setMessage("");

    if (!selectedPurchase) {
      setMessage("Please select a purchase.");
      return;
    }

    if (!selectedItem) {
      setMessage("Please select a product.");
      return;
    }

    const returnQty = Number(quantity);

    if (!Number.isFinite(returnQty) || returnQty <= 0) {
      setMessage("Enter a valid return quantity.");
      return;
    }

    if (returnQty > Number(selectedItem.quantity)) {
      setMessage(
        "Return quantity cannot exceed purchased quantity."
      );
      return;
    }

    try {
      const savedProducts: Product[] = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      const savedSuppliers: Supplier[] = JSON.parse(
        localStorage.getItem("hisabpro_suppliers") || "[]"
      );

      const productIndex = savedProducts.findIndex(
        (product) =>
          Number(product.id) === Number(selectedItem.productId)
      );

      if (productIndex === -1) {
        setMessage("Product not found in stock.");
        return;
      }

      const product = savedProducts[productIndex];

      if (Number(product.stock || 0) < returnQty) {
        setMessage(
          "Return quantity is greater than current stock."
        );
        return;
      }

      let remaining = returnQty;

      let batches = Array.isArray(product.batches)
        ? [...product.batches]
        : [];

      const matchingIndexes = batches
        .map((batch, index) => ({
          batch,
          index,
        }))
        .filter(
          ({ batch }) =>
            Number(batch.purchasePrice) ===
              Number(selectedItem.purchasePrice) &&
            Number(batch.sellingPrice) ===
              Number(selectedItem.sellingPrice) &&
            Number(batch.quantity) > 0
        )
        .sort(
          (a, b) =>
            new Date(b.batch.date).getTime() -
            new Date(a.batch.date).getTime()
        );

      for (const match of matchingIndexes) {
        if (remaining <= 0) break;

        const available = Number(
          batches[match.index].quantity || 0
        );

        const remove = Math.min(available, remaining);

        batches[match.index] = {
          ...batches[match.index],
          quantity: available - remove,
        };

        remaining -= remove;
      }

      if (remaining > 0) {
        for (let i = batches.length - 1; i >= 0; i--) {
          if (remaining <= 0) break;

          const available = Number(
            batches[i].quantity || 0
          );

          if (available <= 0) continue;

          const remove = Math.min(available, remaining);

          batches[i] = {
            ...batches[i],
            quantity: available - remove,
          };

          remaining -= remove;
        }
      }

      if (remaining > 0) {
        setMessage("Unable to adjust stock batches.");
        return;
      }

      batches = batches.filter(
        (batch) => Number(batch.quantity) > 0
      );

      savedProducts[productIndex] = {
        ...product,
        stock: Math.max(
          0,
          Number(product.stock || 0) - returnQty
        ),
        batches,
      };

      localStorage.setItem(
        "hisabpro_products",
        JSON.stringify(savedProducts)
      );

      if (
        selectedPurchase.paymentType === "credit"
      ) {
        const supplierIndex = savedSuppliers.findIndex(
          (supplier) =>
            Number(supplier.id) ===
            Number(selectedPurchase.supplierId)
        );

        if (supplierIndex !== -1) {
          savedSuppliers[supplierIndex] = {
            ...savedSuppliers[supplierIndex],
            due: Math.max(
              0,
              Number(savedSuppliers[supplierIndex].due || 0) -
                returnAmount
            ),
          };

          localStorage.setItem(
            "hisabpro_suppliers",
            JSON.stringify(savedSuppliers)
          );
        }
      }

      const existingReturns = JSON.parse(
        localStorage.getItem("hisabpro_returns") || "[]"
      );

      existingReturns.push({
        id: Date.now(),
        type: "purchase",
        purchaseId: selectedPurchase.id,
        supplierId: selectedPurchase.supplierId,
        supplierName: selectedPurchase.supplierName,
        productId: selectedItem.productId,
        productName: selectedItem.productName,
        quantity: returnQty,
        amount: returnAmount,
        paymentType: selectedPurchase.paymentType,
        reason: reason.trim(),
        date: new Date().toISOString(),
      });

      localStorage.setItem(
        "hisabpro_returns",
        JSON.stringify(existingReturns)
      );

      setProducts(savedProducts);
      setSuppliers(savedSuppliers);

      setQuantity("1");
      setReason("");
      setSelectedItemIndex("");

      setMessage("Purchase return saved successfully.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  };

  const formatMoney = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="purchase-return-page">
      <header className="purchase-return-header">
        <button
          className="purchase-return-back"
          onClick={() => window.history.back()}
        >
          ←
        </button>

        <div>
          <h1>Purchase Return</h1>
          <p>Return product to supplier</p>
        </div>
      </header>

      <section className="purchase-return-content">
        <div className="return-form-card">
          <label>Select Purchase</label>

          <select
            value={selectedPurchaseId}
            onChange={(e) => {
              setSelectedPurchaseId(e.target.value);
              setSelectedItemIndex("");
            }}
          >
            <option value="">Select a purchase</option>

            {purchases.map((purchase) => (
              <option
                key={purchase.id}
                value={purchase.id}
              >
                #{purchase.id} • {purchase.supplierName} •{" "}
                {formatMoney(Number(purchase.total) || 0)}
              </option>
            ))}
          </select>

          {selectedPurchase && (
            <>
              <div className="return-sale-info">
                <strong>
                  Purchase #{selectedPurchase.id}
                </strong>

                <span>
                  {new Date(
                    selectedPurchase.date
                  ).toLocaleDateString("en-IN")}
                </span>

                <span>
                  {selectedPurchase.supplierName}
                </span>
              </div>

              <label>Select Product</label>

              <select
                value={selectedItemIndex}
                onChange={(e) =>
                  setSelectedItemIndex(e.target.value)
                }
              >
                <option value="">Select product</option>

                {selectedPurchase.items.map(
                  (item, index) => (
                    <option key={index} value={index}>
                      {item.productName} • Qty{" "}
                      {item.quantity}
                    </option>
                  )
                )}
              </select>

              {selectedItem && (
                <>
                  <div className="return-product-info">
                    <div>
                      <span>Purchased Quantity</span>
                      <strong>
                        {selectedItem.quantity}
                      </strong>
                    </div>

                    <div>
                      <span>Purchase Price</span>
                      <strong>
                        {formatMoney(purchasePrice)}
                      </strong>
                    </div>
                  </div>

                  <label>Return Quantity</label>

                  <input
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                  />

                  <label>Reason</label>

                  <input
                    type="text"
                    placeholder="Damaged, wrong product, quality issue..."
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                  />

                  <div className="return-total-box">
                    <span>Return Amount</span>
                    <strong>
                      {formatMoney(returnAmount)}
                    </strong>
                  </div>

                  <button
                    className="return-save-button"
                    onClick={saveReturn}
                  >
                    Save Purchase Return
                  </button>
                </>
              )}
            </>
          )}

          {message && (
            <div className="return-message">
              {message}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
