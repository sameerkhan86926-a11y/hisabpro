"use client";

import { useEffect, useState } from "react";

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

  // Old single-product sale compatibility
  product?: string;
  price?: number;
  purchasePrice?: number;
  quantity?: number;

  subtotal: number;
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

  /*
   * Convert old single-product sale
   * into the new items format.
   */
  const items: SaleItem[] =
    sale.items && sale.items.length > 0
      ? sale.items
      : sale.product
        ? [
            {
              productId: 0,
              product: sale.product,
              price: sale.price || 0,
              purchasePrice:
                sale.purchasePrice || 0,
              quantity: sale.quantity || 1,
              amount:
                (sale.price || 0) *
                (sale.quantity || 1),
            },
          ]
        : [];

  /*
   * Convert batch-aware sale items into
   * invoice lines.
   *
   * If one product was sold from multiple
   * batches at different rates, each batch
   * will appear as a separate invoice line.
   */
  const invoiceLines: InvoiceLine[] = [];

  items.forEach((item, itemIndex) => {
    if (
      item.batchDetails &&
      item.batchDetails.length > 0
    ) {
      item.batchDetails.forEach(
        (batch, batchIndex) => {
          invoiceLines.push({
            key: `${item.productId}-${itemIndex}-${batch.batchId}-${batchIndex}`,
            product: item.product,
            quantity: batch.quantity,
            price: batch.sellingPrice,
            amount:
              batch.sellingPrice *
              batch.quantity,
          });
        }
      );
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

  const whatsappItems = invoiceLines
    .map(
      (item) =>
        `${item.product} × ${item.quantity} @ ₹${item.price.toLocaleString(
          "en-IN"
        )} = ₹${item.amount.toLocaleString(
          "en-IN"
        )}`
    )
    .join("\n");

  const whatsappText = `Invoice #${sale.id}
${business.businessName || "HisabPro"}
${business.phone ? `Phone: ${business.phone}` : ""}
${business.address ? `Address: ${business.address}` : ""}

${whatsappItems}

Subtotal: ₹${sale.subtotal.toLocaleString("en-IN")}
Discount: ₹${sale.discount.toLocaleString("en-IN")}
Total: ₹${sale.total.toLocaleString("en-IN")}
Payment: ${
    sale.paymentType === "credit"
      ? "Credit / Udhaar"
      : "Cash"
  }`;

  return (
    <main className="invoice-page">

      {/* HEADER */}

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

      {/* INVOICE */}

      <section className="invoice-card">

        {/* BUSINESS */}

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

        {/* DATE / PAYMENT */}

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

        {/* ITEMS TABLE */}

        <div className="invoice-table">

          <div className="invoice-row invoice-table-head">

            <span>Item</span>

            <span>Qty</span>

            <span>Rate</span>

            <span>Amount</span>

          </div>

          {invoiceLines.map((item) => (
            <div
              className="invoice-row"
              key={item.key}
            >

              <span>
                {item.product}
              </span>

              <span>
                {item.quantity}
              </span>

              <span>
                ₹
                {item.price.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span>
                ₹
                {item.amount.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>
          ))}

        </div>

        {/* TOTAL */}

        <div className="invoice-total">

          <div>

            <span>Subtotal</span>

            <strong>
              ₹
              {sale.subtotal.toLocaleString(
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
