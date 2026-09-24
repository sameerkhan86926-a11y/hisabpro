"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentType = "cash" | "credit";

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

type SaleItem = {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  price?: number;
  sellingPrice?: number;
  amount?: number;
};

type Sale = {
  id: number;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentType: PaymentType;
  paymentMode?: PaymentMode;
  customerId?: number | null;
  customerName?: string;
  date: string;
};

type ProductBatch = {
  id: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  date: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  batches?: ProductBatch[];
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  photo?: string;
  due: number;
  createdAt: string;
};

type CashTransaction = {
  id: number;
  type: "in" | "out";
  amount: number;
  category: string;
  note: string;
  date: string;
  referenceType?: string;
  referenceId?: number;
};

type SalesReturn = {
  id: number;
  type: "sales";
  saleId: number;
  customerId: number | null;
  customerName: string;
  productId: number;
  productName: string;
  quantity: number;
  amount: number;
  paymentType: PaymentType;
  paymentMode?: PaymentMode;
  reason: string;
  date: string;
};

const SALES_KEY = "hisabpro_sales";
const PRODUCT_KEY = "hisabpro_products";
const CUSTOMER_KEY = "hisabpro_customers";
const RETURNS_KEY = "hisabpro_returns";
const CASHBOOK_KEY = "hisabpro_cashbook";

