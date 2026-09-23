"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  phone: string;
  due: number;
  createdAt: string;
};

type Transaction = {
  id: number;
  customerId: number;
  type: "credit" | "payment";
  amount: number;
  note: string;
  date: string;
};

export default function CustomerPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customerId = Number(params.get("id"));

    const savedCustomers: Customer[] = JSON.parse(
      localStorage.getItem("hisabpro_customers") || "[]"
    );

    const foundCustomer = savedCustomers.find(
      (item) => item.id === customerId
    );

    setCustomer(foundCustomer || null);

    const savedTransactions: Transaction[] = JSON.parse(
      localStorage.getItem("hisabpro_transactions") || "[]"
    );

    const customerTransactions = savedTransactions
      .filter((item) => item.customerId === customerId)
      .reverse();

    setTransactions(customerTransactions);
  }, []);

  function saveData(
    updatedCustomer: Customer,
    newTransaction: Transaction
  ) {
    const savedCustomers: Customer[] = JSON.parse(
      localStorage.getItem("hisabpro_customers") || "[]"
    );

    const updatedCustomers = savedCustomers.map((item) =>
      item.id === updatedCustomer.id
        ? updatedCustomer
        : item
    );

    localStorage.setItem(
      "hisabpro_customers",
      JSON.stringify(updatedCustomers)
    );

    const oldTransactions: Transaction[] = JSON.parse(
      localStorage.getItem("hisabpro_transactions") || "[]"
    );

    oldTransactions.push(newTransaction);

    localStorage.setItem(
      "hisabpro_transactions",
      JSON.stringify(oldTransactions)
    );

    setCustomer(updatedCustomer);

    setTransactions((old) => [
      newTransaction,
      ...old,
    ]);
  }

  function addCredit() {
    if (!customer) return;

    if (amount <= 0) {
      setMessage("Amount enter karein.");
      return;
    }

    const transaction: Transaction = {
      id: Date.now(),
      customerId: customer.id,
      type: "credit",
      amount,
      note: note.trim() || "Udhaar",
      date: new Date().toISOString(),
    };

    const updatedCustomer: Customer = {
      ...customer,
      due: customer.due + amount,
    };

    saveData(updatedCustomer, transaction);

    setAmount(0);
    setNote("");
    setMessage("Udhaar added successfully ✅");
  }

  function receivePayment() {
    if (!customer) return;

    if (amount <= 0) {
      setMessage("Amount enter karein.");
      return;
    }

    if (amount > customer.due) {
      setMessage("Payment due se zyada nahi ho sakti.");
      return;
    }

    const transaction: Transaction = {
      id: Date.now(),
      customerId: customer.id,
      type: "payment",
      amount,
      note: note.trim() || "Payment Received",
      date: new Date().toISOString(),
    };

    const updatedCustomer: Customer = {
      ...customer,
      due: customer.due - amount,
    };

    saveData(updatedCustomer, transaction);

    setAmount(0);
    setNote("");
    setMessage("Payment received successfully ✅");
  }

  if (!customer) {
    return (
      <main className="customer-detail-page">
        <header className="customer-detail-header">
          <a href="/hisabpro/khata/">
            ← Khata
          </a>

          <h1>Customer</h1>

          <span></span>
        </header>

        <div className="customer-not-found">
          <h2>Customer Not Found</h2>
          <p>
            Customer record nahi mila.
          </p>

          <a href="/hisabpro/khata/">
            Back to Khata
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="customer-detail-page">

      <header className="customer-detail-header">
        <a href="/hisabpro/khata/">
          ← Khata
        </a>

        <h1>Customer</h1>

        <a
          href={`https://wa.me/91${customer.phone}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </header>

      <section className="customer-profile">

        <div className="customer-avatar">
          👤
        </div>

        <div>
          <h2>{customer.name}</h2>

          <p>{customer.phone}</p>
        </div>

      </section>

      <section className="customer-due-card">

        <span>Current Due</span>

        <strong>
          ₹{customer.due.toLocaleString("en-IN")}
        </strong>

        <small>
          {customer.due > 0
            ? "Amount customer se lena hai"
            : "No pending payment"}
        </small>

      </section>

      <section className="transaction-form">

        <h2>Add Transaction</h2>

        <label>Amount</label>

        <input
          type="number"
          min="0"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              Math.max(0, Number(e.target.value))
            )
          }
        />

        <label>Note</label>

        <input
          type="text"
          placeholder="Example: Grocery / Cash"
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
        />

        <div className="transaction-buttons">

          <button
            className="credit-button"
            onClick={addCredit}
          >
            + Udhaar
          </button>

          <button
            className="payment-button"
            onClick={receivePayment}
          >
            ₹ Payment Received
          </button>

        </div>

        {message && (
          <p className="transaction-message">
            {message}
          </p>
        )}

      </section>

      <section className="transaction-history">

        <h2>Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="empty-transactions">
            <div>📋</div>

            <h3>No Transactions Yet</h3>

            <p>
              Customer ki transactions yahan dikhenगी.
            </p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              className="transaction-item"
              key={transaction.id}
            >

              <div
                className={
                  transaction.type === "credit"
                    ? "transaction-icon credit"
                    : "transaction-icon payment"
                }
              >
                {transaction.type === "credit"
                  ? "↑"
                  : "↓"}
              </div>

              <div className="transaction-info">

                <strong>
                  {transaction.note}
                </strong>

                <span>
                  {transaction.type === "credit"
                    ? "Udhaar Added"
                    : "Payment Received"}
                </span>

                <small>
                  {new Date(
                    transaction.date
                  ).toLocaleString("en-IN")}
                </small>

              </div>

              <div
                className={
                  transaction.type === "credit"
                    ? "transaction-amount credit"
                    : "transaction-amount payment"
                }
              >
                {transaction.type === "credit"
                  ? "+"
                  : "-"}
                ₹
                {transaction.amount.toLocaleString(
                  "en-IN"
                )}
              </div>

            </div>
          ))
        )}

      </section>

    </main>
  );
}
