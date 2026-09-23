"use client";

import { useEffect, useState } from "react";

type Business = {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  gstin: string;
  email: string;
};

const emptyBusiness: Business = {
  businessName: "",
  ownerName: "",
  phone: "",
  address: "",
  gstin: "",
  email: "",
};

export default function SettingsPage() {
  const [business, setBusiness] =
    useState<Business>(emptyBusiness);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(
      "hisabpro_business"
    );

    if (saved) {
      setBusiness(JSON.parse(saved));
    }
  }, []);

  function handleChange(
    field: keyof Business,
    value: string
  ) {
    setBusiness((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
  }

  function saveBusiness() {
    localStorage.setItem(
      "hisabpro_business",
      JSON.stringify(business)
    );

    setMessage(
      "Business details saved successfully ✅"
    );
  }

  function clearBusiness() {
    const confirmClear = window.confirm(
      "Clear all business details?"
    );

    if (!confirmClear) {
      return;
    }

    localStorage.removeItem(
      "hisabpro_business"
    );

    setBusiness(emptyBusiness);

    setMessage(
      "Business details cleared successfully."
    );
  }

  return (
    <main className="settings-page">

      <header className="settings-header">

        <button
          onClick={() => window.history.back()}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Business Settings</h1>

        <span></span>

      </header>

      <section className="settings-box">

        <div className="settings-title">
          <div className="settings-icon">
            🏪
          </div>

          <div>
            <h2>Business Details</h2>
            <p>
              These details will appear on your invoices.
            </p>
          </div>
        </div>

        <div className="settings-note">
          <strong>Optional</strong>
          <span>
            You can leave any field blank. Only filled
            details will appear on the invoice.
          </span>
        </div>

        <div className="settings-form">

          <div className="form-group">
            <label>Business / Shop Name</label>

            <input
              type="text"
              placeholder="e.g. Sameer Garments"
              value={business.businessName}
              onChange={(e) =>
                handleChange(
                  "businessName",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Owner Name</label>

            <input
              type="text"
              placeholder="e.g. Sameer Khan"
              value={business.ownerName}
              onChange={(e) =>
                handleChange(
                  "ownerName",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={business.phone}
              onChange={(e) =>
                handleChange(
                  "phone",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Address</label>

            <textarea
              placeholder="Shop / Business address"
              value={business.address}
              onChange={(e) =>
                handleChange(
                  "address",
                  e.target.value
                )
              }
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>GSTIN</label>

            <input
              type="text"
              placeholder="Optional"
              value={business.gstin}
              onChange={(e) =>
                handleChange(
                  "gstin",
                  e.target.value.toUpperCase()
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Optional"
              value={business.email}
              onChange={(e) =>
                handleChange(
                  "email",
                  e.target.value
                )
              }
            />
          </div>

        </div>

        <button
          className="save-business"
          onClick={saveBusiness}
        >
          Save Business Details
        </button>

        <button
          className="clear-business"
          onClick={clearBusiness}
        >
          Clear Details
        </button>

        {message && (
          <p className="settings-message">
            {message}
          </p>
        )}

      </section>

    </main>
  );
}
