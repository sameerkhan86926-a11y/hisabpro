"use client";

import { useEffect, useState } from "react";

type PaymentType = "cash" | "credit";

type PaymentMode =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "online";

type SaleItem = {
  productId: number;
  product: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  amount: number;
};

type Sale = {
  id: number;
  items?: SaleItem[];

  product?: string;
  price?: number;
  purchasePrice?: number;
  quantity?: number;

  discount?: number;
  total: number;
  paymentType?: PaymentType;
  paymentMode?: PaymentMode;
  customerName?: string;
  date: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  due: number;
  createdAt: string;
};

type Supplier = {
  id: number;
  name: string;
  phone: string;
  due: number;
  createdAt: string;
};

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  note: string;
  date: string;
};

type Purchase = {
  id: number;
  supplierId: number;
  supplierName: string;
  total: number;
  paymentType: PaymentType;
  paymentMode?: PaymentMode;
  date: string;
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

type ReturnRecord = {
  id: number;
  type: "sales" | "purchase";
  amount: number;
  paymentType: PaymentType;
  productName: string;
  quantity: number;
  date: string;
};

function getSaleItems(sale: Sale): SaleItem[] {
  if (sale.items && sale.items.length > 0) {
    return sale.items;
  }

  if (sale.product) {
    const quantity = sale.quantity || 1;
    const price = sale.price || 0;
    const purchasePrice = sale.purchasePrice || 0;

    return [
      {
        productId: 0,
        product: sale.product,
        price,
        purchasePrice,
        quantity,
        amount: price * quantity,
      },
    ];
  }

  return [];
}

function isToday(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPaymentModeLabel(
  paymentType?: PaymentType,
  paymentMode?: PaymentMode
) {
  if (paymentType === "credit") {
    return "Credit";
  }

  switch (paymentMode || "cash") {
    case "cash":
      return "Cash";

    case "upi":
      return "UPI";

    case "card":
      return "Card";

    case "bank":
      return "Bank";

    case "online":
      return "Online";

    default:
      return "Cash";
  }
}

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cashbook, setCashbook] = useState<CashTransaction[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [openingCash, setOpeningCash] = useState(0);

  const [notificationCount, setNotificationCount] =
    useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = () => {
    try {
      const savedSales: Sale[] = JSON.parse(
        localStorage.getItem("hisabpro_sales") || "[]"
      );

      const savedProducts: Product[] = JSON.parse(
        localStorage.getItem("hisabpro_products") || "[]"
      );

      const savedCustomers: Customer[] = JSON.parse(
        localStorage.getItem("hisabpro_customers") || "[]"
      );

      const savedSuppliers: Supplier[] = JSON.parse(
        localStorage.getItem("hisabpro_suppliers") || "[]"
      );

      const savedExpenses: Expense[] = JSON.parse(
        localStorage.getItem("hisabpro_expenses") || "[]"
      );

      const savedPurchases: Purchase[] = JSON.parse(
        localStorage.getItem("hisabpro_purchases") || "[]"
      );

      const savedCashbook: CashTransaction[] = JSON.parse(
        localStorage.getItem("hisabpro_cashbook") || "[]"
      );

      const savedReturns: ReturnRecord[] = JSON.parse(
        localStorage.getItem("hisabpro_returns") || "[]"
      );

      const savedOpeningCash = Number(
        localStorage.getItem("hisabpro_opening_cash") || 0
      );

      setSales(
        Array.isArray(savedSales) ? savedSales : []
      );

      setProducts(
        Array.isArray(savedProducts) ? savedProducts : []
      );

      setCustomers(
        Array.isArray(savedCustomers)
          ? savedCustomers
          : []
      );

      setSuppliers(
        Array.isArray(savedSuppliers)
          ? savedSuppliers
          : []
      );

      setExpenses(
        Array.isArray(savedExpenses)
          ? savedExpenses
          : []
      );

      setPurchases(
        Array.isArray(savedPurchases)
          ? savedPurchases
          : []
      );

      setCashbook(
        Array.isArray(savedCashbook)
          ? savedCashbook
          : []
      );

      setReturns(
        Array.isArray(savedReturns)
          ? savedReturns
          : []
      );

      setOpeningCash(
        Number.isFinite(savedOpeningCash)
          ? savedOpeningCash
          : 0
      );

      const lowStockCount =
        savedProducts.filter(
          (product) =>
            Number(product.stock) <= 5
        ).length;

      const dueCount =
        savedCustomers.filter(
          (customer) =>
            Number(customer.due) > 0
        ).length;

      setNotificationCount(
        lowStockCount + dueCount
      );
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );

      setSales([]);
      setProducts([]);
      setCustomers([]);
      setSuppliers([]);
      setExpenses([]);
      setPurchases([]);
      setCashbook([]);
      setReturns([]);
      setOpeningCash(0);
      setNotificationCount(0);
    }
  };

  // --------------------------------
  // SALES
  // --------------------------------

  const totalSales = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.total || 0),
    0
  );

  const todaySales = sales
    .filter((sale) => isToday(sale.date))
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );

  // Actual CASH sales only.
  // Old sales without paymentMode are treated as Cash.
  const todayCashSales = sales
    .filter(
      (sale) =>
        isToday(sale.date) &&
        sale.paymentType !== "credit" &&
        (sale.paymentMode || "cash") === "cash"
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );

  const todayUpiSales = sales
    .filter(
      (sale) =>
        isToday(sale.date) &&
        sale.paymentType !== "credit" &&
        sale.paymentMode === "upi"
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );

  const todayCardSales = sales
    .filter(
      (sale) =>
        isToday(sale.date) &&
        sale.paymentType !== "credit" &&
        sale.paymentMode === "card"
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );

  const todayBankSales = sales
    .filter(
      (sale) =>
        isToday(sale.date) &&
        sale.paymentType !== "credit" &&
        sale.paymentMode === "bank"
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );

  const todayOnlineSales = sales
    .filter(
      (sale) =>
        isToday(sale.date) &&
        sale.paymentType !== "credit" &&
        sale.paymentMode === "online"
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );

  const todayCreditSales = sales
    .filter(
      (sale) =>
        isToday(sale.date) &&
        sale.paymentType === "credit"
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );

  // --------------------------------
  // GROSS PROFIT
  // --------------------------------

  const grossProfit = sales.reduce(
    (saleTotal, sale) => {
      const items = getSaleItems(sale);

      const itemProfit = items.reduce(
        (itemTotal, item) => {
          const sellingPrice =
            Number(item.price || 0);

          const purchasePrice =
            Number(item.purchasePrice || 0);

          const quantity =
            Number(item.quantity || 0);

          return (
            itemTotal +
            (sellingPrice -
              purchasePrice) *
              quantity
          );
        },
        0
      );

      const discount =
        Number(sale.discount || 0);

      return (
        saleTotal +
        itemProfit -
        discount
      );
    },
    0
  );

  const todayGrossProfit = sales
    .filter((sale) =>
      isToday(sale.date)
    )
    .reduce(
      (saleTotal, sale) => {
        const items = getSaleItems(sale);

        const itemProfit = items.reduce(
          (itemTotal, item) => {
            const sellingPrice =
              Number(item.price || 0);

            const purchasePrice =
              Number(
                item.purchasePrice || 0
              );

            const quantity =
              Number(item.quantity || 0);

            return (
              itemTotal +
              (sellingPrice -
                purchasePrice) *
                quantity
            );
          },
          0
        );

        return (
          saleTotal +
          itemProfit -
          Number(sale.discount || 0)
        );
      },
      0
    );

  // --------------------------------
  // EXPENSES
  // --------------------------------

  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

  const todayExpenses = expenses
    .filter((expense) =>
      isToday(expense.date)
    )
    .reduce(
      (sum, expense) =>
        sum +
        Number(expense.amount || 0),
      0
    );

  const netProfit =
    grossProfit - totalExpenses;

  const todayNetProfit =
    todayGrossProfit - todayExpenses;

  // --------------------------------
  // STOCK
  // --------------------------------

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.stock || 0),
    0
  );

  const stockValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.stock || 0) *
        Number(
          product.purchasePrice || 0
        ),
    0
  );

  const lowStockProducts =
    products.filter(
      (product) =>
        Number(product.stock) <= 5
    );

  // --------------------------------
  // CUSTOMER DUE
  // --------------------------------

  const totalCustomerDue =
    customers.reduce(
      (sum, customer) =>
        sum +
        Number(customer.due || 0),
      0
    );

  // --------------------------------
  // SUPPLIER PAYABLE
  // --------------------------------

  const totalSupplierDue =
    suppliers.reduce(
      (sum, supplier) =>
        sum +
        Number(supplier.due || 0),
      0
    );

  // --------------------------------
  // PURCHASES
  // --------------------------------

  const totalPurchases =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(purchase.total || 0),
      0
    );

  const todayPurchases =
    purchases
      .filter((purchase) =>
        isToday(purchase.date)
      )
      .reduce(
        (sum, purchase) =>
          sum +
          Number(purchase.total || 0),
        0
      );

  // --------------------------------
  // CASHBOOK
  // --------------------------------

  const cashIn =
    cashbook.reduce(
      (sum, transaction) =>
        transaction.type === "in"
          ? sum +
            Number(
              transaction.amount || 0
            )
          : sum,
      0
    );

  const cashOut =
    cashbook.reduce(
      (sum, transaction) =>
        transaction.type === "out"
          ? sum +
            Number(
              transaction.amount || 0
            )
          : sum,
      0
    );

  const cashBalance =
    openingCash +
    cashIn -
    cashOut;

  const todayCashIn =
    cashbook
      .filter((transaction) =>
        isToday(transaction.date)
      )
      .reduce(
        (sum, transaction) =>
          transaction.type === "in"
            ? sum +
              Number(
                transaction.amount || 0
              )
            : sum,
        0
      );

  const todayCashOut =
    cashbook
      .filter((transaction) =>
        isToday(transaction.date)
      )
      .reduce(
        (sum, transaction) =>
          transaction.type === "out"
            ? sum +
              Number(
                transaction.amount || 0
              )
            : sum,
        0
      );

  // --------------------------------
  // RETURNS
  // --------------------------------

  const todaySalesReturns =
    returns
      .filter(
        (item) =>
          item.type === "sales" &&
          isToday(item.date)
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.amount || 0),
        0
      );

  const todayPurchaseReturns =
    returns
      .filter(
        (item) =>
          item.type === "purchase" &&
          isToday(item.date)
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.amount || 0),
        0
      );

  // --------------------------------
  // RECENT SALES
  // --------------------------------

  const recentSales = [
    ...sales,
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 5);

  return (
    <main className="app">

      {/* HEADER */}

      <header className="header">

        <div>
          <h1>HisabPro</h1>

          <p>
            Sales • Stock • Khata • Profit
          </p>
        </div>

        <div className="header-actions">

          <a
            href="/hisabpro/search/"
            className="search-header-button"
            aria-label="Search"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />

              <path d="M16 16l5 5" />
            </svg>
          </a>

          <a
            href="/hisabpro/notifications/"
            className="notification"
            aria-label="Notifications"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

              <path d="M10 21h4" />
            </svg>

            {notificationCount >
              0 && (
              <span className="notification-badge">
                {notificationCount >
                99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </a>

        </div>

      </header>

      {/* WELCOME */}

      <section className="welcome">

        <p>
          Good day 👋
        </p>

        <h2>
          Business Dashboard
        </h2>

      </section>

      {/* MAIN STATS */}

      <section className="stats">

        <div className="card sales">

          <span>
            Today's Sales
          </span>

          <strong>
            {formatMoney(
              todaySales
            )}
          </strong>

          <small>
            Cash{" "}
            {formatMoney(
              todayCashSales
            )}{" "}
            • UPI{" "}
            {formatMoney(
              todayUpiSales
            )}{" "}
            • Card{" "}
            {formatMoney(
              todayCardSales
            )}
          </small>

          <small>
            Bank{" "}
            {formatMoney(
              todayBankSales
            )}{" "}
            • Online{" "}
            {formatMoney(
              todayOnlineSales
            )}{" "}
            • Credit{" "}
            {formatMoney(
              todayCreditSales
            )}
          </small>

        </div>

        <div className="card">

          <span>
            Total Sales
          </span>

          <strong>
            {formatMoney(
              totalSales
            )}
          </strong>

          <small>
            {sales.length} bills
          </small>

        </div>

        <div className="card profit">

          <span>
            Net Profit
          </span>

          <strong>
            {formatMoney(
              netProfit
            )}
          </strong>

          <small>
            Today{" "}
            {formatMoney(
              todayNetProfit
            )}
          </small>

        </div>

        <div className="card">

          <span>
            Cash Balance
          </span>

          <strong>
            {formatMoney(
              cashBalance
            )}
          </strong>

          <small>
            In{" "}
            {formatMoney(
              todayCashIn
            )}{" "}
            • Out{" "}
            {formatMoney(
              todayCashOut
            )}
          </small>

        </div>

      </section>

      {/* QUICK ACTIONS */}

      <div className="actions">

  <a
    href="/hisabpro/sales/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
    <span>New Sale</span>
  </a>

  <a
    href="/hisabpro/purchase/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
      <path d="M12 16v4" />
    </svg>
    <span>New Purchase</span>
  </a>

  <a
    href="/hisabpro/stock/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
    <span>Stock</span>
  </a>

  <a
    href="/hisabpro/khata/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
    </svg>
    <span>Khata</span>
  </a>

  <a
    href="/hisabpro/expenses/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
    <span>Expenses</span>
  </a>

  <a
    href="/hisabpro/cashbook/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2"
      />
      <path d="M7 10h10M12 14h.01" />
    </svg>
    <span>Cashbook</span>
  </a>

  <a
    href="/hisabpro/suppliers/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M4 6h16v13H4z" />
      <path d="M8 6V4h8v2" />
      <path d="M8 11h8M8 15h5" />
    </svg>
    <span>Suppliers</span>
  </a>

  <a
    href="/hisabpro/suppliers/payments/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 10h5a2 2 0 0 1 0 4H9" />
    </svg>
    <span>Supplier Payment</span>
  </a>

  <a
    href="/hisabpro/returns/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M9 7H4l4-4" />
      <path d="M4 7a8 8 0 1 1 2 8" />
    </svg>
    <span>Returns</span>
  </a>

  <a
    href="/hisabpro/invoice/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
    <span>Invoice</span>
  </a>

  <a
    href="/hisabpro/reports/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 15l3-4 3 2 5-6" />
    </svg>
    <span>Reports</span>
  </a>

  <a
    href="/hisabpro/search/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
    <span>Search</span>
  </a>

  <a
    href="/hisabpro/notifications/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
    <span>Notifications</span>
  </a>

  <a
    href="/hisabpro/settings/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.3 2.9a8 8 0 0 0-1.7 1l-2.4-1-2 3.5L5 11a7 7 0 0 0 0 2l-1.9 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.3 3h5l.3-3a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z" />
    </svg>
    <span>Settings</span>
  </a>

  <a
    href="/hisabpro/more/"
    className="action-link"
  >
    <svg viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
    <span>More</span>
  </a>

</div>

      {/* BUSINESS SUMMARY */}

      <section className="section">

        <div className="section-title">
          <h3>
            Business Summary
          </h3>
        </div>

        <div className="summary">

          <a href="/hisabpro/stock/">

            <svg viewBox="0 0 24 24">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
              <path d="M12 11v10" />
            </svg>

            <p>
              Stock
            </p>

            <strong>
              {totalStock} items
            </strong>

            <small>
              Value:{" "}
              {formatMoney(
                stockValue
              )}
            </small>

          </a>

          <a href="/hisabpro/khata/">

            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="8"
                r="4"
              />

              <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
            </svg>

            <p>
              Customer Due
            </p>

            <strong>
              {formatMoney(
                totalCustomerDue
              )}
            </strong>

            <small>
              {customers.length} customers
            </small>

          </a>

          <a href="/hisabpro/suppliers/">

            <svg viewBox="0 0 24 24">
              <path d="M4 6h16v13H4z" />
              <path d="M8 6V4h8v2" />
              <path d="M8 11h8M8 15h5" />
            </svg>

            <p>
              Supplier Payable
            </p>

            <strong>
              {formatMoney(
                totalSupplierDue
              )}
            </strong>

            <small>
              {suppliers.length} suppliers
            </small>

          </a>

          <a href="/hisabpro/cashbook/">

            <svg viewBox="0 0 24 24">
              <rect
                x="3"
                y="6"
                width="18"
                height="13"
                rx="2"
              />

              <path d="M7 10h10M12 14h.01" />
            </svg>

            <p>
              Cash Balance
            </p>

            <strong>
              {formatMoney(
                cashBalance
              )}
            </strong>

            <small>
              Opening{" "}
              {formatMoney(
                openingCash
              )}
            </small>

          </a>

          <a href="/hisabpro/purchase/history/">

            <svg viewBox="0 0 24 24">
              <path d="M4 5h16v14H4z" />
              <path d="M8 9h8M8 13h6M8 17h4" />
            </svg>

            <p>
              Purchases
            </p>

            <strong>
              {formatMoney(
                totalPurchases
              )}
            </strong>

            <small>
              Today{" "}
              {formatMoney(
                todayPurchases
              )}
            </small>

          </a>

          <a href="/hisabpro/reports/">

            <svg viewBox="0 0 24 24">
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="M7 15l3-4 3 2 5-6" />
            </svg>

            <p>
              Profit
            </p>

            <strong>
              {formatMoney(
                netProfit
              )}
            </strong>

            <small>
              Gross{" "}
              {formatMoney(
                grossProfit
              )}
            </small>

          </a>

        </div>

      </section>

      {/* TODAY'S ACTIVITY */}

      <section className="section">

        <div className="section-title">

          <h3>
            Today's Activity
          </h3>

          <a href="/hisabpro/reports/">
            View Reports
          </a>

        </div>

        <div className="dashboard-activity-grid">

          <div className="dashboard-activity-card">
            <span>
              Sales
            </span>

            <strong>
              {formatMoney(
                todaySales
              )}
            </strong>

            <small>
              {sales.filter(
                (sale) =>
                  isToday(
                    sale.date
                  )
              ).length}{" "}
              bills
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>
              Purchases
            </span>

            <strong>
              {formatMoney(
                todayPurchases
              )}
            </strong>

            <small>
              Today's purchases
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>
              Expenses
            </span>

            <strong>
              {formatMoney(
                todayExpenses
              )}
            </strong>

            <small>
              Today's expenses
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>
              Sales Returns
            </span>

            <strong>
              {formatMoney(
                todaySalesReturns
              )}
            </strong>

            <small>
              Today's returns
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>
              Purchase Returns
            </span>

            <strong>
              {formatMoney(
                todayPurchaseReturns
              )}
            </strong>

            <small>
              Supplier returns
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>
              Net Profit
            </span>

            <strong>
              {formatMoney(
                todayNetProfit
              )}
            </strong>

            <small>
              Today's estimated profit
            </small>
          </div>

        </div>

      </section>

      {/* ALERTS */}

      {(lowStockProducts.length > 0 ||
        totalCustomerDue > 0 ||
        totalSupplierDue > 0) && (
        <section className="section">

          <div className="section-title">
            <h3>
              Attention Needed
            </h3>
          </div>

          <div className="dashboard-alerts">

            {lowStockProducts.length >
              0 && (
              <a
                href="/hisabpro/notifications/"
                className="dashboard-alert warning"
              >
                <span>
                  ⚠️
                </span>

                <div>
                  <strong>
                    Low Stock
                  </strong>

                  <small>
                    {
                      lowStockProducts.length
                    }{" "}
                    product
                    {lowStockProducts.length >
                    1
                      ? "s"
                      : ""}{" "}
                    need attention
                  </small>
                </div>

                <b>
                  →
                </b>
              </a>
            )}

            {totalCustomerDue >
              0 && (
              <a
                href="/hisabpro/khata/"
                className="dashboard-alert danger"
              >
                <span>
                  💰
                </span>

                <div>
                  <strong>
                    Customer Receivable
                  </strong>

                  <small>
                    {formatMoney(
                      totalCustomerDue
                    )}{" "}
                    pending
                  </small>
                </div>

                <b>
                  →
                </b>
              </a>
            )}

            {totalSupplierDue >
              0 && (
              <a
                href="/hisabpro/suppliers/"
                className="dashboard-alert info"
              >
                <span>
                  🧾
                </span>

                <div>
                  <strong>
                    Supplier Payable
                  </strong>

                  <small>
                    {formatMoney(
                      totalSupplierDue
                    )}{" "}
                    payable
                  </small>
                </div>

                <b>
                  →
                </b>
              </a>
            )}

          </div>

        </section>
      )}

      {/* RECENT SALES */}

      <section className="section">

        <div className="section-title">

          <h3>
            Recent Sales
          </h3>

          <a href="/hisabpro/sales/history/">
            View All
          </a>

        </div>

        {recentSales.length ===
        0 ? (
          <div className="dashboard-empty">
            <strong>
              No sales yet
            </strong>

            <p>
              Your recent bills will
              appear here.
            </p>
          </div>
        ) : (
          <div className="dashboard-recent-list">

            {recentSales.map(
              (sale) => {
                const items =
                  getSaleItems(
                    sale
                  );

                const firstProduct =
                  items[0]?.product ||
                  "Sale";

                const itemCount =
                  items.reduce(
                    (sum, item) =>
                      sum +
                      Number(
                        item.quantity ||
                          0
                      ),
                    0
                  );

                return (
                  <a
                    href="/hisabpro/sales/history/"
                    className="dashboard-recent-item"
                    key={sale.id}
                  >

                    <div className="dashboard-recent-icon">
                      🧾
                    </div>

                    <div className="dashboard-recent-info">

                      <strong>
                        {firstProduct}
                        {items.length >
                        1
                          ? ` + ${
                              items.length -
                              1
                            } more`
                          : ""}
                      </strong>

                      <small>
                        {itemCount}{" "}
                        item
                        {itemCount !==
                        1
                          ? "s"
                          : ""}{" "}
                        •{" "}
                        {formatDate(
                          sale.date
                        )}
                      </small>

                    </div>

                    <div className="dashboard-recent-right">

                      <strong>
                        {formatMoney(
                          Number(
                            sale.total ||
                              0
                          )
                        )}
                      </strong>

                      <span>
                        {getPaymentModeLabel(
                          sale.paymentType,
                          sale.paymentMode
                        )}
                      </span>

                    </div>

                  </a>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* BOTTOM NAV */}

      <nav className="bottom-nav">

        <a
          href="/hisabpro/"
          className="active"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
            <path d="M9 20v-6h6v6" />
          </svg>

          <span>
            Home
          </span>
        </a>

        <a href="/hisabpro/sales/">
          <svg viewBox="0 0 24 24">
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>

          <span>
            Sales
          </span>
        </a>

        <a href="/hisabpro/stock/">
          <svg viewBox="0 0 24 24">
            <path d="M3 7l9-4 9 4-9 4-9-4z" />
            <path d="M3 7v10l9 4 9-4V7" />
            <path d="M12 11v10" />
          </svg>

          <span>
            Stock
          </span>
        </a>

        <a href="/hisabpro/khata/">
          <svg viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="8"
              r="4"
            />

            <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
          </svg>

          <span>
            Khata
          </span>
        </a>

        <a href="/hisabpro/more/">
          <svg viewBox="0 0 24 24">
            <circle
              cx="5"
              cy="12"
              r="1.5"
            />

            <circle
              cx="12"
              cy="12"
              r="1.5"
            />

            <circle
              cx="19"
              cy="12"
              r="1.5"
            />
          </svg>

          <span>
            More
          </span>
        </a>

      </nav>

    </main>
  );
}
