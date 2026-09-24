use client";
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
type SupplierPayment = {
id: number;
supplierId?: number;
supplierName?: string;
amount: number;
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
function getSaleItems(sale: Sale): SaleItem[] {
if (sale.items && sale.items.length > 0) return sale.items;
if (sale.product) {
const quantity = sale.quantity || 1;
const price = sale.price || 0;
const purchasePrice = sale.purchasePrice || 0;
return [{
productId: 0,
product: sale.product,
price,
purchasePrice,
quantity,
amount: price * quantity,
}];
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
return `■${Number(value || 0).toLocaleString("en-IN", {
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
if (paymentType === "credit") return "Credit";
switch (paymentMode || "cash") {
case "cash": return "Cash";
case "upi": return "UPI";
case "card": return "Card";
case "bank": return "Bank";
case "online": return "Online";
default: return "Cash";
}
}
function getModeValue(
paymentType: PaymentType | undefined,
paymentMode: PaymentMode | undefined
): PaymentMode | "credit" {
if (paymentType === "credit") return "credit";
return paymentMode || "cash";
}
export default function Dashboard() {
const [sales, setSales] = useState<Sale[]>([]);
const [products, setProducts] = useState<Product[]>([]);
const [customers, setCustomers] = useState<Customer[]>([]);
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [expenses, setExpenses] = useState<Expense[]>([]);
const [purchases, setPurchases] = useState<Purchase[]>([]);
const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
const [cashbook, setCashbook] = useState<CashTransaction[]>([]);
const [returns, setReturns] = useState<ReturnRecord[]>([]);
const [openingCash, setOpeningCash] = useState(0);
const [notificationCount, setNotificationCount] = useState(0);
useEffect(() => {
loadDashboard();
const handleStorage = () => loadDashboard();
window.addEventListener("storage", handleStorage);
window.addEventListener("focus", handleStorage);
return () => {
window.removeEventListener("storage", handleStorage);
window.removeEventListener("focus", handleStorage);
};
}, []);
const loadDashboard = () => {
try {
const savedSales: Sale[] = JSON.parse(localStorage.getItem("hisabpro_sales") || "[]");
const savedProducts: Product[] = JSON.parse(localStorage.getItem("hisabpro_products") || "[]");
const savedCustomers: Customer[] = JSON.parse(localStorage.getItem("hisabpro_customers") || "[]");
const savedSuppliers: Supplier[] = JSON.parse(localStorage.getItem("hisabpro_suppliers") || "[]");
const savedExpenses: Expense[] = JSON.parse(localStorage.getItem("hisabpro_expenses") || "[]");
const savedPurchases: Purchase[] = JSON.parse(localStorage.getItem("hisabpro_purchases") || "[]");
const savedSupplierPayments: SupplierPayment[] = JSON.parse(
localStorage.getItem("hisabpro_supplier_payments") || "[]"
);
const savedCashbook: CashTransaction[] = JSON.parse(localStorage.getItem("hisabpro_cashbook") || "[]");
const savedReturns: ReturnRecord[] = JSON.parse(localStorage.getItem("hisabpro_returns") || "[]");
const savedOpeningCash = Number(localStorage.getItem("hisabpro_opening_cash") || 0);
setSales(Array.isArray(savedSales) ? savedSales : []);
setProducts(Array.isArray(savedProducts) ? savedProducts : []);
setCustomers(Array.isArray(savedCustomers) ? savedCustomers : []);
setSuppliers(Array.isArray(savedSuppliers) ? savedSuppliers : []);
setExpenses(Array.isArray(savedExpenses) ? savedExpenses : []);
setPurchases(Array.isArray(savedPurchases) ? savedPurchases : []);
setSupplierPayments(Array.isArray(savedSupplierPayments) ? savedSupplierPayments : []);
setCashbook(Array.isArray(savedCashbook) ? savedCashbook : []);
setReturns(Array.isArray(savedReturns) ? savedReturns : []);
setOpeningCash(Number.isFinite(savedOpeningCash) ? savedOpeningCash : 0);
const lowStockCount = savedProducts.filter((product) => Number(product.stock) <= 5).length;
const dueCount = savedCustomers.filter((customer) => Number(customer.due) > 0).length;
setNotificationCount(lowStockCount + dueCount);
} catch (error) {
console.error("Dashboard data error:", error);
setSales([]);
setProducts([]);
setCustomers([]);
setSuppliers([]);
setExpenses([]);
setPurchases([]);
setSupplierPayments([]);
setCashbook([]);
setReturns([]);
setOpeningCash(0);
setNotificationCount(0);
}
};
const todaySalesReturns = returns
.filter((item) => item.type === "sales" && isToday(item.date))
.reduce((sum, item) => sum + Number(item.amount || 0), 0);
const todayPurchaseReturns = returns
.filter((item) => item.type === "purchase" && isToday(item.date))
.reduce((sum, item) => sum + Number(item.amount || 0), 0);
const modeReturn = (type: "sales" | "purchase", mode: PaymentMode | "credit") =>
returns
.filter(
(item) =>
item.type === type &&
isToday(item.date) &&
getModeValue(item.paymentType, item.paymentMode) === mode
)
.reduce((sum, item) => sum + Number(item.amount || 0), 0);
const todayCashSalesReturns = modeReturn("sales", "cash");
const todayUpiSalesReturns = modeReturn("sales", "upi");
const todayCardSalesReturns = modeReturn("sales", "card");
const todayBankSalesReturns = modeReturn("sales", "bank");
const todayOnlineSalesReturns = modeReturn("sales", "online");
const todayCreditSalesReturns = modeReturn("sales", "credit");
const totalSales =
sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0) -
returns
.filter((item) => item.type === "sales")
.reduce((sum, item) => sum + Number(item.amount || 0), 0);
const todayGrossSales = sales
.filter((sale) => isToday(sale.date))
.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
const todaySales = todayGrossSales - todaySalesReturns;
const salesByMode = (mode: PaymentMode | "credit") =>
sales
.filter(
(sale) =>
)
isToday(sale.date) &&
getModeValue(sale.paymentType, sale.paymentMode) === mode
.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
const todayCashSales = salesByMode("cash") - todayCashSalesReturns;
const todayUpiSales = salesByMode("upi") - todayUpiSalesReturns;
const todayCardSales = salesByMode("card") - todayCardSalesReturns;
const todayBankSales = salesByMode("bank") - todayBankSalesReturns;
const todayOnlineSales = salesByMode("online") - todayOnlineSalesReturns;
const todayCreditSales = salesByMode("credit") - todayCreditSalesReturns;
const totalPurchaseReturns = returns
.filter((item) => item.type === "purchase")
.reduce((sum, item) => sum + Number(item.amount || 0), 0);
const totalGrossPurchases = purchases.reduce(
(sum, purchase) => sum + Number(purchase.total || 0),
0
);
const totalPurchases = totalGrossPurchases - totalPurchaseReturns;
const todayGrossPurchases = purchases
.filter((purchase) => isToday(purchase.date))
.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0);
const todayPurchases = todayGrossPurchases - todayPurchaseReturns;
const purchasesByMode = (mode: PaymentMode | "credit") =>
purchases
.filter(
(purchase) =>
isToday(purchase.date) &&
getModeValue(purchase.paymentType, purchase.paymentMode) === mode
)
.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0);
const todayCashPurchaseReturns = modeReturn("purchase", "cash");
const todayUpiPurchaseReturns = modeReturn("purchase", "upi");
const todayCardPurchaseReturns = modeReturn("purchase", "card");
const todayBankPurchaseReturns = modeReturn("purchase", "bank");
const todayOnlinePurchaseReturns = modeReturn("purchase", "online");
const todayCreditPurchaseReturns = modeReturn("purchase", "credit");
const todayCashPurchases = purchasesByMode("cash");
const todayUpiPurchases = purchasesByMode("upi");
const todayCardPurchases = purchasesByMode("card");
const todayBankPurchases = purchasesByMode("bank");
const todayOnlinePurchases = purchasesByMode("online");
const todayCreditPurchases = purchasesByMode("credit");
const supplierPaymentsByMode = (mode: PaymentMode) =>
supplierPayments
.filter(
(payment) =>
isToday(payment.date) &&
(payment.paymentMode || "cash") === mode
)
.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
const todaySupplierCashPayments = supplierPaymentsByMode("cash");
const todaySupplierUpiPayments = supplierPaymentsByMode("upi");
const todaySupplierCardPayments = supplierPaymentsByMode("card");
const todaySupplierBankPayments = supplierPaymentsByMode("bank");
const todaySupplierOnlinePayments = supplierPaymentsByMode("online");
const todayCashNet =
todayCashSales -
todayCashPurchases +
todayCashPurchaseReturns -
todaySupplierCashPayments;
const todayUpiNet =
todayUpiSales -
todayUpiPurchases +
todayUpiPurchaseReturns -
todaySupplierUpiPayments;
const todayCardNet =
todayCardSales -
todayCardPurchases +
todayCardPurchaseReturns -
todaySupplierCardPayments;
const todayBankNet =
todayBankSales -
todayBankPurchases +
todayBankPurchaseReturns -
todaySupplierBankPayments;
const todayOnlineNet =
todayOnlineSales -
todayOnlinePurchases +
todayOnlinePurchaseReturns -
todaySupplierOnlinePayments;
const todayCreditNet =
todayCreditSales -
todayCreditPurchases +
todayCreditPurchaseReturns;
const grossProfit = sales.reduce((saleTotal, sale) => {
const items = getSaleItems(sale);
const itemProfit = items.reduce((itemTotal, item) => {
const sellingPrice = Number(item.price || 0);
const purchasePrice = Number(item.purchasePrice || 0);
const quantity = Number(item.quantity || 0);
return itemTotal + (sellingPrice - purchasePrice) * quantity;
}, 0);
return saleTotal + itemProfit - Number(sale.discount || 0);
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
const totalExpenses = expenses.reduce(
(sum, expense) => sum + Number(expense.amount || 0),
0
);
const todayExpenses = expenses
.filter((expense) => isToday(expense.date))
.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
const netProfit = grossProfit - totalExpenses;
const todayNetProfit = todayGrossProfit - todayExpenses;
const totalStock = products.reduce(
(sum, product) => sum + Number(product.stock || 0),
0
);
const stockValue = products.reduce(
(sum, product) =>
sum +
Number(product.stock || 0) *
Number(product.purchasePrice || 0),
0
);
const lowStockProducts = products.filter(
(product) => Number(product.stock) <= 5
);
const totalCustomerDue = customers.reduce(
(sum, customer) => sum + Number(customer.due || 0),
0
);
const totalSupplierDue = suppliers.reduce(
(sum, supplier) => sum + Number(supplier.due || 0),
0
);
const cashIn = cashbook.reduce(
(sum, transaction) =>
transaction.type === "in"
? sum + Number(transaction.amount || 0)
: sum,
0
);
const cashOut = cashbook.reduce(
(sum, transaction) =>
transaction.type === "out"
? sum + Number(transaction.amount || 0)
: sum,
0
);
const cashBalance = openingCash + cashIn - cashOut;
const todayCashIn = cashbook
.filter((transaction) => isToday(transaction.date))
.reduce(
(sum, transaction) =>
transaction.type === "in"
? sum + Number(transaction.amount || 0)
: sum,
0
);
const todayCashOut = cashbook
.filter((transaction) => isToday(transaction.date))
.reduce(
(sum, transaction) =>
transaction.type === "out"
? sum + Number(transaction.amount || 0)
: sum,
0
);
const recentSales = [...sales]
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
<p>Good day ■</p>
<h2>Business Dashboard</h2>
</section>
{/* MAIN STATS */}
<section className="stats">
<div className="card sales">
<span>Today's Net Sales</span>
<strong>{formatMoney(todaySales)}</strong>
<small>
</small>
Cash {formatMoney(todayCashSales)} • UPI {formatMoney(todayUpiSales)} • Card {formatMoney(todayCardSales)}
<small>
</small>
Bank {formatMoney(todayBankSales)} • Online {formatMoney(todayOnlineSales)} • Credit {formatMoney(todayCreditSales)}
</div>
<div className="card">
<span>Total Net Sales</span>
<strong>{formatMoney(totalSales)}</strong>
<small>{sales.length} bills</small>
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
</small>
</div>
</section>
In {formatMoney(todayCashIn)} • Out {formatMoney(todayCashOut)}
{/* QUICK ACTIONS */}
<section className="section">
<div className="section-title">
<h3>Quick Actions</h3>
</div>
<div className="actions">
<a href="/hisabpro/sales/" className="action-link">New Sale</a>
<a href="/hisabpro/purchase/" className="action-link">New Purchase</a>
<a href="/hisabpro/stock/" className="action-link">Add Product</a>
<a href="/hisabpro/khata/" className="action-link">Add Customer</a>
<a href="/hisabpro/expenses/" className="action-link">Add Expense</a>
<a href="/hisabpro/cashbook/in/" className="action-link">Cash In</a>
<a href="/hisabpro/cashbook/out/" className="action-link">Cash Out</a>
<a href="/hisabpro/reports/" className="action-link">Reports</a>
</div>
</section>
{/* BUSINESS SUMMARY */}
<section className="section">
<div className="section-title">
<h3>Business Summary</h3>
</div>
<div className="summary">
<a href="/hisabpro/stock/">
<p>Stock</p>
<strong>{totalStock} items</strong>
<small>Value: {formatMoney(stockValue)}</small>
</a>
<a href="/hisabpro/khata/">
<p>Customer Due</p>
<strong>{formatMoney(totalCustomerDue)}</strong>
<small>{customers.length} customers</small>
</a>
<a href="/hisabpro/suppliers/">
<p>Supplier Payable</p>
<strong>{formatMoney(totalSupplierDue)}</strong>
<small>{suppliers.length} suppliers</small>
</a>
<a href="/hisabpro/cashbook/">
<p>Cash Balance</p>
<strong>{formatMoney(cashBalance)}</strong>
<small>Opening {formatMoney(openingCash)}</small>
</a>
<a href="/hisabpro/purchase/history/">
<p>Net Purchases</p>
<strong>{formatMoney(totalPurchases)}</strong>
<small>Today {formatMoney(todayPurchases)}</small>
</a>
<a href="/hisabpro/reports/">
<p>Profit</p>
<strong>{formatMoney(netProfit)}</strong>
<small>Gross {formatMoney(grossProfit)}</small>
</a>
</div>
</section>
{/* PAYMENT MODE SUMMARY */}
<section className="section">
<div className="section-title">
<h3>Today's Payment Mode Summary</h3>
</div>
<div className="dashboard-activity-grid">
<div className="dashboard-activity-card">
<span>Cash</span>
<strong>{formatMoney(todayCashNet)}</strong>
<small>Sales − Purchases + Purchase Return − Supplier Payment</small>
</div>
<div className="dashboard-activity-card">
<span>UPI</span>
<strong>{formatMoney(todayUpiNet)}</strong>
<small>Sales − Purchases + Purchase Return − Supplier Payment</small>
</div>
<div className="dashboard-activity-card">
<span>Card</span>
<strong>{formatMoney(todayCardNet)}</strong>
<small>Sales − Purchases + Purchase Return − Supplier Payment</small>
</div>
<div className="dashboard-activity-card">
<span>Bank</span>
<strong>{formatMoney(todayBankNet)}</strong>
<small>Sales − Purchases + Purchase Return − Supplier Payment</small>
</div>
<div className="dashboard-activity-card">
<span>Online</span>
<strong>{formatMoney(todayOnlineNet)}</strong>
<small>Sales − Purchases + Purchase Return − Supplier Payment</small>
</div>
<div className="dashboard-activity-card">
<span>Credit</span>
<strong>{formatMoney(todayCreditNet)}</strong>
<small>Credit Sales − Credit Purchases + Purchase Return</small>
</div>
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
<small>
Gross {formatMoney(todayGrossSales)} − Returns {formatMoney(todaySalesReturns)}
</small>
</div>
<div className="dashboard-activity-card">
<span>Net Purchases</span>
<strong>{formatMoney(todayPurchases)}</strong>
<small>
Gross {formatMoney(todayGrossPurchases)} − Returns {formatMoney(todayPurchaseReturns)}
</small>
</div>
<div className="dashboard-activity-card">
<span>Expenses</span>
<strong>{formatMoney(todayExpenses)}</strong>
<small>Today's expenses</small>
</div>
<div className="dashboard-activity-card">
<span>Sales Returns</span>
<strong>{formatMoney(todaySalesReturns)}</strong>
<small>Amount reversed from original sale mode</small>
</div>
<div className="dashboard-activity-card">
<span>Purchase Returns</span>
<strong>{formatMoney(todayPurchaseReturns)}</strong>
<small>Amount returned to original purchase mode</small>
</div>
<div className="dashboard-activity-card">
<span>Supplier Payments</span>
<strong>
{formatMoney(
todaySupplierCashPayments +
todaySupplierUpiPayments +
todaySupplierCardPayments +
todaySupplierBankPayments +
todaySupplierOnlinePayments
)}
</strong>
</div>
<small>Payments made to suppliers today</small>
<div className="dashboard-activity-card">
<span>Net Profit</span>
<strong>{formatMoney(todayNetProfit)}</strong>
<small>Today's estimated profit</small>
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
<span>■■</span>
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
<a
href="/hisabpro/khata/"
className="dashboard-alert danger"
>
<span>■</span>
<div>
<strong>Customer Receivable</strong>
<small>{formatMoney(totalCustomerDue)} pending</small>
</div>
<b>→</b>
</a>
)}
{totalSupplierDue > 0 && (
<a
href="/hisabpro/suppliers/"
className="dashboard-alert info"
>
<span>■</span>
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
<div className="dashboard-recent-icon">■</div>
<div className="dashboard-recent-info">
<strong>
{firstProduct}
{items.length > 1
? ` + ${items.length - 1} more`
: ""}
</strong>
<small>
{itemCount} item
{itemCount !== 1 ? "s" : ""} • {formatDate(sale.date)}
</small>
</div>
<div className="dashboard-recent-right">
<strong>
{formatMoney(Number(sale.total || 0))}
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
})}
</div>
)}
</section>
{/* BOTTOM NAV */}
<nav className="bottom-nav">
<a href="/hisabpro/" className="active">
<span>Home</span>
</a>
<a href="/hisabpro/sales/">
<span>Sales</span>
</a>
<a href="/hisabpro/stock/">
<span>Stock</span>
</a>
<a href="/hisabpro/khata/">
<span>Khata</span>
</a>
<a href="/hisabpro/more/">
<span>More</span>
</a>
</nav>
</main>
);}
