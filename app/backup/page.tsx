"use client";

import Link from "next/link";
import BackupRestore from "@/components/BackupRestore"; // Agar components root me hai

export default function BackupPage() {
  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>Backup & Restore</h1>
          <p>Protect your HisabPro business data</p>
        </div>

        <Link href="/hisabpro/more/" className="header-back-button">
          Back
        </Link>
      </header>

      <section className="backup-page-section">
        <BackupRestore />
      </section>
    </main>
  );
}
