"use client";

import { useEffect, useState, useMemo } from "react";

type PaymentType = "cash" | "credit";
type PaymentMode = "cash" | "upi" | "card" | "bank" | "online";

type BatchDetail = {
  batchId: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
};

type SaleItem = {
  productId: number;
  product: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  amount: number;
  batchDetails?: BatchDetail[];
};

type Sale = {
  id: number;
  items?: SaleItem[];
  subtotal?: number;
  product?: string;
  price?: number;
  purchasePrice?: number;
  quantity?: number;
  discount: number;
  total: number;
  date: string;
  paymentType?: PaymentType;
  paymentMode?: PaymentMode;
  customerName?: string;
};

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  note: string;
  date: string;
};

type ReturnRecord = {
  id: number;
  type: "sales" | "purchase";
  saleId?: number;
  purchaseId?: number;
  customerId?: number | null;
  customerName?: string;
  supplierId?: number;
  supplierName?: string;
  productId: number;
  productName: string;
  quantity: number;
  amount: number;
  paymentType: PaymentType;
  paymentMode?: PaymentMode;
  reason: string;
  date: string;
};

type Period = "today" | "week" | "month" | "custom" | "all";
type ChartDesign = "bars" | "area" | "distribution";

type ProductReport = {
  quantity: number;
  sales: number;
  profit: number;
};

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [storeName, setStoreName] = useState("HisabPro Store");
  const [chartDesign, setChartDesign] = useState<ChartDesign>("bars");

  useEffect(() => {
    try {
      const savedSales = JSON.parse(localStorage.getItem("hisabpro_sales") || "[]");
      const savedExpenses = JSON.parse(localStorage.getItem("hisabpro_expenses") || "[]");
      const savedReturns = JSON.parse(localStorage.getItem("hisabpro_returns") || "[]");

      setSales(Array.isArray(savedSales) ? savedSales : []);
      setExpenses(Array.isArray(savedExpenses) ? savedExpenses : []);
      setReturns(Array.isArray(savedReturns) ? savedReturns : []);

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
    } catch {}
  }, []);

  function getPaymentModeLabel(paymentType?: PaymentType, paymentMode?: PaymentMode) {
    if (paymentType === "credit") return "Credit";
    switch (paymentMode || "cash") {
      case "cash": return "Cash";
      case "upi": return "UPI";
      case "card": return "Card";
      case "bank": return "Bank";
      case "online": return "Online";
      default: return "Cash";
    }
  }

  function getSaleItems(sale: Sale): SaleItem[] {
    if (sale.items && sale.items.length > 0) return sale.items;
    if (sale.product) {
      return [
        {
          productId: 0,
          product: sale.product,
          price: sale.price || 0,
          purchasePrice: sale.purchasePrice || 0,
          quantity: sale.quantity || 1,
          amount: (sale.price || 0) * (sale.quantity || 1),
        },
      ];
    }
    return [];
  }

  function getItemReport(item: SaleItem) {
    if (item.batchDetails && item.batchDetails.length > 0) {
      let salesSum = 0;
      let profitSum = 0;
      let quantitySum = 0;

      item.batchDetails.forEach((batch) => {
        const qty = Number(batch.quantity);
        const sellingPrice = Number(batch.sellingPrice);
        const purchasePrice = Number(batch.purchasePrice);

        salesSum += sellingPrice * qty;
        profitSum += (sellingPrice - purchasePrice) * qty;
        quantitySum += qty;
      });

      return { quantity: quantitySum, sales: salesSum, profit: profitSum };
    }

    return {
      quantity: Number(item.quantity || 0),
      sales: Number(item.amount || 0),
      profit:
        (Number(item.price || 0) - Number(item.purchasePrice || 0)) *
        Number(item.quantity || 0),
    };
  }

  function getDateOnly(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function isInPeriod(dateString: string) {
    if (!dateString) return false;
    const date = getDateOnly(new Date(dateString));
    const now = getDateOnly(new Date());

    if (period === "today") {
      return date.getTime() === now.getTime();
    }
    if (period === "week") {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const difference = day === 0 ? 6 : day - 1;
      startOfWeek.setDate(now.getDate() - difference);
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
    if (period === "month") {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }
    if (period === "custom") {
      if (!fromDate && !toDate) return false;
      const start = fromDate ? getDateOnly(new Date(`${fromDate}T00:00:00`)) : null;
      const end = toDate ? getDateOnly(new Date(`${toDate}T00:00:00`)) : null;

      if (start && end) return date >= start && date <= end;
      if (start) return date >= start;
      if (end) return date <= end;
      return false;
    }
    return true;
  }

  const filteredSales = useMemo(() => sales.filter((s) => isInPeriod(s.date)), [sales, period, fromDate, toDate]);
  const filteredExpenses = useMemo(() => expenses.filter((e) => isInPeriod(e.date)), [expenses, period, fromDate, toDate]);
  const filteredReturns = useMemo(() => returns.filter((r) => isInPeriod(r.date)), [returns, period, fromDate, toDate]);

  const salesReturns = filteredReturns
    .filter((item) => item.type === "sales")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const purchaseReturns = filteredReturns
    .filter((item) => item.type === "purchase")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalSales = filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const netSales = totalSales - salesReturns;

  const totalItems = filteredSales.reduce((sum, sale) => {
    const items = getSaleItems(sale);
    return sum + items.reduce((iSum, i) => iSum + Number(i.quantity || 0), 0);
  }, 0);

  const grossProfit = filteredSales.reduce((sum, sale) => {
    const items = getSaleItems(sale);
    const itemProfit = items.reduce((iSum, item) => {
      const rep = getItemReport(item);
      return iSum + rep.profit;
    }, 0);
    return sum + itemProfit - Number(sale.discount || 0);
  }, 0);

  const grossProfitAfterReturns = grossProfit - salesReturns + purchaseReturns;
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const netProfit = grossProfitAfterReturns - totalExpenses;
  const profitMarginPercent = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : "0.0";

  const cashSales = filteredSales
    .filter((s) => s.paymentType !== "credit" && (s.paymentMode || "cash") === "cash")
    .reduce((sum, s) => sum + Number(s.total || 0), 0);

  const upiSales = filteredSales
    .filter((s) => s.paymentType !== "credit" && s.paymentMode === "upi")
    .reduce((sum, s) => sum + Number(s.total || 0), 0);

  const cardSales = filteredSales
    .filter((s) => s.paymentType !== "credit" && s.paymentMode === "card")
    .reduce((sum, s) => sum + Number(s.total || 0), 0);

  const bankSales = filteredSales
    .filter((s) => s.paymentType !== "credit" && s.paymentMode === "bank")
    .reduce((sum, s) => sum + Number(s.total || 0), 0);

  const onlineSales = filteredSales
    .filter((s) => s.paymentType !== "credit" && s.paymentMode === "online")
    .reduce((sum, s) => sum + Number(s.total || 0), 0);

  const creditSales = filteredSales
    .filter((s) => s.paymentType === "credit")
    .reduce((sum, s) => sum + Number(s.total || 0), 0);

  const paymentModeTotal = cashSales + upiSales + cardSales + bankSales + onlineSales + creditSales;

  const topProducts = useMemo(() => {
    const pMap = new Map<string, ProductReport>();
    filteredSales.forEach((sale) => {
      const items = getSaleItems(sale);
      items.forEach((item) => {
        const report = getItemReport(item);
        const existing = pMap.get(item.product);
        if (existing) {
          pMap.set(item.product, {
            quantity: existing.quantity + report.quantity,
            sales: existing.sales + report.sales,
            profit: existing.profit + report.profit,
          });
        } else {
          pMap.set(item.product, {
            quantity: report.quantity,
            sales: report.sales,
            profit: report.profit,
          });
        }
      });
    });

    return Array.from(pMap.entries())
      .map(([product, data]) => ({ product, ...data }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  }, [filteredSales]);

  // Chart calculation
  const chartDays = useMemo(() => {
    const daysMap = new Map<string, { label: string; sales: number; expenses: number }>();
    const last7: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      daysMap.set(key, { label, sales: 0, expenses: 0 });
      last7.push(key);
    }

    sales.forEach((s) => {
      const k = s.date ? s.date.split("T")[0] : "";
      if (daysMap.has(k)) {
        daysMap.get(k)!.sales += Number(s.total || 0);
      }
    });

    expenses.forEach((e) => {
      const k = e.date ? e.date.split("T")[0] : "";
      if (daysMap.has(k)) {
        daysMap.get(k)!.expenses += Number(e.amount || 0);
      }
    });

    return last7.map((k) => daysMap.get(k)!);
  }, [sales, expenses]);

  const maxChartVal = useMemo(() => {
    return Math.max(...chartDays.map((d) => Math.max(d.sales, d.expenses)), 100);
  }, [chartDays]);

  const areaSvgPoints = useMemo(() => {
    const width = 300;
    const height = 90;
    const step = width / (chartDays.length - 1 || 1);

    const salesCoords = chartDays.map((d, idx) => {
      const x = idx * step;
      const y = height - (d.sales / maxChartVal) * (height - 10);
      return { x, y };
    });

    const expCoords = chartDays.map((d, idx) => {
      const x = idx * step;
      const y = height - (d.expenses / maxChartVal) * (height - 10);
      return { x, y };
    });

    const salesPath = salesCoords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
    const expPath = expCoords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
    const salesArea = `${salesPath} L ${width},${height} L 0,${height} Z`;

    return { salesPath, expPath, salesArea, salesCoords };
  }, [chartDays, maxChartVal]);

  // 100% RELIABLE POS THERMAL ROLL PRINT ENGINE
  function triggerPrintThermal() {
    try {
      const topProductsRows = topProducts.slice(0, 5).map((p) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>${p.product.slice(0, 16)} x${p.quantity}</span>
          <span>INR ${p.sales.toLocaleString("en-IN")}</span>
        </div>
      `).join("");

      const receiptHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Closing Slip</title>
            <style>
              @page { size: 58mm auto; margin: 0; }
              body {
                width: 54mm;
                margin: 0 auto;
                padding: 6px 2px;
                font-family: 'Courier New', Courier, monospace, system-ui;
                font-size: 11px;
                color: #000;
                line-height: 1.25;
                font-weight: 600;
              }
              .center { text-align: center; }
              .bold { font-weight: 900; }
              .divider { border-top: 1px dashed #000; margin: 5px 0; }
              .double-divider { border-top: 2px solid #000; margin: 6px 0; }
              .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            </style>
          </head>
          <body>
            <div class="center">
              <div class="bold" style="font-size: 15px; margin-bottom: 2px;">${storeName}</div>
              <div style="font-size: 10px;">BUSINESS REPORT SUMMARY</div>
              <div style="font-size: 9px;">${new Date().toLocaleString("en-IN")}</div>
              <div class="bold" style="font-size: 10px; margin-top: 2px;">PERIOD: ${period.toUpperCase()}</div>
            </div>

            <div class="divider"></div>

            <div class="row">
              <span>Gross Sales:</span>
              <span>INR ${totalSales.toLocaleString("en-IN")}</span>
            </div>
            <div class="row">
              <span>Returns:</span>
              <span>-INR ${salesReturns.toLocaleString("en-IN")}</span>
            </div>
            <div class="row bold">
              <span>Net Sales:</span>
              <span>INR ${netSales.toLocaleString("en-IN")}</span>
            </div>
            <div class="row">
              <span>Expenses:</span>
              <span>-INR ${totalExpenses.toLocaleString("en-IN")}</span>
            </div>

            <div class="double-divider"></div>

            <div class="row bold" style="font-size: 13px;">
              <span>NET PROFIT:</span>
              <span>INR ${netProfit.toLocaleString("en-IN")}</span>
            </div>

            <div class="divider"></div>

            <div class="bold" style="margin-bottom: 3px;">PAYMENT BREAKUP:</div>
            <div class="row">
              <span>Cash:</span>
              <span>INR ${cashSales.toLocaleString("en-IN")}</span>
            </div>
            <div class="row">
              <span>UPI / Online:</span>
              <span>INR ${(upiSales + cardSales + bankSales + onlineSales).toLocaleString("en-IN")}</span>
            </div>
            <div class="row">
              <span>Udhar (Credit):</span>
              <span>INR ${creditSales.toLocaleString("en-IN")}</span>
            </div>

            ${topProducts.length > 0 ? `
              <div class="divider"></div>
              <div class="bold" style="margin-bottom: 3px;">TOP ITEMS SOLD:</div>
              ${topProductsRows}
            ` : ""}

            <div class="divider"></div>

            <div class="center" style="font-size: 9px; margin-top: 6px; padding-bottom: 12px;">
              *** END OF REPORT ***<br/>
              HisabPro Smart Vyapar POS
            </div>
          </body>
        </html>
      `;

      let printFrame = document.getElementById("thermal-print-frame") as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement("iframe");
        printFrame.id = "thermal-print-frame";
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "none";
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(receiptHtml);
        frameDoc.close();

        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        }, 300);
      }
    } catch {
      alert("Thermal print error: Popups allow karein.");
    }
  }

  function exportToExcel() {
    try {
      const rows = [
        ["HISABPRO BUSINESS REPORT", storeName],
        ["Generated On", new Date().toLocaleString("en-IN")],
        ["Period", period.toUpperCase()],
        [],
        ["FINANCIAL SUMMARY"],
        ["Metric", "Amount (INR)"],
        ["Total Sales", totalSales],
        ["Sales Returns", salesReturns],
        ["Net Sales", netSales],
        ["Gross Profit", grossProfitAfterReturns],
        ["Total Expenses", totalExpenses],
        ["Net Profit", netProfit],
        ["Profit Margin (%)", `${profitMarginPercent}%`],
        [],
        ["PAYMENT MODE BREAKDOWN"],
        ["Mode", "Amount (INR)"],
        ["Cash Sales", cashSales],
        ["UPI Sales", upiSales],
        ["Card Sales", cardSales],
        ["Bank Sales", bankSales],
        ["Online Sales", onlineSales],
        ["Credit (Udhar) Sales", creditSales],
        [],
        ["TOP SELLING PRODUCTS"],
        ["Product Name", "Qty Sold", "Total Sales (INR)", "Profit (INR)"],
        ...topProducts.map((p) => [p.product, p.quantity, p.sales, p.profit]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        rows
          .map((row) =>
            row
              .map((cell) => {
                const str = String(cell ?? "");
                return `"${str.replace(/"/g, '""')}"`;
              })
              .join(",")
          )
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `HisabPro_Report_${period}_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Excel export failed. Please try again.");
    }
  }

  return (
    <main className="reports-page" style={{ paddingBottom: "100px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .no-print { display: none !important; }
              body { background: #ffffff !important; color: #000000 !important; }
              .reports-header { display: none !important; }
              .print-a4-view { display: block !important; margin-bottom: 20px; }
              .report-card, .report-section { break-inside: avoid; border: 1px solid #cbd5e1 !important; box-shadow: none !important; }
              @page { size: A4 portrait; margin: 12mm; }
            }
            .print-a4-view { display: none; }
          `,
        }}
      />

      {/* HEADER WITH SVG ICONS */}
      <header className="reports-header no-print">
        <button
          type="button"
          onClick={() => (window.location.href = "/hisabpro/")}
          className="back-button"
        >
          ← Back
        </button>

        <h1 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Reports & Analytics</h1>

        <div style={{ display: "flex", gap: "6px" }}>
          {/* EXCEL BUTTON WITH SVG */}
          <button
            type="button"
            onClick={exportToExcel}
            title="Download CSV / Excel"
            style={{
              background: "#10b981",
              border: "none",
              color: "#ffffff",
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Excel
          </button>

          {/* THERMAL 58MM BUTTON WITH SVG */}
          <button
            type="button"
            onClick={triggerPrintThermal}
            title="Print 58mm Thermal Slip"
            style={{
              background: "#0284c7",
              border: "none",
              color: "#ffffff",
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Thermal
          </button>

          {/* A4 PRINT BUTTON WITH SVG */}
          <button
            type="button"
            onClick={() => window.print()}
            title="Save as A4 PDF"
            style={{
              background: "#102a56",
              border: "none",
              color: "#ffffff",
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            A4
          </button>
        </div>
      </header>

      {/* A4 PRINT LETTERHEAD */}
      <div className="print-a4-view">
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #102a56", paddingBottom: "10px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#102a56" }}>{storeName}</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Financial Business & Profit Statement</p>
          </div>
          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <div><strong>Period:</strong> {period.toUpperCase()}</div>
            <div><strong>Generated:</strong> {new Date().toLocaleDateString("en-IN")}</div>
          </div>
        </div>
      </div>

      {/* PERIOD FILTER */}
      <section className="report-filter no-print">
        <button className={period === "today" ? "active" : ""} onClick={() => setPeriod("today")}>
          Today
        </button>
        <button className={period === "week" ? "active" : ""} onClick={() => setPeriod("week")}>
          This Week
        </button>
        <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")}>
          This Month
        </button>
        <button className={period === "custom" ? "active" : ""} onClick={() => setPeriod("custom")}>
          📅 Custom
        </button>
        <button className={period === "all" ? "active" : ""} onClick={() => setPeriod("all")}>
          All Time
        </button>
      </section>

      {/* CUSTOM DATE */}
      {period === "custom" && (
        <section className="custom-date-filter no-print">
          <div>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label>To Date</label>
            <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} />
          </div>
          {(fromDate || toDate) && (
            <button
              className="clear-date-button"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </button>
          )}
        </section>
      )}

      {/* MAIN STATS */}
      <section className="report-stats">
        <div className="report-card">
          <span>Total Sales</span>
          <strong>₹{totalSales.toLocaleString("en-IN")}</strong>
          <small>{filteredSales.length} bills</small>
        </div>

        <div className="report-card">
          <span>Net Sales</span>
          <strong>₹{netSales.toLocaleString("en-IN")}</strong>
          <small>After sales returns</small>
        </div>

        <div className="report-card">
          <span>Gross Profit</span>
          <strong>₹{grossProfitAfterReturns.toLocaleString("en-IN")}</strong>
          <small>After returns</small>
        </div>

        <div className="report-card">
          <span>Expenses</span>
          <strong>₹{totalExpenses.toLocaleString("en-IN")}</strong>
          <small>Business expenses</small>
        </div>

        <div className="report-card profit-card">
          <span>Net Profit ({profitMarginPercent}%)</span>
          <strong>₹{netProfit.toLocaleString("en-IN")}</strong>
          <small>Profit after expenses</small>
        </div>
      </section>

      {/* MULTI-DESIGN INTERACTIVE GRAPH STUDIO (WITH SVG ICONS) */}
      <section
        className="report-section no-print"
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#1e293b" }}>
              Visual Analytics Studio
            </h2>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Choose visual representation style</span>
          </div>

          {/* GRAPH SWITCH TABS WITH SVG ICONS */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "10px", gap: "2px" }}>
            <button
              type="button"
              onClick={() => setChartDesign("bars")}
              style={{
                border: "none",
                padding: "5px 10px",
                borderRadius: "7px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: chartDesign === "bars" ? "#102a56" : "transparent",
                color: chartDesign === "bars" ? "#ffffff" : "#475569",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Bars
            </button>
            <button
              type="button"
              onClick={() => setChartDesign("area")}
              style={{
                border: "none",
                padding: "5px 10px",
                borderRadius: "7px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: chartDesign === "area" ? "#102a56" : "transparent",
                color: chartDesign === "area" ? "#ffffff" : "#475569",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Wave
            </button>
            <button
              type="button"
              onClick={() => setChartDesign("distribution")}
              style={{
                border: "none",
                padding: "5px 10px",
                borderRadius: "7px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: chartDesign === "distribution" ? "#102a56" : "transparent",
                color: chartDesign === "distribution" ? "#ffffff" : "#475569",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="2" x2="12" y2="12" />
                <line x1="12" y1="12" x2="21.5" y2="15.5" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* 1. DUAL BARS VIEW */}
        {chartDesign === "bars" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", fontSize: "11px", fontWeight: "700", marginBottom: "8px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#0284c7" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#0284c7" }}></span> Sales
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#ef4444" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#ef4444" }}></span> Expenses
              </span>
            </div>

            <div style={{ width: "100%", overflowX: "auto" }}>
              <div style={{ minWidth: "320px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "140px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
                {chartDays.map((day, idx) => {
                  const sH = Math.round((day.sales / maxChartVal) * 100);
                  const eH = Math.round((day.expenses / maxChartVal) * 100);

                  return (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "110px" }}>
                        <div
                          title={`Sales: ₹${day.sales.toLocaleString("en-IN")}`}
                          style={{
                            width: "14px",
                            height: `${Math.max(sH, 4)}px`,
                            backgroundColor: "#0284c7",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.3s ease",
                          }}
                        />
                        <div
                          title={`Expense: ₹${day.expenses.toLocaleString("en-IN")}`}
                          style={{
                            width: "14px",
                            height: `${Math.max(eH, 2)}px`,
                            backgroundColor: "#ef4444",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.3s ease",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "600", color: "#64748b" }}>{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. WAVE AREA VIEW */}
        {chartDesign === "area" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
              <span>7-Day Inflow / Outflow Gradient</span>
              <strong style={{ color: "#0284c7" }}>Peak: ₹{maxChartVal.toLocaleString("en-IN")}</strong>
            </div>

            <div style={{ position: "relative", width: "100%", height: "130px" }}>
              <svg viewBox="0 0 300 90" preserveAspectRatio="none" style={{ width: "100%", height: "100px", overflow: "visible" }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path d={areaSvgPoints.salesArea} fill="url(#salesGrad)" />
                <path d={areaSvgPoints.salesPath} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                <path d={areaSvgPoints.expPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />

                {areaSvgPoints.salesCoords.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                ))}
              </svg>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                {chartDays.map((d, i) => (
                  <span key={i} style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. DISTRIBUTION SHARE VIEW */}
        {chartDesign === "distribution" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Payment Inflow Contribution</span>
              <strong style={{ fontSize: "12px", color: "#102a56" }}>₹{paymentModeTotal.toLocaleString("en-IN")}</strong>
            </div>

            <div style={{ display: "flex", height: "18px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#f1f5f9", marginBottom: "14px" }}>
              <div style={{ width: `${(cashSales / (paymentModeTotal || 1)) * 100}%`, background: "#10b981" }} />
              <div style={{ width: `${(upiSales / (paymentModeTotal || 1)) * 100}%`, background: "#0284c7" }} />
              <div style={{ width: `${(cardSales / (paymentModeTotal || 1)) * 100}%`, background: "#8b5cf6" }} />
              <div style={{ width: `${(creditSales / (paymentModeTotal || 1)) * 100}%`, background: "#f59e0b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#10b981" }} />
                <span>Cash: ₹{cashSales.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#0284c7" }} />
                <span>UPI: ₹{upiSales.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#8b5cf6" }} />
                <span>Card/Bank: ₹{(cardSales + bankSales).toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#f59e0b" }} />
                <span>Udhar (Due): ₹{creditSales.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* PAYMENT BREAKDOWN (ORIGINAL DESIGN) */}
      <section className="report-section">
        <div className="report-section-title">
          <h2>Payment Breakdown</h2>
          <span>₹{paymentModeTotal.toLocaleString("en-IN")}</span>
        </div>

        <div className="report-breakdown">
          <div>
            <span>💵</span>
            <p>Cash</p>
            <strong>₹{cashSales.toLocaleString("en-IN")}</strong>
          </div>
          <div>
            <span>📱</span>
            <p>UPI</p>
            <strong>₹{upiSales.toLocaleString("en-IN")}</strong>
          </div>
          <div>
            <span>💳</span>
            <p>Card</p>
            <strong>₹{cardSales.toLocaleString("en-IN")}</strong>
          </div>
          <div>
            <span>🏦</span>
            <p>Bank</p>
            <strong>₹{bankSales.toLocaleString("en-IN")}</strong>
          </div>
          <div>
            <span>🌐</span>
            <p>Online</p>
            <strong>₹{onlineSales.toLocaleString("en-IN")}</strong>
          </div>
          <div>
            <span>📒</span>
            <p>Credit</p>
            <strong>₹{creditSales.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </section>

      {/* SALES BREAKDOWN (ORIGINAL DESIGN) */}
      <section className="report-section">
        <h2>Sales Breakdown</h2>
        <div className="report-breakdown">
          <div>
            <span>🧾</span>
            <p>Total Bills</p>
            <strong>{filteredSales.length}</strong>
          </div>
          <div>
            <span>📦</span>
            <p>Items Sold</p>
            <strong>{totalItems}</strong>
          </div>
          <div>
            <span>↩️</span>
            <p>Sales Returns</p>
            <strong>₹{salesReturns.toLocaleString("en-IN")}</strong>
          </div>
          <div>
            <span>↩️</span>
            <p>Purchase Returns</p>
            <strong>₹{purchaseReturns.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </section>

      {/* TOP PRODUCTS (ORIGINAL DESIGN) */}
      <section className="report-section">
        <div className="report-section-title">
          <h2>Top Products</h2>
          <span>By sales</span>
        </div>

        {topProducts.length === 0 ? (
          <div className="report-empty">No product sales in this period.</div>
        ) : (
          <div className="top-products">
            {topProducts.map((item, index) => (
              <div className="top-product" key={item.product}>
                <div className="product-rank">{index + 1}</div>
                <div className="top-product-info">
                  <strong>{item.product}</strong>
                  <span>{item.quantity} units sold</span>
                </div>
                <div className="top-product-right">
                  <strong>₹{item.sales.toLocaleString("en-IN")}</strong>
                  <span>Profit ₹{item.profit.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT SALES (ORIGINAL DESIGN) */}
      <section className="report-section">
        <div className="report-section-title">
          <h2>Recent Sales</h2>
          <a href="/hisabpro/sales/history/" className="no-print">
            View All
          </a>
        </div>

        {filteredSales.length === 0 ? (
          <div className="report-empty">No sales in this period.</div>
        ) : (
          <div className="recent-reports">
            {[...filteredSales]
              .reverse()
              .slice(0, 10)
              .map((sale) => {
                const items = getSaleItems(sale);
                return (
                  <div className="recent-report-item" key={sale.id}>
                    <div>
                      <strong>
                        {items.length === 1 ? items[0].product : `${items.length} Items`}
                      </strong>
                      <span>{new Date(sale.date).toLocaleString("en-IN")}</span>
                      <small
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#1559b7",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {getPaymentModeLabel(sale.paymentType, sale.paymentMode)}
                      </small>
                    </div>
                    <strong>₹{Number(sale.total || 0).toLocaleString("en-IN")}</strong>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </main>
  );
}
