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

const SUPPLIER_KEY = "hisabpro_suppliers";
const PAYMENT_KEY = "hisabpro_supplier_payments";

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

      const payment: SupplierPayment = {
        id: Date.now(),
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: paymentAmount,
        note: note.trim(),
        date: new Date().toISOString(),
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

      localStorage.setItem(
        SUPPLIER_KEY,
        JSON.stringify(updatedSuppliers)
      );

      localStorage.setItem(
        PAYMENT_KEY,
        JSON.stringify(updatedPayments)
      );

      setSuppliers(updatedSuppliers);
      setPayments(updatedPayments);

      setAmount("");
      setNote("");

      setMessage(
        `₹${formatMoney(
          paymentAmount
        )} payment recorded successfully.`
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

              </div>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}
