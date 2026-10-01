"use client";

import { useEffect, useState } from "react";
import BarcodeSvg from "../../components/BarcodeSvg";
import QrSvg from "../../components/QrSvg";

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
  const [qrContent, setQrContent] = useState("");
  const [mrp, setMrp] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [batchNo, setBatchNo] = useState("B-01");
  const [packDate, setPackDate] = useState("");
  const [copies, setCopies] = useState("24");

  // Code Modes & QR Styles
  const [codeType, setCodeType] = useState<"barcode" | "qr" | "dual">("dual");
  const [qrStyle, setQrStyle] = useState<"square" | "rounded" | "badge">("rounded");

  // Presets & Toggles
  const [preset, setPreset] = useState<"oddy24" | "oddy40" | "thermal">("oddy24");
  const [showStore, setShowStore] = useState(true);
  const [showMrp, setShowMrp] = useState(true);
  const [showOfferPrice, setShowOfferPrice] = useState(false);
  const [showDate, setShowDate] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [showBatch, setShowBatch] = useState(true);
  const [showBorder, setShowBorder] = useState(true);

  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    setPackDate(`${mm}/${yy}`);

    try {
      const savedBusinesses = localStorage.getItem("hisabpro_businesses");
      const activeId = localStorage.getItem("hisabpro_active_business");
      const savedBusiness = localStorage.getItem("hisabpro_business");

      let businessTitle = "";
      let upiId = "";

      if (savedBusinesses) {
        const list = JSON.parse(savedBusinesses);
        if (Array.isArray(list) && list.length > 0) {
          const current = list.find((b: any) => b.id === Number(activeId)) || list[0];
          if (current?.businessName) businessTitle = current.businessName;
          if (current?.upiId) upiId = current.upiId;
        }
      } else if (savedBusiness) {
        const single = JSON.parse(savedBusiness);
        if (single?.businessName) businessTitle = single.businessName;
        if (single?.upiId) upiId = single.upiId;
      }

      setStoreName(businessTitle);

      const savedProds = localStorage.getItem("hisabpro_products");
      if (savedProds) {
        const parsed = JSON.parse(savedProds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          handleSelectProduct(parsed[0], upiId, businessTitle);
        }
      }
    } catch {}
  }, []);

  function handleSelectProduct(prod: Product, upi: string = "", bName: string = "") {
    setSelectedProduct(prod);
    setProductName(prod.name || "");
    const code = prod.barcode || String(prod.id);
    setBarcodeText(code);
    setMrp(String(prod.salePrice || ""));

    if (upi) {
      setQrContent(`upi://pay?pa=${upi}&pn=${encodeURIComponent(bName || "Store")}&am=${prod.salePrice || ""}&cu=INR`);
    } else {
      setQrContent(code);
    }
  }

  function generateRandomBarcode() {
    const random = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setBarcodeText(random);
    if (!qrContent.startsWith("upi://")) {
      setQrContent(random);
    }
  }

  const numCopies = Math.max(1, Math.min(200, Number(copies) || 1));
  const labelsArray = Array.from({ length: numCopies });

  return (
    <main style={{ padding: "16px", maxWidth: "900px", margin: "0 auto", paddingBottom: "90px", fontFamily: "system-ui, sans-serif" }}>
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
        <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#102a56", margin: 0 }}>Barcode & QR Studio Pro</h1>
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
          <span>🖨️</span> Print Labels
        </button>
      </header>

      {/* CONTROLS */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {/* LEFT COLUMN: ITEM INFO */}
        <section style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #cbd5e1" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: "0 0 12px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
            1. Product Details
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
                Stock Item Se Select Karein
              </label>
              <select
                style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#f8fafc" }}
                onChange={(e) => {
                  const item = products.find((p) => p.id === Number(e.target.value));
                  if (item) handleSelectProduct(item, "", storeName);
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
              Product Name
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
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>MRP (₹)</label>
              <input
                type="text"
                placeholder="499"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#0284c7", marginBottom: "4px" }}>Offer Price (₹)</label>
              <input
                type="text"
                placeholder="399"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #0284c7", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Wt / Size</label>
              <input
                type="text"
                placeholder="500g"
                value={netWeight}
                onChange={(e) => setNetWeight(e.target.value)}
                style={{ width: "100%", padding: "7px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>PKD Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={packDate}
                onChange={(e) => setPackDate(e.target.value)}
                style={{ width: "100%", padding: "7px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Batch No</label>
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
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569" }}>Code Number</label>
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
              value={barcodeText}
              onChange={(e) => {
                setBarcodeText(e.target.value);
                if (!qrContent.startsWith("upi://")) setQrContent(e.target.value);
              }}
              style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
        </section>

        {/* RIGHT COLUMN: CODE TYPE & QR DESIGN */}
        <section style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #cbd5e1" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: "0 0 12px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
            2. Barcode & QR Designs
          </h2>

          {/* Code Mode Selector */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Sticker Format Mode
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              {[
                { id: "barcode", label: "Barcode" },
                { id: "qr", label: "QR Only" },
                { id: "dual", label: "Dual (Both)" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCodeType(m.id as any)}
                  style={{
                    padding: "7px 4px",
                    borderRadius: "6px",
                    border: codeType === m.id ? "2px solid #102a56" : "1px solid #cbd5e1",
                    background: codeType === m.id ? "#102a56" : "#ffffff",
                    color: codeType === m.id ? "#ffffff" : "#1e293b",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* QR Design Option */}
          {(codeType === "qr" || codeType === "dual") && (
            <div style={{ marginBottom: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#102a56", marginBottom: "6px" }}>
                QR Code Design Style
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                {[
                  { id: "square", name: "Classic" },
                  { id: "rounded", name: "Soft Rounded" },
                  { id: "badge", name: "Scan Me Badge" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setQrStyle(s.id as any)}
                    style={{
                      padding: "6px 2px",
                      borderRadius: "6px",
                      border: qrStyle === s.id ? "2px solid #0284c7" : "1px solid #cbd5e1",
                      background: qrStyle === s.id ? "#e0f2fe" : "#ffffff",
                      color: qrStyle === s.id ? "#0284c7" : "#475569",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paper Format */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Paper Size
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
              style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "600" }}
            >
              <option value="oddy24">A4 Sheet - Oddy 24 (3 × 8 Grid)</option>
              <option value="oddy40">A4 Sheet - Oddy 40 (4 × 10 Grid)</option>
              <option value="thermal">Thermal Roll - 50mm × 25mm</option>
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Sticker Copies
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
              style={{ width: "100%", padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px", color: "#1e293b" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input type="checkbox" checked={showStore} onChange={(e) => setShowStore(e.target.checked)} /> Store Name
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input type="checkbox" checked={showMrp} onChange={(e) => setShowMrp(e.target.checked)} /> MRP
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input type="checkbox" checked={showOfferPrice} onChange={(e) => setShowOfferPrice(e.target.checked)} /> Offer Price
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input type="checkbox" checked={showWeight} onChange={(e) => setShowWeight(e.target.checked)} /> Wt / Size
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} /> PKD Date
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input type="checkbox" checked={showBatch} onChange={(e) => setShowBatch(e.target.checked)} /> Batch No
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input type="checkbox" checked={showBorder} onChange={(e) => setShowBorder(e.target.checked)} /> Border
            </label>
          </div>
        </section>
      </div>

      {/* PRINT CANVAS */}
      <section
        id="print-label-canvas"
        style={
          preset === "oddy24"
            ? { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px", width: "100%", background: "#fff" }
            : preset === "oddy40"
            ? { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", width: "100%", background: "#fff" }
            : { display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", width: "100%", background: "#fff" }
        }
      >
        {labelsArray.map((_, index) => (
          <div
            key={index}
            style={{
              width: preset === "thermal" ? "185px" : "auto",
              minHeight: preset === "oddy40" ? "95px" : "125px",
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
            {/* Store Title */}
            {showStore && storeName && (
              <div
                style={{
                  fontSize: preset === "oddy40" ? "8.5px" : "9.5px",
                  fontWeight: "900",
                  color: "#000",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
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

            {/* Product Title */}
            <div
              style={{
                fontSize: preset === "oddy40" ? "9.5px" : "11px",
                fontWeight: "700",
                color: "#000",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {productName || "Product Name"}
            </div>

            {/* Price Line */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", margin: "1px 0" }}>
              {showMrp && mrp && (
                <span
                  style={{
                    fontSize: preset === "oddy40" ? "9.5px" : "10.5px",
                    fontWeight: showOfferPrice ? "500" : "800",
                    color: "#000",
                    textDecoration: showOfferPrice && offerPrice ? "line-through" : "none",
                  }}
                >
                  MRP: ₹{mrp}
                </span>
              )}
              {showOfferPrice && offerPrice && (
                <span style={{ fontSize: preset === "oddy40" ? "10px" : "11.5px", fontWeight: "900", color: "#000" }}>
                  OFFER: ₹{offerPrice}
                </span>
              )}
            </div>

            {/* CODE DISPLAY AREA (Barcode, QR or Dual) */}
            <div style={{ margin: "2px 0" }}>
              {codeType === "barcode" && (
                <>
                  <BarcodeSvg text={barcodeText || "890000000000"} />
                  <div style={{ fontSize: "8.5px", fontFamily: "monospace", letterSpacing: "1px", color: "#000", fontWeight: "700", marginTop: "-1px" }}>
                    {barcodeText || "890000000000"}
                  </div>
                </>
              )}

              {codeType === "qr" && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <QrSvg text={qrContent || barcodeText || "890000000000"} size={preset === "oddy40" ? 42 : 54} style={qrStyle} />
                </div>
              )}

              {codeType === "dual" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <div style={{ flex: 1 }}>
                    <BarcodeSvg text={barcodeText || "890000000000"} />
                    <div style={{ fontSize: "8px", fontFamily: "monospace", letterSpacing: "0.5px", color: "#000", fontWeight: "700" }}>
                      {barcodeText || "890000000000"}
                    </div>
                  </div>
                  <div>
                    <QrSvg text={qrContent || barcodeText || "890000000000"} size={preset === "oddy40" ? 38 : 46} style={qrStyle} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Meta (Weight, Date, Batch) */}
            {(showDate || showWeight || showBatch) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: preset === "oddy40" ? "7px" : "8px",
                  fontWeight: "600",
                  color: "#000",
                  borderTop: "0.5px solid #cbd5e1",
                  paddingTop: "1px",
                  marginTop: "1px",
                }}
              >
                {showWeight && netWeight ? <span>{netWeight}</span> : <span></span>}
                {showDate && packDate ? <span>PKD: {packDate}</span> : <span></span>}
                {showBatch && batchNo ? <span>B: {batchNo}</span> : <span></span>}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
