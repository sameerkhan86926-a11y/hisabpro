"use client";

import { useEffect, useState } from "react";

type DenominationKey = "500" | "200" | "100" | "50" | "20" | "10" | "coins";

export default function CashDrawerPage() {
  const [openingCash, setOpeningCash] = useState<string>("0");
  const [cashSales, setCashSales] = useState<number>(0);
  const [cashExpenses, setCashExpenses] = useState<number>(0);

  // Denominations
  const [notes, setNotes] = useState<Record<DenominationKey, string>>({
    "500": "",
    "200": "",
    "100": "",
    "50": "",
    "20": "",
    "10": "",
    coins: "",
  });

  const [storeName, setStoreName] = useState<string>("HisabPro Store");
  const [activeDate, setActiveDate] = useState<string>("");

  useEffect(() => {
    try {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      setActiveDate(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );

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

      // 2. Fetch Opening Cash
      const savedOpening = localStorage.getItem(`hisabpro_opening_cash_${todayStr}`);
      if (savedOpening) setOpeningCash(savedOpening);

      // 3. Fetch Cash Sales
      const savedSales = JSON.parse(localStorage.getItem("hisabpro_sales") || "[]");
      const todayCashTotal = savedSales
        .filter((sale: any) => {
          const saleDate = sale.date ? sale.date.split("T")[0] : "";
          const isCash = sale.paymentType !== "credit" && (sale.paymentMode || "cash") === "cash";
          return saleDate === todayStr && isCash;
        })
        .reduce((sum: number, sale: any) => sum + Number(sale.total || 0), 0);
      setCashSales(todayCashTotal);

      // 4. Fetch Cash Expenses
      const savedExpenses = JSON.parse(localStorage.getItem("hisabpro_expenses") || "[]");
      const todayExpTotal = savedExpenses
        .filter((exp: any) => {
          const expDate = exp.date ? exp.date.split("T")[0] : "";
          return expDate === todayStr;
        })
        .reduce((sum: number, exp: any) => sum + Number(exp.amount || 0), 0);
      setCashExpenses(todayExpTotal);

      // 5. Restore notes
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

  function adjustCount(key: DenominationKey, delta: number) {
    const current = Number(notes[key]) || 0;
    const nextVal = Math.max(0, current + delta);
    handleNoteChange(key, nextVal === 0 ? "" : String(nextVal));
  }

  function resetNotes() {
    if (confirm("Kya aap note counter ko reset (0) karna chahte hain?")) {
      const empty: Record<DenominationKey, string> = {
        "500": "",
        "200": "",
        "100": "",
        "50": "",
        "20": "",
        "10": "",
        coins: "",
      };
      setNotes(empty);
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(`hisabpro_notes_${todayStr}`, JSON.stringify(empty));
    }
  }

  // Calculations
  const countedCash =
    (Number(notes["500"]) || 0) * 500 +
    (Number(notes["200"]) || 0) * 200 +
    (Number(notes["100"]) || 0) * 100 +
    (Number(notes["50"]) || 0) * 50 +
    (Number(notes["20"]) || 0) * 20 +
    (Number(notes["10"]) || 0) * 10 +
    (Number(notes.coins) || 0);

  const expectedCash = (Number(openingCash) || 0) + cashSales - cashExpenses;
  const difference = countedCash - expectedCash;

  function shareWhatsAppSummary() {
    const statusText =
      difference === 0
        ? "✅ PERFECT MATCH (₹0)"
        : difference > 0
        ? `⚠️ EXTRA CASH (+₹${difference.toLocaleString("en-IN")})`
        : `❌ CASH SHORT (-₹${Math.abs(difference).toLocaleString("en-IN")})`;

    const msg = `*DAILY CASH DRAWER REPORT*
🏪 *${storeName}*
📅 Date: ${activeDate}
━━━━━━━━━━━━━━━━━━━━
💵 Opening Float: ₹${Number(openingCash).toLocaleString("en-IN")}
🛒 Cash In (Sales): ₹${cashSales.toLocaleString("en-IN")}
🔻 Cash Out (Expenses): -₹${cashExpenses.toLocaleString("en-IN")}
━━━━━━━━━━━━━━━━━━━━
📌 *Expected in Galla:* ₹${expectedCash.toLocaleString("en-IN")}
✋ *Counted by Hand:* ₹${countedCash.toLocaleString("en-IN")}
🎯 *Tally Result:* ${statusText}
━━━━━━━━━━━━━━━━━━━━
_Generated automatically via HisabPro_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <main style={{ padding: "16px", maxWidth: "680px", margin: "0 auto", paddingBottom: "100px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Thermal Print Slip CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              #thermal-closing-slip, #thermal-closing-slip * { visibility: visible; }
              #thermal-closing-slip {
                position: absolute;
                left: 0;
                top: 0;
                width: 58mm;
                padding: 4mm;
                font-family: monospace;
              }
              .no-print { display: none !important; }
            }
          `,
        }}
      />

      {/* HEADER */}
      <header className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => (window.location.href = "/hisabpro/more/")}
          style={{ background: "#f1f5f9", border: "none", color: "#102a56", fontWeight: "700", fontSize: "14px", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}
        >
          ← Back
        </button>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#102a56", margin: 0 }}>Cash Drawer & Tally</h1>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{activeDate}</span>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ background: "#102a56", border: "none", color: "#ffffff", fontWeight: "700", fontSize: "13px", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
        >
          <span>🖨️</span> Slip
        </button>
      </header>

      {/* TOP HERO STATUS HERO CARD */}
      <section
        className="no-print"
        style={{
          borderRadius: "16px",
          padding: "18px 20px",
          marginBottom: "18px",
          background: difference === 0 ? "linear-gradient(135deg, #065f46 0%, #047857 100%)" : difference > 0 ? "linear-gradient(135deg, #92400e 0%, #b45309 100%)" : "linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)",
          color: "#ffffff",
          boxShadow: "0 10px 20px -5px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.9 }}>
            DRAWER RECONCILIATION
          </span>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" }}>
            {difference === 0 ? "BALANCED" : difference > 0 ? "SURPLUS" : "DEFICIT"}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px" }}>
              {difference === 0 ? "₹0.00" : (difference > 0 ? `+₹${difference.toLocaleString("en-IN")}` : `-₹${Math.abs(difference).toLocaleString("en-IN")}`)}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.85, fontWeight: "600", marginTop: "2px" }}>
              {difference === 0 ? "Galla 100% Tally Hai! No difference." : difference > 0 ? "Galle me hisab se zyada cash hai." : "Galle me cash kam pad raha hai!"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Counted Cash</div>
            <div style={{ fontSize: "16px", fontWeight: "800" }}>₹{countedCash.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </section>

      {/* METRIC TILES */}
      <section className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
        <div style={{ background: "#ffffff", padding: "12px 14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Opening Float</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>₹</span>
            <input
              type="number"
              value={openingCash}
              onChange={(e) => handleOpeningChange(e.target.value)}
              placeholder="0"
              style={{ width: "100%", padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", fontWeight: "800", color: "#0f172a", boxSizing: "border-box" }}
            />
          </div>
          <small style={{ fontSize: "10px", color: "#94a3b8" }}>Morning cash float</small>
        </div>

        <div style={{ background: "#ffffff", padding: "12px 14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#059669", textTransform: "uppercase" }}>Today Cash Sales</span>
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#059669", marginTop: "4px" }}>
            ₹{cashSales.toLocaleString("en-IN")}
          </div>
          <small style={{ fontSize: "10px", color: "#94a3b8" }}>Auto from Sales bills</small>
        </div>

        <div style={{ background: "#ffffff", padding: "12px 14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#dc2626", textTransform: "uppercase" }}>Cash Expenses</span>
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#dc2626", marginTop: "4px" }}>
            -₹{cashExpenses.toLocaleString("en-IN")}
          </div>
          <small style={{ fontSize: "10px", color: "#94a3b8" }}>Galla petty payouts</small>
        </div>

        <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #cbd5e1" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase" }}>Expected in Drawer</span>
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#1e293b", marginTop: "4px" }}>
            ₹{expectedCash.toLocaleString("en-IN")}
          </div>
          <small style={{ fontSize: "10px", color: "#64748b" }}>Opening + Sales - Exp</small>
        </div>
      </section>

      {/* DENOMINATION COUNTER STUDIO */}
      <section className="no-print" style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Galla Currency Denominations</h2>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Count physical notes & coins</span>
          </div>
          <button
            type="button"
            onClick={resetNotes}
            style={{ background: "#fee2e2", border: "none", color: "#b91c1c", fontSize: "11px", fontWeight: "700", padding: "5px 10px", borderRadius: "6px", cursor: "pointer" }}
          >
            Clear Counter
          </button>
        </div>

        {/* Currency Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {(["500", "200", "100", "50", "20", "10"] as DenominationKey[]).map((val) => {
            const count = Number(notes[val]) || 0;
            const subtotal = count * Number(val);
            return (
              <div
                key={val}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: count > 0 ? "#f8fafc" : "transparent",
                  padding: "6px 8px",
                  borderRadius: "10px",
                  border: count > 0 ? "1px solid #cbd5e1" : "1px solid transparent",
                }}
              >
                {/* Note Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "80px" }}>
                  <span
                    style={{
                      background: val === "500" ? "#e0f2fe" : val === "200" ? "#fef3c7" : val === "100" ? "#ede9fe" : "#f1f5f9",
                      color: val === "500" ? "#0369a1" : val === "200" ? "#b45309" : val === "100" ? "#6d28d9" : "#334155",
                      fontWeight: "900",
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    ₹{val}
                  </span>
                </div>

                {/* Steppers & Input */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => adjustCount(val, -1)}
                    style={{ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: "800", cursor: "pointer" }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    placeholder="0"
                    value={notes[val]}
                    onChange={(e) => handleNoteChange(val, e.target.value)}
                    style={{ width: "65px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "700", textAlign: "center", boxSizing: "border-box" }}
                  />
                  <button
                    type="button"
                    onClick={() => adjustCount(val, 1)}
                    style={{ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: "800", cursor: "pointer" }}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div style={{ width: "95px", textAlign: "right", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </div>
              </div>
            );
          })}

          {/* Coins / Chillar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: "10px", background: notes.coins ? "#f8fafc" : "transparent" }}>
            <div style={{ width: "80px" }}>
              <span style={{ background: "#e2e8f0", color: "#334155", fontWeight: "800", fontSize: "12px", padding: "4px 8px", borderRadius: "6px" }}>
                Coins
              </span>
            </div>
            <div style={{ flex: 1, maxWidth: "150px" }}>
              <input
                type="number"
                placeholder="Coins amount (₹)"
                value={notes.coins}
                onChange={(e) => handleNoteChange("coins", e.target.value)}
                style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "700", textAlign: "center", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ width: "95px", textAlign: "right", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
              ₹{(Number(notes.coins) || 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Counter Grand Total Footer */}
        <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "2px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: "14px", color: "#475569" }}>Total Physical Cash:</strong>
          <strong style={{ fontSize: "20px", color: "#102a56", fontWeight: "900" }}>₹{countedCash.toLocaleString("en-IN")}</strong>
        </div>
      </section>

      {/* ACTION TOOLBAR */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <button
          type="button"
          onClick={shareWhatsAppSummary}
          style={{
            padding: "14px",
            borderRadius: "12px",
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
            boxShadow: "0 4px 12px rgba(37, 211, 102, 0.2)",
          }}
        >
          <span>📲</span> WhatsApp Summary
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: "14px",
            borderRadius: "12px",
            backgroundColor: "#102a56",
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
          <span>🖨️</span> Thermal Print
        </button>
      </div>

      {/* THERMAL PRINT SLIP (HIDDEN ON SCREEN, VISIBLE ON PRINT) */}
      <div id="thermal-closing-slip" style={{ display: "none" }}>
        <center>
          <h3 style={{ margin: "0 0 2px 0", fontSize: "13px" }}>{storeName.toUpperCase()}</h3>
          <p style={{ margin: 0, fontSize: "10px" }}>DAILY SHIFT / GALLE REPORT</p>
          <p style={{ margin: "2px 0 6px 0", fontSize: "9px" }}>{activeDate}</p>
          <div>--------------------------------</div>
        </center>
        <div style={{ fontSize: "10px", lineHeight: "1.4" }}>
          <div>Opening Cash:  Rs.{Number(openingCash).toLocaleString("en-IN")}</div>
          <div>Cash Sales:    Rs.{cashSales.toLocaleString("en-IN")}</div>
          <div>Expenses Out:  Rs.{cashExpenses.toLocaleString("en-IN")}</div>
          <div>--------------------------------</div>
          <div><strong>Expected Galla: Rs.{expectedCash.toLocaleString("en-IN")}</strong></div>
          <div><strong>Counted Cash:  Rs.{countedCash.toLocaleString("en-IN")}</strong></div>
          <div>--------------------------------</div>
          <div style={{ fontWeight: "bold" }}>
            Tally Result: {difference === 0 ? "PERFECT (Rs.0)" : (difference > 0 ? `EXTRA (+Rs.${difference})` : `SHORT (-Rs.${Math.abs(difference)})`)}
          </div>
          <div>--------------------------------</div>
          <center style={{ marginTop: "6px", fontSize: "8px" }}>Powered by HisabPro</center>
        </div>
      </div>
    </main>
  );
}
