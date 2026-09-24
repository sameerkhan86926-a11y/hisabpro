"use client";

import { useEffect, useMemo, useState } from "react";

type SaleItem = {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  price?: number;
  sellingPrice?: number;
  amount?: number;
};

type Sale = {
  id: number;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentType: "cash" | "credit";
  customerId?: number | null;
  customerName?: string;
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

type Customer = {
  id: number;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  photo?: string;
  due: number;
  createdAt: string;
};

export default function SalesReturnPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setSales(
        JSON.parse(localStorage.getItem("hisabpro_sales") || "[]")
      );

      setProducts(
        JSON.parse(localStorage.getItem("hisabpro_products") || "[]")
      );

      setCustomers(
        JSON.parse(localStorage.getItem("hisabpro_customers") || "[]")
      );
    } catch {
      setSales([]);
      setProducts([]);
      setCustomers([]);
    }
  }, []);

  const selectedSale = useMemo(() => {
    return sales.find(
      (sale) => String(sale.id) === selectedSaleId
    );
  }, [sales, selectedSaleId]);

  const selectedItem = useMemo(() => {
    if (!selectedSale || selectedItemIndex === "") return null;

    return selectedSale.items[Number(selectedItemIndex)] || null;
  }, [selectedSale, selectedItemIndex]);

  const itemPrice = selectedItem
    ? Number(
        selectedItem.price ??
          selectedItem.sellingPrice ??
          0
      )
    : 0;

  const returnAmount =
    itemPrice * Math.max(0, Number(quantity) || 0);

  const saveReturn = () => {
    setMessage("");

    if (!selectedSale) {
      setMessage("Please select a sale.");
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
      setMessage("Return quantity cannot exceed sold quantity.");
      return;
    }

    try {
      const savedProducts: Product[] = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      const savedSales: Sale[] = JSON.parse(
        localStorage.getItem("hisabpro_sales") || "[]"
      );

      const savedCustomers: Customer[] = JSON.parse(
        localStorage.getItem("hisabpro_customers") || "[]"
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

      const batches = Array.isArray(product.batches)
        ? [...product.batches]
        : [];

      if (batches.length > 0) {
        const lastBatchIndex = batches.length - 1;

        batches[lastBatchIndex] = {
          ...batches[lastBatchIndex],
          quantity:
            Number(batches[lastBatchIndex].quantity || 0) +
            returnQty,
        };
      } else {
        batches.push({
          id: Date.now(),
          quantity: returnQty,
          purchasePrice: Number(product.purchasePrice) || 0,
          sellingPrice: Number(product.sellingPrice) || itemPrice,
          date: new Date().toISOString(),
        });
      }

      savedProducts[productIndex] = {
        ...product,
        stock: Number(product.stock || 0) + returnQty,
        batches,
      };

      localStorage.setItem(
        "hisabpro_products",
        JSON.stringify(savedProducts)
      );

      if (
        selectedSale.paymentType === "credit" &&
        selectedSale.customerId
      ) {
        const customerIndex = savedCustomers.findIndex(
          (customer) =>
            Number(customer.id) ===
            Number(selectedSale.customerId)
        );

        if (customerIndex !== -1) {
          savedCustomers[customerIndex] = {
            ...savedCustomers[customerIndex],
            due: Math.max(
              0,
              Number(savedCustomers[customerIndex].due || 0) -
                returnAmount
            ),
          };

          localStorage.setItem(
            "hisabpro_customers",
            JSON.stringify(savedCustomers)
          );
        }
      }

      const existingReturns = JSON.parse(
        localStorage.getItem("hisabpro_returns") || "[]"
      );

      const returnRecord = {
        id: Date.now(),
        type: "sales",
        saleId: selectedSale.id,
        customerId: selectedSale.customerId || null,
        customerName: selectedSale.customerName || "",
        productId: selectedItem.productId,
        productName: selectedItem.productName,
        quantity: returnQty,
        amount: returnAmount,
        paymentType: selectedSale.paymentType,
        reason: reason.trim(),
        date: new Date().toISOString(),
      };

      existingReturns.push(returnRecord);

      localStorage.setItem(
        "hisabpro_returns",
        JSON.stringify(existingReturns)
      );

      setSales([...savedSales]);
      setProducts(savedProducts);
      setCustomers(savedCustomers);

      setQuantity("1");
      setReason("");
      setSelectedItemIndex("");

      setMessage("Sales return saved successfully.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  };

  const formatMoney = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="sales-return-page">
      <header className="sales-return-header">
        <button
          className="sales-return-back"
          onClick={() => window.history.back()}
        >
          ←
        </button>

        <div>
          <h1>Sales Return</h1>
          <p>Customer returned product</p>
        </div>
      </header>

      <section className="sales-return-content">
        <div className="return-form-card">
          <label>Select Sale</label>

          <select
            value={selectedSaleId}
            onChange={(e) => {
              setSelectedSaleId(e.target.value);
              setSelectedItemIndex("");
            }}
          >
            <option value="">Select a sale</option>

            {sales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                #{sale.id} •{" "}
                {sale.customerName || "Walk-in Customer"} •{" "}
                {formatMoney(Number(sale.total) || 0)}
              </option>
            ))}
          </select>

          {selectedSale && (
            <>
              <div className="return-sale-info">
                <strong>
                  Sale #{selectedSale.id}
                </strong>

                <span>
                  {new Date(
                    selectedSale.date
                  ).toLocaleDateString("en-IN")}
                </span>

                <span>
                  {selectedSale.customerName ||
                    "Walk-in Customer"}
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

                {selectedSale.items.map((item, index) => (
                  <option key={index} value={index}>
                    {item.productName} • Qty {item.quantity}
                  </option>
                ))}
              </select>

              {selectedItem && (
                <>
                  <div className="return-product-info">
                    <div>
                      <span>Sold Quantity</span>
                      <strong>
                        {selectedItem.quantity}
                      </strong>
                    </div>

                    <div>
                      <span>Sale Price</span>
                      <strong>
                        {formatMoney(itemPrice)}
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
                    placeholder="Damaged, wrong size, customer changed mind..."
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
                    Save Sales Return
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
