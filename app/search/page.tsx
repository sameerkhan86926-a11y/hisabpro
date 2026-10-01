"use client";

import { useEffect, useState, useMemo } from "react";

type Product = {
  id: number;
  name: string;
  category?: string;
  barcode?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  price?: number;
  stock?: number;
};

type Customer = {
  id: number;
  name: string;
  phone?: string;
  due?: number;
};

type SaleItem = {
  productId?: number;
  product?: string;
  quantity?: number;
  price?: number;
  amount?: number;
};

type Sale = {
  id: number;
  items?: SaleItem[];
  total?: number;
  date?: string;
  paymentType?: "cash" | "credit";
  paymentMode?: string;
  customerName?: string;
};

type FilterCategory = "all" | "Product" | "Customer" | "Sale";

type SearchResult = {
  id: string;
  type: "Product" | "Customer" | "Sale";
  title: string;
  subtitle: string;
  meta: string;
  badge?: string;
  badgeColor?: string;
  extraAction?: {
    label: string;
    url: string;
  };
  href: string;
};

const RECENT_SEARCHES_KEY = "hisabpro_recent_searches";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedProducts = JSON.parse(localStorage.getItem("hisabpro_products") || "[]");
      const savedCustomers = JSON.parse(localStorage.getItem("hisabpro_customers") || "[]");
      const savedSales = JSON.parse(localStorage.getItem("hisabpro_sales") || "[]");
      const savedRecents = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");

      setProducts(Array.isArray(savedProducts) ? savedProducts : []);
      setCustomers(Array.isArray(savedCustomers) ? savedCustomers : []);
      setSales(Array.isArray(savedSales) ? savedSales : []);
      setRecentSearches(Array.isArray(savedRecents) ? savedRecents : []);
    } catch {
      setProducts([]);
      setCustomers([]);
      setSales([]);
    }
  }, []);

  function saveRecentSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const filtered = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(filtered);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }

  const allResults = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return [];

    const found: SearchResult[] = [];

    // 1. PRODUCTS SEARCH (Name, Category, Barcode)
    products.forEach((p) => {
      const barcodeText = String(p.barcode || "").toLowerCase();
      const nameText = String(p.name || "").toLowerCase();
      const catText = String(p.category || "").toLowerCase();

      if (nameText.includes(search) || catText.includes(search) || barcodeText.includes(search)) {
        const stockQty = Number(p.stock || 0);
        const rate = Number(p.sellingPrice || p.price || 0);
        const isOutOfStock = stockQty <= 0;

        found.push({
          id: `product-${p.id}`,
          type: "Product",
          title: p.name,
          subtitle: p.category ? `Category: ${p.category}` : (p.barcode ? `Barcode: ${p.barcode}` : "Product"),
          meta: `₹${rate.toLocaleString("en-IN")}`,
          badge: isOutOfStock ? "Out of Stock" : `${stockQty} In Stock`,
          badgeColor: isOutOfStock ? "#ef4444" : stockQty <= 5 ? "#f59e0b" : "#10b981",
          href: `/hisabpro/stock/`,
        });
      }
    });

    // 2. CUSTOMERS SEARCH (Name, Phone)
    customers.forEach((c) => {
      const nameText = String(c.name || "").toLowerCase();
      const phoneText = String(c.phone || "").toLowerCase();

      if (nameText.includes(search) || phoneText.includes(search)) {
        const dueVal = Number(c.due || 0);
        const hasDue = dueVal > 0;

        found.push({
          id: `customer-${c.id}`,
          type: "Customer",
          title: c.name,
          subtitle: c.phone ? `📞 ${c.phone}` : "No phone saved",
          meta: hasDue ? `Due: ₹${dueVal.toLocaleString("en-IN")}` : "No Pending Due",
          badge: hasDue ? `₹${dueVal.toLocaleString("en-IN")} Baaki` : "Clear",
          badgeColor: hasDue ? "#dc2626" : "#059669",
          extraAction: c.phone
            ? {
                label: "WhatsApp",
                url: `https://wa.me/91${c.phone.replace(/\D/g, "")}`,
              }
            : undefined,
          href: `/hisabpro/khata/`,
        });
      }
    });

    // 3. SALES SEARCH (Bill ID, Customer, Products inside bill)
    sales.forEach((s) => {
      const productNames = s.items?.map((item) => item.product || "").join(" ") || "";
      const text = `${productNames} ${s.customerName || ""} ${s.id}`.toLowerCase();

      if (text.includes(search)) {
        const billTotal = Number(s.total || 0);
        const mode = s.paymentType === "credit" ? "Udhar / Credit" : (s.paymentMode || "Cash").toUpperCase();
        const dateStr = s.date ? new Date(s.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

        found.push({
          id: `sale-${s.id}`,
          type: "Sale",
          title: `Bill #${String(s.id).slice(-6)} • ${s.customerName || "Cash Customer"}`,
          subtitle: `${dateStr} • ${s.items?.length || 1} items sold`,
          meta: `₹${billTotal.toLocaleString("en-IN")}`,
          badge: mode,
          badgeColor: s.paymentType === "credit" ? "#9333ea" : "#0284c7",
          href: `/hisabpro/sales/history/`,
        });
      }
    });

    return found;
  }, [query, products, customers, sales]);

  const filteredResults = useMemo(() => {
    if (activeFilter === "all") return allResults;
    return allResults.filter((r) => r.type === activeFilter);
  }, [allResults, activeFilter]);

  const counts = useMemo(() => {
    return {
      all: allResults.length,
      Product: allResults.filter((r) => r.type === "Product").length,
      Customer: allResults.filter((r) => r.type === "Customer").length,
      Sale: allResults.filter((r) => r.type === "Sale").length,
    };
  }, [allResults]);

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

        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#102a56", margin: 0 }}>
            Universal Search
          </h1>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Spotlight across your entire POS</span>
        </div>

        <div style={{ width: "40px" }} />
      </header>

      {/* SEARCH COMMAND BOX */}
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <span
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "16px",
            color: "#64748b",
          }}
        >
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              saveRecentSearch(query);
            }
          }}
          placeholder="Search items, barcodes, customers, bills..."
          autoFocus
          style={{
            width: "100%",
            padding: "14px 40px 14px 44px",
            fontSize: "15px",
            fontWeight: "600",
            borderRadius: "14px",
            border: "1.5px solid #cbd5e1",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            outline: "none",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#e2e8f0",
              border: "none",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              fontWeight: "800",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* FILTER CHIPS (VISIBLE ONLY WHEN QUERY HAS MATCHES) */}
      {query.trim() && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "8px",
            marginBottom: "14px",
          }}
        >
          {(
            [
              { key: "all", label: "All Results", count: counts.all },
              { key: "Product", label: "📦 Products", count: counts.Product },
              { key: "Customer", label: "👤 Customers", count: counts.Customer },
              { key: "Sale", label: "🧾 Bills", count: counts.Sale },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
                background: activeFilter === tab.key ? "#102a56" : "#f1f5f9",
                color: activeFilter === tab.key ? "#ffffff" : "#475569",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  background: activeFilter === tab.key ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ZERO QUERY STATE: RECENT SEARCHES & QUICK LAUNCHPAD */}
      {!query.trim() && (
        <section>
          {recentSearches.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                >
                  Clear All
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuery(term)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1e293b",
                      cursor: "pointer",
                    }}
                  >
                    🕒 {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Shortcuts Launchpad */}
          <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
              Quick POS Launchpad
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <a
                href="/hisabpro/billing/"
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "20px" }}>⚡</span>
                <div>
                  <strong style={{ fontSize: "13px", color: "#166534", display: "block" }}>New Bill</strong>
                  <small style={{ color: "#15803d", fontSize: "11px" }}>Counter billing</small>
                </div>
              </a>

              <a
                href="/hisabpro/stock/"
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "20px" }}>📦</span>
                <div>
                  <strong style={{ fontSize: "13px", color: "#0369a1", display: "block" }}>Inventory</strong>
                  <small style={{ color: "#0284c7", fontSize: "11px" }}>Manage items</small>
                </div>
              </a>

              <a
                href="/hisabpro/khata/"
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#faf5ff",
                  border: "1px solid #e9d5ff",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "20px" }}>📒</span>
                <div>
                  <strong style={{ fontSize: "13px", color: "#7e22ce", display: "block" }}>Udhar Khata</strong>
                  <small style={{ color: "#9333ea", fontSize: "11px" }}>Customer dues</small>
                </div>
              </a>

              <a
                href="/hisabpro/cash-drawer/"
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "20px" }}>💵</span>
                <div>
                  <strong style={{ fontSize: "13px", color: "#b45309", display: "block" }}>Cash Drawer</strong>
                  <small style={{ color: "#d97706", fontSize: "11px" }}>Galla tally</small>
                </div>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* NO MATCHES FOUND */}
      {query.trim() && filteredResults.length === 0 && (
        <section
          style={{
            textAlign: "center",
            padding: "40px 16px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px dashed #cbd5e1",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔍</div>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px 0" }}>
            No Matches Found
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            "{query}" se related koi product, customer ya bill nahi mila.
          </p>
        </section>
      )}

      {/* RESULTS LIST */}
      {filteredResults.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredResults.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                saveRecentSearch(query);
                window.location.href = item.href;
              }}
              style={{
                background: "#ffffff",
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                transition: "transform 0.1s ease",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: item.type === "Product" ? "#eff6ff" : item.type === "Customer" ? "#fdf4ff" : "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                }}
              >
                {item.type === "Product" ? "📦" : item.type === "Customer" ? "👤" : "🧾"}
              </div>

              {/* Title & Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong
                    style={{
                      fontSize: "14px",
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                    }}
                  >
                    {item.title}
                  </strong>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                  {item.subtitle}
                </div>
              </div>

              {/* Right Side: Meta Value + Badge / Actions */}
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <strong style={{ fontSize: "14px", color: "#102a56" }}>{item.meta}</strong>
                {item.badge && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      background: `${item.badgeColor}15`,
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor}30`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {item.extraAction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.extraAction!.url, "_blank");
                    }}
                    style={{
                      marginTop: "2px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "#25D366",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "10px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    💬 WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
