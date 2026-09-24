"use client";

import BackupRestore from "../../components/BackupRestore";

export default function BackupPage() {
  return (
    <main className="app">
      <header className="header">
        <a href="/hisabpro/more/" className="header-back-button">
          ← Back
        </a>

        <div>
          <h1>Backup & Restore</h1>
          <p>Protect your HisabPro business data</p>
        </div>
      </header>

      <section className="backup-page-section">
        <BackupRestore />
      </section>
    </main>
  );
}
