"use client";

import { useEffect, useState } from "react";

type DenominationKey = "2000" | "500" | "200" | "100" | "50" | "20" | "10" | "coins";

export default function CashDrawerPage() {
  const [openingCash, setOpeningCash] = useState<string>("0");
  const [cashSales, setCashSales] = useState<number>(0);
  const [cashExpenses, setCashExpenses] = useState<number>(0);

  // Note Denomination Counter
  const [notes, setNotes] = useState<Record<DenominationKey, string>>({
    "2000": "",
    "500": "",
    "200": "",
    "100": "",
    "50": "",
    "20": "",
    "10": "",
    coins: "",
  });

  const [storeName, setStoreName] = useState<string>("HisabPro Store");

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // 1. Fetch Store Name
      const savedBusinesses = localStorage.getItem("hisabpro_businesses");
      const activeId = localStorage.getItem("hisabpro_active_business");
      const savedBusiness = localStorage.getItem("hisabpro_business");

      if (savedBusinesses) {
        const list = JSON.parse(savedBusinesses);
        if (Array.isArray(list) && list.length > 0) {
          const current = list.find((b: any) => b.id === Number(activeId)) || list[0];
          if (current?.businessName) setStoreName(current.businessName);
        }
      } else if (savedBusiness) {
        const single = JSON.parse(savedBusiness);
        if (single?.businessName) setStoreName(single.businessName);
      }

      // 2. Fetch Opening Cash for today
      const savedOpening = localStorage.getItem(`hisabpro_opening_cash_${todayStr}`);
      if (savedOpening) setOpeningCash(savedOpening);

      // 3. Auto-calculate Today's Cash Sales from hisabpro_sales
      const savedSales = JSON.parse(localStorage.getItem("hisabpro_sales") || "[]");
      const todayCashTotal = savedSales
        .filter((sale: any) => {
          const saleDate = sale.date ? sale.date.split("T")[0] : "";
          const isCash = sale.paymentType !== "credit" && (sale.paymentMode || "cash") === "cash";
          return saleDate === todayStr && isCash;
        })
        .reduce((sum: number, sale: any) => sum + Number(sale.total || 0), 0);

      setCashSales(todayCashTotal);

      // 4. Auto-calculate Today's Expenses from hisabpro_expenses
      const savedExpenses = JSON.parse(localStorage.getItem("hisabpro_expenses") || "[]");
      const todayExpTotal = savedExpenses
        .filter((exp: any) => {
          const expDate = exp.date ? exp.date.split("T")[0] : "";
          return expDate === todayStr;
        })
        .reduce((sum: number, exp: any) => sum + Number(exp.amount || 0), 0);

      setCashExpenses(todayExpTotal);

      // 5. Restore saved notes if any
      const savedNotes = localStorage.getItem(`hisabpro_notes_${todayStr}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch {}
  }, []);

  function handleOpeningChange(val: string) {
    setOpeningCash(val);
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem(`hisabpro_opening_cash_${todayStr}`, val);
  }

  function handleNoteChange(key: DenominationKey, val: string) {
    const updated = { ...notes, [key]: val };
    setNotes(updated);
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem(`hisabpro_notes_${todayStr}`, JSON.stringify(updated));
  }

  // Calculate Physical Cash counted in drawer
  const countedCash =
    (Number(notes["2000"]) || 0) * 2000 +
    (Number(notes["500"]) || 0) * 500 +
    (Number(notes["200"]) || 0) * 200 +
    (Number(notes["100"]) || 0) * 100 +
    (Number(notes["50"]) || 0) * 50 +
    (Number(notes["20"]) || 0) * 20 +
    (Number(notes["10"]) || 0) * 10 +
    (Number(notes.coins) || 0);

  // Expected Cash = Opening + Cash Sales - Expenses
  const expectedCash = (Number(openingCash) || 0) + cashSales - cashExpenses;
  const difference = countedCash - expectedCash;

  function shareWhatsAppSummary() {
    const todayFormatted = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const statusText =
      difference === 0
        ? "✅ PERFECT MATCH (₹0)"
        : difference > 0
        ? `⚠️ EXTRA CASH (+₹${difference})`
        : `❌ SHORTAGE (-₹${Math.abs(difference)})`;

    const msg = `*DAILY CASH DRAWER CLOSING REPORT*
🏪 *${storeName}*
📅 Date: ${todayFormatted}
───────────────────────
💵 Opening Cash: ₹${Number(openingCash).toLocaleString("en-IN")}
🛒 Today's Cash Sales: ₹${cashSales.toLocaleString("en-IN")}
🔻 Petty Expenses: -₹${cashExpenses.toLocaleString("en-IN")}
───────────────────────
📌 *Expected in Drawer:* ₹${expectedCash.toLocaleString("en-IN")}
✋ *Actual Counted:* ₹${countedCash.toLocaleString("en-IN")}
🎯 *Tally Status:* ${statusText}
───────────────────────
_Generated via HisabPro_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <main style={{ padding: "16px", maxWidth: "600px", margin: "0 auto", paddingBottom: "90px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => (window.location.href = "/hisabpro/more/")}
          style={{ background: "none", border: "none", color: "#102a56", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#102a56", margin: 0 }}>Cash Drawer & Tally</h1>
        <span></span>
      </header>

      {/* Tally Verdict Alert Card */}
      <section
        style={{
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "16px",
          backgroundColor: difference === 0 ? "#ecfdf5" : difference > 0 ? "#fffbeb" : "#fef2f2",
          border: `1.5px solid ${difference === 0 ? "#10b981" : difference > 0 ? "#f59e0b" : "#ef4444"}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>
            Tally Status
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              padding: "2px 8px",
              borderRadius: "12px",
              backgroundColor: difference === 0 ? "#10b981" : difference > 0 ? "#f59e0b" : "#ef4444",
              color: "#fff",
            }}
          >
            {difference === 0 ? "MATCHED" : difference > 0 ? "SURPLUS" : "SHORTAGE"}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "900", margin: 0, color: "#1e293b" }}>
            {difference === 0
              ? "₹0 (Perfect)"
              : difference > 0
              ? `+₹${difference.toLocaleString("en-IN")}`
              : `-₹${Math.abs(difference).toLocaleString("en-IN")}`}
          </h2>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
            Counted: ₹{countedCash.toLocaleString("en-IN")}
          </span>
        </div>
      </section>

      {/* System Math Summary Card */}
      <section style={{ background: "#ffffff", padding: "14px", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b", margin: "0 0 10px 0" }}>System Expected Cash</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "3px" }}>
              Opening Cash (Subah)
            </label>
            <input
              type="number"
              value={openingCash}
              onChange={(e) => handleOpeningChange(e.target.value)}
              placeholder="0"
              style={{ width: "100%", padding: "7px 9px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "700", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#059669", marginBottom: "3px" }}>
              + Cash Sales (Today)
            </label>
            <div style={{ padding: "7px 9px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "14px", fontWeight: "700", color: "#166534" }}>
              ₹{cashSales.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#dc2626", marginBottom: "3px" }}>
              - Expenses (Galla Out)
            </label>
            <div style={{ padding: "7px 9px", borderRadius: "8px", background: "#fef2f2", border: "1px solid #fecaca", fontSize: "14px", fontWeight: "700", color: "#991b1b" }}>
              ₹{cashExpenses.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#1e293b", marginBottom: "3px" }}>
              = Expected In Drawer
            </label>
            <div style={{ padding: "7px 9px", borderRadius: "8px", background: "#f8fafc", border: "1.5px solid #94a3b8", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
              ₹{expectedCash.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </section>

      {/* Note Denomination Counter */}
      <section style={{ background: "#ffffff", padding: "14px", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Galla Note Counter</h3>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0284c7" }}>Total: ₹{countedCash.toLocaleString("en-IN")}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(["500", "200", "100", "50", "20", "10"] as DenominationKey[]).map((val) => {
            const count = Number(notes[val]) || 0;
            const subtotal = count * Number(val);
            return (
              <div key={val} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ width: "65px", fontSize: "13px", fontWeight: "700", color: "#334155" }}>₹{val} ×</span>
                <input
                  type="number"
                  placeholder="0"
                  value={notes[val]}
                  onChange={(e) => handleNoteChange(val, e.target.value)}
                  style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", textAlign: "center" }}
                />
                <span style={{ width: "85px", textAlign: "right", fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}

          {/* Coins / Chillar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ width: "65px", fontSize: "13px", fontWeight: "700", color: "#334155" }}>Coins</span>
            <input
              type="number"
              placeholder="Total Coins (₹)"
              value={notes.coins}
              onChange={(e) => handleNoteChange("coins", e.target.value)}
              style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", textAlign: "center" }}
            />
            <span style={{ width: "85px", textAlign: "right", fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
              ₹{(Number(notes.coins) || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={shareWhatsAppSummary}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            backgroundColor: "#25D366",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>📲</span> Share on WhatsApp
        </button>
      </div>
    </main>
  );
}
