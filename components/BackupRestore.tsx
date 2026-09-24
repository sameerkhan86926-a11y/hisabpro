"use client";

import React, { useRef, useState } from "react";

const BACKUP_KEYS = [
  "hisabpro_products",
  "hisabpro_customers",
  "hisabpro_sales",
  "hisabpro_transactions",
  "hisabpro_expenses",
  "hisabpro_purchases",
  "hisabpro_suppliers",
  "hisabpro_supplier_payments",
  "hisabpro_returns",
  "hisabpro_cashbook",
  "hisabpro_businesses",
  "hisabpro_active_business",
  "hisabpro_business",
  "hisabpro_app_lock",
  "hisabpro_app_lock_pin_hash",
  "hisabpro_app_lock_pin_length",
  "hisabpro_app_lock_auto",
];

type BackupData = {
  app: string;
  version: number;
  createdAt: string;
  data: Record<string, string | null>;
};

export default function BackupRestore() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const showMessage = (text: string) => {
    setError("");
    setMessage(text);
  };

  const showError = (text: string) => {
    setMessage("");
    setError(text);
  };

  const createBackup = () => {
    try {
      setBusy(true);
      setMessage("");
      setError("");

      const data: Record<string, string | null> = {};

      BACKUP_KEYS.forEach((key) => {
        data[key] = localStorage.getItem(key);
      });

      const backup: BackupData = {
        app: "HisabPro",
        version: 1,
        createdAt: new Date().toISOString(),
        data,
      };

      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);

      const date = new Date();
      const dateText = date.toISOString().slice(0, 10);

      const link = document.createElement("a");
      link.href = url;
      link.download = `hisabpro-backup-${dateText}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      showMessage("Backup file successfully created.");
    } catch {
      showError("Backup create nahi ho saka. Dobara try karo.");
    } finally {
      setBusy(false);
    }
  };

  const restoreBackup = () => {
    setMessage("");
    setError("");
    fileInputRef.current?.click();
  };

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setBusy(true);
      setMessage("");
      setError("");

      if (!file.name.toLowerCase().endsWith(".json")) {
        showError("Sirf HisabPro JSON backup file select karo.");
        return;
      }

      const text = await file.text();

      let backup: BackupData;

      try {
        backup = JSON.parse(text);
      } catch {
        showError("Backup file valid JSON nahi hai.");
        return;
      }

      if (
        !backup ||
        backup.app !== "HisabPro" ||
        !backup.data ||
        typeof backup.data !== "object"
      ) {
        showError("Ye valid HisabPro backup file nahi hai.");
        return;
      }

      const confirmed = window.confirm(
        "Restore karne se current HisabPro data replace ho jayega.\n\n" +
          "Continue karna hai?"
      );

      if (!confirmed) {
        return;
      }

      const secondConfirmed = window.confirm(
        "Final confirmation:\n\n" +
          "Current data replace karke backup restore karein?"
      );

      if (!secondConfirmed) {
        return;
      }

      BACKUP_KEYS.forEach((key) => {
        const value = backup.data[key];

        if (typeof value === "string") {
          localStorage.setItem(key, value);
        } else {
          localStorage.removeItem(key);
        }
      });

      showMessage(
        "Backup successfully restored. Page reload ho raha hai..."
      );

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      showError(
        "Backup restore nahi ho saka. File check karke dobara try karo."
      );
    } finally {
      setBusy(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="backup-container">
      <div className="backup-card">
        <h2>Backup & Restore</h2>

        <p>
          Apne HisabPro data ka backup rakho aur zarurat padne par restore karo.
        </p>

        <div className="backup-actions">
          <button
            type="button"
            className="backup-button backup-primary"
            onClick={createBackup}
            disabled={busy}
          >
            {busy ? "Processing..." : "Create Backup"}
          </button>

          <button
            type="button"
            className="backup-button backup-secondary"
            onClick={restoreBackup}
            disabled={busy}
          >
            Restore Backup
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFile}
          style={{ display: "none" }}
        />

        {message && (
          <div className="backup-message backup-success">
            {message}
          </div>
        )}

        {error && (
          <div className="backup-message backup-error">
            {error}
          </div>
        )}

        <div className="backup-info">
          <strong>Backup me kya save hoga?</strong>

          <ul>
            <li>Products & Stock</li>
            <li>Sales & Sales History</li>
            <li>Customers & Khata</li>
            <li>Purchases</li>
            <li>Suppliers & Supplier Payments</li>
            <li>Expenses</li>
            <li>Cashbook</li>
            <li>Returns</li>
            <li>Business Settings</li>
            <li>App Settings</li>
          </ul>
        </div>

        <div className="backup-warning">
          Restore karne se current data replace ho sakta hai. Restore karne se
          pehle current data ka backup bana lena safe rahega.
        </div>
      </div>
    </div>
  );
}
