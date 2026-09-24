"use client";

import { useEffect, useMemo, useState } from "react";

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

type SupplierPayment = {
  id: number;
  supplierId: number;
  supplierName: string;
  amount: number;
  note: string;
  date: string;
};

type LedgerTransaction = {
  id: number;
  type: "purchase" | "payment";
  date: string;
  title: string;
  subtitle: string;
  amount: number;
  effect: number;
};

export default function SupplierLedgerPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  useEffect(() => {
    try {
      const savedSuppliers = JSON.parse(
        localStorage.getItem("hisabpro_suppliers") || "[]"
      );

      const savedPurchases = JSON.parse(
        localStorage.getItem("hisabpro_purchases") || "[]"
      );

      const savedPayments = JSON.parse(
        localStorage.getItem("hisabpro_supplier_payments") || "[]"
      );

      setSuppliers(savedSuppliers);
      setPurchases(savedPurchases);
      setPayments(savedPayments);

      if (savedSuppliers.length > 0) {
        setSelectedSupplierId(String(savedSuppliers[0].id));
      }
    } catch {
      setSuppliers([]);
      setPurchases([]);
      setPayments([]);
    }
  }, []);

  const selectedSupplier = useMemo(() => {
    return suppliers.find(
      (supplier) => String(supplier.id) === selectedSupplierId
    );
  }, [suppliers, selectedSupplierId]);

  const supplierPurchases = useMemo(() => {
    if (!selectedSupplier) return [];

    return purchases.filter(
      (purchase) => Number(purchase.supplierId) === Number(selectedSupplier.id)
    );
  }, [purchases, selectedSupplier]);

  const supplierPayments = useMemo(() => {
    if (!selectedSupplier) return [];

    return payments.filter(
      (payment) => Number(payment.supplierId) === Number(selectedSupplier.id)
    );
  }, [payments, selectedSupplier]);

  const transactions = useMemo<LedgerTransaction[]>(() => {
    const list: LedgerTransaction[] = [];

    supplierPurchases.forEach((purchase) => {
      list.push({
        id: purchase.id,
        type: "purchase",
        date: purchase.date,
        title: "Purchase",
        subtitle:
          purchase.items.length === 1
            ? purchase.items[0].productName
            : `${purchase.items.length} products`,
        amount: Number(purchase.total) || 0,
        effect: purchase.paymentType === "credit"
          ? Number(purchase.total) || 0
          : 0,
      });
    });

    supplierPayments.forEach((payment) => {
      list.push({
        id: payment.id,
        type: "payment",
        date: payment.date,
        title: "Payment",
        subtitle: payment.note || "Supplier payment",
        amount: Number(payment.amount) || 0,
        effect: -(Number(payment.amount) || 0),
      });
    });

    return list.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [supplierPurchases, supplierPayments]);

  const totalPurchases = supplierPurchases.reduce(
    (sum, purchase) => sum + (Number(purchase.total) || 0),
    0
  );

  const totalCreditPurchases = supplierPurchases
    .filter((purchase) => purchase.paymentType === "credit")
    .reduce((sum, purchase) => sum + (Number(purchase.total) || 0), 0);

  const totalPayments = supplierPayments.reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0
  );

  const formatMoney = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="supplier-ledger-page">
      <header className="supplier-ledger-header">
        <button
          className="supplier-ledger-back"
          onClick={() => window.history.back()}
          aria-label="Back"
        >
          ←
        </button>

        <div>
          <h1>Supplier Ledger</h1>
          <p>Purchase • Payment • Payable</p>
        </div>
      </header>

      <section className="supplier-ledger-content">
        {suppliers.length === 0 ? (
          <div className="supplier-ledger-empty">
            <div className="supplier-ledger-empty-icon">🏪</div>

            <h2>No suppliers found</h2>

            <p>
              Add a supplier first to view their ledger.
            </p>

            <a
              href="/hisabpro/suppliers/"
              className="supplier-ledger-primary"
            >
              Add Supplier
            </a>
          </div>
        ) : (
          <>
            <div className="supplier-ledger-selector">
              <label>Select Supplier</label>

              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
              >
                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedSupplier && (
              <>
                <div className="supplier-ledger-profile">
                  <div className="supplier-ledger-avatar">
                    {selectedSupplier.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2>{selectedSupplier.name}</h2>

                    {selectedSupplier.phone && (
                      <p>{selectedSupplier.phone}</p>
                    )}
                  </div>
                </div>

                <div className="supplier-ledger-summary">
                  <div className="supplier-ledger-summary-card">
                    <span>Total Purchase</span>
                    <strong>
                      {formatMoney(totalPurchases)}
                    </strong>
                  </div>

                  <div className="supplier-ledger-summary-card">
                    <span>Paid</span>
                    <strong className="ledger-paid">
                      {formatMoney(totalPayments)}
                    </strong>
                  </div>

                  <div className="supplier-ledger-summary-card payable">
                    <span>Current Payable</span>
                    <strong>
                      {formatMoney(
                        Number(selectedSupplier.due) || 0
                      )}
                    </strong>
                  </div>
                </div>

                <div className="supplier-ledger-actions">
                  <a
                    href="/hisabpro/suppliers/payments/"
                    className="supplier-ledger-payment-button"
                  >
                    💰 Record Payment
                  </a>
                </div>

                <section className="supplier-ledger-statement">
                  <div className="supplier-ledger-section-title">
                    <div>
                      <h3>Statement</h3>
                      <p>
                        {transactions.length} transactions
                      </p>
                    </div>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="supplier-ledger-no-transactions">
                      <div>📋</div>
                      <h3>No transactions yet</h3>
                      <p>
                        Purchases and supplier payments will
                        appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="supplier-ledger-list">
                      {transactions.map((transaction) => (
                        <div
                          className="supplier-ledger-transaction"
                          key={`${transaction.type}-${transaction.id}`}
                        >
                          <div
                            className={`supplier-ledger-transaction-icon ${
                              transaction.type
                            }`}
                          >
                            {transaction.type === "purchase"
                              ? "🛒"
                              : "💰"}
                          </div>

                          <div className="supplier-ledger-transaction-info">
                            <strong>
                              {transaction.title}
                            </strong>

                            <span>
                              {transaction.subtitle}
                            </span>

                            <small>
                              {formatDate(transaction.date)}
                              {" • "}
                              {formatTime(transaction.date)}
                            </small>
                          </div>

                          <div className="supplier-ledger-transaction-amount">
                            <strong
                              className={
                                transaction.type === "purchase"
                                  ? "purchase-amount"
                                  : "payment-amount"
                              }
                            >
                              {transaction.type === "purchase"
                                ? "+"
                                : "-"}
                              {formatMoney(transaction.amount)}
                            </strong>

                            {transaction.type === "purchase" && (
                              <small>
                                {supplierPurchases.find(
                                  (p) =>
                                    p.id === transaction.id
                                )?.paymentType === "credit"
                                  ? "Credit"
                                  : "Cash"}
                              </small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="supplier-ledger-note">
                  <strong>Note:</strong> Current payable is taken
                  directly from the supplier account. Cash purchases
                  do not increase payable; credit purchases increase
                  payable and recorded payments reduce it.
                </div>

                <div className="supplier-ledger-breakdown">
                  <div>
                    <span>Credit Purchases</span>
                    <strong>
                      {formatMoney(totalCreditPurchases)}
                    </strong>
                  </div>

                  <div>
                    <span>Total Payments</span>
                    <strong>
                      {formatMoney(totalPayments)}
                    </strong>
                  </div>

                  <div>
                    <span>Account Payable</span>
                    <strong>
                      {formatMoney(
                        Number(selectedSupplier.due) || 0
                      )}
                    </strong>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
