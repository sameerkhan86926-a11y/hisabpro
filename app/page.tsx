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
  paymentMode?: PaymentMode;
  productName: string;
  quantity: number;
  date: string;
};

type SupplierPayment = {
  id: number;
  supplierId: number;
  supplierName?: string;
  amount: number;
  paymentMode?: PaymentMode;
  date: string;
};

type ModeTotals = {
  cash: number;
  upi: number;
  card: number;
  bank: number;
  online: number;
  credit: number;
};

type NonCreditModeTotals = {
  cash: number;
  upi: number;
  card: number;
  bank: number;
  online: number;
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

function getPaymentMode(
  paymentType?: PaymentType,
  paymentMode?: PaymentMode
): keyof ModeTotals {
  if (paymentType === "credit") {
    return "credit";
  }

  return paymentMode || "cash";
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

function emptyModeTotals(): ModeTotals {
  return {
    cash: 0,
    upi: 0,
    card: 0,
    bank: 0,
    online: 0,
    credit: 0,
  };
}

function emptyNonCreditModeTotals(): NonCreditModeTotals {
  return {
    cash: 0,
    upi: 0,
    card: 0,
    bank: 0,
    online: 0,
  };
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
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [openingCash, setOpeningCash] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadDashboard();

    const handleStorage = () => {
      loadDashboard();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
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
      const savedSupplierPayments: SupplierPayment[] = JSON.parse(
        localStorage.getItem("hisabpro_supplier_payments") || "[]"
      );
      const savedOpeningCash = Number(
        localStorage.getItem("hisabpro_opening_cash") || 0
      );

      setSales(Array.isArray(savedSales) ? savedSales : []);
      setProducts(Array.isArray(savedProducts) ? savedProducts : []);
      setCustomers(Array.isArray(savedCustomers) ? savedCustomers : []);
      setSuppliers(Array.isArray(savedSuppliers) ? savedSuppliers : []);
      setExpenses(Array.isArray(savedExpenses) ? savedExpenses : []);
      setPurchases(Array.isArray(savedPurchases) ? savedPurchases : []);
      setCashbook(Array.isArray(savedCashbook) ? savedCashbook : []);
      setReturns(Array.isArray(savedReturns) ? savedReturns : []);
      setSupplierPayments(
        Array.isArray(savedSupplierPayments) ? savedSupplierPayments : []
      );
      setOpeningCash(Number.isFinite(savedOpeningCash) ? savedOpeningCash : 0);

      const lowStockCount = savedProducts.filter(
        (product) => Number(product.stock) <= 5
      ).length;

      const dueCount = savedCustomers.filter(
        (customer) => Number(customer.due) > 0
      ).length;

      const supplierDueCount = savedSuppliers.filter(
        (supplier) => Number(supplier.due) > 0
      ).length;

      setNotificationCount(lowStockCount + dueCount + supplierDueCount);
    } catch (error) {
      console.error("Dashboard data error:", error);
      setSales([]);
      setProducts([]);
      setCustomers([]);
      setSuppliers([]);
      setExpenses([]);
      setPurchases([]);
      setCashbook([]);
      setReturns([]);
      setSupplierPayments([]);
      setOpeningCash(0);
      setNotificationCount(0);
    }
  };

  // SALES
  const totalGrossSales = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  const totalSalesReturns = returns
    .filter((item) => item.type === "sales")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalSales = totalGrossSales - totalSalesReturns;

  const todayGrossSales = sales
    .filter((sale) => isToday(sale.date))
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const todaySalesReturns = returns
    .filter((item) => item.type === "sales" && isToday(item.date))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const todaySales = todayGrossSales - todaySalesReturns;

  // SALES BY PAYMENT MODE
  const todayGrossSalesByMode = emptyModeTotals();
  sales
    .filter((sale) => isToday(sale.date))
    .forEach((sale) => {
      const mode = getPaymentMode(sale.paymentType, sale.paymentMode);
      todayGrossSalesByMode[mode] += Number(sale.total || 0);
    });

  const todaySalesReturnsByMode = emptyModeTotals();
  returns
    .filter((item) => item.type === "sales" && isToday(item.date))
    .forEach((item) => {
      const mode = getPaymentMode(item.paymentType, item.paymentMode);
      todaySalesReturnsByMode[mode] += Number(item.amount || 0);
    });

  const todayNetSalesByMode: ModeTotals = emptyModeTotals();
  (Object.keys(todayNetSalesByMode) as Array<keyof ModeTotals>).forEach((mode) => {
    todayNetSalesByMode[mode] =
      todayGrossSalesByMode[mode] - todaySalesReturnsByMode[mode];
  });

  const todayCashSales = todayNetSalesByMode.cash;
  const todayUpiSales = todayNetSalesByMode.upi;
  const todayCardSales = todayNetSalesByMode.card;
  const todayBankSales = todayNetSalesByMode.bank;
  const todayOnlineSales = todayNetSalesByMode.online;
  const todayCreditSales = todayNetSalesByMode.credit;

  // GROSS PROFIT
  const grossProfit = sales.reduce((saleTotal, sale) => {
    const items = getSaleItems(sale);
    const itemProfit = items.reduce((itemTotal, item) => {
      const sellingPrice = Number(item.price || 0);
      const purchasePrice = Number(item.purchasePrice || 0);
      const quantity = Number(item.quantity || 0);
      return itemTotal + (sellingPrice - purchasePrice) * quantity;
    }, 0);

    const discount = Number(sale.discount || 0);
    return saleTotal + itemProfit - discount;
  }, 0);

  const todayGrossProfit = sales
    .filter((sale) => isToday(sale.date))
    .reduce((saleTotal, sale) => {
      const items = getSaleItems(sale);
      const itemProfit = items.reduce((itemTotal, item) => {
        const sellingPrice = Number(item.price || 0);
        const purchasePrice = Number(item.purchasePrice || 0);
        const quantity = Number(item.quantity || 0);
        return itemTotal + (sellingPrice - purchasePrice) * quantity;
      }, 0);

      return saleTotal + itemProfit - Number(sale.discount || 0);
    }, 0);

  // EXPENSES
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const todayExpenses = expenses
    .filter((expense) => isToday(expense.date))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  // PURCHASES
  const totalGrossPurchases = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.total || 0),
    0
  );

  const totalPurchaseReturns = returns
    .filter((item) => item.type === "purchase")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalPurchases = totalGrossPurchases - totalPurchaseReturns;

  const todayGrossPurchases = purchases
    .filter((purchase) => isToday(purchase.date))
    .reduce((sum, purchase) => sum + Number(purchase.total || 0), 0);

  const todayPurchaseReturns = returns
    .filter((item) => item.type === "purchase" && isToday(item.date))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const todayPurchases = todayGrossPurchases - todayPurchaseReturns;

  // PURCHASE BY PAYMENT MODE
  const todayGrossPurchasesByMode = emptyModeTotals();
  purchases
    .filter((purchase) => isToday(purchase.date))
    .forEach((purchase) => {
      const mode =
        purchase.paymentType === "credit"
          ? "credit"
          : purchase.paymentMode || "cash";
      todayGrossPurchasesByMode[mode] += Number(purchase.total || 0);
    });

  const todayPurchaseReturnsByMode = emptyModeTotals();
  returns
    .filter((item) => item.type === "purchase" && isToday(item.date))
    .forEach((item) => {
      const mode = getPaymentMode(item.paymentType, item.paymentMode);
      todayPurchaseReturnsByMode[mode] += Number(item.amount || 0);
    });

  const todayNetPurchasesByMode: ModeTotals = emptyModeTotals();
  (Object.keys(todayNetPurchasesByMode) as Array<keyof ModeTotals>).forEach(
    (mode) => {
      todayNetPurchasesByMode[mode] =
        todayGrossPurchasesByMode[mode] - todayPurchaseReturnsByMode[mode];
    }
  );

  // SUPPLIER PAYMENTS
  const todaySupplierPaymentsByMode: NonCreditModeTotals =
    emptyNonCreditModeTotals();
  supplierPayments
    .filter((payment) => isToday(payment.date))
    .forEach((payment) => {
      const mode = payment.paymentMode || "cash";
      todaySupplierPaymentsByMode[mode] += Number(payment.amount || 0);
    });

  // NET PAYMENT MODE FLOW
  const todayNetModeFlow = {
    cash:
      todayNetSalesByMode.cash -
      todayNetPurchasesByMode.cash +
      todayPurchaseReturnsByMode.cash -
      todaySupplierPaymentsByMode.cash,
    upi:
      todayNetSalesByMode.upi -
      todayNetPurchasesByMode.upi +
      todayPurchaseReturnsByMode.upi -
      todaySupplierPaymentsByMode.upi,
    card:
      todayNetSalesByMode.card -
      todayNetPurchasesByMode.card +
      todayPurchaseReturnsByMode.card -
      todaySupplierPaymentsByMode.card,
    bank:
      todayNetSalesByMode.bank -
      todayNetPurchasesByMode.bank +
      todayPurchaseReturnsByMode.bank -
      todaySupplierPaymentsByMode.bank,
    online:
      todayNetSalesByMode.online -
      todayNetPurchasesByMode.online +
      todayPurchaseReturnsByMode.online -
      todaySupplierPaymentsByMode.online,
    credit:
      todayNetSalesByMode.credit - todayNetPurchasesByMode.credit,
  };

  // STOCK
  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const stockValue = products.reduce(
    (sum, product) =>
      sum + Number(product.stock || 0) * Number(product.purchasePrice || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5
  );

  // CUSTOMER / SUPPLIER DUE
  const totalCustomerDue = customers.reduce(
    (sum, customer) => sum + Number(customer.due || 0),
    0
  );

  const totalSupplierDue = suppliers.reduce(
    (sum, supplier) => sum + Number(supplier.due || 0),
    0
  );

  // PROFIT
  const netProfit = grossProfit - totalExpenses;
  const todayNetProfit = todayGrossProfit - todayExpenses;

  // CASHBOOK
  const cashIn = cashbook.reduce(
    (sum, transaction) =>
      transaction.type === "in" ? sum + Number(transaction.amount || 0) : sum,
    0
  );

  const cashOut = cashbook.reduce(
    (sum, transaction) =>
      transaction.type === "out" ? sum + Number(transaction.amount || 0) : sum,
    0
  );

  const cashBalance = openingCash + cashIn - cashOut;

  const todayCashIn = cashbook
    .filter((transaction) => isToday(transaction.date))
    .reduce(
      (sum, transaction) =>
        transaction.type === "in" ? sum + Number(transaction.amount || 0) : sum,
      0
    );

  const todayCashOut = cashbook
    .filter((transaction) => isToday(transaction.date))
    .reduce(
      (sum, transaction) =>
        transaction.type === "out" ? sum + Number(transaction.amount || 0) : sum,
      0
    );

  // RECENT SALES
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const todayBillCount = sales.filter((sale) => isToday(sale.date)).length;

  return (
    <main className="dashboard-container">
      {/* HEADER */}
      <header className="header">
        <div>
          <h1>HisabPro</h1>
          <p>Sales • Stock • Khata • Profit</p>
        </div>

        <div className="header-actions">
          <a
            href="/hisabpro/search/"
            className="search-header-button"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l5 5" />
            </svg>
          </a>

          <a
            href="/hisabpro/notifications/"
            className="notification"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
            {notificationCount > 0 && (
              <span className="notification-badge">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </a>
        </div>
      </header>

      {/* WELCOME */}
      <section className="welcome">
        <p>Good day</p>
        <h2>Business Dashboard</h2>
      </section>

      {/* MAIN STATS */}
      <section className="stats">
        <div className="card sales">
          <span>Today's Net Sales</span>
          <strong>{formatMoney(todaySales)}</strong>
          <small>
            Cash {formatMoney(todayCashSales)} • UPI {formatMoney(todayUpiSales)}{" "}
            • Card {formatMoney(todayCardSales)}
          </small>
          <small>
            Bank {formatMoney(todayBankSales)} • Online{" "}
            {formatMoney(todayOnlineSales)} • Credit{" "}
            {formatMoney(todayCreditSales)}
          </small>
          <small>Returns − {formatMoney(todaySalesReturns)}</small>
        </div>

        <div className="card">
          <span>Total Net Sales</span>
          <strong>{formatMoney(totalSales)}</strong>
          <small>{sales.length} bills</small>
          <small>Returns − {formatMoney(totalSalesReturns)}</small>
        </div>

        <div className="card profit">
          <span>Net Profit</span>
          <strong>{formatMoney(netProfit)}</strong>
          <small>Today {formatMoney(todayNetProfit)}</small>
        </div>

        <div className="card">
          <span>Cash Balance</span>
          <strong>{formatMoney(cashBalance)}</strong>
          <small>
            In {formatMoney(todayCashIn)} • Out {formatMoney(todayCashOut)}
          </small>
        </div>
      </section>

      {/* NET PAYMENT MODE FLOW */}
      <section className="section">
        <div className="section-title">
          <h3>Today's Payment Mode Flow</h3>
        </div>

        <div className="dashboard-activity-grid">
          <div className="dashboard-activity-card">
            <span>Cash</span>
            <strong>{formatMoney(todayNetModeFlow.cash)}</strong>
            <small>
              Sales + Purchase Return − Purchase − Supplier Payment
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>UPI</span>
            <strong>{formatMoney(todayNetModeFlow.upi)}</strong>
            <small>
              Sales + Purchase Return − Purchase − Supplier Payment
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>Card</span>
            <strong>{formatMoney(todayNetModeFlow.card)}</strong>
            <small>
              Sales + Purchase Return − Purchase − Supplier Payment
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>Bank</span>
            <strong>{formatMoney(todayNetModeFlow.bank)}</strong>
            <small>
              Sales + Purchase Return − Purchase − Supplier Payment
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>Online</span>
            <strong>{formatMoney(todayNetModeFlow.online)}</strong>
            <small>
              Sales + Purchase Return − Purchase − Supplier Payment
            </small>
          </div>

          <div className="dashboard-activity-card">
            <span>Credit</span>
            <strong>{formatMoney(todayNetModeFlow.credit)}</strong>
            <small>Net credit sales − net credit purchases</small>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="section">
        <div className="section-title">
          <h3>Quick Actions</h3>
        </div>

        <div className="actions">
          <a href="/hisabpro/sales/" className="action-link">
            <svg viewBox="0 0 24 24">
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            <span>New Sale</span>
          </a>

          <a href="/hisabpro/purchase/" className="action-link">
            <svg viewBox="0 0 24 24">
              <path d="M4 5h16v14H4z" />
              <path d="M8 9h8M8 13h5" />
              <path d="M12 16v4" />
            </svg>
            <span>New Purchase</span>
          </a>

          <a href="/hisabpro/stock/" className="action-link">
            <svg viewBox="0 0 24 24">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
              <path d="M12 11v10" />
            </svg>
            <span>Add Product</span>
          </a>

          <a href="/hisabpro/khata/" className="action-link">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
            </svg>
            <span>Add Customer</span>
          </a>

          <a href="/hisabpro/expenses/" className="action-link">
            <svg viewBox="0 0 24 24">
              <path d="M4 5h16v14H4z" />
              <path d="M8 9h8M8 13h5" />
            </svg>
            <span>Add Expense</span>
          </a>

          <a href="/hisabpro/cashbook/in/" className="action-link">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 16V8M9 11l3-3 3 3" />
            </svg>
            <span>Cash In</span>
          </a>

          <a href="/hisabpro/cashbook/out/" className="action-link">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M9 13l3 3 3-3" />
            </svg>
            <span>Cash Out</span>
          </a>

          <a href="/hisabpro/reports/" className="action-link">
            <svg viewBox="0 0 24 24">
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="M7 15l3-4 3 2 5-6" />
            </svg>
            <span>Reports</span>
          </a>
        </div>
      </section>

      {/* BUSINESS SUMMARY */}
      <section className="section">
        <div className="section-title">
          <h3>Business Summary</h3>
        </div>

        <div className="summary">
          <a href="/hisabpro/stock/">
            <svg viewBox="0 0 24 24">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
              <path d="M12 11v10" />
            </svg>
            <p>Stock</p>
            <strong>{totalStock} items</strong>
            <small>Value: {formatMoney(stockValue)}</small>
          </a>

          <a href="/hisabpro/khata/">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
            </svg>
            <p>Customer Due</p>
            <strong>{formatMoney(totalCustomerDue)}</strong>
            <small>{customers.length} customers</small>
          </a>

          <a href="/hisabpro/suppliers/">
            <svg viewBox="0 0 24 24">
              <path d="M4 6h16v13H4z" />
              <path d="M8 6V4h8v2" />
              <path d="M8 11h8M8 15h5" />
            </svg>
            <p>Supplier Payable</p>
            <strong>{formatMoney(totalSupplierDue)}</strong>
            <small>{suppliers.length} suppliers</small>
          </a>

          <a href="/hisabpro/cashbook/">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M7 10h10M12 14h.01" />
            </svg>
            <p>Cash Balance</p>
            <strong>{formatMoney(cashBalance)}</strong>
            <small>Opening {formatMoney(openingCash)}</small>
          </a>

          <a href="/hisabpro/purchase/history/">
            <svg viewBox="0 0 24 24">
              <path d="M4 5h16v14H4z" />
              <path d="M8 9h8M8 13h6M8 17h4" />
            </svg>
            <p>Net Purchases</p>
            <strong>{formatMoney(totalPurchases)}</strong>
            <small>Return − {formatMoney(totalPurchaseReturns)}</small>
          </a>

          <a href="/hisabpro/reports/">
            <svg viewBox="0 0 24 24">
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="M7 15l3-4 3 2 5-6" />
            </svg>
            <p>Profit</p>
            <strong>{formatMoney(netProfit)}</strong>
            <small>Gross {formatMoney(grossProfit)}</small>
          </a>
        </div>
      </section>

      {/* TODAY'S ACTIVITY */}
      <section className="section">
        <div className="section-title">
          <h3>Today's Activity</h3>
          <a href="/hisabpro/reports/">View Reports</a>
        </div>

        <div className="dashboard-activity-grid">
          <div className="dashboard-activity-card">
            <span>Net Sales</span>
            <strong>{formatMoney(todaySales)}</strong>
            <small>{todayBillCount} bills</small>
          </div>

          <div className="dashboard-activity-card">
            <span>Net Purchases</span>
            <strong>{formatMoney(todayPurchases)}</strong>
            <small>After purchase returns</small>
          </div>

          <div className="dashboard-activity-card">
            <span>Expenses</span>
            <strong>{formatMoney(todayExpenses)}</strong>
            <small>Today's expenses</small>
          </div>

          <div className="dashboard-activity-card">
            <span>Sales Returns</span>
            <strong>{formatMoney(todaySalesReturns)}</strong>
            <small>Reduced from sales</small>
          </div>

          <div className="dashboard-activity-card">
            <span>Purchase Returns</span>
            <strong>{formatMoney(todayPurchaseReturns)}</strong>
            <small>Reduced from purchases</small>
          </div>

          <div className="dashboard-activity-card">
            <span>Supplier Payments</span>
            <strong>
              {formatMoney(
                Object.values(todaySupplierPaymentsByMode).reduce(
                  (sum, amount) => sum + amount,
                  0
                )
              )}
            </strong>
            <small>Cash + UPI + Card + Bank + Online</small>
          </div>
        </div>
      </section>

      {/* ALERTS */}
      {(lowStockProducts.length > 0 ||
        totalCustomerDue > 0 ||
        totalSupplierDue > 0) && (
        <section className="section">
          <div className="section-title">
            <h3>Attention Needed</h3>
          </div>

          <div className="dashboard-alerts">
            {lowStockProducts.length > 0 && (
              <a
                href="/hisabpro/notifications/"
                className="dashboard-alert warning"
              >
                <span>!</span>
                <div>
                  <strong>Low Stock</strong>
                  <small>
                    {lowStockProducts.length} product
                    {lowStockProducts.length > 1 ? "s" : ""} need attention
                  </small>
                </div>
                <b>→</b>
              </a>
            )}

            {totalCustomerDue > 0 && (
              <a href="/hisabpro/khata/" className="dashboard-alert danger">
                <span>₹</span>
                <div>
                  <strong>Customer Receivable</strong>
                  <small>{formatMoney(totalCustomerDue)} pending</small>
                </div>
                <b>→</b>
              </a>
            )}

            {totalSupplierDue > 0 && (
              <a href="/hisabpro/suppliers/" className="dashboard-alert info">
                <span>S</span>
                <div>
                  <strong>Supplier Payable</strong>
                  <small>{formatMoney(totalSupplierDue)} payable</small>
                </div>
                <b>→</b>
              </a>
            )}
          </div>
        </section>
      )}

      {/* RECENT SALES */}
      <section className="section">
        <div className="section-title">
          <h3>Recent Sales</h3>
          <a href="/hisabpro/sales/history/">View All</a>
        </div>

        {recentSales.length === 0 ? (
          <div className="dashboard-empty">
            <strong>No sales yet</strong>
            <p>Your recent bills will appear here.</p>
          </div>
        ) : (
          <div className="dashboard-recent-list">
            {recentSales.map((sale) => {
              const items = getSaleItems(sale);
              const firstProduct = items[0]?.product || "Sale";
              const itemCount = items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
              );

              return (
                <a
                  href="/hisabpro/sales/history/"
                  className="dashboard-recent-item"
                  key={sale.id}
                >
                  <div className="dashboard-recent-icon">S</div>

                  <div className="dashboard-recent-info">
                    <strong>
                      {firstProduct}
                      {items.length > 1 ? ` + ${items.length - 1} more` : ""}
                    </strong>
                    <small>
                      {itemCount} item{itemCount !== 1 ? "s" : ""} •{" "}
                      {formatDate(sale.date)}
                    </small>
                  </div>

                  <div className="dashboard-recent-right">
                    <strong>{formatMoney(Number(sale.total || 0))}</strong>
                    <span>
                      {getPaymentModeLabel(
                        sale.paymentType,
                        sale.paymentMode
                      )}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <a href="/hisabpro/" className="active">
          <svg viewBox="0 0 24 24">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
            <path d="M9 20v-6h6v6" />
          </svg>
          <span>Home</span>
        </a>

        <a href="/hisabpro/sales/">
          <svg viewBox="0 0 24 24">
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          <span>Sales</span>
        </a>

        <a href="/hisabpro/stock/">
          <svg viewBox="0 0 24 24">
            <path d="M3 7l9-4 9 4-9 4-9-4z" />
            <path d="M3 7v10l9 4 9-4V7" />
            <path d="M12 11v10" />
          </svg>
          <span>Stock</span>
        </a>

        <a href="/hisabpro/khata/">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
          </svg>
          <span>Khata</span>
        </a>

        <a href="/hisabpro/more/">
          <svg viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
          <span>More</span>
        </a>
      </nav>
    </main>
  );
}
