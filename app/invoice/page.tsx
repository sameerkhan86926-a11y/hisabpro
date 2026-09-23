"use client";

import { useEffect, useState } from "react";

type Sale = {
  id: number;
  product: string;
  price: number;
  purchasePrice?: number;
  quantity: number;
  discount: number;
  total: number;
  date: string;
  paymentType?: "cash" | "credit";
  customerName?: string;
};

type Business = {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  gstin: string;
  email: string;
};

const defaultBusiness: Business = {
  businessName: "HisabPro",
  ownerName: "",
  phone: "",
  address: "",
  gstin: "",
  email: "",
};

export default function InvoicePage() {
  const [sale, setSale] = useState<Sale | null>(null);

  const [business, setBusiness] =
    useState<Business>(defaultBusiness);

  useEffect(() => {
    const savedSale = localStorage.getItem(
      "hisabpro_last_invoice"
    );

    if (savedSale) {
      setSale(JSON.parse(savedSale));
    }

    const savedBusiness = localStorage.getItem(
      "hisabpro_business"
    );

    if (savedBusiness) {
      setBusiness({
        ...defaultBusiness,
        ...JSON.parse(savedBusiness),
      });
    }
  }, []);

  if (!sale) {
    return (
      <main className="invoice-page">

        <header className="invoice-header">

          <button
            onClick={() => window.history.back()}
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

          <p>
            Create a sale first to generate an invoice.
          </p>

          <a href="/hisabpro/sales/">
            Create New Sale
          </a>

        </div>

      </main>
    );
  }

  const subtotal = sale.price * sale.quantity;

  const whatsappText = `Invoice #${sale.id}
${business.businessName || "HisabPro"}
${business.phone ? `Phone: ${business.phone}` : ""}
${business.address ? `Address: ${business.address}` : ""}

Product: ${sale.product}
Qty: ${sale.quantity}
Rate: ₹${sale.price.toLocaleString("en-IN")}
Discount: ₹${sale.discount.toLocaleString("en-IN")}
Total: ₹${sale.total.toLocaleString("en-IN")}
Payment: ${
    sale.paymentType === "credit"
      ? "Credit / Udhaar"
      : "Cash"
  }`;

  return (
    <main className="invoice-page">

      <header className="invoice-header">

        <button
          onClick={() => window.history.back()}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Invoice</h1>

        <button
          onClick={() => window.print()}
          className="print-button"
        >
          🖨 Print
        </button>

      </header>

      <section className="invoice-card">

        {/* BUSINESS DETAILS */}

        <div className="invoice-business">

          <div>

            <h2>
              {business.businessName || "HisabPro"}
            </h2>

            <p>
              Sales • Stock • Khata • Profit
            </p>

            {business.ownerName && (
              <p className="business-detail">
                Owner: {business.ownerName}
              </p>
            )}

            {business.phone && (
              <p className="business-detail">
                Phone: {business.phone}
              </p>
            )}

            {business.address && (
              <p className="business-detail">
                {business.address}
              </p>
            )}

            {business.email && (
              <p className="business-detail">
                Email: {business.email}
              </p>
            )}

            {business.gstin && (
              <p className="business-detail">
                GSTIN: {business.gstin}
              </p>
            )}

          </div>

          <div className="invoice-number">

            <span>Invoice No.</span>

            <strong>
              #{sale.id}
            </strong>

          </div>

        </div>

        {/* DATE + PAYMENT */}

        <div className="invoice-meta">

          <div>

            <span>Date</span>

            <strong>
              {new Date(
                sale.date
              ).toLocaleString("en-IN")}
            </strong>

          </div>

          <div>

            <span>Payment</span>

            <strong>
              {sale.paymentType === "credit"
                ? "Credit / Udhaar"
                : "Cash"}
            </strong>

          </div>

        </div>

        {/* CUSTOMER */}

        {sale.customerName && (
          <div className="invoice-customer">

            <span>Customer</span>

            <strong>
              {sale.customerName}
            </strong>

          </div>
        )}

        {/* PRODUCTS */}

        <div className="invoice-table">

          <div className="invoice-row invoice-table-head">

            <span>Item</span>

            <span>Qty</span>

            <span>Rate</span>

            <span>Amount</span>

          </div>

          <div className="invoice-row">

            <span>
              {sale.product}
            </span>

            <span>
              {sale.quantity}
            </span>

            <span>
              ₹
              {sale.price.toLocaleString(
                "en-IN"
              )}
            </span>

            <span>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </span>

          </div>

        </div>

        {/* TOTAL */}

        <div className="invoice-total">

          <div>

            <span>Subtotal</span>

            <strong>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div>

            <span>Discount</span>

            <strong>
              ₹
              {sale.discount.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div className="grand-total">

            <span>Total</span>

            <strong>
              ₹
              {sale.total.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

        {/* FOOTER */}

        <div className="invoice-footer">

          <strong>
            Thank you for your business!
          </strong>

          <span>
            Powered by HisabPro
          </span>

        </div>

      </section>

      {/* ACTIONS */}

      <div className="invoice-actions">

        <button
          onClick={() => window.print()}
        >
          🖨 Print / Save PDF
        </button>

        <button
          onClick={() => {
            window.open(
              `https://wa.me/?text=${encodeURIComponent(
                whatsappText
              )}`,
              "_blank"
            );
          }}
        >
          💬 Share on WhatsApp
        </button>

      </div>

    </main>
  );
}
