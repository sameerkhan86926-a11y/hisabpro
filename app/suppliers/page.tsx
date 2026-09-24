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

const STORAGE_KEY = "hisabpro_suppliers";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [due, setDue] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSuppliers();
  }, []);

  function loadSuppliers() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      setSuppliers(Array.isArray(saved) ? saved : []);
    } catch {
      setSuppliers([]);
    }
  }

  function saveSupplier() {
    if (!name.trim()) {
      setMessage("Supplier name required.");
      return;
    }

    const supplier: Supplier = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: email.trim(),
      due: Math.max(0, Number(due) || 0),
      createdAt: new Date().toISOString(),
    };

    const updated = [...suppliers, supplier];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setSuppliers(updated);

    setName("");
    setPhone("");
    setAddress("");
    setEmail("");
    setDue("");

    setShowForm(false);
    setMessage("Supplier added successfully.");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  function deleteSupplier(id: number) {
    const supplier = suppliers.find(
      (item) => item.id === id
    );

    if (!supplier) return;

    const confirmed = window.confirm(
      `Delete supplier "${supplier.name}"?`
    );

    if (!confirmed) return;

    const updated = suppliers.filter(
      (item) => item.id !== id
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setSuppliers(updated);
  }

  const totalDue = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.due || 0),
    0
  );

  return (
    <main className="supplier-page">

      {/* HEADER */}
      <header className="supplier-header">

        <button
          type="button"
          className="supplier-back"
          onClick={() => window.history.back()}
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <h1>Suppliers</h1>
          <p>Manage your suppliers</p>
        </div>

      </header>

      {/* SUMMARY */}
      <section className="supplier-summary">

        <div className="supplier-summary-card">
          <span>Total Suppliers</span>
          <strong>{suppliers.length}</strong>
        </div>

        <div className="supplier-summary-card due">
          <span>Supplier Payable</span>
          <strong>
            ₹
            {totalDue.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>

      </section>

      {/* ADD BUTTON */}
      <section className="supplier-actions">

        <button
          type="button"
          className="supplier-add-button"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
          }}
        >
          <span>＋</span>
          Add Supplier
        </button>

      </section>

      {/* FORM */}
      {showForm && (
        <section className="supplier-form-card">

          <div className="supplier-section-title">
            <h2>New Supplier</h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
          </div>

          <div className="supplier-form">

            <label>
              Supplier Name
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter supplier name"
              />
            </label>

            <label>
              Mobile Number
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter mobile number"
              />
            </label>

            <label>
              Address
              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="Enter supplier address"
                rows={3}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="supplier@example.com"
              />
            </label>

            <label>
              Opening Payable
              <div className="supplier-money-input">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  value={due}
                  onChange={(e) =>
                    setDue(e.target.value)
                  }
                  placeholder="0"
                />
              </div>
            </label>

            <button
              type="button"
              className="supplier-save-button"
              onClick={saveSupplier}
            >
              Save Supplier
            </button>

          </div>

        </section>
      )}

      {/* MESSAGE */}
      {message && (
        <div className="supplier-message">
          {message}
        </div>
      )}

      {/* SUPPLIER LIST */}
      <section className="supplier-list-section">

        <div className="supplier-list-title">
          <h2>Supplier List</h2>

          <span>{suppliers.length}</span>
        </div>

        {suppliers.length === 0 ? (
          <div className="supplier-empty">

            <div className="supplier-empty-icon">
              <svg viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />
                <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
              </svg>
            </div>

            <h3>No suppliers yet</h3>

            <p>
              Add your first supplier to start
              managing purchases.
            </p>

          </div>
        ) : (
          <div className="supplier-list">

            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="supplier-card"
              >

                <div className="supplier-avatar">
                  {supplier.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="supplier-info">

                  <strong>{supplier.name}</strong>

                  {supplier.phone && (
                    <small>
                      {supplier.phone}
                    </small>
                  )}

                  {supplier.address && (
                    <small>
                      {supplier.address}
                    </small>
                  )}

                  <span
                    className={
                      Number(supplier.due) > 0
                        ? "supplier-due"
                        : "supplier-paid"
                    }
                  >
                    {Number(supplier.due) > 0
                      ? `Payable: ₹${Number(
                          supplier.due
                        ).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}`
                      : "No payable"}
                  </span>

                </div>

                <button
                  type="button"
                  className="supplier-delete"
                  onClick={() =>
                    deleteSupplier(supplier.id)
                  }
                  aria-label="Delete supplier"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M4 7h16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M6 7l1 14h10l1-14" />
                    <path d="M9 7V4h6v3" />
                  </svg>
                </button>

              </div>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}
