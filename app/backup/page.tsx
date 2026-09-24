"use client";

import BackupRestore from "../../components/BackupRestore";

export default function BackupPage() {
  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>Backup & Restore</h1>
          <p>Protect your HisabPro business data</p>
        </div>

        <button
          type="button"
          className="header-back-button"
          onClick={() => {
            window.location.href = "/hisabpro/more/";
          }}
        >
          Back
        </button>
      </header>

      <section className="backup-page-section">
        <BackupRestore />
      </section>
    </main>
  );
}
