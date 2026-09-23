"use client";

import { useEffect, useState } from "react";

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  note: string;
  date: string;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedExpenses = JSON.parse(
      localStorage.getItem("hisabpro_expenses") || "[]"
    );

    setExpenses(savedExpenses);
  }, []);

  function addExpense() {
    setMessage("");

    if (!title.trim()) {
      setMessage("Expense name required.");
      return;
    }

    if (amount <= 0) {
      setMessage("Valid amount enter karein.");
      return;
    }

    const expense: Expense = {
      id: Date.now(),
      title: title.trim(),
      category: category.trim() || "General",
      amount,
      note: note.trim(),
      date: new Date().toISOString(),
    };

    const updatedExpenses = [
      ...expenses,
      expense,
    ];

    setExpenses(updatedExpenses);

    localStorage.setItem(
      "hisabpro_expenses",
      JSON.stringify(updatedExpenses)
    );

    setTitle("");
    setCategory("");
    setAmount(0);
    setNote("");

    setMessage("Expense added successfully ✅");
  }

  function deleteExpense(id: number) {
    const updatedExpenses = expenses.filter(
      (expense) => expense.id !== id
    );

    setExpenses(updatedExpenses);

    localStorage.setItem(
      "hisabpro_expenses",
      JSON.stringify(updatedExpenses)
    );
  }

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const today = new Date();

  const todayExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    return (
      expenseDate.getDate() === today.getDate() &&
      expenseDate.getMonth() === today.getMonth() &&
      expenseDate.getFullYear() === today.getFullYear()
    );
  });

  const todayExpenseAmount = todayExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <main className="expenses-page">

      <header className="expenses-header">

        <a href="/hisabpro/">
          ← Dashboard
        </a>

        <h1>Expenses</h1>

        <span></span>

      </header>

      <section className="expense-stats">

        <div>
          <span>Total Expenses</span>

          <strong>
            ₹{totalExpenses.toLocaleString("en-IN")}
          </strong>
        </div>

        <div>
          <span>Today's Expenses</span>

          <strong>
            ₹{todayExpenseAmount.toLocaleString("en-IN")}
          </strong>
        </div>

        <div>
          <span>Total Entries</span>

          <strong>
            {expenses.length}
          </strong>
        </div>

      </section>

      <section className="expense-form">

        <h2>Add Expense</h2>

        <label>Expense Name</label>

        <input
          type="text"
          placeholder="Example: Shop Rent"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <label>Category</label>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >

          <option value="">
            Select Category
          </option>

          <option value="Rent">
            Rent
          </option>

          <option value="Electricity">
            Electricity
          </option>

          <option value="Salary">
            Salary
          </option>

          <option value="Transport">
            Transport
          </option>

          <option value="Marketing">
            Marketing
          </option>

          <option value="Purchase">
            Purchase
          </option>

          <option value="Other">
            Other
          </option>

        </select>

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
          placeholder="Optional note"
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
        />

        <button onClick={addExpense}>
          + Add Expense
        </button>

        {message && (
          <p className="expense-message">
            {message}
          </p>
        )}

      </section>

      <section className="expense-list">

        <h2>Expense History</h2>

        {expenses.length === 0 ? (

          <div className="empty-expenses">

            <div>💰</div>

            <h3>No Expenses Yet</h3>

            <p>
              Add your first business expense.
            </p>

          </div>

        ) : (

          [...expenses]
            .reverse()
            .map((expense) => (

              <div
                className="expense-item"
                key={expense.id}
              >

                <div className="expense-icon">
                  ₹
                </div>

                <div className="expense-info">

                  <strong>
                    {expense.title}
                  </strong>

                  <span>
                    {expense.category}
                  </span>

                  {expense.note && (
                    <small>
                      {expense.note}
                    </small>
                  )}

                  <small>
                    {new Date(
                      expense.date
                    ).toLocaleString("en-IN")}
                  </small>

                </div>

                <div className="expense-right">

                  <strong>
                    -₹
                    {expense.amount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <button
                    onClick={() =>
                      deleteExpense(expense.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

        )}

      </section>

    </main>
  );
}
