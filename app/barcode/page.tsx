"use client";

import { useEffect, useState } from "react";
import BarcodeSvg from "../../components/BarcodeSvg";

type Product = {
  id: number;
  name: string;
  barcode: string;
  salePrice: number | string;
};

export default function BarcodeStudioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form Fields
  const [storeName, setStoreName] = useState("");
  const [productName, setProductName] = useState("");
  const [barcodeText, setBarcodeText] = useState("");
  const [mrp, setMrp] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [packDate, setPackDate] = useState("");
  const [copies, setCopies] = useState("24");

  // Presets & Toggles
  const [preset, setPreset] = useState<"oddy24" | "oddy40" | "thermal">("oddy24");
  const [showStore, setShowStore] = useState(true);
  const [showMrp, setShowMrp] = useState(true);
  const [showOfferPrice, setShowOfferPrice] = useState(false);
  const [showDate, setShowDate] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [showBatch, setShowBatch] = useState(false);
  const [showBorder, setShowBorder] = useState(true);

  useEffect(() => {
    // Current month/year for default packaging date (e.g. 10/26)
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    setPackDate(`${mm}/${yy}`);

    try {
      // Load Active Store / Business Name
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

      // Load Existing Stock Products
      const savedProds = localStorage.getItem("hisabpro_products");
      if (savedProds) {
        const parsed = JSON.parse(savedProds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          handleSelectProduct(parsed[0]);
        }
      }
    } catch {}
  }, []);

  function handleSelectProduct(prod: Product) {
    setSelectedProduct(prod);
    setProductName(prod.name || "");
    setBarcodeText(prod.barcode || String(prod.id));
    setMrp(String(prod.salePrice || ""));
  }

  function generateRandomBarcode() {
    const random = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setBarcodeText(random);
  }

  const numCopies = Math.max(1, Math.min(200, Number(copies) || 1));
  const labelsArray = Array.from({ length: numCopies });

  return (
    <main style={{ padding: "16px", maxWidth: "900px", margin: "0 auto", paddingBottom: "90px", fontFamily: "system-ui, sans-serif" }}>
      {/* Precision Print Engine Rules */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              #print-label-canvas, #print-label-canvas * { visibility: visible; }
              #print-label-canvas {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .no-print { display: none !important; }
              @page {
                size: ${preset === "thermal" ? "50mm 25mm" : "A4 portrait"};
                margin: ${preset === "thermal" ? "0mm" : "6mm"};
              }
            }
          `,
        }}
      />

      <header className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <a href="/hisabpro/more/" style={{ textDecoration: "none", color: "#102a56", fontWeight: "700" }}>← Back to More</a>
        <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#102a56", margin: 0 }}>Barcode Studio Pro</h1>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            background: "#102a56",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>🖨️</span> Print
        </button>
      </header>

      {/* STUDIO CONTROLS (NO PRINT) */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {/* LEFT COLUMN: PRODUCT DATA */}
        <section style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #cbd5e1" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: "0 0 12px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
            1. Label Details
          </h2>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Store Name (Branding)
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Store Name"
              style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          {products.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                Stock Item Se Fill Karein
              </label>
              <select
                style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#f8fafc" }}
                onChange={(e) => {
                  const item = products.find((p) => p.id === Number(e.target.value));
                  if (item) handleSelectProduct(item);
                }}
                value={selectedProduct?.id ?? ""}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.barcode ? `(${p.barcode})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Product Name / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Premium Basmati Rice"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                MRP (₹)
              </label>
              <input
                type="text"
                placeholder="e.g. 599"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#0284c7", marginBottom: "4px" }}>
                Offer / Sale Price (₹)
              </label>
              <input
                type="text"
                placeholder="e.g. 449"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #0284c7", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                Wt / Size
              </label>
              <input
                type="text"
                placeholder="500g / L"
                value={netWeight}
                onChange={(e) => setNetWeight(e.target.value)}
                style={{ width: "100%", padding: "7px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                PKD Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={packDate}
                onChange={(e) => setPackDate(e.target.value)}
                style={{ width: "100%", padding: "7px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                Batch No
              </label>
              <input
                type="text"
                placeholder="B-01"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                style={{ width: "100%", padding: "7px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569" }}>Barcode Number</label>
              <button
                type="button"
                onClick={generateRandomBarcode}
                style={{ background: "none", border: "none", color: "#0284c7", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
              >
                ⚡ Auto Generate
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. 890123456789"
              value={barcodeText}
              onChange={(e) => setBarcodeText(e.target.value)}
              style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
        </section>

        {/* RIGHT COLUMN: PRESETS & VISIBILITY TOGGLES */}
        <section style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #cbd5e1" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: "0 0 12px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
            2. Paper & Field Visibility
          </h2>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Paper Format / Preset
            </label>
            <select
              value={preset}
              onChange={(e) => {
                const val = e.target.value as any;
                setPreset(val);
                if (val === "oddy24") setCopies("24");
                if (val === "oddy40") setCopies("40");
                if (val === "thermal") setCopies("1");
              }}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600" }}
            >
              <option value="oddy24">A4 Sheet - Oddy 24 Labels (3 × 8 Grid)</option>
              <option value="oddy40">A4 Sheet - Oddy 40 Labels (4 × 10 Grid)</option>
              <option value="thermal">Thermal Roll - 50mm × 25mm (2" × 1")</option>
            </select>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Total Labels Count
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>
            Show / Hide on Sticker:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "#1e293b" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="checkbox" checked={showStore} onChange={(e) => setShowStore(e.target.checked)} />
              Store Branding
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="checkbox" checked={showMrp} onChange={(e) => setShowMrp(e.target.checked)} />
              MRP Price
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="checkbox" checked={showOfferPrice} onChange={(e) => setShowOfferPrice(e.target.checked)} />
              Offer / Deal Price
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="checkbox" checked={showWeight} onChange={(e) => setShowWeight(e.target.checked)} />
              Weight / Size
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
              PKD Date
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="checkbox" checked={showBatch} onChange={(e) => setShowBatch(e.target.checked)} />
              Batch No
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="checkbox" checked={showBorder} onChange={(e) => setShowBorder(e.target.checked)} />
              Cut Guide Border
            </label>
          </div>
        </section>
      </div>

      {/* PRINT CANVAS (THE ACTUAL STICKERS) */}
      <section
        id="print-label-canvas"
        style={
          preset === "oddy24"
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "5px",
                width: "100%",
                background: "#ffffff",
                boxSizing: "border-box",
              }
            : preset === "oddy40"
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "4px",
                width: "100%",
                background: "#ffffff",
                boxSizing: "border-box",
              }
            : {
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
                width: "100%",
                background: "#ffffff",
              }
        }
      >
        {labelsArray.map((_, index) => (
          <div
            key={index}
            style={{
              width: preset === "thermal" ? "185px" : "auto",
              minHeight: preset === "oddy40" ? "95px" : "120px",
              border: showBorder ? "1px dashed #94a3b8" : "none",
              borderRadius: "5px",
              padding: preset === "oddy40" ? "4px 5px" : "6px 8px",
              textAlign: "center",
              background: "#ffffff",
              boxSizing: "border-box",
              pageBreakInside: "avoid",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Top Store Header */}
            {showStore && storeName && (
              <div
                style={{
                  fontSize: preset === "oddy40" ? "9px" : "10px",
                  fontWeight: "900",
                  color: "#000",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: "0.8px solid #000",
                  paddingBottom: "1px",
                  marginBottom: "2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {storeName}
              </div>
            )}

            {/* Product Name */}
            <div
              style={{
                fontSize: preset === "oddy40" ? "10px" : "11px",
                fontWeight: "700",
                color: "#000",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: "1.2",
              }}
            >
              {productName || "Product Name"}
            </div>

            {/* Price Row (MRP & Offer Price Combo) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", margin: "1px 0" }}>
              {showMrp && mrp && (
                <span
                  style={{
                    fontSize: preset === "oddy40" ? "10px" : "11px",
                    fontWeight: showOfferPrice ? "500" : "800",
                    color: "#000",
                    textDecoration: showOfferPrice && offerPrice ? "line-through" : "none",
                  }}
                >
                  MRP: ₹{mrp}
                </span>
              )}
              {showOfferPrice && offerPrice && (
                <span
                  style={{
                    fontSize: preset === "oddy40" ? "11px" : "12px",
                    fontWeight: "900",
                    color: "#000",
                    background: "#f1f5f9",
                    padding: "0 3px",
                    borderRadius: "3px",
                  }}
                >
                  OFFER: ₹{offerPrice}
                </span>
              )}
            </div>

            {/* Barcode Vector (Crisp rendering) */}
            <div style={{ padding: "1px 0" }}>
              <BarcodeSvg text={barcodeText || "890000000000"} />
            </div>

            {/* Numeric Code below barcode */}
            <div
              style={{
                fontSize: preset === "oddy40" ? "8.5px" : "9.5px",
                fontFamily: "monospace",
                letterSpacing: "1px",
                color: "#000",
                fontWeight: "700",
                marginTop: "-1px",
              }}
            >
              {barcodeText || "890000000000"}
            </div>

            {/* Bottom Meta Row (PKD Date, Weight/Size, Batch) */}
            {(showDate || showWeight || showBatch) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: preset === "oddy40" ? "7.5px" : "8.5px",
                  fontWeight: "600",
                  color: "#000",
                  borderTop: "0.5px solid #cbd5e1",
                  paddingTop: "2px",
                  marginTop: "2px",
                }}
              >
                {showWeight && netWeight ? <span>{netWeight}</span> : <span></span>}
                {showDate && packDate ? <span>PKD: {packDate}</span> : null}
                {showBatch && batchNo ? <span>B:{batchNo}</span> : null}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
