"use client";

import { useEffect, useMemo, useState } from "react";

type CashTransaction = {
  id: number;
  type: "in" | "out";
  amount: number;
  category: string;
  note: string;
  date: string;
};

export default function CashbookHistoryPage() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const saved = localStorage.getItem("hisabpro_cashbook");

    if (!saved) {
      setTransactions([]);
      return;
    }

    try {
      setTransactions(JSON.parse(saved));
    } catch {
      setTransactions([]);
    }
  };

  const deleteTransaction = (id: number) => {
    if (!confirm("Is transaction ko delete karna hai?")) return;

    const updated = transactions.filter(
      (item) => item.id !== id
    );

    setTransactions(updated);

    localStorage.setItem(
      "hisabpro_cashbook",
      JSON.stringify(updated)
    );
  };

  const filteredTransactions = useMemo(() => {
    const result =
      filter === "all"
        ? transactions
        : transactions.filter(
            (item) => item.type === filter
          );

    return result
      .slice()
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [transactions, filter]);

  const totalIn = transactions
    .filter((item) => item.type === "in")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalOut = transactions
    .filter((item) => item.type === "out")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <main className="cashbook-page">
      <header className="cashbook-header">
        <button
          className="cashbook-back"
          onClick={() => window.history.back()}
        >
          ←
        </button>

        <div>
          <h1>Cashbook History</h1>
          <p>All cash transactions</p>
        </div>
      </header>

      <section className="cashbook-content">

        <div className="cashbook-summary">
          <div className="cashbook-summary-card cash-in-card">
            <span>Total Cash In</span>
            <strong>₹{totalIn.toFixed(2)}</strong>
          </div>

          <div className="cashbook-summary-card cash-out-card">
            <span>Total Cash Out</span>
            <strong>₹{totalOut.toFixed(2)}</strong>
          </div>
        </div>

        <div className="cashbook-filter">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={filter === "in" ? "active" : ""}
            onClick={() => setFilter("in")}
          >
            Cash In
          </button>

          <button
            className={filter === "out" ? "active" : ""}
            onClick={() => setFilter("out")}
          >
            Cash Out
          </button>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="cashbook-empty">
            <div>💰</div>
            <h3>No transactions found</h3>
            <p>Cashbook transactions yahan appear hongi.</p>
          </div>
        ) : (
          <div className="cashbook-list">
            {filteredTransactions.map((item) => (
              <div
                className="cashbook-transaction"
                key={item.id}
              >
                <div
                  className={
                    item.type === "in"
                      ? "cashbook-icon in"
                      : "cashbook-icon out"
                  }
                >
                  {item.type === "in" ? "↓" : "↑"}
                </div>

                <div className="cashbook-transaction-info">
                  <strong>{item.category}</strong>

                  <span>
                    {item.note || "No note"}
                  </span>

                  <small>
                    {new Date(item.date).toLocaleString()}
                  </small>
                </div>

                <div className="cashbook-transaction-right">
                  <strong
                    className={
                      item.type === "in"
                        ? "amount-in"
                        : "amount-out"
                    }
                  >
                    {item.type === "in" ? "+" : "-"}₹
                    {Number(item.amount).toFixed(2)}
                  </strong>

                  <button
                    onClick={() =>
                      deleteTransaction(item.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
