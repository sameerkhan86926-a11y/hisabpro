"use client";

import { useEffect, useState } from "react";

type Supplier = {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  due: number;
  createdAt: string;
};

type SupplierPayment = {
  id: number;
  supplierId: number;
  supplierName: string;
  amount: number;
  note: string;
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

const SUPPLIER_KEY = "hisabpro_suppliers";
const PAYMENT_KEY = "hisabpro_supplier_payments";
const CASHBOOK_KEY = "hisabpro_cashbook";

export default function SupplierPaymentsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    try {
      const savedSuppliers = JSON.parse(
        localStorage.getItem(SUPPLIER_KEY) || "[]"
      );

      const savedPayments = JSON.parse(
        localStorage.getItem(PAYMENT_KEY) || "[]"
      );

      setSuppliers(
        Array.isArray(savedSuppliers)
          ? savedSuppliers
          : []
      );

      setPayments(
        Array.isArray(savedPayments)
          ? [...savedPayments].sort(
              (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime()
            )
          : []
      );
    } catch {
      setSuppliers([]);
      setPayments([]);
    }
  }

  const selectedSupplier = suppliers.find(
    (supplier) =>
      String(supplier.id) === supplierId
  );

  function formatMoney(value: number) {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  }

  function formatDate(date: string) {
    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  }

  function savePayment() {
    if (!supplierId) {
      setMessage("Please select a supplier.");
      return;
    }

    const paymentAmount = Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      setMessage("Enter a valid payment amount.");
      return;
    }

    const supplier = suppliers.find(
      (item) => item.id === Number(supplierId)
    );

    if (!supplier) {
      setMessage("Supplier not found.");
      return;
    }

    if (paymentAmount > Number(supplier.due || 0)) {
      setMessage(
        `Payment cannot be greater than supplier payable of ₹${formatMoney(
          supplier.due
        )}.`
      );
      return;
    }

    try {
      const savedSuppliers: Supplier[] =
        JSON.parse(
          localStorage.getItem(
            SUPPLIER_KEY
          ) || "[]"
        );

      const savedPayments: SupplierPayment[] =
        JSON.parse(
          localStorage.getItem(
            PAYMENT_KEY
          ) || "[]"
        );

      const savedCashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(
            CASHBOOK_KEY
          ) || "[]"
        );

      const paymentId = Date.now();
      const paymentDate =
        new Date().toISOString();

      const payment: SupplierPayment = {
        id: paymentId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: paymentAmount,
        note: note.trim(),
        date: paymentDate,
      };

      const updatedSuppliers =
        savedSuppliers.map((item) => {
          if (item.id !== supplier.id) {
            return item;
          }

          return {
            ...item,
            due: Math.max(
              0,
              Number(item.due || 0) -
                paymentAmount
            ),
          };
        });

      const updatedPayments = [
        payment,
        ...savedPayments,
      ];

      // Supplier payment = Cash Out
      const cashTransaction: CashTransaction = {
        id: paymentId + 1,
        type: "out",
        amount: paymentAmount,
        category: "Supplier Payment",
        note:
          `Payment to Supplier - ${supplier.name}` +
          (note.trim()
            ? ` - ${note.trim()}`
            : ""),
        date: paymentDate,
        referenceType: "supplier_payment",
        referenceId: paymentId,
      };

      const updatedCashbook = [
        cashTransaction,
        ...savedCashbook,
      ];

      localStorage.setItem(
        SUPPLIER_KEY,
        JSON.stringify(updatedSuppliers)
      );

      localStorage.setItem(
        PAYMENT_KEY,
        JSON.stringify(updatedPayments)
      );

      localStorage.setItem(
        CASHBOOK_KEY,
        JSON.stringify(updatedCashbook)
      );

      setSuppliers(updatedSuppliers);

      setPayments(
        [...updatedPayments].sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )
      );

      setAmount("");
      setNote("");

      setMessage(
        `₹${formatMoney(
          paymentAmount
        )} payment recorded successfully and added to Cashbook as Cash Out.`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Supplier payment error:",
        error
      );

      setMessage(
        "Unable to save supplier payment."
      );
    }
  }

  function deletePayment(payment: SupplierPayment) {
    const confirmDelete = window.confirm(
      `Delete ₹${formatMoney(
        payment.amount
      )} payment to ${payment.supplierName}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const savedSuppliers: Supplier[] =
        JSON.parse(
          localStorage.getItem(
            SUPPLIER_KEY
          ) || "[]"
        );

      const savedPayments: SupplierPayment[] =
        JSON.parse(
          localStorage.getItem(
            PAYMENT_KEY
          ) || "[]"
        );

      const savedCashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(
            CASHBOOK_KEY
          ) || "[]"
        );

      // Reverse supplier payable
      const updatedSuppliers =
        savedSuppliers.map((supplier) => {
          if (
            supplier.id !==
            payment.supplierId
          ) {
            return supplier;
          }

          return {
            ...supplier,
            due:
              Number(supplier.due || 0) +
              Number(payment.amount || 0),
          };
        });

      // Remove exact supplier payment
      const updatedPayments =
        savedPayments.filter(
          (item) =>
            Number(item.id) !==
            Number(payment.id)
        );

      // Remove only linked automatic Cashbook entry
      // Manual Cashbook entries remain untouched.
      const updatedCashbook =
        savedCashbook.filter(
          (transaction) =>
            !(
              transaction.referenceType ===
                "supplier_payment" &&
              Number(
                transaction.referenceId
              ) === Number(payment.id)
            )
        );

      localStorage.setItem(
        SUPPLIER_KEY,
        JSON.stringify(updatedSuppliers)
      );

      localStorage.setItem(
        PAYMENT_KEY,
        JSON.stringify(updatedPayments)
      );

      localStorage.setItem(
        CASHBOOK_KEY,
        JSON.stringify(updatedCashbook)
      );

      setSuppliers(updatedSuppliers);

      setPayments(
        [...updatedPayments].sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )
      );

      setMessage(
        `₹${formatMoney(
          payment.amount
        )} payment deleted, supplier payable restored and Cashbook updated.`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Delete supplier payment error:",
        error
      );

      setMessage(
        "Unable to delete supplier payment."
      );
    }
  }

  return (
    <main className="supplier-payment-page">

      <header className="supplier-payment-header">

        <button
          type="button"
          className="supplier-payment-back"
          onClick={() => window.history.back()}
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <h1>Supplier Payment</h1>
          <p>Settle supplier payable</p>
        </div>

      </header>

      <section className="supplier-payment-form-card">

        <div className="supplier-payment-field">

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

        </div>

        {selectedSupplier && (
          <div className="supplier-payment-due-card">

            <span>Current Payable</span>

            <strong>
              ₹{formatMoney(selectedSupplier.due)}
            </strong>

          </div>
        )}

        <div className="supplier-payment-field">

          <label>Payment Amount</label>

          <div className="supplier-payment-money">

            <span>₹</span>

            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="Enter amount"
            />

          </div>

        </div>

        <div className="supplier-payment-field">

          <label>Note</label>

          <input
            type="text"
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            placeholder="Optional note"
          />

        </div>

        <button
          type="button"
          className="supplier-payment-save"
          onClick={savePayment}
        >
          Record Payment
        </button>

      </section>

      {message && (
        <div className="supplier-payment-message">
          {message}
        </div>
      )}

      <section className="supplier-payment-history">

        <div className="supplier-payment-title">
          <h2>Payment History</h2>
          <span>{payments.length}</span>
        </div>

        {payments.length === 0 ? (
          <div className="supplier-payment-empty">
            <div>💳</div>
            <h3>No payments yet</h3>
            <p>
              Supplier payments will appear here.
            </p>
          </div>
        ) : (
          <div className="supplier-payment-list">

            {payments.map((payment) => (
              <div
                key={payment.id}
                className="supplier-payment-card"
              >

                <div className="supplier-payment-icon">
                  ₹
                </div>

                <div className="supplier-payment-info">

                  <strong>
                    {payment.supplierName}
                  </strong>

                  <span>
                    {formatDate(payment.date)}
                  </span>

                  {payment.note && (
                    <small>
                      {payment.note}
                    </small>
                  )}

                </div>

                <strong className="supplier-payment-amount">
                  ₹{formatMoney(payment.amount)}
                </strong>

                <button
                  type="button"
                  className="supplier-payment-delete"
                  onClick={() =>
                    deletePayment(payment)
                  }
                  aria-label="Delete payment"
                  title="Delete payment"
                >
                  🗑️
                </button>

              </div>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}
