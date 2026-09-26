"use client";

import { useEffect, useState } from "react";

type PaymentType = "cash" | "credit";

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

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

  product?: string;
  price?: number;
  purchasePrice?: number;
  quantity?: number;

  subtotal: number;
  discount: number;
  total: number;
  date: string;

  paymentType?: PaymentType;
  paymentMode?: PaymentMode;

  customerName?: string;
};

type Business = {
  id?: number;
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  gstin: string;
  email: string;
  upiId?: string;
};

type InvoiceLine = {
  key: string;
  product: string;
  quantity: number;
  price: number;
  amount: number;
};

const defaultBusiness: Business = {
  businessName: "HisabPro",
  ownerName: "",
  phone: "",
  address: "",
  gstin: "",
  email: "",
  upiId: "",
};

export default function InvoicePage() {
  const [sale, setSale] = useState<Sale | null>(null);
  const [business, setBusiness] = useState<Business>(defaultBusiness);
  const [showDoneDialog, setShowDoneDialog] = useState(false);
  const [paperMode, setPaperMode] = useState<"thermal" | "a4">("thermal");

  /*
   * =====================================
   * LOAD DATA
   * =====================================
   */
  useEffect(() => {
    const savedSale = localStorage.getItem("hisabpro_last_invoice");
    if (savedSale) {
      try {
        setSale(JSON.parse(savedSale));
      } catch {
        console.log("Invoice data could not be loaded.");
      }
    }

    const savedBusinesses = localStorage.getItem("hisabpro_businesses");
    const savedActiveId = localStorage.getItem("hisabpro_active_business");

    if (savedBusinesses) {
      try {
        const businesses = JSON.parse(savedBusinesses);
        if (Array.isArray(businesses) && businesses.length > 0) {
          let activeBusiness: Business | undefined;
          if (savedActiveId) {
            const activeId = Number(savedActiveId);
            activeBusiness = businesses.find(
              (item: Business) => Number(item.id) === activeId
            );
          }
          if (!activeBusiness) {
            activeBusiness = businesses[0];
          }
          if (activeBusiness) {
            setBusiness({
              ...defaultBusiness,
              ...activeBusiness,
            });
          }
        }
      } catch {
        console.log("Business profiles could not be loaded.");
      }
    } else {
      const savedBusiness = localStorage.getItem("hisabpro_business");
      if (savedBusiness) {
        try {
          setBusiness({
            ...defaultBusiness,
            ...JSON.parse(savedBusiness),
          });
        } catch {
          console.log("Business details could not be loaded.");
        }
      }
    }
  }, []);

  function getPaymentModeLabel(
    paymentType?: PaymentType,
    paymentMode?: PaymentMode
  ) {
    if (paymentType === "credit") {
      return "Credit / Udhaar";
    }

    switch (paymentMode || "cash") {
      case "cash":
        return "Cash";
      case "upi":
        return "UPI";
      case "card":
        return "Card";
      case "bank":
        return "Bank Transfer";
      case "online":
        return "Online";
      default:
        return "Cash";
    }
  }

  if (!sale) {
    return (
      <main className="invoice-page">
        <header className="invoice-header">
          <button
            type="button"
            onClick={() => (window.location.href = "/hisabpro/")}
            className="back-button"
          >
            ← Back
          </button>
          <h1>Invoice</h1>
          <span></span>
        </header>

        <div className="invoice-empty">
          <div>🧾</div>
          <h2>No Invoice Found</h2>
          <p>Create a sale first to generate an invoice.</p>
          <a href="/hisabpro/sales/">Create New Sale</a>
        </div>
      </main>
    );
  }

  const items: SaleItem[] =
    sale.items && sale.items.length > 0
      ? sale.items
      : sale.product
      ? [
          {
            productId: 0,
            product: sale.product,
            price: sale.price || 0,
            purchasePrice: sale.purchasePrice || 0,
            quantity: sale.quantity || 1,
            amount: (sale.price || 0) * (sale.quantity || 1),
          },
        ]
      : [];

  const invoiceLines: InvoiceLine[] = [];

  items.forEach((item, itemIndex) => {
    if (item.batchDetails && item.batchDetails.length > 0) {
      item.batchDetails.forEach((batch, batchIndex) => {
        invoiceLines.push({
          key: `${item.productId}-${itemIndex}-${batch.batchId}-${batchIndex}`,
          product: item.product,
          quantity: batch.quantity,
          price: batch.sellingPrice,
          amount: batch.sellingPrice * batch.quantity,
        });
      });
    } else {
      invoiceLines.push({
        key: `${item.productId}-${itemIndex}`,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount,
      });
    }
  });

  const paymentLabel = getPaymentModeLabel(
    sale.paymentType,
    sale.paymentMode
  );

  /*
   * =====================================
   * DYNAMIC UPI VARIABLES
   * =====================================
   */
  const upiId = business.upiId || (business.phone ? `${business.phone}@upi` : "");
  const payeeName = business.businessName || business.ownerName || "HisabPro";
  const formattedAmount = Number(sale.total || 0).toFixed(2);

  // Intent Link for QR Code
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(
    `Invoice #${sale.id}`
  )}`;

  // QR Code Image URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    upiDeepLink
  )}`;

  /*
   * =====================================
   * SHARE TEXT BUILDER (Clean UPI Info)
   * =====================================
   */
  const shareItems = invoiceLines
    .map(
      (item) =>
        `${item.product} × ${item.quantity} @ ₹${Number(
          item.price || 0
        ).toLocaleString("en-IN")} = ₹${Number(
          item.amount || 0
        ).toLocaleString("en-IN")}`
    )
    .join("\n");

  const shareText = `🧾 *Invoice #${sale.id}*
*${business.businessName || "HisabPro"}*
${business.ownerName ? `Owner: ${business.ownerName}\n` : ""}${business.phone ? `Phone: ${business.phone}\n` : ""}${business.address ? `Address: ${business.address}\n` : ""}
${shareItems}

-----------------------------
*Subtotal:* ₹${Number(sale.subtotal || 0).toLocaleString("en-IN")}
*Discount:* ₹${Number(sale.discount || 0).toLocaleString("en-IN")}
*Grand Total:* ₹${Number(sale.total || 0).toLocaleString("en-IN")}
*Payment Status:* ${paymentLabel}
${
  upiId
    ? `\n📲 *UPI Payment Details:*
