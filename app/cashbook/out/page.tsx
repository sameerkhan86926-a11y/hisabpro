"use client";

import { useState } from "react";

export default function CashOutPage() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Expense");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const saveCashOut = () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      setMessage("Valid amount enter karein.");
      return;
    }

    const saved = localStorage.getItem("hisabpro_cashbook");

    let transactions = [];

    try {
      transactions = saved ? JSON.parse(saved) : [];
    } catch {
      transactions = [];
    }

    transactions.push({
      id: Date.now(),
      type: "out",
      amount: value,
      category,
      note,
      date: new Date().toISOString(),
    });

    localStorage.setItem(
      "hisabpro_cashbook",
      JSON.stringify(transactions)
    );

    setAmount("");
    setNote("");
    setMessage("Cash Out successfully added.");
  };

  return (
    <main className="cashbook-page">
      <header className="cashbook-header">
        <button
          className="cashbook-back"
          onClick={() => {
            window.location.href = "/hisabpro/cashbook/";
          }}
        >
          ←
        </button>

        <div>
          <h1>Cash Out</h1>
          <p>Cash paid by business</p>
        </div>
      </header>

      <section className="cashbook-form-content">
        <div className="cashbook-form-card">
          <div className="cashbook-form-icon cash-out-form-icon">
            ↑
          </div>

          <h2>Add Cash Out</h2>

          <p className="cashbook-form-help">
            Business se diya gaya cash record karein.
          </p>

          <label>Amount</label>

          <input
            className="cashbook-money-input"
            type="number"
            min="0"
            placeholder="₹ 0.00"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />

          <label>Category</label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option>Expense</option>
            <option>Purchase</option>
            <option>Supplier Payment</option>
            <option>Salary</option>
            <option>Transport</option>
            <option>Other Payment</option>
            <option>Other</option>
          </select>

          <label>Note</label>

          <textarea
            placeholder="Optional note"
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
          />

          {message && (
            <div className="cashbook-message">
              {message}
            </div>
          )}

          <button
            className="cashbook-save-out"
            onClick={saveCashOut}
          >
            Add Cash Out
          </button>
        </div>
      </section>
    </main>
  );
}
