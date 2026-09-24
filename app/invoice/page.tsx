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
  const [sale, setSale] =
    useState<Sale | null>(null);

  const [business, setBusiness] =
    useState<Business>(
      defaultBusiness
    );

  /*
   * =====================================
   * LOAD DATA
   * =====================================
   */

  useEffect(() => {
    /*
     * LAST INVOICE
     */

    const savedSale =
      localStorage.getItem(
        "hisabpro_last_invoice"
      );

    if (savedSale) {
      try {
        setSale(
          JSON.parse(savedSale)
        );
      } catch {
        console.log(
          "Invoice data could not be loaded."
        );
      }
    }

    /*
     * BUSINESS PROFILES
     */

    const savedBusinesses =
      localStorage.getItem(
        "hisabpro_businesses"
      );

    const savedActiveId =
      localStorage.getItem(
        "hisabpro_active_business"
      );

    if (savedBusinesses) {
      try {
        const businesses =
          JSON.parse(
            savedBusinesses
          );

        if (
          Array.isArray(
            businesses
          ) &&
          businesses.length > 0
        ) {
          let activeBusiness:
            | Business
            | undefined;

          if (savedActiveId) {
            const activeId =
              Number(
                savedActiveId
              );

            activeBusiness =
              businesses.find(
                (item: Business) =>
                  Number(item.id) ===
                  activeId
              );
          }

          if (!activeBusiness) {
            activeBusiness =
              businesses[0];
          }

          if (activeBusiness) {
            setBusiness({
              ...defaultBusiness,
              ...activeBusiness,
            });
          }
        }
      } catch {
        console.log(
          "Business profiles could not be loaded."
        );
      }
    } else {
      /*
       * OLD BUSINESS FALLBACK
       */

      const savedBusiness =
        localStorage.getItem(
          "hisabpro_business"
        );

      if (savedBusiness) {
        try {
          setBusiness({
            ...defaultBusiness,
            ...JSON.parse(
              savedBusiness
            ),
          });
        } catch {
          console.log(
            "Business details could not be loaded."
          );
        }
      }
    }
  }, []);

  /*
   * =====================================
   * PAYMENT LABEL
   * =====================================
   */

  function getPaymentModeLabel(
    paymentType?: PaymentType,
    paymentMode?: PaymentMode
  ) {
    if (
      paymentType === "credit"
    ) {
      return "Credit / Udhaar";
    }

    switch (
      paymentMode || "cash"
    ) {
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

  /*
   * =====================================
   * NO INVOICE
   * =====================================
   */

  if (!sale) {
    return (
      <main className="invoice-page">

        <header className="invoice-header">

          <button
            type="button"
            onClick={() =>
              window.location.href =
                "/hisabpro/"
            }
            className="back-button"
          >
            ← Back
          </button>

          <h1>
            Invoice
          </h1>

          <span></span>

        </header>

        <div className="invoice-empty">

          <div>
            🧾
          </div>

          <h2>
            No Invoice Found
          </h2>

          <p>
            Create a sale first to
            generate an invoice.
          </p>

          <a href="/hisabpro/sales/">
            Create New Sale
          </a>

        </div>

      </main>
    );
  }

  /*
   * =====================================
   * SALE ITEMS
   * =====================================
   */

  const items: SaleItem[] =
    sale.items &&
    sale.items.length > 0
      ? sale.items
      : sale.product
        ? [
            {
              productId: 0,

              product:
                sale.product,

              price:
                sale.price || 0,

              purchasePrice:
                sale.purchasePrice ||
                0,

              quantity:
                sale.quantity || 1,

              amount:
                (sale.price || 0) *
                (sale.quantity || 1),
            },
          ]
        : [];

  /*
   * =====================================
   * INVOICE LINES
   * =====================================
   */

  const invoiceLines:
    InvoiceLine[] = [];

  items.forEach(
    (
      item,
      itemIndex
    ) => {

      if (
        item.batchDetails &&
        item.batchDetails.length >
          0
      ) {
        item.batchDetails.forEach(
          (
            batch,
            batchIndex
          ) => {

            invoiceLines.push({
              key:
                `${item.productId}-${itemIndex}-${batch.batchId}-${batchIndex}`,

              product:
                item.product,

              quantity:
                batch.quantity,

              price:
                batch.sellingPrice,

              amount:
                batch.sellingPrice *
                batch.quantity,
            });

          }
        );
      } else {
        invoiceLines.push({
          key:
            `${item.productId}-${itemIndex}`,

          product:
            item.product,

          quantity:
            item.quantity,

          price:
            item.price,

          amount:
            item.amount,
        });
      }
    }
  );

  /*
   * =====================================
   * PAYMENT LABEL
   * =====================================
   */

  const paymentLabel =
    getPaymentModeLabel(
      sale.paymentType,
      sale.paymentMode
    );

  /*
   * =====================================
   * WHATSAPP MESSAGE
   * =====================================
   */

  const whatsappItems =
    invoiceLines
      .map(
        (item) =>
          `${item.product} × ${item.quantity} @ ₹${Number(
            item.price || 0
          ).toLocaleString(
            "en-IN"
          )} = ₹${Number(
            item.amount || 0
          ).toLocaleString(
            "en-IN"
          )}`
      )
      .join("\n");

  const whatsappText =
    `Invoice #${sale.id}
${business.businessName || "HisabPro"}
${
  business.ownerName
    ? `Owner: ${business.ownerName}`
    : ""
}
${
  business.phone
    ? `Phone: ${business.phone}`
    : ""
}
${
  business.address
    ? `Address: ${business.address}`
    : ""
}

${whatsappItems}

Subtotal: ₹${Number(
      sale.subtotal || 0
    ).toLocaleString("en-IN")}

Discount: ₹${Number(
      sale.discount || 0
    ).toLocaleString("en-IN")}

Total: ₹${Number(
      sale.total || 0
    ).toLocaleString("en-IN")}

Payment: ${paymentLabel}`;

  /*
   * =====================================
   * INVOICE UI
   * =====================================
   */

  return (
    <main className="invoice-page">

      {/* HEADER */}

      <header className="invoice-header">

        <button
          type="button"
          onClick={() =>
            window.location.href =
              "/hisabpro/"
          }
          className="back-button"
        >
          ← Back
        </button>

        <h1>
          Invoice
        </h1>

        <button
          type="button"
          onClick={() =>
            window.print()
          }
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
              {
                business.businessName ||
                "HisabPro"
              }
            </h2>

            <p>
              Sales • Stock • Khata • Profit
            </p>

            {business.ownerName && (
              <p className="business-detail">
                Owner:{" "}
                {business.ownerName}
              </p>
            )}

            {business.phone && (
              <p className="business-detail">
                Phone:{" "}
                {business.phone}
              </p>
            )}

            {business.address && (
              <p className="business-detail">
                {business.address}
              </p>
            )}

            {business.email && (
              <p className="business-detail">
                Email:{" "}
                {business.email}
              </p>
            )}

            {business.gstin && (
              <p className="business-detail">
                GSTIN:{" "}
                {business.gstin}
              </p>
            )}

          </div>

          <div className="invoice-number">

            <span>
              Invoice No.
            </span>

            <strong>
              #{sale.id}
            </strong>

          </div>

        </div>

        {/* DATE / PAYMENT */}

        <div className="invoice-meta">

          <div>

            <span>
              Date
            </span>

            <strong>
              {new Date(
                sale.date
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div>

            <span>
              Payment
            </span>

            <strong>
              {paymentLabel}
            </strong>

          </div>

        </div>

        {/* CUSTOMER */}

        {sale.customerName && (
          <div className="invoice-customer">

            <span>
              Customer
            </span>

            <strong>
              {sale.customerName}
            </strong>

          </div>
        )}

        {/* ITEMS */}

        <div className="invoice-table">

          <div className="invoice-row invoice-table-head">

            <span>
              Item
            </span>

            <span>
              Qty
            </span>

            <span>
              Rate
            </span>

            <span>
              Amount
            </span>

          </div>

          {invoiceLines.map(
            (item) => (
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
                  {Number(
                    item.price || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span>
                  ₹
                  {Number(
                    item.amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>
            )
          )}

        </div>

        {/* TOTAL */}

        <div className="invoice-total">

          <div>

            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {Number(
                sale.subtotal || 0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div>

            <span>
              Discount
            </span>

            <strong>
              ₹
              {Number(
                sale.discount || 0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div className="grand-total">

            <span>
              Total
            </span>

            <strong>
              ₹
              {Number(
                sale.total || 0
              ).toLocaleString(
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
          type="button"
          onClick={() =>
            window.print()
          }
        >
          🖨 Print / Save PDF
        </button>

        <button
          type="button"
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
