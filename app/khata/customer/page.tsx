"use client";

import { useEffect, useState } from "react";

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

type Transaction = {
  id: number;
  customerId: number;
  type: "credit" | "payment";
  amount: number;
  note: string;
  date: string;
  saleId?: number;
};

export default function CustomerPage() {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const [editing, setEditing] =
    useState(false);

  const [editName, setEditName] =
    useState("");

  const [editPhone, setEditPhone] =
    useState("");

  const [editAddress, setEditAddress] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [editPhoto, setEditPhoto] =
    useState("");

  useEffect(() => {
    loadCustomer();
  }, []);

  function loadCustomer() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const customerId = Number(
      params.get("id")
    );

    const savedCustomers: Customer[] =
      JSON.parse(
        localStorage.getItem(
          "hisabpro_customers"
        ) || "[]"
      );

    const foundCustomer =
      savedCustomers.find(
        (item) =>
          item.id === customerId
      );

    setCustomer(
      foundCustomer || null
    );

    const savedTransactions:
      Transaction[] = JSON.parse(
        localStorage.getItem(
          "hisabpro_transactions"
        ) || "[]"
      );

    const customerTransactions =
      savedTransactions
        .filter(
          (item) =>
            item.customerId ===
            customerId
        )
        .reverse();

    setTransactions(
      customerTransactions
    );
  }

  function startEdit() {
    if (!customer) return;

    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditAddress(
      customer.address || ""
    );
    setEditEmail(
      customer.email || ""
    );
    setEditPhoto(
      customer.photo || ""
    );

    setEditing(true);
    setMessage("");
  }

  function handleEditPhoto(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage(
        "Please select an image file."
      );
      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setMessage(
        "Photo size 2MB se kam honi chahiye."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setEditPhoto(
        reader.result as string
      );

      setMessage("");
    };

    reader.readAsDataURL(file);
  }

  function saveCustomerChanges() {
    if (!customer) return;

    if (!editName.trim()) {
      setMessage(
        "Customer name required."
      );
      return;
    }

    if (!editPhone.trim()) {
      setMessage(
        "Mobile number required."
      );
      return;
    }

    const updatedCustomer:
      Customer = {
        ...customer,

        name: editName.trim(),

        phone: editPhone.trim(),

        address:
          editAddress.trim(),

        email:
          editEmail.trim(),

        photo: editPhoto,
      };

    const savedCustomers:
      Customer[] = JSON.parse(
        localStorage.getItem(
          "hisabpro_customers"
        ) || "[]"
      );

    const updatedCustomers =
      savedCustomers.map(
        (item) =>
          item.id === customer.id
            ? updatedCustomer
            : item
      );

    localStorage.setItem(
      "hisabpro_customers",
      JSON.stringify(
        updatedCustomers
      )
    );

    setCustomer(
      updatedCustomer
    );

    setEditing(false);

    setMessage(
      "Customer profile updated successfully ✅"
    );
  }

  function deleteCustomer() {
    if (!customer) return;

    const confirmed =
      window.confirm(
        `Delete ${customer.name}? This action cannot be undone.`
      );

    if (!confirmed) return;

    const savedCustomers:
      Customer[] = JSON.parse(
        localStorage.getItem(
          "hisabpro_customers"
        ) || "[]"
      );

    const updatedCustomers =
      savedCustomers.filter(
        (item) =>
          item.id !== customer.id
      );

    localStorage.setItem(
      "hisabpro_customers",
      JSON.stringify(
        updatedCustomers
      )
    );

    window.location.href =
      "/hisabpro/khata/";
  }

  function saveData(
    updatedCustomer: Customer,
    newTransaction: Transaction
  ) {
    const savedCustomers:
      Customer[] = JSON.parse(
        localStorage.getItem(
          "hisabpro_customers"
        ) || "[]"
      );

    const updatedCustomers =
      savedCustomers.map(
        (item) =>
          item.id ===
          updatedCustomer.id
            ? updatedCustomer
            : item
      );

    localStorage.setItem(
      "hisabpro_customers",
      JSON.stringify(
        updatedCustomers
      )
    );

    const oldTransactions:
      Transaction[] = JSON.parse(
        localStorage.getItem(
          "hisabpro_transactions"
        ) || "[]"
      );

    oldTransactions.push(
      newTransaction
    );

    localStorage.setItem(
      "hisabpro_transactions",
      JSON.stringify(
        oldTransactions
      )
    );

    setCustomer(
      updatedCustomer
    );

    setTransactions(
      (old) => [
        newTransaction,
        ...old,
      ]
    );
  }

  function addCredit() {
    if (!customer) return;

    if (amount <= 0) {
      setMessage(
        "Amount enter karein."
      );
      return;
    }

    const transaction:
      Transaction = {
        id: Date.now(),
        customerId:
          customer.id,
        type: "credit",
        amount,
        note:
          note.trim() ||
          "Udhaar",
        date:
          new Date().toISOString(),
      };

    const updatedCustomer:
      Customer = {
        ...customer,
        due:
          customer.due +
          amount,
      };

    saveData(
      updatedCustomer,
      transaction
    );

    setAmount(0);
    setNote("");

    setMessage(
      "Udhaar added successfully ✅"
    );
  }

  function receivePayment() {
    if (!customer) return;

    if (amount <= 0) {
      setMessage(
        "Amount enter karein."
      );
      return;
    }

    if (amount > customer.due) {
      setMessage(
        "Payment due se zyada nahi ho sakti."
      );
      return;
    }

    const transaction:
      Transaction = {
        id: Date.now(),
        customerId:
          customer.id,
        type: "payment",
        amount,
        note:
          note.trim() ||
          "Payment Received",
        date:
          new Date().toISOString(),
      };

    const updatedCustomer:
      Customer = {
        ...customer,
        due:
          customer.due -
          amount,
      };

    saveData(
      updatedCustomer,
      transaction
    );

    setAmount(0);
    setNote("");

    setMessage(
      "Payment received successfully ✅"
    );
  }

  const totalCredit =
    transactions
      .filter(
        (item) =>
          item.type === "credit"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

  const totalPayment =
    transactions
      .filter(
        (item) =>
          item.type === "payment"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

  if (!customer) {
    return (
      <main className="customer-detail-page">

        <header className="customer-detail-header">

          <button
            onClick={() =>
              window.history.back()
            }
            className="back-button"
          >
            ← Back
          </button>

          <h1>
            Customer
          </h1>

          <span></span>

        </header>

        <div className="customer-not-found">

          <h2>
            Customer Not Found
          </h2>

          <p>
            Customer record nahi mila.
          </p>

          <a
            href="/hisabpro/khata/"
          >
            Back to Khata
          </a>

        </div>

      </main>
    );
  }

  return (
    <main className="customer-detail-page">

      {/* HEADER */}

      <header className="customer-detail-header">

        <a
          href="/hisabpro/khata/"
        >
          ← Khata
        </a>

        <h1>
          Customer
        </h1>

        <button
          onClick={startEdit}
          className="edit-customer-top"
        >
          ✏️ Edit
        </button>

      </header>

      {/* PROFILE */}

      <section className="customer-profile">

        <div className="customer-avatar-large">

          {customer.photo ? (

            <img
              src={customer.photo}
              alt={customer.name}
            />

          ) : (

            <span>
              {customer.name
                .charAt(0)
                .toUpperCase()}
            </span>

          )}

        </div>

        <div className="customer-profile-info">

          <h2>
            {customer.name}
          </h2>

          <p>
            📱 {customer.phone}
          </p>

          {customer.email && (
            <p>
              ✉️ {customer.email}
            </p>
          )}

          {customer.address && (
            <p>
              📍 {customer.address}
            </p>
          )}

          <small>
            Customer since{" "}
            {new Date(
              customer.createdAt
            ).toLocaleDateString(
              "en-IN"
            )}
          </small>

        </div>

      </section>

      {/* QUICK ACTIONS */}

      <section className="customer-quick-actions">

        <a
          href={`tel:${customer.phone}`}
          className="quick-call"
        >
          📞
          <span>
            Call
          </span>
        </a>

        <a
          href={`https://wa.me/91${customer.phone.replace(
            /\D/g,
            ""
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="quick-whatsapp"
        >
          💬
          <span>
            WhatsApp
          </span>
        </a>

        <button
          onClick={startEdit}
          className="quick-edit"
        >
          ✏️
          <span>
            Edit
          </span>
        </button>

      </section>

      {/* DUE */}

      <section className="customer-due-card">

        <span>
          Current Due
        </span>

        <strong>
          ₹
          {Number(
            customer.due || 0
          ).toLocaleString(
            "en-IN"
          )}
        </strong>

        <small>
          {customer.due > 0
            ? "Amount customer se lena hai"
            : "No pending payment"}
        </small>

      </section>

      {/* SUMMARY */}

      <section className="customer-summary">

        <div>
          <span>
            Total Udhaar
          </span>

          <strong>
            ₹
            {totalCredit.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <div>
          <span>
            Total Payment
          </span>

          <strong>
            ₹
            {totalPayment.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <div>
          <span>
            Transactions
          </span>

          <strong>
            {transactions.length}
          </strong>
        </div>

      </section>

      {/* EDIT PROFILE */}

      {editing && (

        <section className="customer-edit-form">

          <div className="edit-form-header">

            <h2>
              Edit Customer
            </h2>

            <button
              onClick={() =>
                setEditing(false)
              }
            >
              ✕
            </button>

          </div>

          <div className="edit-photo-section">

            <div className="edit-photo-preview">

              {editPhoto ? (

                <img
                  src={editPhoto}
                  alt={editName}
                />

              ) : (

                <span>
                  {editName
                    ? editName
                        .charAt(0)
                        .toUpperCase()
                    : "👤"}
                </span>

              )}

            </div>

            <div>

              <label className="photo-upload-button">

                Change Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleEditPhoto
                  }
                />

              </label>

              {editPhoto && (
                <button
                  type="button"
                  className="remove-photo-button"
                  onClick={() =>
                    setEditPhoto("")
                  }
                >
                  Remove
                </button>
              )}

            </div>

          </div>

          <label>
            Customer Name
          </label>

          <input
            type="text"
            value={editName}
            onChange={(e) =>
              setEditName(
                e.target.value
              )
            }
          />

          <label>
            Mobile Number
          </label>

          <input
            type="tel"
            value={editPhone}
            onChange={(e) =>
              setEditPhone(
                e.target.value
              )
            }
          />

          <label>
            Address
          </label>

          <textarea
            rows={3}
            value={editAddress}
            onChange={(e) =>
              setEditAddress(
                e.target.value
              )
            }
          />

          <label>
            Email
          </label>

          <input
            type="email"
            value={editEmail}
            onChange={(e) =>
              setEditEmail(
                e.target.value
              )
            }
          />

          <div className="edit-form-buttons">

            <button
              className="save-customer-button"
              onClick={
                saveCustomerChanges
              }
            >
              Save Changes
            </button>

            <button
              className="cancel-edit-button"
              onClick={() =>
                setEditing(false)
              }
            >
              Cancel
            </button>

          </div>

          {message && (
            <p className="transaction-message">
              {message}
            </p>
          )}

        </section>

      )}

      {/* TRANSACTION FORM */}

      <section className="transaction-form">

        <h2>
          Add Transaction
        </h2>

        <label>
          Amount
        </label>

        <input
          type="number"
          min="0"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              Math.max(
                0,
                Number(
                  e.target.value
                )
              )
            )
          }
        />

        <label>
          Note
        </label>

        <input
          type="text"
          placeholder="Example: Grocery / Cash"
          value={note}
          onChange={(e) =>
            setNote(
              e.target.value
            )
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
            onClick={
              receivePayment
            }
          >
            ₹ Payment Received
          </button>

        </div>

        {message && !editing && (
          <p className="transaction-message">
            {message}
          </p>
        )}

      </section>

      {/* TRANSACTION HISTORY */}

      <section className="transaction-history">

        <div className="transaction-history-header">

          <h2>
            Transaction History
          </h2>

          <span>
            {transactions.length}
          </span>

        </div>

        {transactions.length === 0 ? (

          <div className="empty-transactions">

            <div>
              📋
            </div>

            <h3>
              No Transactions Yet
            </h3>

            <p>
              Customer ki transactions
              yahan dikhenगी.
            </p>

          </div>

        ) : (

          transactions.map(
            (transaction) => (

              <div
                className="transaction-item"
                key={transaction.id}
              >

                <div
                  className={
                    transaction.type ===
                    "credit"
                      ? "transaction-icon credit"
                      : "transaction-icon payment"
                  }
                >
                  {transaction.type ===
                  "credit"
                    ? "↑"
                    : "↓"}
                </div>

                <div className="transaction-info">

                  <strong>
                    {transaction.note}
                  </strong>

                  <span>
                    {transaction.type ===
                    "credit"
                      ? "Udhaar Added"
                      : "Payment Received"}
                  </span>

                  <small>
                    {new Date(
                      transaction.date
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </small>

                </div>

                <div
                  className={
                    transaction.type ===
                    "credit"
                      ? "transaction-amount credit"
                      : "transaction-amount payment"
                  }
                >

                  {transaction.type ===
                  "credit"
                    ? "+"
                    : "-"}

                  ₹
                  {Number(
                    transaction.amount
                  ).toLocaleString(
                    "en-IN"
                  )}

                </div>

              </div>

            )
          )

        )}

      </section>

      {/* DELETE */}

      <section className="customer-danger-zone">

        <button
          onClick={
            deleteCustomer
          }
        >
          🗑️ Delete Customer
        </button>

      </section>

    </main>
  );
}