• *UPI ID:* \`${upiId}\`
• *Amount to Pay:* ₹${Number(formattedAmount).toLocaleString("en-IN")}
_(Pay using Google Pay, PhonePe, or Paytm)_`
    : ""
}

_Thank you for your business!_`;

  /*
   * =====================================
   * ACTIONS HANDLERS
   * =====================================
   */
  function handlePrint() {
    try {
      // 1. Android Native Print Bridge check (Direct hardware spooler)
      const androidPrint = typeof window !== "undefined" && (window as any).AndroidPrint;
      if (androidPrint && typeof androidPrint.print === "function") {
        androidPrint.print();
      } else if (typeof window !== "undefined" && window.print) {
        // 2. Browser standard printing
        window.print();
      }
    } catch (err) {
      console.error("Print action failed:", err);
    }

    // Modal ko smooth delay ke baad layein taaki print prompt interfere na kare
    setTimeout(() => {
      setShowDoneDialog(true);
    }, 1500);
  }

  function handleWhatsAppShare() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
    setShowDoneDialog(true);
  }

  async function handleUniversalShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice #${sale?.id} - ${business.businessName || "HisabPro"}`,
          text: shareText,
        });
      } catch (err) {
        console.log("Share dismissed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Invoice details copied to clipboard!");
      } catch {
        handleWhatsAppShare();
        return;
      }
    }
    setShowDoneDialog(true);
  }

  return (
    <main className="invoice-page">
      {/* THERMAL & PRINT DYNAMIC STYLES */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-header,
          .invoice-actions,
          .print-format-bar,
          .back-button {
            display: none !important;
          }

          /* 58mm POS Slip Mode Styles */
          .thermal-mode {
            width: 58mm !important;
            max-width: 58mm !important;
            margin: 0 auto !important;
            padding: 8px 6px !important;
            font-size: 11px !important;
            line-height: 1.25 !important;
            font-family: monospace, Courier, sans-serif !important;
            box-shadow: none !important;
            border: none !important;
          }
          .thermal-mode h2 {
            font-size: 14px !important;
            text-align: center !important;
            margin: 0 0 2px 0 !important;
          }
          .thermal-mode p,
          .thermal-mode span,
          .thermal-mode strong {
            font-size: 10px !important;
          }
          .thermal-mode .invoice-business {
            text-align: center !important;
            border-bottom: 1px dashed #000 !important;
            padding-bottom: 6px !important;
            margin-bottom: 6px !important;
          }
          .thermal-mode .invoice-meta {
            border-bottom: 1px dashed #000 !important;
            padding-bottom: 4px !important;
            margin-bottom: 6px !important;
          }
          .thermal-mode .invoice-table-head {
            border-bottom: 1px solid #000 !important;
            font-weight: bold !important;
          }
          .thermal-mode .invoice-row {
            padding: 2px 0 !important;
          }
          .thermal-mode .invoice-total {
            border-top: 1px dashed #000 !important;
            margin-top: 6px !important;
            padding-top: 4px !important;
          }
          .thermal-mode .grand-total strong {
            font-size: 13px !important;
          }
          .thermal-mode .thermal-qr {
            width: 110px !important;
            height: 110px !important;
          }
          .thermal-mode .invoice-footer {
            border-top: 1px dashed #000 !important;
            margin-top: 6px !important;
            padding-top: 6px !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="invoice-header">
        <button
          type="button"
          onClick={() => (window.location.href = "/hisabpro/")}
          className="back-button"
        >
          ← Back
        </button>
        <h1>Invoice</h1>
        <button
          type="button"
          onClick={handlePrint}
          className="print-button"
        >
          🖨 Print
        </button>
      </header>

      {/* PRINT FORMAT SELECTOR (58mm Slip vs A4) */}
      <div
        className="print-format-bar"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          margin: "12px auto 4px auto",
          maxWidth: "480px",
          padding: "0 12px",
        }}
      >
        <button
          type="button"
          onClick={() => setPaperMode("thermal")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            border: paperMode === "thermal" ? "1.5px solid #102a56" : "1px solid #cbd5e1",
            background: paperMode === "thermal" ? "#102a56" : "#ffffff",
            color: paperMode === "thermal" ? "#ffffff" : "#475569",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          🧾 58mm Slip (POS)
        </button>
        <button
          type="button"
          onClick={() => setPaperMode("a4")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            border: paperMode === "a4" ? "1.5px solid #102a56" : "1px solid #cbd5e1",
            background: paperMode === "a4" ? "#102a56" : "#ffffff",
            color: paperMode === "a4" ? "#ffffff" : "#475569",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          📄 Standard A4
        </button>
      </div>

      {/* INVOICE CARD */}
      <section className={`invoice-card ${paperMode === "thermal" ? "thermal-mode" : ""}`}>
        {/* BUSINESS INFO */}
        <div className="invoice-business">
          <div>
            <h2>{business.businessName || "HisabPro"}</h2>
            <p>Sales • Stock • Khata • Profit</p>
            {business.ownerName && (
              <p className="business-detail">Owner: {business.ownerName}</p>
            )}
            {business.phone && (
              <p className="business-detail">Phone: {business.phone}</p>
            )}
            {business.address && (
              <p className="business-detail">{business.address}</p>
            )}
            {business.email && (
              <p className="business-detail">Email: {business.email}</p>
            )}
            {business.gstin && (
              <p className="business-detail">GSTIN: {business.gstin}</p>
            )}
          </div>

          <div className="invoice-number">
            <span>Invoice No.</span>
            <strong>#{sale.id}</strong>
          </div>
        </div>

        {/* DATE & PAYMENT */}
        <div className="invoice-meta">
          <div>
            <span>Date</span>
            <strong>
              {new Date(sale.date).toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Payment</span>
            <strong>{paymentLabel}</strong>
          </div>
        </div>

        {/* CUSTOMER */}
        {sale.customerName && (
          <div className="invoice-customer">
            <span>Customer</span>
            <strong>{sale.customerName}</strong>
          </div>
        )}

        {/* ITEMS TABLE */}
        <div className="invoice-table">
          <div className="invoice-row invoice-table-head">
            <span>Item</span>
            <span>Qty</span>
            <span>Rate</span>
            <span>Amount</span>
          </div>

          {invoiceLines.map((item) => (
            <div className="invoice-row" key={item.key}>
              <span>{item.product}</span>
              <span>{item.quantity}</span>
              <span>
                ₹{Number(item.price || 0).toLocaleString("en-IN")}
              </span>
              <span>
                ₹{Number(item.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>

        {/* TOTAL CALCULATION */}
        <div className="invoice-total">
          <div>
            <span>Subtotal</span>
            <strong>
              ₹{Number(sale.subtotal || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>
              ₹{Number(sale.discount || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="grand-total">
            <span>Total</span>
            <strong>
              ₹{Number(sale.total || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        {/* DYNAMIC UPI QR CODE SECTION */}
        {upiId && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "20px 0 14px 0",
              padding: "14px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Scan & Pay via UPI
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "#64748b",
                marginBottom: "10px",
              }}
            >
              Google Pay • PhonePe • Paytm • Any UPI
            </span>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="UPI QR Code"
              className="thermal-qr"
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "8px",
                background: "#ffffff",
                padding: "6px",
                border: "1px solid #e2e8f0",
              }}
            />

            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#0f172a",
                marginTop: "6px",
              }}
            >
              UPI ID: {upiId}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#16a34a",
                marginTop: "2px",
              }}
            >
              Exact Amount: ₹{Number(formattedAmount).toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {/* FOOTER */}
        <div className="invoice-footer">
          <strong>Thank you for your business!</strong>
          <span>Powered by HisabPro</span>
        </div>
      </section>

      {/* ACTIONS */}
      <div
        className="invoice-actions"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        <button
          type="button"
          onClick={handlePrint}
          style={{
            padding: "12px 6px",
            fontSize: "13px",
            fontWeight: 700,
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            cursor: "pointer",
          }}
        >
          🖨️ <span>Print</span>
        </button>

        <button
          type="button"
          onClick={handleWhatsAppShare}
          style={{
            padding: "12px 6px",
            fontSize: "13px",
            fontWeight: 700,
            borderRadius: "10px",
            border: "none",
            background: "#25D366",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ minWidth: "17px" }}
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.668-.699c.969.54 1.761.82 2.79.82 3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.766-5.766zm9.969 5.766c0 5.503-4.478 9.97-9.97 9.97-1.748 0-3.381-.453-4.81-1.246l-5.22 1.368 1.393-5.086c-.901-1.503-1.423-3.262-1.423-5.006 0-5.502 4.478-9.97 9.97-9.97s10.06 4.468 10.06 9.97z" />
          </svg>
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleUniversalShare}
          style={{
            padding: "12px 6px",
            fontSize: "13px",
            fontWeight: 700,
            borderRadius: "10px",
            border: "1px solid #102a56",
            background: "#102a56",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            cursor: "pointer",
          }}
        >
          📤 <span>Share</span>
        </button>
      </div>

      {/* ACTION COMPLETE POPUP / REDIRECT MODAL */}
      {showDoneDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "24px 20px",
              maxWidth: "340px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>✅</div>
            <h3
              style={{
                margin: "0 0 6px 0",
                fontSize: "18px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Invoice Processed!
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Bill details have been printed / shared. Choose what to do next:
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => (window.location.href = "/hisabpro/sales/")}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#102a56",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ➕ Create New Sale
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "/hisabpro/")}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#f1f5f9",
                  color: "#1e293b",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                🏠 Back to Home / Dashboard
              </button>

              <button
                type="button"
                onClick={() => setShowDoneDialog(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "13px",
                  padding: "6px",
                  cursor: "pointer",
                }}
              >
                Stay on this invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
