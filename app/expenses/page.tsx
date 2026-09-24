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

const EXPENSE_KEY = "hisabpro_expenses";
const CASHBOOK_KEY = "hisabpro_cashbook";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  function loadExpenses() {
    try {
      const savedExpenses = JSON.parse(
        localStorage.getItem(EXPENSE_KEY) || "[]"
      );

      setExpenses(
        Array.isArray(savedExpenses)
          ? savedExpenses
          : []
      );
    } catch {
      setExpenses([]);
    }
  }

  function addExpense() {
    setMessage("");

    if (!title.trim()) {
      setMessage("Expense name required.");
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setMessage("Valid amount enter karein.");
      return;
    }

    try {
      const savedExpenses: Expense[] =
        JSON.parse(
          localStorage.getItem(EXPENSE_KEY) || "[]"
        );

      const savedCashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(CASHBOOK_KEY) || "[]"
        );

      const expenseId = Date.now();
      const expenseDate =
        new Date().toISOString();

      const expense: Expense = {
        id: expenseId,
        title: title.trim(),
        category:
          category.trim() || "General",
        amount,
        note: note.trim(),
        date: expenseDate,
      };

      const updatedExpenses = [
        ...savedExpenses,
        expense,
      ];

      /*
       * Every business expense is a Cash Out.
       *
       * The reference fields allow us to remove
       * only this automatic Cashbook entry later.
       */
      const cashTransaction: CashTransaction = {
        id: expenseId + 1,
        type: "out",
        amount,
        category:
          category.trim() || "General",
        note:
          `Expense - ${title.trim()}` +
          (note.trim()
            ? ` - ${note.trim()}`
            : ""),
        date: expenseDate,
        referenceType: "expense",
        referenceId: expenseId,
      };

      const updatedCashbook = [
        cashTransaction,
        ...savedCashbook,
      ];

      localStorage.setItem(
        EXPENSE_KEY,
        JSON.stringify(updatedExpenses)
      );

      localStorage.setItem(
        CASHBOOK_KEY,
        JSON.stringify(updatedCashbook)
      );

      setExpenses(updatedExpenses);

      setTitle("");
      setCategory("");
      setAmount(0);
      setNote("");

      setMessage(
        `₹${amount.toLocaleString(
          "en-IN"
        )} expense added and recorded in Cashbook as Cash Out ✅`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Add expense error:",
        error
      );

      setMessage(
        "Unable to save expense."
      );
    }
  }

  function deleteExpense(expense: Expense) {
    const confirmDelete = window.confirm(
      `Delete ₹${expense.amount.toLocaleString(
        "en-IN"
      )} expense "${expense.title}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const savedExpenses: Expense[] =
        JSON.parse(
          localStorage.getItem(EXPENSE_KEY) || "[]"
        );

      const savedCashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(CASHBOOK_KEY) || "[]"
        );

      /*
       * Remove the expense itself.
       */
      const updatedExpenses =
        savedExpenses.filter(
          (item) =>
            Number(item.id) !==
            Number(expense.id)
        );

      /*
       * Remove only the automatic Cashbook
       * transaction created for this expense.
       *
       * Manual Cashbook entries remain untouched.
       */
      const updatedCashbook =
        savedCashbook.filter(
          (transaction) =>
            !(
              transaction.referenceType ===
                "expense" &&
              Number(
                transaction.referenceId
              ) === Number(expense.id)
            )
        );

      localStorage.setItem(
        EXPENSE_KEY,
        JSON.stringify(updatedExpenses)
      );

      localStorage.setItem(
        CASHBOOK_KEY,
        JSON.stringify(updatedCashbook)
      );

      setExpenses(updatedExpenses);

      setMessage(
        `Expense deleted and linked Cashbook entry removed successfully.`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Delete expense error:",
        error
      );

      setMessage(
        "Unable to delete expense."
      );
    }
  }

  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

  const today = new Date();

  const todayExpenses = expenses.filter(
    (expense) => {
      const expenseDate = new Date(
        expense.date
      );

      return (
        expenseDate.getDate() ===
          today.getDate() &&
        expenseDate.getMonth() ===
          today.getMonth() &&
        expenseDate.getFullYear() ===
          today.getFullYear()
      );
    }
  );

  const todayExpenseAmount =
    todayExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

  return (
    <main className="expenses-page">

      <header className="expenses-header">

        <button
          onClick={() =>
            window.history.back()
          }
          className="back-button"
        >
          ← Back
        </button>

        <h1>Expenses</h1>

        <span></span>

      </header>

      <section className="expense-stats">

        <div>
          <span>Total Expenses</span>

          <strong>
            ₹
            {totalExpenses.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <div>
          <span>Today's Expenses</span>

          <strong>
            ₹
            {todayExpenseAmount.toLocaleString(
              "en-IN"
            )}
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
              Math.max(
                0,
                Number(e.target.value)
              )
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
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </small>

                </div>

                <div className="expense-right">

                  <strong>
                    -₹
                    {Number(
                      expense.amount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <button
                    onClick={() =>
                      deleteExpense(
                        expense
                      )
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
