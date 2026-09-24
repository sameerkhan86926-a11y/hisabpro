"use client";

import { useEffect, useState } from "react";

type CashTransaction = {
  id: number;
  type: "in" | "out";
  amount: number;
  category: string;
  note: string;
  date: string;
};

export default function CashbookPage() {
  const [openingCash, setOpeningCash] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [openingInput, setOpeningInput] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedOpening = localStorage.getItem("hisabpro_opening_cash");
    const savedTransactions = localStorage.getItem("hisabpro_cashbook");

    if (savedOpening) {
      setOpeningCash(Number(savedOpening));
      setOpeningInput(savedOpening);
    }

    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch {
        setTransactions([]);
      }
    }
  }, []);

  const saveOpeningCash = () => {
    const amount = Number(openingInput);

    if (amount < 0 || Number.isNaN(amount)) {
      setMessage("Valid opening cash enter karein.");
      return;
    }

    localStorage.setItem(
      "hisabpro_opening_cash",
      String(amount)
    );

    setOpeningCash(amount);
    setMessage("Opening cash saved.");
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

  const cashIn = transactions
    .filter((item) => item.type === "in")
    .reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

  const cashOut = transactions
    .filter((item) => item.type === "out")
    .reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

  const balance =
    openingCash + cashIn - cashOut;

  return (
    <main className="cashbook-page">
      <header className="cashbook-header">
        <button
          className="cashbook-back"
          onClick={() => {
            window.location.href = "/hisabpro/";
          }}
        >
          ←
        </button>

        <div>
          <h1>Cashbook</h1>
          <p>Cash In • Cash Out • Balance</p>
        </div>
      </header>

      <section className="cashbook-content">

        <div className="cashbook-balance-card">
          <span>Current Cash Balance</span>
          <strong>
            ₹{balance.toFixed(2)}
          </strong>
        </div>

        <div className="cashbook-summary">
          <div className="cashbook-summary-card cash-in-card">
            <span>Cash In</span>
            <strong>
              ₹{cashIn.toFixed(2)}
            </strong>
          </div>

          <div className="cashbook-summary-card cash-out-card">
            <span>Cash Out</span>
            <strong>
              ₹{cashOut.toFixed(2)}
            </strong>
          </div>
        </div>

        <section className="cashbook-section">
          <h2>Opening Cash</h2>

          <div className="cashbook-opening-card">
            <input
              type="number"
              min="0"
              placeholder="Opening cash"
              value={openingInput}
              onChange={(e) =>
                setOpeningInput(e.target.value)
              }
            />

            <button onClick={saveOpeningCash}>
              Save
            </button>
          </div>
        </section>

        {message && (
          <div className="cashbook-message">
            {message}
          </div>
        )}

        <section className="cashbook-section">
          <h2>Quick Actions</h2>

          <div className="cashbook-actions">
            <a href="/hisabpro/cashbook/in/">
              <span>＋</span>
              Cash In
            </a>

            <a href="/hisabpro/cashbook/out/">
              <span>−</span>
              Cash Out
            </a>
          </div>
        </section>

        <section className="cashbook-section">
          <div className="cashbook-section-title">
            <h2>Recent Transactions</h2>

            <a href="/hisabpro/cashbook/history/">
              View All
            </a>
          </div>

          {transactions.length === 0 ? (
            <div className="cashbook-empty">
              <div>💰</div>

              <h3>No transactions yet</h3>

              <p>
                Cash In ya Cash Out add karein.
              </p>
            </div>
          ) : (
            <div className="cashbook-list">
              {transactions
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime()
                )
                .slice(0, 10)
                .map((item) => (
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
                      {item.type === "in"
                        ? "↓"
                        : "↑"}
                    </div>

                    <div className="cashbook-transaction-info">
                      <strong>
                        {item.category}
                      </strong>

                      <span>
                        {item.note || "No note"}
                      </span>

                      <small>
                        {new Date(
                          item.date
                        ).toLocaleString()}
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
                        {item.type === "in"
                          ? "+"
                          : "-"}
                        ₹
                        {Number(
                          item.amount
                        ).toFixed(2)}
                      </strong>

                      <button
                        onClick={() =>
                          deleteTransaction(
                            item.id
                          )
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
      </section>
    </main>
  );
}