export default function SalesReturnPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedSaleId, setSelectedSaleId] =
    useState("");

  const [selectedItemIndex, setSelectedItemIndex] =
    useState("");

  const [quantity, setQuantity] =
    useState("1");

  const [reason, setReason] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    try {
      setSales(
        JSON.parse(
          localStorage.getItem(SALES_KEY) ||
            "[]"
        )
      );

      setProducts(
        JSON.parse(
          localStorage.getItem(PRODUCT_KEY) ||
            "[]"
        )
      );

      setCustomers(
        JSON.parse(
          localStorage.getItem(CUSTOMER_KEY) ||
            "[]"
        )
      );
    } catch {
      setSales([]);
      setProducts([]);
      setCustomers([]);
    }
  }

  const selectedSale = useMemo(() => {
    return sales.find(
      (sale) =>
        String(sale.id) ===
        selectedSaleId
    );
  }, [
    sales,
    selectedSaleId,
  ]);

  const selectedItem = useMemo(() => {
    if (
      !selectedSale ||
      selectedItemIndex === ""
    ) {
      return null;
    }

    return (
      selectedSale.items[
        Number(selectedItemIndex)
      ] || null
    );
  }, [
    selectedSale,
    selectedItemIndex,
  ]);

  const itemPrice = selectedItem
    ? Number(
        selectedItem.price ??
          selectedItem.sellingPrice ??
          0
      )
    : 0;

  const returnAmount =
    itemPrice *
    Math.max(
      0,
      Number(quantity) || 0
    );

  function getPaymentModeLabel(
    paymentType: PaymentType,
    paymentMode?: PaymentMode
  ) {
    if (paymentType === "credit") {
      return "Credit";
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

  const saveReturn = () => {
    setMessage("");

    if (!selectedSale) {
      setMessage(
        "Please select a sale."
      );
      return;
    }

    if (!selectedItem) {
      setMessage(
        "Please select a product."
      );
      return;
    }

    const returnQty =
      Number(quantity);

    if (
      !Number.isFinite(returnQty) ||
      returnQty <= 0
    ) {
      setMessage(
        "Enter a valid return quantity."
      );
      return;
    }

    if (
      returnQty >
      Number(selectedItem.quantity)
    ) {
      setMessage(
        "Return quantity cannot exceed sold quantity."
      );
      return;
    }

    if (
      !Number.isFinite(returnAmount) ||
      returnAmount <= 0
    ) {
      setMessage(
        "Invalid return amount."
      );
      return;
    }

    try {
      const savedProducts: Product[] =
        JSON.parse(
          localStorage.getItem(
            PRODUCT_KEY
          ) || "[]"
        );

      const savedSales: Sale[] =
        JSON.parse(
          localStorage.getItem(
            SALES_KEY
          ) || "[]"
        );

      const savedCustomers: Customer[] =
        JSON.parse(
          localStorage.getItem(
            CUSTOMER_KEY
          ) || "[]"
        );

      const savedCashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(
            CASHBOOK_KEY
          ) || "[]"
        );

      const existingReturns: SalesReturn[] =
        JSON.parse(
          localStorage.getItem(
            RETURNS_KEY
          ) || "[]"
        );

      const productIndex =
        savedProducts.findIndex(
          (product) =>
            Number(product.id) ===
            Number(
              selectedItem.productId
            )
        );

      if (productIndex === -1) {
        setMessage(
          "Product not found in stock."
        );
        return;
      }

      const product =
        savedProducts[
          productIndex
        ];

      const batches = Array.isArray(
        product.batches
      )
        ? [...product.batches]
        : [];

      /*
       * Returned stock is added
       * to the latest batch.
       */
      if (batches.length > 0) {
        const lastBatchIndex =
          batches.length - 1;

        batches[lastBatchIndex] = {
          ...batches[
            lastBatchIndex
          ],

          quantity:
            Number(
              batches[
                lastBatchIndex
              ].quantity || 0
            ) + returnQty,
        };
      } else {
        batches.push({
          id: Date.now(),

          quantity:
            returnQty,

          purchasePrice:
            Number(
              product.purchasePrice
            ) || 0,

          sellingPrice:
            Number(
              product.sellingPrice
            ) || itemPrice,

          date:
            new Date().toISOString(),
        });
      }

      savedProducts[
        productIndex
      ] = {
        ...product,

        stock:
          Number(
            product.stock || 0
          ) + returnQty,

        batches,
      };

      /*
       * Original payment mode.
       *
       * Old sales without paymentMode
       * are treated as Cash.
       */
      const originalPaymentMode: PaymentMode =
        selectedSale.paymentType ===
        "credit"
          ? "cash"
          : selectedSale.paymentMode ||
            "cash";

      /*
       * CREDIT SALE
       *
       * Return reduces customer's
       * outstanding payable.
       *
       * No Cashbook entry.
       */
      if (
        selectedSale.paymentType ===
          "credit" &&
        selectedSale.customerId
      ) {
        const customerIndex =
          savedCustomers.findIndex(
            (customer) =>
              Number(
                customer.id
              ) ===
              Number(
                selectedSale.customerId
              )
          );

        if (customerIndex !== -1) {
          savedCustomers[
            customerIndex
          ] = {
            ...savedCustomers[
              customerIndex
            ],

            due: Math.max(
              0,

              Number(
                savedCustomers[
                  customerIndex
                ].due || 0
              ) - returnAmount
            ),
          };
        }
      }

      /*
       * CASH SALE RETURN
       *
       * Only actual Cash refund
       * affects Cashbook.
       *
       * UPI/Card/Bank/Online refunds
       * do NOT affect Cashbook.
       */
      let updatedCashbook =
        savedCashbook;

      const returnId =
        Date.now();

      const returnDate =
        new Date().toISOString();

      if (
        selectedSale.paymentType ===
          "cash" &&
        originalPaymentMode ===
          "cash"
      ) {
        const cashTransaction:
          CashTransaction = {
            id:
              returnId + 1,

            type: "out",

            amount:
              returnAmount,

            category:
              "Sales Return",

            note:
              `Cash Refund - ${selectedItem.productName}` +
              ` - ${
                selectedSale.customerName ||
                "Walk-in Customer"
              }` +
              (reason.trim()
                ? ` - ${reason.trim()}`
                : ""),

            date:
              returnDate,

            referenceType:
              "sales_return",

            referenceId:
              returnId,
          };

        updatedCashbook = [
          cashTransaction,
          ...savedCashbook,
        ];
      }

      /*
       * Save return record.
       *
       * paymentType tells whether
       * original sale was Cash/Credit.
       *
       * paymentMode tells the actual
       * refund/payment channel.
       */
      const returnRecord:
        SalesReturn = {
          id: returnId,

          type: "sales",

          saleId:
            selectedSale.id,

          customerId:
            selectedSale.customerId ||
            null,

          customerName:
            selectedSale.customerName ||
            "",

          productId:
            selectedItem.productId,

          productName:
            selectedItem.productName,

          quantity:
            returnQty,

          amount:
            returnAmount,

          paymentType:
            selectedSale.paymentType,

          paymentMode:
            selectedSale.paymentType ===
            "credit"
              ? undefined
              : originalPaymentMode,

          reason:
            reason.trim(),

          date:
            returnDate,
        };

      existingReturns.push(
        returnRecord
      );

      /*
       * Save products.
       */
      localStorage.setItem(
        PRODUCT_KEY,
        JSON.stringify(
          savedProducts
        )
      );

      /*
       * Save customer only for
       * credit return.
       */
      if (
        selectedSale.paymentType ===
        "credit"
      ) {
        localStorage.setItem(
          CUSTOMER_KEY,
          JSON.stringify(
            savedCustomers
          )
        );
      }

      /*
       * Save return record.
       */
      localStorage.setItem(
        RETURNS_KEY,
        JSON.stringify(
          existingReturns
        )
      );

      /*
       * Cashbook changes ONLY for
       * actual Cash refund.
       */
      if (
        selectedSale.paymentType ===
          "cash" &&
        originalPaymentMode ===
          "cash"
      ) {
        localStorage.setItem(
          CASHBOOK_KEY,
          JSON.stringify(
            updatedCashbook
          )
        );
      }

      setSales([
        ...savedSales,
      ]);

      setProducts([
        ...savedProducts,
      ]);

      setCustomers([
        ...savedCustomers,
      ]);

      setQuantity("1");
      setReason("");
      setSelectedItemIndex("");

      /*
       * Success messages.
       */
      if (
        selectedSale.paymentType ===
        "credit"
      ) {
        setMessage(
          `${formatMoney(
            returnAmount
          )} sales return saved and customer payable adjusted successfully ✅`
        );
      } else if (
        originalPaymentMode ===
        "cash"
      ) {
        setMessage(
          `${formatMoney(
            returnAmount
          )} cash refund recorded and Cashbook updated as Cash Out ✅`
        );
      } else {
        setMessage(
          `${formatMoney(
            returnAmount
          )} ${getPaymentModeLabel(
            "cash",
            originalPaymentMode
          )} refund recorded. Cashbook was not changed ✅`
        );
      }
    } catch (error) {
      console.error(
        "Sales return error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    }
  };

  const formatMoney = (
    amount: number
  ) =>
    `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  return (
    <main className="sales-return-page">

      <header className="sales-return-header">

        <button
          className="sales-return-back"
          onClick={() => {
            window.location.href =
              "/hisabpro/returns/";
          }}
        >
          ←
        </button>

        <div>
          <h1>
            Sales Return
          </h1>

          <p>
            Customer returned product
          </p>
        </div>

      </header>

      <section className="sales-return-content">

        <div className="return-form-card">

          <label>
            Select Sale
          </label>

          <select
            value={
              selectedSaleId
            }
            onChange={(e) => {
              setSelectedSaleId(
                e.target.value
              );

              setSelectedItemIndex(
                ""
              );
            }}
          >
            <option value="">
              Select a sale
            </option>

            {sales.map(
              (sale) => (
                <option
                  key={sale.id}
                  value={sale.id}
                >
                  #{sale.id} •{" "}
                  {sale.customerName ||
                    "Walk-in Customer"}{" "}
                  •{" "}
                  {formatMoney(
                    Number(
                      sale.total
                    ) || 0
                  )}
                </option>
              )
            )}

          </select>

          {selectedSale && (
            <>
              <div className="return-sale-info">

                <strong>
                  Sale #
                  {
                    selectedSale.id
                  }
                </strong>

                <span>
                  {new Date(
                    selectedSale.date
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </span>

                <span>
                  {selectedSale.customerName ||
                    "Walk-in Customer"}
                </span>

                <span>
                  Payment:{" "}
                  {getPaymentModeLabel(
                    selectedSale.paymentType,
                    selectedSale.paymentMode
                  )}
                </span>

              </div>

              <label>
                Select Product
              </label>

              <select
                value={
                  selectedItemIndex
                }
                onChange={(e) =>
                  setSelectedItemIndex(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select product
                </option>

                {selectedSale.items.map(
                  (
                    item,
                    index
                  ) => (
                    <option
                      key={index}
                      value={index}
                    >
                      {
                        item.productName
                      }{" "}
                      • Qty{" "}
                      {
                        item.quantity
                      }
                    </option>
                  )
                )}

              </select>

              {selectedItem && (
                <>
                  <div className="return-product-info">

                    <div>
                      <span>
                        Sold Quantity
                      </span>

                      <strong>
                        {
                          selectedItem.quantity
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Sale Price
                      </span>

                      <strong>
                        {formatMoney(
                          itemPrice
                        )}
                      </strong>
                    </div>

                  </div>

                  <label>
                    Return Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={
                      selectedItem.quantity
                    }
                    value={
                      quantity
                    }
                    onChange={(e) =>
                      setQuantity(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Reason
                  </label>

                  <input
                    type="text"
                    placeholder="Damaged, wrong size, customer changed mind..."
                    value={
                      reason
                    }
                    onChange={(e) =>
                      setReason(
                        e.target.value
                      )
                    }
                  />

                  <div className="return-total-box">

                    <span>
                      Return Amount
                    </span>

                    <strong>
                      {formatMoney(
                        returnAmount
                      )}
                    </strong>

                  </div>

                  <button
                    className="return-save-button"
                    onClick={
                      saveReturn
                    }
                  >
                    Save Sales Return
                  </button>

                </>
              )}

            </>
          )}

          {message && (
            <div className="return-message">
              {message}
            </div>
          )}

        </div>

      </section>

    </main>
  );
}
