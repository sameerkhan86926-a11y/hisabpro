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

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(
    `Invoice #${sale.id}`
  )}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    upiDeepLink
  )}`;

  /*
   * =====================================
   * SHARE TEXT BUILDER
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
    ? `\n💳 *Pay Exact Bill Amount (₹${Number(formattedAmount).toLocaleString("en-IN")}) via UPI:*
👉 ${upiDeepLink}`
    : ""
}

_Thank you for your business!_`;

  /*
   * =====================================
   * ACTIONS HANDLERS (PRINT & SHARE)
   * =====================================
   */
  function handlePrint() {
    window.print();
    setTimeout(() => {
      setShowDoneDialog(true);
    }, 1000);
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
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText)}`,
          "_blank"
        );
      }
    }
    setShowDoneDialog(true);
  }

  return (
    <main className="invoice-page">
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

      {/* INVOICE CARD */}
      <section className="invoice-card">
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
              margin: "24px 0 16px 0",
              padding: "16px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "13px",
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
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "12px",
              }}
            >
              Google Pay • PhonePe • Paytm • Any UPI App
            </span>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="UPI QR Code"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "8px",
                background: "#ffffff",
                padding: "8px",
                border: "1px solid #e2e8f0",
              }}
            />

            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#0f172a",
                marginTop: "8px",
              }}
            >
              UPI ID: {upiId}
            </span>
            <span
              style={{
                fontSize: "13px",
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
      <div className="invoice-actions">
        <button type="button" onClick={handlePrint}>
          🖨 Print / Save PDF
        </button>

        <button type="button" onClick={handleUniversalShare}>
          📤 Share
        </button>
      </div>

      {/* =====================================
          ACTION COMPLETE POPUP / REDIRECT MODAL
          ===================================== */}
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
