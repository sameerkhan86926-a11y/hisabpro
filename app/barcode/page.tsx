"use client";

import { useEffect, useState } from "react";
import BarcodeSvg from "../../components/BarcodeSvg";

type Product = {
  id: number;
  name: string;
  barcode: string;
  salePrice: number | string;
};

export default function BarcodePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form Fields
  const [productName, setProductName] = useState("");
  const [barcodeText, setBarcodeText] = useState("");
  const [price, setPrice] = useState("");
  const [copies, setCopies] = useState("12");
  const [paperFormat, setPaperFormat] = useState<"a4" | "thermal">("a4");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hisabpro_products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setProducts(parsed);
          if (parsed.length > 0) {
            handleSelectProduct(parsed[0]);
          }
        }
      }
    } catch {}
  }, []);

  function handleSelectProduct(prod: Product) {
    setSelectedProduct(prod);
    setProductName(prod.name || "");
    setBarcodeText(prod.barcode || String(prod.id));
    setPrice(String(prod.salePrice || ""));
  }

  function generateRandomBarcode() {
    const random = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setBarcodeText(random);
  }

  const numCopies = Math.max(1, Math.min(100, Number(copies) || 1));
  const labelsArray = Array.from({ length: numCopies });

  return (
    <main style={{ padding: "16px", maxWidth: "800px", margin: "0 auto", paddingBottom: "80px", fontFamily: "system-ui, sans-serif" }}>
      {/* Print Specific CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              #print-label-area, #print-label-area * { visibility: visible; }
              #print-label-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
              }
              .no-print { display: none !important; }
            }
          `,
        }}
      />

      <header className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <a href="/hisabpro/more/" style={{ textDecoration: "none", color: "#102a56", fontWeight: "700" }}>← Back to More</a>
        <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#102a56", margin: 0 }}>Barcode Generator</h1>
        <span></span>
      </header>

      {/* CONTROLS (NO PRINT) */}
      <section className="no-print" style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
        {products.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Stock Se Product Select Karein (Optional)
            </label>
            <select
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              onChange={(e) => {
                const found = products.find((p) => p.id === Number(e.target.value));
                if (found) handleSelectProduct(found);
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Product Name
            </label>
            <input
              type="text"
              placeholder="e.g. Cotton Shirt"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Price (MRP / Sale)
            </label>
            <input
              type="text"
              placeholder="e.g. 499"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>Barcode Number / Code</label>
            <button
              type="button"
              onClick={generateRandomBarcode}
              style={{ background: "none", border: "none", color: "#0284c7", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
            >
              ⚡ Auto Generate
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g. 890123456789"
            value={barcodeText}
            onChange={(e) => setBarcodeText(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Total Labels (Count)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
              Print Format
            </label>
            <select
              value={paperFormat}
              onChange={(e) => setPaperFormat(e.target.value as "a4" | "thermal")}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            >
              <option value="a4">A4 Sheet (Multi-label Grid)</option>
              <option value="thermal">Thermal Roll (Single 50x25mm)</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            backgroundColor: "#102a56",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "15px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>🖨️</span> Print Labels Now
        </button>
      </section>

      {/* PRINTABLE LABEL AREA */}
      <section
        id="print-label-area"
        style={
          paperFormat === "a4"
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "8px",
                padding: "8px",
                background: "#ffffff",
              }
            : {
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                alignItems: "center",
                padding: "4px",
                background: "#ffffff",
              }
        }
      >
        {labelsArray.map((_, index) => (
          <div
            key={index}
            style={{
              width: paperFormat === "thermal" ? "180px" : "auto",
              border: "1px dashed #94a3b8",
              borderRadius: "6px",
              padding: "6px",
              textAlign: "center",
              background: "#ffffff",
              boxSizing: "border-box",
              pageBreakInside: "avoid",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "2px" }}>
              {productName || "Product Name"}
            </div>

            {price && (
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#000", marginBottom: "2px" }}>
                MRP: ₹{price}
              </div>
            )}

            <div style={{ padding: "2px 4px" }}>
              <BarcodeSvg text={barcodeText || "890000000000"} />
            </div>

            <div style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "1px", color: "#000", marginTop: "1px" }}>
              {barcodeText || "890000000000"}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
