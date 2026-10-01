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

  useEffect(() => {
    try {
      const savedSales = JSON.parse(localStorage.getItem("hisabpro_sales") || "[]");
      const savedExpenses = JSON.parse(localStorage.getItem("hisabpro_expenses") || "[]");
      const savedReturns = JSON.parse(localStorage.getItem("hisabpro_returns") || "[]");

      setSales(savedSales);
      setExpenses(savedExpenses);
      setReturns(savedReturns);

      // Business Name Fetch
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
      let sales = 0;
      let profit = 0;
      let quantity = 0;

      item.batchDetails.forEach((batch) => {
        const qty = Number(batch.quantity);
        const sellingPrice = Number(batch.sellingPrice);
        const purchasePrice = Number(batch.purchasePrice);

        sales += sellingPrice * qty;
        profit += (sellingPrice - purchasePrice) * qty;
        quantity += qty;
      });

      return { quantity, sales, profit };
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

  // Filtered lists
  const filteredSales = useMemo(() => sales.filter((s) => isInPeriod(s.date)), [sales, period, fromDate, toDate]);
  const filteredExpenses = useMemo(() => expenses.filter((e) => isInPeriod(e.date)), [expenses, period, fromDate, toDate]);
  const filteredReturns = useMemo(() => returns.filter((r) => isInPeriod(r.date)), [returns, period, fromDate, toDate]);

  // Financial aggregates
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

  // Mode-wise sales
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

  // Top Products
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

  // Daily Trend Data for Interactive Chart
  const chartDays = useMemo(() => {
    const daysMap = new Map<string, { label: string; sales: number; expenses: number }>();
    const last7 = [];
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
    const maxVal = Math.max(...chartDays.map((d) => Math.max(d.sales, d.expenses)), 100);
    return maxVal;
  }, [chartDays]);

  // EXCEL / CSV EXPORT FUNCTION
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
        ["TOP 10 SELLING PRODUCTS"],
        ["Product Name", "Qty Sold", "Total Sales (INR)", "Profit (INR)"],
        ...topProducts.map((p) => [p.product, p.quantity, p.sales, p.profit]),
        [],
        ["RECENT BILLS BREAKDOWN"],
        ["Bill ID", "Date", "Customer", "Payment Mode", "Amount (INR)"],
        ...filteredSales.map((s) => [
          s.id,
          s.date,
          s.customerName || "Walk-in",
          getPaymentModeLabel(s.paymentType, s.paymentMode),
          s.total,
        ]),
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
      {/* PRINT STYLES FOR A4 PDF EXPORT */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .no-print { display: none !important; }
              body { background: #ffffff !important; color: #000000 !important; }
              .reports-header { display: none !important; }
              .print-header { display: block !important; margin-bottom: 20px; }
              .report-card, .report-section { break-inside: avoid; border: 1px solid #cbd5e1 !important; box-shadow: none !important; }
              @page { size: A4 portrait; margin: 12mm; }
            }
            .print-header { display: none; }
          `,
        }}
      />

      {/* HEADER */}
      <header className="reports-header no-print">
        <button
          type="button"
          onClick={() => (window.location.href = "/hisabpro/")}
          className="back-button"
        >
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Reports & Analytics</h1>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={exportToExcel}
            title="Download Excel / CSV"
            style={{
              background: "#10b981",
              border: "none",
              color: "#ffffff",
              padding: "7px 11px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>📊</span> Excel
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            title="Save as PDF / Print"
            style={{
              background: "#102a56",
              border: "none",
              color: "#ffffff",
              padding: "7px 11px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>🖨️</span> PDF
          </button>
        </div>
      </header>

      {/* PRINT-ONLY OFFICIAL DOCUMENT HEADER */}
      <div className="print-header">
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #102a56", paddingBottom: "10px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#102a56" }}>{storeName}</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Financial Sales & Profit Statement</p>
          </div>
          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <div><strong>Period:</strong> {period.toUpperCase()}</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</div>
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

      {/* REVENUE VS EXPENSES 7-DAY VISUAL BAR CHART */}
      <section className="report-section" style={{ background: "#ffffff", borderRadius: "14px", padding: "16px", marginBottom: "16px", border: "1px solid #e2e8f0" }}>
        <div className="report-section-title" style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#1e293b" }}>Sales & Expense Trend</h2>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Past 7 days performance</span>
          </div>
          <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontWeight: "700" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#0284c7" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "2px", background: "#0284c7" }}></span> Sales
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#ef4444" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "2px", background: "#ef4444" }}></span> Expenses
            </span>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: "320px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "150px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
            {chartDays.map((day, idx) => {
              const salesH = Math.round((day.sales / maxChartVal) * 110);
              const expH = Math.round((day.expenses / maxChartVal) * 110);

              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
                    {/* Sales Bar */}
                    <div
                      title={`Sales: ₹${day.sales.toLocaleString("en-IN")}`}
                      style={{
                        width: "16px",
                        height: `${Math.max(salesH, 4)}px`,
                        backgroundColor: "#0284c7",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.3s ease",
                      }}
                    />
                    {/* Expense Bar */}
                    <div
                      title={`Expense: ₹${day.expenses.toLocaleString("en-IN")}`}
                      style={{
                        width: "16px",
                        height: `${Math.max(expH, 2)}px`,
                        backgroundColor: "#ef4444",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.3s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PAYMENT BREAKDOWN */}
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

      {/* SALES BREAKDOWN */}
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

      {/* TOP PRODUCTS */}
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

      {/* RECENT SALES */}
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
