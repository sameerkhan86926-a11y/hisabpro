"use client";

import { useEffect, useState, useMemo } from "react";

type Product = {
  id: number;
  name: string;
  stock: number;
  minStock?: number;
};

type Customer = {
  id: number;
  name: string;
  phone?: string;
  due: number;
};

type NotificationType = "danger" | "warning" | "info";

type Notification = {
  id: string;
  category: "stock" | "khata";
  type: NotificationType;
  icon: string;
  title: string;
  message: string;
  entityName: string;
  amountOrQty?: number;
  phone?: string;
  actionUrl: string;
};

type TabFilter = "all" | "stock" | "khata";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [storeName, setStoreName] = useState("HisabPro Store");

  useEffect(() => {
    loadNotifications();
  }, []);

  function loadNotifications() {
    const list: Notification[] = [];

    try {
      // 1. Fetch Store Name
      const savedBusinesses = localStorage.getItem("hisabpro_businesses");
      const activeId = localStorage.getItem("hisabpro_active_business");
      const savedBusiness = localStorage.getItem("hisabpro_business");

      if (savedBusinesses) {
        const parsed = JSON.parse(savedBusinesses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const current = parsed.find((b: any) => b.id === Number(activeId)) || parsed[0];
          if (current?.businessName) setStoreName(current.businessName);
        }
      } else if (savedBusiness) {
        const single = JSON.parse(savedBusiness);
        if (single?.businessName) setStoreName(single.businessName);
      }

      // 2. Products Load
      const products: Product[] = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      // 3. Customers Load
      const customers: Customer[] = JSON.parse(
        localStorage.getItem("hisabpro_customers") || "[]"
      );

      // OUT OF STOCK (Danger)
      products
        .filter((p) => Number(p.stock) <= 0)
        .forEach((p) => {
          list.push({
            id: `out-${p.id}`,
            category: "stock",
            type: "danger",
            icon: "🚨",
            title: "Out of Stock",
            message: `${p.name} ka stock poora khatam ho chuka hai (0 units).`,
            entityName: p.name,
            amountOrQty: 0,
            actionUrl: `/hisabpro/stock/`,
          });
        });

      // LOW STOCK (Warning)
      products
        .filter((p) => Number(p.stock) > 0 && Number(p.stock) <= (p.minStock || 5))
        .forEach((p) => {
          list.push({
            id: `low-${p.id}`,
            category: "stock",
            type: "warning",
            icon: "⚠️",
            title: "Low Stock Alert",
            message: `${p.name} ke sirf ${p.stock} piece bache hain. Turant order karein.`,
            entityName: p.name,
            amountOrQty: Number(p.stock),
            actionUrl: `/hisabpro/stock/`,
          });
        });

      // CUSTOMER DUES (Info)
      customers
        .filter((c) => Number(c.due) > 0)
        .forEach((c) => {
          list.push({
            id: `due-${c.id}`,
            category: "khata",
            type: "info",
            icon: "💰",
            title: "Customer Udhar Due",
            message: `${c.name} ke paas ₹${Number(c.due).toLocaleString("en-IN")} baaki hain.`,
            entityName: c.name,
            amountOrQty: Number(c.due),
            phone: c.phone || "",
            actionUrl: `/hisabpro/khata/`,
          });
        });
    } catch (error) {
      console.error("Notification loading error:", error);
    }

    setNotifications(list);
  }

  // Quick WhatsApp Payment Reminder
  function sendCustomerReminder(name: string, due: number, phone?: string) {
    const text = `Namaste ${name} ji,\n*${storeName}* se aapka hisab remind karaya ja raha hai.\nAapke account me *₹${due.toLocaleString("en-IN")}* baaki hain.\nKripya jald se jald payment clear kar dein.\n\nDhanyawad! 🙏`;
    const cleanPhone = (phone || "").replace(/\D/g, "");
    const url = cleanPhone
      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Quick 1-Item Supplier WhatsApp Draft
  function orderSingleItem(name: string) {
    const text = `Namaste Wholesaler / Distributor Bhaiya,\n*${storeName}* ke liye maal order karna hai:\n- *${name}* (Jaldi bhej dijiyega)\n\nShukriya!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // Bulk Reorder All Low & Out Stock Items
  function sendBulkSupplierOrder() {
    const stockItems = notifications.filter((n) => n.category === "stock");
    if (stockItems.length === 0) return;

    let itemsList = stockItems
      .map((item, idx) => `${idx + 1}. ${item.entityName} (Current: ${item.amountOrQty} pcs)`)
      .join("\n");

    const text = `*URGENT PURCHASE REORDER LIST*\n🏪 *${storeName}*\n📅 Date: ${new Date().toLocaleDateString("en-IN")}\n━━━━━━━━━━━━━━━━━━━━\nBhaiya yeh items store me khatam ya low hain, kripya stock bhej dein:\n\n${itemsList}\n━━━━━━━━━━━━━━━━━━━━\n_Sent via HisabPro Alerts_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // Filtered Notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  // Metric summary counts
  const outOfStockCount = notifications.filter((n) => n.type === "danger").length;
  const lowStockCount = notifications.filter((n) => n.type === "warning").length;
  const duesCount = notifications.filter((n) => n.category === "khata").length;
  const totalDueAmount = notifications
    .filter((n) => n.category === "khata")
    .reduce((sum, n) => sum + (n.amountOrQty || 0), 0);

  return (
    <main
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "16px",
        paddingBottom: "100px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            background: "#f1f5f9",
            border: "none",
            color: "#102a56",
            fontWeight: "700",
            fontSize: "14px",
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#102a56", margin: 0 }}>
          Business Alerts
        </h1>

        <button
          type="button"
          onClick={loadNotifications}
          title="Refresh Alerts"
          style={{
            background: "#f1f5f9",
            border: "none",
            color: "#102a56",
            fontSize: "16px",
            fontWeight: "700",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ↻
        </button>
      </header>

      {/* METRIC STRIP */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "10px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#991b1b" }}>Out of Stock</span>
          <div style={{ fontSize: "18px", fontWeight: "900", color: "#b91c1c", marginTop: "2px" }}>
            {outOfStockCount}
          </div>
        </div>

        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            padding: "10px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#92400e" }}>Low Stock</span>
          <div style={{ fontSize: "18px", fontWeight: "900", color: "#d97706", marginTop: "2px" }}>
            {lowStockCount}
          </div>
        </div>

        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "10px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e40af" }}>Khata Dues</span>
          <div style={{ fontSize: "18px", fontWeight: "900", color: "#2563eb", marginTop: "2px" }}>
            {duesCount}
          </div>
        </div>
      </section>

      {/* BULK REORDER BANNER (IF STOCK ALERTS EXIST) */}
      {(outOfStockCount > 0 || lowStockCount > 0) && (
        <div
          style={{
            background: "linear-gradient(135deg, #102a56 0%, #0d1e3a 100%)",
            color: "#ffffff",
            borderRadius: "14px",
            padding: "14px 16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 12px rgba(16, 42, 86, 0.15)",
          }}
        >
          <div>
            <strong style={{ fontSize: "14px", display: "block" }}>
              📦 {outOfStockCount + lowStockCount} Items Need Reordering
            </strong>
            <small style={{ color: "#94a3b8", fontSize: "12px" }}>
              Wholesaler ko 1-click me puri list send karein
            </small>
          </div>
          <button
            type="button"
            onClick={sendBulkSupplierOrder}
            style={{
              backgroundColor: "#25D366",
              color: "#ffffff",
              border: "none",
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              whiteSpace: "nowrap",
            }}
          >
            <span>📲</span> Order List
          </button>
        </div>
      )}

      {/* TAB FILTERS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: "none",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "all" ? "#102a56" : "#f1f5f9",
            color: activeTab === "all" ? "#ffffff" : "#475569",
          }}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stock")}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: "none",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "stock" ? "#102a56" : "#f1f5f9",
            color: activeTab === "stock" ? "#ffffff" : "#475569",
          }}
        >
          Stock Issues ({outOfStockCount + lowStockCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("khata")}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: "none",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "khata" ? "#102a56" : "#f1f5f9",
            color: activeTab === "khata" ? "#ffffff" : "#475569",
          }}
        >
          Khata Dues (₹{totalDueAmount.toLocaleString("en-IN")})
        </button>
      </div>

      {/* NOTIFICATION CARDS LIST */}
      {filteredNotifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 16px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px dashed #cbd5e1",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px 0" }}>
            All Clear! Koi Alert Nahi Hai
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Aapka stock maintain hai aur koi urgent alert pending nahi hai.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifications.map((n) => {
            const isDanger = n.type === "danger";
            const isWarning = n.type === "warning";
            const isInfo = n.type === "info";

            const accentColor = isDanger ? "#dc2626" : isWarning ? "#d97706" : "#2563eb";
            const bgColor = isDanger ? "#fef2f2" : isWarning ? "#fffbeb" : "#f0f9ff";

            return (
              <div
                key={n.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  borderLeft: `5px solid ${accentColor}`,
                  padding: "14px 16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {/* Top Details */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      backgroundColor: bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {n.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>{n.title}</strong>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: bgColor,
                          color: accentColor,
                        }}
                      >
                        {n.category === "stock" ? "Inventory" : "Recovery"}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#475569", lineHeight: "1.4" }}>
                      {n.message}
                    </p>
                  </div>
                </div>

                {/* Bottom Quick-Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "8px",
                    paddingTop: "6px",
                    borderTop: "1px dashed #f1f5f9",
                  }}
                >
                  {/* Stock Alert Actions */}
                  {n.category === "stock" && (
                    <>
                      <button
                        type="button"
                        onClick={() => orderSingleItem(n.entityName)}
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          color: "#16a34a",
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>📲</span> WhatsApp Order
                      </button>
                      <a
                        href={n.actionUrl}
                        style={{
                          background: "#102a56",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "6px 12px",
                          borderRadius: "6px",
                        }}
                      >
                        Update Stock →
                      </a>
                    </>
                  )}

                  {/* Khata Alert Actions */}
                  {n.category === "khata" && (
                    <>
                      <button
                        type="button"
                        onClick={() => sendCustomerReminder(n.entityName, n.amountOrQty || 0, n.phone)}
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          color: "#16a34a",
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>💬</span> WhatsApp Reminder
                      </button>
                      <a
                        href={n.actionUrl}
                        style={{
                          background: "#102a56",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "6px 12px",
                          borderRadius: "6px",
                        }}
                      >
                        Khata Dekhein →
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
