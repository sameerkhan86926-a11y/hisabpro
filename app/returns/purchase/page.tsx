"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentType = "cash" | "credit";

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

type PurchaseItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  amount: number;
};

type Purchase = {
  id: number;
  supplierId: number;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  paymentType: PaymentType;
  paymentMode?: PaymentMode;
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

type Supplier = {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
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

type PurchaseReturn = {
  id: number;
  type: "purchase";
  purchaseId: number;
  supplierId: number;
  supplierName: string;
  productId: number;
  productName: string;
  quantity: number;
  amount: number;
  paymentType: PaymentType;
  paymentMode?: PaymentMode;
  reason: string;
  date: string;
};

const PURCHASE_KEY =
  "hisabpro_purchases";

const PRODUCT_KEY =
  "hisabpro_products";

const SUPPLIER_KEY =
  "hisabpro_suppliers";

const RETURNS_KEY =
  "hisabpro_returns";

const CASHBOOK_KEY =
  "hisabpro_cashbook";

export default function PurchaseReturnPage() {
  const [purchases, setPurchases] =
    useState<Purchase[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [selectedPurchaseId, setSelectedPurchaseId] =
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
      setPurchases(
        JSON.parse(
          localStorage.getItem(
            PURCHASE_KEY
          ) || "[]"
        )
      );

      setProducts(
        JSON.parse(
          localStorage.getItem(
            PRODUCT_KEY
          ) || "[]"
        )
      );

      setSuppliers(
        JSON.parse(
          localStorage.getItem(
            SUPPLIER_KEY
          ) || "[]"
        )
      );
    } catch {
      setPurchases([]);
      setProducts([]);
      setSuppliers([]);
    }
  }

  const selectedPurchase =
    useMemo(() => {
      return purchases.find(
        (purchase) =>
          String(purchase.id) ===
          selectedPurchaseId
      );
    }, [
      purchases,
      selectedPurchaseId,
    ]);

  const selectedItem =
    useMemo(() => {
      if (
        !selectedPurchase ||
        selectedItemIndex === ""
      ) {
        return null;
      }

      return (
        selectedPurchase.items[
          Number(selectedItemIndex)
        ] || null
      );
    }, [
      selectedPurchase,
      selectedItemIndex,
    ]);

  const purchasePrice =
    selectedItem
      ? Number(
          selectedItem.purchasePrice
        ) || 0
      : 0;

  const returnAmount =
    purchasePrice *
    Math.max(
      0,
      Number(quantity) || 0
    );

  function getPaymentModeLabel(
    paymentType: PaymentType,
    paymentMode?: PaymentMode
  ) {
    if (
      paymentType === "credit"
    ) {
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

    if (!selectedPurchase) {
      setMessage(
        "Please select a purchase."
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
      !Number.isFinite(
        returnQty
      ) ||
      returnQty <= 0
    ) {
      setMessage(
        "Enter a valid return quantity."
      );
      return;
    }

    if (
      returnQty >
      Number(
        selectedItem.quantity
      )
    ) {
      setMessage(
        "Return quantity cannot exceed purchased quantity."
      );
      return;
    }

    if (
      !Number.isFinite(
        returnAmount
      ) ||
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

      const savedSuppliers: Supplier[] =
        JSON.parse(
          localStorage.getItem(
            SUPPLIER_KEY
          ) || "[]"
        );

      const savedCashbook: CashTransaction[] =
        JSON.parse(
          localStorage.getItem(
            CASHBOOK_KEY
          ) || "[]"
        );

      const existingReturns:
        PurchaseReturn[] =
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

      if (
        Number(
          product.stock || 0
        ) < returnQty
      ) {
        setMessage(
          "Return quantity is greater than current stock."
        );
        return;
      }

      let remaining =
        returnQty;

      let batches =
        Array.isArray(
          product.batches
        )
          ? [
              ...product.batches,
            ]
          : [];

      /*
       * First reduce batches matching
       * the original purchase price
       * and selling price.
       *
       * Newest matching batches
       * are reduced first.
       */
      const matchingIndexes =
        batches
          .map(
            (
              batch,
              index
            ) => ({
              batch,
              index,
            })
          )
          .filter(
            ({
              batch,
            }) =>
              Number(
                batch.purchasePrice
              ) ===
                Number(
                  selectedItem.purchasePrice
                ) &&
              Number(
                batch.sellingPrice
              ) ===
                Number(
                  selectedItem.sellingPrice
                ) &&
              Number(
                batch.quantity
              ) > 0
          )
          .sort(
            (a, b) =>
              new Date(
                b.batch.date
              ).getTime() -
              new Date(
                a.batch.date
              ).getTime()
          );

      for (
        const match of
          matchingIndexes
      ) {
        if (
          remaining <= 0
        ) {
          break;
        }

        const available =
          Number(
            batches[
              match.index
            ].quantity || 0
          );

        const remove =
          Math.min(
            available,
            remaining
          );

        batches[
          match.index
        ] = {
          ...batches[
            match.index
          ],

          quantity:
            available -
            remove,
        };

        remaining -=
          remove;
      }

      /*
       * Fallback:
       * If matching batches are
       * insufficient, reduce other
       * available batches from
       * newest to oldest.
       */
      if (
        remaining > 0
      ) {
        for (
          let i =
            batches.length -
            1;
          i >= 0;
          i--
        ) {
          if (
            remaining <= 0
          ) {
            break;
          }

          const available =
            Number(
              batches[i]
                .quantity ||
                0
            );

          if (
            available <= 0
          ) {
            continue;
          }

          const remove =
            Math.min(
              available,
              remaining
            );

          batches[i] = {
            ...batches[i],

            quantity:
              available -
              remove,
          };

          remaining -=
            remove;
        }
      }

      if (
        remaining > 0
      ) {
        setMessage(
          "Unable to adjust stock batches."
        );
        return;
      }

      batches =
        batches.filter(
          (batch) =>
            Number(
              batch.quantity
            ) > 0
        );

      savedProducts[
        productIndex
      ] = {
        ...product,

        stock: Math.max(
          0,
          Number(
            product.stock || 0
          ) - returnQty
        ),

        batches,
      };

      /*
       * Original payment mode.
       *
       * Old purchase records without
       * paymentMode are treated as Cash.
       */
      const originalPaymentMode:
        PaymentMode =
        selectedPurchase.paymentType ===
        "credit"
          ? "cash"
          : selectedPurchase.paymentMode ||
            "cash";

      /*
       * CREDIT PURCHASE
       *
       * Supplier payable is reduced.
       *
       * No Cashbook entry.
       */
      if (
        selectedPurchase.paymentType ===
        "credit"
      ) {
        const supplierIndex =
          savedSuppliers.findIndex(
            (supplier) =>
              Number(
                supplier.id
              ) ===
              Number(
                selectedPurchase.supplierId
              )
          );

        if (
          supplierIndex !==
          -1
        ) {
          savedSuppliers[
            supplierIndex
          ] = {
            ...savedSuppliers[
              supplierIndex
            ],

            due: Math.max(
              0,

              Number(
                savedSuppliers[
                  supplierIndex
                ].due || 0
              ) - returnAmount
            ),
          };
        }
      }

      const returnId =
        Date.now();

      const returnDate =
        new Date().toISOString();

      /*
       * Save purchase return
       * with paymentMode.
       */
      const returnRecord:
        PurchaseReturn = {
        id: returnId,

        type: "purchase",

        purchaseId:
          selectedPurchase.id,

        supplierId:
          selectedPurchase.supplierId,

        supplierName:
          selectedPurchase.supplierName,

        productId:
          selectedItem.productId,

        productName:
          selectedItem.productName,

        quantity:
          returnQty,

        amount:
          returnAmount,

        paymentType:
          selectedPurchase.paymentType,

        paymentMode:
          selectedPurchase.paymentType ===
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
       * CASH PURCHASE RETURN
       *
       * Supplier gives actual
       * cash refund.
       *
       * Cashbook = Cash In.
       */
      let updatedCashbook =
        savedCashbook;

      if (
        selectedPurchase.paymentType ===
          "cash" &&
        originalPaymentMode ===
          "cash"
      ) {
        const cashTransaction:
          CashTransaction = {
          id:
            returnId + 1,

          type: "in",

          amount:
            returnAmount,

          category:
            "Purchase Return",

          note:
            `Cash Refund from Supplier - ${selectedPurchase.supplierName}` +
            ` - ${selectedItem.productName}` +
            (reason.trim()
              ? ` - ${reason.trim()}`
              : ""),

          date:
            returnDate,

          referenceType:
            "purchase_return",

          referenceId:
            returnId,
        };

        updatedCashbook = [
          cashTransaction,
          ...savedCashbook,
        ];
      }

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
       * Save supplier payable
       * for credit purchases.
       */
      if (
        selectedPurchase.paymentType ===
        "credit"
      ) {
        localStorage.setItem(
          SUPPLIER_KEY,
          JSON.stringify(
            savedSuppliers
          )
        );
      }

      /*
       * Save return history.
       */
      localStorage.setItem(
        RETURNS_KEY,
        JSON.stringify(
          existingReturns
        )
      );

      /*
       * Cashbook changes ONLY
       * for actual Cash refund.
       */
      if (
        selectedPurchase.paymentType ===
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

      setProducts([
        ...savedProducts,
      ]);

      setSuppliers([
        ...savedSuppliers,
      ]);

      setQuantity("1");
      setReason("");
      setSelectedItemIndex("");

      /*
       * Success messages.
       */
      if (
        selectedPurchase.paymentType ===
        "credit"
      ) {
        setMessage(
          `${formatMoney(
            returnAmount
          )} purchase return saved and supplier payable adjusted successfully ✅`
        );
      } else if (
        originalPaymentMode ===
        "cash"
      ) {
        setMessage(
          `${formatMoney(
            returnAmount
          )} cash refund from supplier recorded and Cashbook updated as Cash In ✅`
        );
      } else {
        setMessage(
          `${formatMoney(
            returnAmount
          )} ${getPaymentModeLabel(
            "cash",
            originalPaymentMode
          )} supplier refund recorded. Cashbook was not changed ✅`
        );
      }
    } catch (error) {
      console.error(
        "Purchase return error:",
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
    <main className="purchase-return-page">

      <header className="purchase-return-header">

        <button
          className="purchase-return-back"
          onClick={() => {
            window.location.href =
              "/hisabpro/returns/";
          }}
        >
          ←
        </button>

        <div>
          <h1>
            Purchase Return
          </h1>

          <p>
            Return product to supplier
          </p>
        </div>

      </header>

      <section className="purchase-return-content">

        <div className="return-form-card">

          <label>
            Select Purchase
          </label>

          <select
            value={
              selectedPurchaseId
            }
            onChange={(e) => {
              setSelectedPurchaseId(
                e.target.value
              );

              setSelectedItemIndex(
                ""
              );
            }}
          >
            <option value="">
              Select a purchase
            </option>

            {purchases.map(
              (
                purchase
              ) => (
                <option
                  key={
                    purchase.id
                  }
                  value={
                    purchase.id
                  }
                >
                  #{purchase.id} •{" "}
                  {
                    purchase.supplierName
                  }{" "}
                  •{" "}
                  {formatMoney(
                    Number(
                      purchase.total
                    ) || 0
                  )}
                </option>
              )
            )}

          </select>

          {selectedPurchase && (
            <>
              <div className="return-sale-info">

                <strong>
                  Purchase #
                  {
                    selectedPurchase.id
                  }
                </strong>

                <span>
                  {new Date(
                    selectedPurchase.date
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </span>

                <span>
                  {
                    selectedPurchase.supplierName
                  }
                </span>

                <span>
                  Payment:{" "}
                  {getPaymentModeLabel(
                    selectedPurchase.paymentType,
                    selectedPurchase.paymentMode
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

                {selectedPurchase.items.map(
                  (
                    item,
                    index
                  ) => (
                    <option
                      key={
                        index
                      }
                      value={
                        index
                      }
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
                        Purchased Quantity
                      </span>

                      <strong>
                        {
                          selectedItem.quantity
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Purchase Price
                      </span>

                      <strong>
                        {formatMoney(
                          purchasePrice
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
                    placeholder="Damaged, wrong product, quality issue..."
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
                    Save Purchase Return
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
